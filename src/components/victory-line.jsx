import React from "react";
import Radium from "radium";
import d3 from "d3";
import _ from "lodash";

@Radium
class VictoryLine extends React.Component {

  constructor(props) {
    super(props);

    // Initialize state.
    this.state = {};

    const styles = this.getStyles();

    // Extrapolate x and y range from style
    this.state.xRange = {
      min: styles.svg.margin,
      max: styles.svg.width - styles.svg.margin
    };
    this.state.yRange = {
      min: styles.svg.margin,
      max: styles.svg.height - styles.svg.margin
    };

    /*
       Our use-cases are:
       1. The user passes in data as an array of {x: 1, y: 2}
       2. The user provides no x; make it from xMin and xMax
       3. The user provides x as an array of points; leave it be
       4. The user provides y as an array of points; leave it be
       5. The user provides y as a function; use x to generate y
     */

    if (this.props.data) {
      this.state.data = this.props.data;
      this.state.x = this.props.data.map(row => row.x);
      this.state.y = this.props.data.map(row => row.y);
    } else {
      this.state.x = this.returnOrGenerateX();
      this.state.y = this.returnOrGenerateY();

      const inter = _.zip(this.state.x, this.state.y);
      const objs = _.map(inter, (obj) => { return {x: obj[0], y: obj[1]}; });

      this.state.data = objs;
    }
  }

  returnOrGenerateX() {
    const step = Math.round(this.state.xRange.max / this.props.sample, 4);
    return this.props.x
         ? this.props.x
         : _.range(this.state.xRange.min, this.state.xRange.max, step);
  }

  returnOrGenerateY() {
    const y = this.props.y;
    if (typeof y === "object" && y.isArray()) {
      return y;
    } else if (typeof y === "function") {
      return _.map(this.state.x, (x) => y(x));
    } else {
      // asplode
      return null;
    }
  }

  getStyles() {
    return _.merge({
      base: {
        color: "#000",
        fontSize: 12,
        textDecoration: "underline"
      },
      red: {
        color: "#d71920",
        fontSize: 30
      },
      path: {
        "fill": "none",
        "stroke": "darkgrey",
        "strokeWidth": "2px"
      },
      svg: {
        "border": "2px solid black",
        "margin": "40",
        "width": "500",
        "height": "200"
      }
    }, this.props.style);
  }

  render() {
    const styles = this.getStyles();

    const xScale = this.props.scale(this.state.xRange.min, this.state.xRange.max);
    const yScale = this.props.scale(this.state.yRange.max, this.state.yRange.min);

    xScale.domain(d3.extent(this.state.data, (obj) => obj.x));
    yScale.domain(d3.extent(this.state.data, (obj) => obj.y));

    const d3Line = d3.svg.line()
                     .interpolate(this.props.interpolation)
                     .x((obj) => xScale(obj.x))
                     .y((obj) => yScale(obj.y));


    const path = d3Line(this.state.data);

    return (
      <svg style={[styles.svg, this.props.style]} >
        <path style={[styles.path, this.props.style]}
              d={path} />
      </svg>
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
  sample: React.PropTypes.number,
  scale: React.PropTypes.func,
  style: React.PropTypes.node,
  x: React.PropTypes.array,
  y: React.PropTypes.oneOfType([
    React.PropTypes.array,
    React.PropTypes.func
  ])
};

VictoryLine.defaultProps = {
  data: null,
  interpolation: "basis",
  range: [0, 100],
  sample: 100,
  scale: (min, max) => d3.scale.linear().range([min, max]),
  x: null,
  y: () => Math.random()
};

export default VictoryLine;
