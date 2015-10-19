import React from "react";
import Radium from "radium";
import d3 from "d3";
import _ from "lodash";
import log from "../log";
import {VictoryAnimation} from "victory-animation";

const styles = {
  base: {
    width: 500,
    height: 300,
    margin: 50
  },
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

class VLine extends React.Component {
  static propTypes = {
    /**
     * The style prop specifies styles for your chart. VictoryLine relies on Radium,
     * so valid Radium style objects should work for this prop, however height, width, and margin
     * are used to calculate range, and need to be expressed as a number of pixels
     * @example {width: 300, margin: 50, data: {stroke: "red", opacity, 0.8}}
     */
    style: React.PropTypes.object,
    /**
     * The data prop specifies the data to be plotted. Data should be in the form of an array
     * of data points where each data point should be an object with x and y properties.
     * @exampes [
     *   {x: 1, y: 125},
     *   {x: 10, y: 257},
     *   {x: 100, y: 345},
     * ]
     */
    data: React.PropTypes.arrayOf(
      React.PropTypes.shape({
        x: React.PropTypes.any,
        y: React.PropTypes.any
      })
    ),
    /**
     * The x props provides another way to supply data for line to plot. This prop can be given
     * as an array of values, and it will be plotted against whatever y prop is provided. If no
     * props are provided for y, the values in x will be plotted as the identity function (x) => x.
     * @examples [1, 2, 3]
     */
    x: React.PropTypes.array,
    /**
     * The y props provides another way to supply data for line to plot. This prop can be given
     * as a function of x, or an array of values. If x props are given, they will be used
     * in plotting (x, y) data points. If x props are not provided, a set of x values
     * evenly spaced across the x domain will be calculated, and used for plotting data points.
     * @examples (x) => Math.sin(x), [1, 2, 3]
     */
    y: React.PropTypes.oneOfType([
      React.PropTypes.array,
      React.PropTypes.func
    ]),
    /**
     * The domain prop describes the range of values your chart will include. This prop can be
     * given as a array of the minimum and maximum expected values for your chart,
     * or as an object that specifies separate arrays for x and y.
     * If this prop is not provided, a domain will be calculated from data, or other
     * available information.
     * @exampes [-1, 1], {x: [0, 100], y: [0, 1]}
     */
    domain: React.PropTypes.oneOfType([
      React.PropTypes.array,
      React.PropTypes.shape({
        x: React.PropTypes.array,
        y: React.PropTypes.array
      })
    ]),
    /**
     * The range prop describes the range of pixels your chart will cover. This prop can be
     * given as a array of the minimum and maximum expected values for your chart,
     * or as an object that specifies separate arrays for x and y.
     * If this prop is not provided, a range will be calculated based on the height,
     * width, and margin provided in the style prop, or in default styles. It is usually
     * a good idea to let the chart component calculate its own range.
     * @exampes [0, 500], {x: [0, 500], y: [500, 300]}
     */
    range: React.PropTypes.oneOfType([
      React.PropTypes.array,
      React.PropTypes.shape({
        x: React.PropTypes.array,
        y: React.PropTypes.array
      })
    ]),
    /**
     * The scale prop determines which scales your chart should use. This prop can be
     * given as a function, or as an object that specifies separate functions for x and y.
     * @exampes d3.time.scale(), {x: d3.scale.linear(), y: d3.scale.log()}
     */
    scale: React.PropTypes.oneOfType([
      React.PropTypes.func,
      React.PropTypes.shape({
        x: React.PropTypes.func,
        y: React.PropTypes.func
      })
    ]),
    /**
     * The samples prop specifies how many individual points to plot when plotting
     * y as a function of x. Samples is ignored if x props are provided instead.
     */
    samples: React.PropTypes.number,
    /**
     * The interpolation prop determines how data points should be connected
     * when plotting a line
     */
    interpolation: React.PropTypes.oneOf([
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
     * The animate prop specifies props for victory-animation to use. It this prop is
     * not given, the line will not tween between changing data / style props.
     * Large datasets might animate slowly due to the inherent limits of svg rendering.
     * @examples {line: {delay: 5, velocity: 10, onEnd: () => alert("woo!")}}
     */
    animate: React.PropTypes.object,
    /**
     * The standalone prop determines whether the component will render a standalone svg
     * or a <g> tag that will be included in an external svg. Set standalone to false to
     * compose VictoryLine with other components within an enclosing <svg> tag.
     */
    standalone: React.PropTypes.bool,
    label: React.PropTypes.string
  };

  static defaultProps = {
    interpolation: "basis",
    samples: 50,
    scale: d3.scale.linear(),
    y: (x) => x,
    standalone: true
  };

  constructor(props) {
    super(props);
    this.getCalculatedValues(props);
  }

  componentWillReceiveProps(nextProps) {
    this.getCalculatedValues(nextProps);
  }

  getCalculatedValues(props) {
    this.style = this.getStyles(props);
    this.range = {
      x: this.getRange(props, "x"),
      y: this.getRange(props, "y")
    };
    this.domain = {
      x: this.getDomain(props, "x"),
      y: this.getDomain(props, "y")
    };
    this.scale = {
      x: this.getScale(props, "x"),
      y: this.getScale(props, "y")
    };
    this.dataset = this.getData(props);
  }

  getStyles(props) {
    if (!props.style) {
      return styles;
    }
    const {data, labels, ...base} = props.style;
    return {
      base: _.merge({}, styles.base, base),
      data: _.merge({}, styles.data, data),
      labels: _.merge({}, styles.labels, labels)
    };
  }

  getScale(props, axis) {
    const scale = props.scale[axis] ? props.scale[axis].copy() :
      props.scale.copy();
    const range = this.range[axis];
    const domain = this.domain[axis];
    scale.range(range);
    scale.domain(domain);
    // hacky check for identity scale
    if (_.difference(scale.range(), range).length !== 0) {
      // identity scale, reset the domain and range
      scale.range(range);
      scale.domain(range);
      log.warn("Identity Scale: domain and range must be identical. " +
        "Domain has been reset to match range.");
    }
    return scale;
  }

  getDomain(props, axis) {
    if (props.domain) {
      return props.domain[axis] || props.domain;
    } else if (props.data || _.isArray(props[axis])) {
      return this._getDomainFromData(props, axis);
    } else {
      return this._getDomainFromScale(props, axis);
    }
  }


  // helper method for getDomain
  _getDomainFromData(props, axis) {
    // if data is given, return the max/min of the data
    if (props.data) {
      return [_.min(_.pluck(props.data, axis)), _.max(_.pluck(props.data, axis))];
    } else {
      // return the max / min of the array specified by props[axis]
      return [_.min(props[axis]), _.max(props[axis])];
    }
  }

  // helper method for getDomain
  _getDomainFromScale(props, axis) {
    // The scale will never be undefined due to default props
    const scaleDomain = props.scale[axis] ? props.scale[axis].domain() :
      props.scale.domain();

    // Warn when particular types of scales need more information to produce meaningful lines
    if (_.isDate(scaleDomain[0])) {
      log.warn("please specify a domain or data when using time scales");
    } else if (scaleDomain.length === 0) {
      log.warn("please specify a domain or data when using ordinal or quantile scales");
    } else if (scaleDomain.length === 1) {
      log.warn("please specify a domain or data when using a threshold scale");
    }
    // return the default domain for the scale
    return scaleDomain;
  }

  getRange(props, axis) {
    if (props.range) {
      return props.range[axis] ? props.range[axis] : props.range;
    }
    // if the range is not given in props, calculate it from width, height and margin
    const style = this.style.base;
    return axis === "x" ?
      [style.margin, style.width - style.margin] :
      [style.height - style.margin, style.margin];
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
    const domain = this.domain.x;
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

  getTextLines(text, x) {
    if (!text) {
      return "";
    }
    // TODO: split text to new lines based on font size, number of characters and total width
    // TODO: determine line height ("1.2em") based on font size
    const dx = this.style.labels.padding;
    const textString = "" + text;
    const textLines = textString.split("\n");
    return _.map(textLines, (line, index) => {
      return index === 0 ?
      (<tspan x={x} dx={dx} key={"text-line-" + index}>{line}</tspan>) :
      (<tspan x={x} dx={dx} dy="1.2em" key={"text-line-" + index}>{line}</tspan>);
    });
  }

  drawLine() {
    const xScale = this.scale.x;
    const yScale = this.scale.y;
    const lineFunction = d3.svg.line()
      .interpolate(this.props.interpolation)
      .x((data) => xScale(data.x))
      .y((data) => yScale(data.y));
    if (this.props.label) {
      const x = xScale.call(this, _.last(this.dataset).x);
      const y = yScale.call(this, _.last(this.dataset).y);

      // match labels styles to data style by default (fill, opacity, others?)
      const opacity = this.style.data.opacity;
      // match label color to data color if it is not given.
      // use fill instead of stroke for text
      const fill = this.style.data.stroke;
      return (
        <g>
          <path style={this.style.data} d={lineFunction(this.dataset)}/>
          <text
            x={x}
            y={y}
            style={_.merge({}, {fill, opacity}, this.style.labels)}>
            {this.getTextLines(this.props.label, x)}
          </text>
        </g>
      );
    }
    return <path style={this.style.data} d={lineFunction(this.dataset)}/>;
  }

  render() {
    if (this.props.standalone) {
      return (
        <svg style={this.style.base}>
          {this.drawLine()}
        </svg>
      );
    }
    return (
      <g style={this.style.base}>
        {this.drawLine()}
      </g>
    );
  }
}

@Radium
export default class VictoryLine extends React.Component {
  /* eslint-disable react/prop-types */
  // ^ see: https://github.com/yannickcr/eslint-plugin-react/issues/106
  static propTypes = {...VLine.propTypes};
  static defaultProps = {...VLine.defaultProps};

  constructor(props) {
    super(props);
  }

  render() {
    if (this.props.animate) {
      // Do less work by having `VictoryAnimation` tween only values that
      // make sense to tween. In the future, allow customization of animated
      // prop whitelist/blacklist?
      const animateData = _.omit(this.props, [
        "animate", "scale", "containerElement", "interpolation"
      ]);
      return (
        <VictoryAnimation {...this.props.animate} data={animateData}>
          {props => <VLine {...this.props} {...props}/>}
        </VictoryAnimation>
      );
    }
    return (<VLine {...this.props}/>);
  }
}
