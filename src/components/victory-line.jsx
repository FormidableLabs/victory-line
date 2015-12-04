import React, { PropTypes } from "react";
import Radium from "radium";
import d3 from "d3";
import _ from "lodash";
import {VictoryAnimation} from "victory-animation";
import {VictoryLabel} from "victory-label";
import Util from "victory-util";

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
      "linear",
      "linear-closed",
      "step",
      "step-before",
      "step-after",
      "basis",
      "basis-open",
      "basis-closed",
      "bundle",
      "cardinal",
      "cardinal-open",
      "cardinal-closed",
      "monotone"
    ]),
    /**
     * The label prop specifies a label to display at the end of a line component
     */
    label: PropTypes.string,
    /**
     * The labelComponent prop takes in an entire, HTML-complete label component
     * which will be used to create labels for line to use
     */
    labelComponent: PropTypes.element,
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
     * @examples d3.time.scale(), {x: d3.scale.linear(), y: d3.scale.log()}
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
    scale: d3.scale.linear(),
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
      parent: _.merge({height: props.height, width: props.width}, parent),
      labels: _.merge({}, defaultStyles.labels, labels),
      data: _.merge({}, defaultStyles.data, data)
    };
  }

  getPadding(props) {
    const padding = _.isNumber(props.padding) ? props.padding : 0;
    const paddingObj = _.isObject(props.padding) ? props.padding : {};
    return {
      top: paddingObj.top || padding,
      bottom: paddingObj.bottom || padding,
      left: paddingObj.left || padding,
      right: paddingObj.right || padding
    };
  }

  getScale(props, axis) {
    const scale = props.scale[axis] ? props.scale[axis].copy() :
      props.scale.copy();
    const range = this.range[axis];
    const domain = this.domain[axis];
    scale.range(range);
    scale.domain(domain);
    return scale;
  }

  getDomain(props, axis) {
    if (props.domain) {
      return props.domain[axis] || props.domain;
    } else {
      return [_.min(_.pluck(this.dataset, axis)), _.max(_.pluck(this.dataset, axis))];
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
    const n = _.min([x.length, y.length]);
    // create a dataset from x and y with n points
    const dataset = _.zip(_.take(x, n), _.take(y, n));
    // return data as an array of objects
    return _.map(dataset, (point) => {
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
    const samples = _.isArray(props.y) ? props.y.length : props.samples;
    const step = _.max(domain) / samples;
    // return an array of x values spaced across the domain,
    // include the maximum of the domain
    return _.union(_.range(_.min(domain), _.max(domain), step), [_.max(domain)]);
  }

  returnOrGenerateY(props, x) {
    if (_.isFunction(props.y)) {
      // if y is a function, apply the function y to to each value of the array x,
      // and return the results as an array
      return _.map(x, (datum) => props.y(datum));
    }
    // y is either a function or an array, and is never undefined
    // if it isn't a function, just return it.
    return props.y;
  }

  getLabelStyle() {
    // match labels styles to data style by default (fill, opacity, others?)
    const opacity = this.style.data.opacity;
    // match label color to data color if it is not given.
    // use fill instead of stroke for text
    const fill = this.style.data.stroke;
    const padding = this.style.labels.padding || 0;
    return _.merge({opacity, fill, padding}, this.style.labels);
  }

  renderLabel(position, text) {
    const component = this.props.labelComponent;
    const componentStyle = component && component.props.style || {};
    const style = _.merge({}, this.getLabelStyle(), componentStyle);
    const children = component && component.props.children || text;
    const props = {
      x: component && component.props.x || position.x + style.padding,
      y: component && component.props.y || position.y - style.padding,
      data: this.dataset, // Pass dataset for custom label component to access
      textAnchor: component && component.props.textAnchor || "start",
      verticalAnchor: component && component.props.verticalAnchor || "middle",
      style
    };
    return component ?
      React.cloneElement(component, props, children) :
      React.createElement(VictoryLabel, props, children);
  }

  segmentOnNull(collection) {
    const segments = [];
    let segmentStartIndex = 0;
    _.each(collection, (obj, index) => {
      if (obj.y === null || obj.y === undefined) {
        segments.push(collection.slice(segmentStartIndex, index));
        segmentStartIndex = index + 1;
      }
    });
    segments.push(collection.slice(segmentStartIndex, collection.length));
    return _.filter(segments, (segment) => {return !_.isEmpty(segment)});
  }

  getDataSegments() {
    const orderedData = _.sortBy(this.dataset, "x");
    return this.segmentOnNull(orderedData);
  }

  renderLine() {
    const xScale = this.scale.x;
    const yScale = this.scale.y;
    const lineFunction = d3.svg.line()
      .interpolate(this.props.interpolation)
      .x((data) => xScale(data.x))
      .y((data) => yScale(data.y));
    const dataSegments = this.getDataSegments();
    console.log(dataSegments);
    const pathElement = <path style={this.style.data} d={lineFunction(dataSegments[0])}/>;
    if (this.props.label || this.props.labelComponent) {
      const position = {
        x: xScale.call(this, _.last(dataSegments[0]).x),
        y: yScale.call(this, _.last(dataSegments[0]).y)
      };
      const text = this.props.label || "";
      return (
        <g>
          {pathElement}
          {this.renderLabel(position, text)}
        </g>
      );
    }
    return pathElement;
  }

  render() {
    // If animating, return a `VictoryAnimation` element that will create
    // a new `VictoryLine` with nearly identical props, except (1) tweened
    // and (2) `animate` set to null so we don't recurse forever.
    if (this.props.animate) {
      // Do less work by having `VictoryAnimation` tween only values that
      // make sense to tween. In the future, allow customization of animated
      // prop whitelist/blacklist?
      const animateData = _.pick(this.props, [
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
    const group = <g style={style}>{this.renderLine()}</g>;

    return this.props.standalone ? <svg style={style}>{group}</svg> : group;
  }
}
