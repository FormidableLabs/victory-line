import flatten from "lodash/array/flatten";
import last from "lodash/array/last";
import pluck from "lodash/collection/pluck";
import sortBy from "lodash/collection/sortBy";
import isEmpty from "lodash/lang/isEmpty";
import isNull from "lodash/lang/isNull";
import isObject from "lodash/lang/isObject";
import isUndefined from "lodash/lang/isUndefined";
import merge from "lodash/object/merge";
import pick from "lodash/object/pick";
import max from "lodash/math/max";
import min from "lodash/math/min";
import React from "react";
import Radium from "radium";
import d3Scale from "d3-scale";
import LineSegment from "./line-segment";
import LineLabel from "./line-label";
import {Chart, Data, PropTypes, Scale} from "victory-util";
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
    animate: React.PropTypes.object,
    /**
     * The data prop specifies the data to be plotted. Data should be in the form of an array
     * of data points where each data point should be an object with x and y properties.
     * @examples [{x: 1, y: 12}, {x: 10, y: 25}, {x: 100, y: 34}]
     */
    data: React.PropTypes.arrayOf(
      React.PropTypes.shape({
        x: React.PropTypes.any,
        y: React.PropTypes.any
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
    domain: React.PropTypes.oneOfType([
      PropTypes.domain,
      React.PropTypes.shape({
        x: PropTypes.domain,
        y: PropTypes.domain
      })
    ]),
    /**
     * The height props specifies the height of the chart container element in pixels
     */
    height: PropTypes.nonNegative,
    /**
     * The interpolation prop determines how data points should be connected
     * when plotting a line
     */
    interpolation: React.PropTypes.oneOf([
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
    label: React.PropTypes.any,
    /**
     * The padding props specifies the amount of padding in number of pixels between
     * the edge of the chart and any rendered child components. This prop can be given
     * as a number or as an object with padding specified for top, bottom, left
     * and right.
     */
    padding: React.PropTypes.oneOfType([
      React.PropTypes.number,
      React.PropTypes.shape({
        top: React.PropTypes.number,
        bottom: React.PropTypes.number,
        left: React.PropTypes.number,
        right: React.PropTypes.number
      })
    ]),
    /**
     * The samples prop specifies how many individual points to plot when plotting
     * y as a function of x. Samples is ignored if x props are provided instead.
     */
    samples: PropTypes.nonNegative,
    /**
     * The scale prop determines which scales your chart should use. This prop can be
     * given as a function, or as an object that specifies separate functions for x and y.
     * @examples d3Scale.time(), {x: d3Scale.linear(), y: d3Scale.log()}
     */
    scale: React.PropTypes.oneOfType([
      PropTypes.scale,
      React.PropTypes.shape({
        x: PropTypes.scale,
        y: PropTypes.scale
      })
    ]),
    /**
     * The standalone prop determines whether the component will render a standalone svg
     * or a <g> tag that will be included in an external svg. Set standalone to false to
     * compose VictoryLine with other components within an enclosing <svg> tag.
     */
    standalone: React.PropTypes.bool,
    /**
     * The style prop specifies styles for your chart. VictoryLine relies on Radium,
     * so valid Radium style objects should work for this prop, however height, width, and margin
     * are used to calculate range, and need to be expressed as a number of pixels
     * @examples {data: {stroke: "red"}, labels: {fontSize: 14}}
     */
    style: React.PropTypes.shape({
      parent: React.PropTypes.object,
      data: React.PropTypes.object,
      labels: React.PropTypes.object
    }),
    /**
     * The width props specifies the width of the chart container element in pixels
     */
    width: PropTypes.nonNegative,
    /**
     * The x prop provides another way to supply data for line to plot. This prop can be given
     * as an array of values, and it will be plotted against whatever y prop is provided. If no
     * props are provided for y, the values in x will be plotted as the identity function (x) => x.
     * @examples [1, 2, 3]
     */
    x: PropTypes.homogeneousArray,
    /**
     * The y prop provides another way to supply data for line to plot. This prop can be given
     * as a function of x, or an array of values. If x props are given, they will be used
     * in plotting (x, y) data points. If x props are not provided, a set of x values
     * evenly spaced across the x domain will be calculated, and used for plotting data points.
     * @examples (x) => Math.sin(x), [1, 2, 3]
     */
    y: React.PropTypes.oneOfType([
      PropTypes.homogeneousArray,
      React.PropTypes.func
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

  getDomain(dataset, props, axis) {
    if (props.domain && props.domain[axis]) {
      return props.domain[axis];
    } else if (props.domain && !isObject(props.domain)) {
      return props.domain;
    } else {
      return [min(pluck(dataset, axis)), max(pluck(dataset, axis))];
    }
  }

  getDataSegments(dataset) {
    const orderedData = sortBy(dataset, "x");
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

  getLabelStyle(style) {
    // match labels styles to data style by default (fill, opacity, others?)
    const opacity = style.data.opacity;
    // match label color to data color if it is not given.
    // use fill instead of stroke for text
    const fill = style.data.stroke;
    const padding = style.labels.padding || 0;
    return merge({}, opacity, fill, padding, style.labels);
  }

  renderLine(calculatedProps) {
    const {dataSegments, scale, style} = calculatedProps;
    return dataSegments.map((segment, index) => {
      return (
        <LineSegment
          key={`line-segment-${index}`}
          data={segment}
          interpolation={this.props.interpolation}
          scale={scale}
          style={style.data}
        />
      );
    });
  }

  renderLabel(calculatedProps) {
    const {dataset, dataSegments, scale, style} = calculatedProps;
    if (!this.props.label) {
      return undefined;
    }
    const position = {
      x: scale.x.call(this, last(flatten(dataSegments)).x),
      y: scale.y.call(this, last(flatten(dataSegments)).y)
    };
    return (
      <LineLabel
        key={`line-label`}
        data={dataset}
        position={position}
        label={this.props.label}
        style={this.getLabelStyle(style)}
      />
    );
  }

  renderData(props, style) {
    const dataset = Data.getData(props);
    const dataSegments = this.getDataSegments(dataset);
    const range = {
      x: Chart.getRange(props, "x"),
      y: Chart.getRange(props, "y")
    };
    const domain = {
      x: this.getDomain(dataset, props, "x"),
      y: this.getDomain(dataset, props, "y")
    };
    const scale = {
      x: Scale.getBaseScale(props, "x").domain(domain.x).range(range.x),
      y: Scale.getBaseScale(props, "y").domain(domain.y).range(range.y)
    };
    const calculatedProps = {dataset, dataSegments, scale, style};
    return (
      <g style={style.parent}>
        {this.renderLine(calculatedProps)}
        {this.renderLabel(calculatedProps)}
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
    }
    const style = Chart.getStyles(this.props, defaultStyles);
    const group = <g style={style.parent}>{this.renderData(this.props, style)}</g>;
    return this.props.standalone ? <svg style={style.parent}>{group}</svg> : group;
  }
}
