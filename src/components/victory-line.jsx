import React from "react";
import Radium from "radium";
import d3 from "d3";
import _ from "lodash";

@Radium
class VictoryLine extends React.Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  getStyles() {
    return _.merge({
      path: {
        fill: "none",
        stroke: "darkgrey",
        strokeWidth: 2
      },
      svg: {
        border: "2px solid black",
        margin: 5,
        width: 500,
        height: 200
      }
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
      this.warn("Identity Scale: domain and range must be identical. " +
        "Domain has been reset to match range.");
    }
    return scale;
  }

  getDomain(type) {
    // scale is never undefined thanks to defaults
    const scaleDomain = this.props.scale[type] ? this.props.scale[type]().domain() :
      this.props.scale().domain();
    let domain;
    if (this.props.domain) {
      domain = this.props.domain[type] ? this.props.domain[type] : this.props.domain;
    } else if (this.props.data) {
      domain = [_.min(this.props.data, type), _.max(this.props.data, type)];
    } else if (this.props[type]) {
      domain = [_.min(this.props[type]), _.max(this.props[type])];
      else if (this.props.scale)
      domain = scaleDomain;
    }
    // Warn when domains need more information to produce meaningful axes
    if (domain === scaleDomain && _.isDate(scaleDomain[0])) {
      log.warn("please specify tickValues or domain when creating a time scale axis");
    } else if (domain === scaleDomain && scaleDomain.length === 0) {
      log.warn("please specify tickValues or domain when creating an axis using " +
        "ordinal or quantile scales");
    } else if (domain === scaleDomain && scaleDomain.length === 1) {
      log.warn("please specify tickValues or domain when creating an axis using " +
        "a threshold scale");
    }
    return domain;
  }

  getRange(type) {
    if (this.props.range) {
      return this.props.range[type] ? this.props.range[type] : this.props.range;
    }
    const style = this.getStyles().svg; // TODO: hacky
    const dimension = type === "x" ? "width" : "height"
    return [style.margin, style[dimension] - style.width];
  }

  returnOrGenerateX() {
    if (this.props.x) {
      return this.props.x;
    }
    const domain = this.getDomain("x");
    const samples = _.isArray(this.props.y) ? this.props.y.length : this.props.sample;
    const step = _.round(_.max(domain) / samples, 2);
    return _.range(_.min(domain), _.max(domain), step);
  }

  returnOrGenerateY() {
    const y = this.props.y;
    const x = this.returnOrGenerateX();
    if (typeof y === "object" && y.isArray()) {
      return y;
    } else if (typeof y === "function") {
      return _.map(x, (x) => y(x));
    } else {
      // asplode
      return [];
    }
  }

  getData() {
    /*
       Our use-cases are:
       1. The user passes in data as an array of {x: 1, y: 2}
       2. The user provides no x; make it from the domain
       3. The user provides x as an array of points; leave it be
       4. The user provides y as an array of points; leave it be
       5. The user provides y as a function; use x to generate y
     */

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

    const d3Line = d3.svg.line()
      .interpolate(this.props.interpolation)
      .x((data) => xScale(data.x))
      .y((data) => yScale(data.y));

    const path = d3Line(this.getData());
    const style = this.getStyles();
    return (
      <path style={[style.path, this.props.style]}
          d={path} />
    );
  }

  render() {
    return (
      <g>
        {this.drawLine}
      <g>
    );
  }
}

VictoryLine.propTypes = {
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
  style: React.PropTypes.node,
  sample: React.PropTypes.number,
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
  sample: 100,
  scale: () => d3.scale.linear(),
  y: () => Math.random(),
  domain: [0, 100]
};

export default VictoryLine;
