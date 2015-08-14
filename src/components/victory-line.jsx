import React from "react";
import Radium from "radium";
import d3 from "d3";
import _ from "lodash";

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
    if (this.props.domain && this.props.domain[type]) {
      // if the domain for this type is given, return it
      return this.props.domain[type];
    } else if (this.props.domain) {
      // if the domain is given without the type specified, return the domain (reversed for y)
      return type === "x" ? this.props.domain : this.props.domain.concat().reverse();
    } else if (this.props.data) {
      // if data is given, return the range of the data (reversed for y)
      return type === "x" ?
        [_.min(this.props.data, type)[type], _.max(this.props.data, type)[type]] :
        [_.max(this.props.data, type)[type], _.min(this.props.data, type)[type]];
    } else if (this.props[type] && _.isArray(this.props[type])) {
      // if data of the type specified is given as an array, return the range of the
      // data array (reversed for y)
      return type === "x" ? [_.min(this.props[type]), _.max(this.props[type])] :
        [_.max(this.props[type]), _.min(this.props[type])];
    } else if (this.props.scale) {
      // if none of the above, return the default domain of the scale. The scale will
      // never be undefined due to default props
      const scaleDomain = this.props.scale[type] ? this.props.scale[type]().domain() :
        this.props.scale().domain();

      return type === "x" ? scaleDomain : scaleDomain.reverse();
    }
  }

  getRange(type) {
    if (this.props.range) {
      return this.props.range[type] ? this.props.range[type] : this.props.range;
    }
    const style = this.getStyles().svg; // TODO: hacky
    const dimension = type === "x" ? "width" : "height";
    return [style.margin, style[dimension] - style.margin];
  }

  returnOrGenerateX() {
    if (this.props.x) {
      return this.props.x;
    }
    const domain = this.getDomain("x");
    const samples = _.isArray(this.props.y) ? this.props.y.length : this.props.samples;
    const step = _.round(_.max(domain) / samples, 2);
    return _.range(_.min(domain), _.max(domain), step);
  }

  returnOrGenerateY() {
    const y = this.props.y;
    const x = this.returnOrGenerateX();
    if (typeof y === "object" && y.isArray()) {
      return y;
    } else if (typeof y === "function") {
      return _.map(x, (datum) => y(datum));
    } else {
      // asplode
      return [];
    }
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
    const d3Line = d3.svg.line()
      .interpolate(this.props.interpolation)
      .x((data) => xScale(data.x))
      .y((data) => yScale(data.y));

    const path = d3Line(this.getData());
    const style = this.getStyles();
    return <path style={[style.path, this.props.style]} d={path} />;
  }

  render() {
    const style = this.getStyles();
    return (
      <g style={[style.svg, this.props.style]}>
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
