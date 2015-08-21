import React from "react";
import Radium from "radium";
import d3 from "d3";
import _ from "lodash";
import log from "../log";

@Radium
class VictoryLine extends React.Component {

  constructor(props) {
    super(props);
    this.state = {};
    this.state.scale = {
      x: this.getScale("x"),
      y: this.getScale("y")
    };
  }

  getStyles() {
    return _.merge({
      fill: "none",
      stroke: "darkgrey",
      strokeWidth: 2,
      margin: 5,
      width: 500,
      height: 200
    }, this.props.style);
  }

  getScale(type) {
    const scale = this.props.scale[type] ? this.props.scale[type]().copy() :
      this.props.scale().copy();
    const range = this.getRange(type);
    const domain = this.getDomain(type);
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

  getDomain(type) {
    if (this.props.domain) {
      return this._getDomainFromProps(type);
    } else if (this.props.data || _.isArray(this.props[type])) {
      return this._getDomainFromData(type);
    } else {
      return this._getDomainFromScale(type);
    }
  }

  // helper method for getDomain
  _getDomainFromProps(type) {
    if (this.props.domain[type]) {
      // if the domain for this type is given, return it
      return this.props.domain[type];
    }
    // if the domain is given without the type specified, return the domain (reversed for y)
    return type === "x" ? this.props.domain : this.props.domain.concat().reverse();
  }

  // helper method for getDomain
  _getDomainFromData(type) {
    // if data is given, return the max/min of the data (reversed for y)
    if (this.props.data) {
      return type === "x" ?
        [_.min(_.pluck(this.props.data, type)), _.max(_.pluck(this.props.data, type))] :
        [_.max(_.pluck(this.props.data, type)), _.min(_.pluck(this.props.data, type))];
    } else {
      // return the max / min of the array specified by this.props[type] (reversed for y)
      return type === "x" ? [_.min(this.props[type]), _.max(this.props[type])] :
        [_.max(this.props[type]), _.min(this.props[type])];
    }
  }

  // helper method for getDomain
  _getDomainFromScale(type) {
    // The scale will never be undefined due to default props
    const scaleDomain = this.props.scale[type] ? this.props.scale[type]().domain() :
      this.props.scale().domain();

    // Warn when particular types of scales need more information to produce meaningful lines
    if (_.isDate(scaleDomain[0])) {
      log.warn("please specify a domain or data when using time scales");
    } else if (scaleDomain.length === 0) {
      log.warn("please specify a domain or data when using ordinal or quantile scales");
    } else if (scaleDomain.length === 1) {
      log.warn("please specify a domain or data when using a threshold scale");
    }
    // return the default domain for the scale (reversed for y)
    return type === "x" ? scaleDomain : scaleDomain.reverse();
  }

  getRange(type) {
    if (this.props.range) {
      return this.props.range[type] ? this.props.range[type] : this.props.range;
    }
    // if the range is not given in props, calculate it from width, height and margin
    const style = this.getStyles();
    const dimension = type === "x" ? "width" : "height";
    return [style.margin, style[dimension] - style.margin];
  }

  returnOrGenerateX() {
    if (this.props.x) {
      return this.props.x;
    }
    // if x is not given in props, create an array of values evenly
    // spaced across the x domain
    const domain = this.getDomain("x");
    const samples = _.isArray(this.props.y) ? this.props.y.length : this.props.samples;
    const step = _.max(domain) / samples;
    return _.range(_.min(domain), _.max(domain), step);
  }

  returnOrGenerateY() {
    const y = this.props.y;
    if (_.isFunction(y)) {
      const x = this.returnOrGenerateX();
      // if y is a function, apply the function y to to each value of the array x,
      // and return the results as an array
      return _.map(x, (datum) => y(datum));
    }
    // y is either a function or an array, and is never undefined
    // if it isn't a function, just return it.
    return y;
  }

  getData() {
    if (this.props.data) {
      return this.props.data;
    }
    const x = this.returnOrGenerateX();
    const y = this.returnOrGenerateY();
    const n = _.min([x.length, y.length]);
    // create a dataset from x and y with n points
    const dataset = _.zip(_.take(x, n), _.take(y, n));
    // return data as an array of objects
    return _.map(dataset, (point) => {
      return {x: point[0], y: point[1]};
    });
  }

  drawLine() {
    const xScale = this.getScale("x");
    const yScale = this.getScale("y");
    const lineFunction = d3.svg.line()
      .interpolate(this.props.interpolation)
      .x((data) => xScale(data.x))
      .y((data) => yScale(data.y));

    const path = lineFunction(this.getData());
    const style = this.getStyles();
    return <path style={[style, this.props.style]} d={path} />;
  }

  render() {
    const style = this.getStyles();
    return (
      <g style={[style, this.props.style]}>
        {this.drawLine()}
      </g>
    );
  }

}

VictoryLine.propTypes = {
  style: React.PropTypes.node,
  data: React.PropTypes.arrayOf(
    React.PropTypes.shape({
      x: React.PropTypes.number,
      y: React.PropTypes.number
    })
  ),
  x: React.PropTypes.array,
  y: React.PropTypes.oneOfType([
    React.PropTypes.array,
    React.PropTypes.func
  ]),
  domain: React.PropTypes.oneOfType([
    React.PropTypes.array,
    React.PropTypes.objectOf(
      React.PropTypes.shape({
        x: React.PropTypes.array,
        y: React.PropTypes.array
      })
    )
  ]),
  range: React.PropTypes.oneOfType([
    React.PropTypes.array,
    React.PropTypes.objectOf(
      React.PropTypes.shape({
        x: React.PropTypes.array,
        y: React.PropTypes.array
      })
    )
  ]),
  scale: React.PropTypes.oneOfType([
    React.PropTypes.func,
    React.PropTypes.objectOf(
      React.PropTypes.shape({
        x: React.PropTypes.func,
        y: React.PropTypes.func
      })
    )
  ]),
  samples: React.PropTypes.number,
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
  ])
};

VictoryLine.defaultProps = {
  interpolation: "basis",
  samples: 100,
  scale: () => d3.scale.linear(),
  y: () => Math.random()
};

export default VictoryLine;
