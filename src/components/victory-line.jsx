import flatten from "lodash/array/flatten";
import last from "lodash/array/last";
import take from "lodash/array/take";
import union from "lodash/array/union";
import zip from "lodash/array/zip";
import pluck from "lodash/collection/pluck";
import sortBy from "lodash/collection/sortBy";
import isArray from "lodash/lang/isArray";
import isEmpty from "lodash/lang/isEmpty";
import isFunction from "lodash/lang/isFunction";
import isNull from "lodash/lang/isNull";
import isNumber from "lodash/lang/isNumber";
import isObject from "lodash/lang/isObject";
import isUndefined from "lodash/lang/isUndefined";
import merge from "lodash/object/merge";
import pick from "lodash/object/pick";
import max from "lodash/math/max";
import min from "lodash/math/min";
import lodashRange from "lodash/utility/range";
import React, { PropTypes } from "react";
import Radium from "radium";
import d3Scale from "d3-scale";
import LineSegment from "./line-segment";
import LineLabel from "./line-label";
import Util from "victory-util";
import {VictoryAnimation} from "victory-animation";

const defaultStyles = {
  data: {
    strokeWidth: 2,
    fill: "none",
    stroke: "#756f6a",
    opacity: 1
  },
  labels: {
    padding: 5,
    fontFamily: "Helvetica",
    fontSize: 10,
    strokeWidth: 0,
    stroke: "transparent",
    textAnchor: "start"
  }
};

@Radium
export default class VictoryLine extends React.Component {
  static role = "line";
  static propTypes = {
    /**
     * The animate prop specifies props for victory-animation to use. It this prop is
     * not given, the line will not tween between changing data / style props.
     * Large datasets might animate slowly due to the inherent limits of svg rendering.
     * @examples {velocity: 0.02, onEnd: () => alert("done!")}
     */
    animate: PropTypes.object,
    /**
     * The data prop specifies the data to be plotted. Data should be in the form of an array
     * of data points where each data point should be an object with x and y properties.
     * @examples [{x: 1, y: 12}, {x: 10, y: 25}, {x: 100, y: 34}]
     */
    data: PropTypes.arrayOf(
      PropTypes.shape({
        x: PropTypes.any,
        y: PropTypes.any
      })
    ),
    /**
     * The domain prop describes the range of values your chart will include. This prop can be
     * given as a array of the minimum and maximum expected values for your chart,
     * or as an object that specifies separate arrays for x and y.
     * If this prop is not provided, a domain will be calculated from data, or other
     * available information.
     * @examples [-1, 1], {x: [0, 100], y: [0, 1]}
     */
    domain: PropTypes.oneOfType([
      Util.PropTypes.domain,
      PropTypes.shape({
        x: Util.PropTypes.domain,
        y: Util.PropTypes.domain
      })
    ]),
    /**
     * The height props specifies the height of the chart container element in pixels
     */
    height: Util.PropTypes.nonNegative,
    /**
     * The interpolation prop determines how data points should be connected
     * when plotting a line
     */
    interpolation: PropTypes.oneOf([
      "basis",
      "basisClosed",
      "basisOpen",
      "bundle",
      "cardinal",
      "cardinalClosed",
      "cardinalOpen",
      "catmullRom",
      "catmullRomClosed",
      "catmullRomOpen",
      "linear",
      "linearClosed",
      "monotone",
      "natural",
      "radial",
      "step",
      "stepAfter",
      "stepBefore"
    ]),
    /**
     * The label prop specifies a label to display at the end of a line component,
     * this prop can be given as a value, or as an entire label component
     */
    label: PropTypes.any,
    /**
     * The padding props specifies the amount of padding in number of pixels between
     * the edge of the chart and any rendered child components. This prop can be given
     * as a number or as an object with padding specified for top, bottom, left
     * and right.
     */
    padding: PropTypes.oneOfType([
      PropTypes.number,
      PropTypes.shape({
        top: PropTypes.number,
        bottom: PropTypes.number,
        left: PropTypes.number,
        right: PropTypes.number
      })
    ]),
    /**
     * The samples prop specifies how many individual points to plot when plotting
     * y as a function of x. Samples is ignored if x props are provided instead.
     */
    samples: Util.PropTypes.nonNegative,
    /**
     * The scale prop determines which scales your chart should use. This prop can be
     * given as a function, or as an object that specifies separate functions for x and y.
     * @examples d3Scale.time(), {x: d3Scale.linear(), y: d3Scale.log()}
     */
    scale: PropTypes.oneOfType([
      Util.PropTypes.scale,
      PropTypes.shape({
        x: Util.PropTypes.scale,
        y: Util.PropTypes.scale
      })
    ]),
    /**
     * The standalone prop determines whether the component will render a standalone svg
     * or a <g> tag that will be included in an external svg. Set standalone to false to
     * compose VictoryLine with other components within an enclosing <svg> tag.
     */
    standalone: PropTypes.bool,
    /**
     * The style prop specifies styles for your chart. VictoryLine relies on Radium,
     * so valid Radium style objects should work for this prop, however height, width, and margin
     * are used to calculate range, and need to be expressed as a number of pixels
     * @examples {data: {stroke: "red"}, labels: {fontSize: 14}}
     */
    style: PropTypes.shape({
      parent: PropTypes.object,
      data: PropTypes.object,
      labels: PropTypes.object
    }),
    /**
     * The width props specifies the width of the chart container element in pixels
     */
    width: Util.PropTypes.nonNegative,
    /**
     * The x prop provides another way to supply data for line to plot. This prop can be given
     * as an array of values, and it will be plotted against whatever y prop is provided. If no
     * props are provided for y, the values in x will be plotted as the identity function (x) => x.
     * @examples [1, 2, 3]
     */
    x: Util.PropTypes.homogeneousArray,
    /**
     * The y prop provides another way to supply data for line to plot. This prop can be given
     * as a function of x, or an array of values. If x props are given, they will be used
     * in plotting (x, y) data points. If x props are not provided, a set of x values
     * evenly spaced across the x domain will be calculated, and used for plotting data points.
     * @examples (x) => Math.sin(x), [1, 2, 3]
     */
    y: PropTypes.oneOfType([
      PropTypes.array,
      PropTypes.func
    ])
  };

  static defaultProps = {
    height: 300,
    interpolation: "linear",
    padding: 50,
    samples: 50,
    scale: d3Scale.linear(),
    standalone: true,
    width: 450,
    y: (x) => x
  };

  getCalculatedValues(props) {
    this.style = this.getStyles(props);
    this.padding = this.getPadding(props);
    this.range = {
      x: this.getRange(props, "x"),
      y: this.getRange(props, "y")
    };
    this.dataset = this.getData(props);
    this.dataSegments = this.getDataSegments();
    this.domain = {
      x: this.getDomain(props, "x"),
      y: this.getDomain(props, "y")
    };
    this.scale = {
      x: this.getScale(props, "x"),
      y: this.getScale(props, "y")
    };
  }

  getStyles(props) {
    const style = props.style || defaultStyles;
    const {data, labels, parent} = style;
    return {
      parent: merge({height: props.height, width: props.width}, parent),
      labels: merge({}, defaultStyles.labels, labels),
      data: merge({}, defaultStyles.data, data)
    };
  }

  getPadding(props) {
    const padding = isNumber(props.padding) ? props.padding : 0;
    const paddingObj = isObject(props.padding) ? props.padding : {};
    return {
      top: paddingObj.top || padding,
      bottom: paddingObj.bottom || padding,
      left: paddingObj.left || padding,
      right: paddingObj.right || padding
    };
  }

  getScale(props, axis) {
    let scale;
    if (props.scale && props.scale[axis]) {
      scale = props.scale[axis].copy();
    } else if (props.scale && !isObject(props.scale)) {
      scale = props.scale.copy();
    } else {
      scale = d3Scale.linear().copy();
    }
    const range = this.range[axis];
    const domain = this.domain[axis];
    scale.range(range);
    scale.domain(domain);
    return scale;
  }

  getDomain(props, axis) {
    if (props.domain && props.domain[axis]) {
      return props.domain[axis];
    } else if (props.domain && !isObject(props.domain)) {
      return props.domain;
    } else {
      return [min(pluck(this.dataset, axis)), max(pluck(this.dataset, axis))];
    }
  }

  getRange(props, axis) {
    // if the range is not given in props, calculate it from width, height and margin
    return axis === "x" ?
      [this.padding.left, props.width - this.padding.right] :
      [props.height - this.padding.bottom, this.padding.top];
  }

  getData(props) {
    if (props.data) {
      return props.data;
    }
    const x = this.returnOrGenerateX(props);
    const y = this.returnOrGenerateY(props, x);
    const n = min([x.length, y.length]);
    // create a dataset from x and y with n points
    const dataset = zip(take(x, n), take(y, n));
    // return data as an array of objects
    return dataset.map((point) => {
      return {x: point[0], y: point[1]};
    });
  }

  returnOrGenerateX(props) {
    if (props.x) {
      return props.x;
    }
    // if x is not given in props, create an array of values evenly
    // spaced across the x domain
    const domainFromProps = props.domain && props.domain.x || props.domain;
    const domainFromScale = props.scale && props.scale.x ?
      props.scale.x.domain() : props.scale.domain();
    const domain = domainFromProps || domainFromScale;
    const samples = isArray(props.y) ? props.y.length : props.samples;
    const step = max(domain) / samples;
    // return an array of x values spaced across the domain,
    // include the maximum of the domain
    const xArray = union(lodashRange(min(domain), max(domain), step), [max(domain)]);
    return xArray.filter((x) => x !== 0);
  }

  returnOrGenerateY(props, x) {
    if (isFunction(props.y)) {
      // if y is a function, apply the function y to to each value of the array x,
      // and return the results as an array
      return x.map((datum) => props.y(datum));
    }
    // y is either a function or an array, and is never undefined
    // if it isn't a function, just return it.
    return props.y;
  }

  getDataSegments() {
    const orderedData = sortBy(this.dataset, "x");
    const segments = [];
    let segmentStartIndex = 0;
    orderedData.forEach((datum, index) => {
      if (isNull(datum.y) || isUndefined(datum.y)) {
        segments.push(orderedData.slice(segmentStartIndex, index));
        segmentStartIndex = index + 1;
      }
    });
    segments.push(orderedData.slice(segmentStartIndex, orderedData.length));
    return segments.filter((segment) => {
      return !isEmpty(segment);
    });
  }

  getLabelStyle() {
    // match labels styles to data style by default (fill, opacity, others?)
    const opacity = this.style.data.opacity;
    // match label color to data color if it is not given.
    // use fill instead of stroke for text
    const fill = this.style.data.stroke;
    const padding = this.style.labels.padding || 0;
    return merge({}, opacity, fill, padding, this.style.labels);
  }

  renderLine() {
    return this.dataSegments.map((segment, index) => {
      return (
        <LineSegment
          key={`line-segment-${index}`}
          data={segment}
          interpolation={this.props.interpolation}
          scale={this.scale}
          style={this.style.data}
        />
      );
    });
  }

  renderLabel() {
    if (!this.props.label) {
      return undefined;
    }
    const position = {
      x: this.scale.x.call(this, last(flatten(this.dataSegments)).x),
      y: this.scale.y.call(this, last(flatten(this.dataSegments)).y)
    };
    return (
      <LineLabel
        key={`line-label`}
        data={this.dataset}
        position={position}
        label={this.props.label}
        style={this.getLabelStyle()}
      />
    );
  }

  renderData() {
    return (
      <g style={this.style.parent}>
        {this.renderLine()}
        {this.renderLabel()}
      </g>
    );
  }

  render() {
    // If animating, return a `VictoryAnimation` element that will create
    // a new `VictoryLine` with nearly identical props, except (1) tweened
    // and (2) `animate` set to null so we don't recurse forever.
    if (this.props.animate) {
      // Do less work by having `VictoryAnimation` tween only values that
      // make sense to tween. In the future, allow customization of animated
      // prop whitelist/blacklist?
      const animateData = pick(this.props, [
        "data", "domain", "height", "padding", "samples", "style", "width", "x", "y"
      ]);
      return (
        <VictoryAnimation {...this.props.animate} data={animateData}>
          {(props) => <VictoryLine {...this.props} {...props} animate={null}/>}
        </VictoryAnimation>
      );
    } else {
      this.getCalculatedValues(this.props);
    }
    const style = this.style.parent;
    const group = <g style={style}>{this.renderData()}</g>;
    return this.props.standalone ? <svg style={style}>{group}</svg> : group;
  }
}
