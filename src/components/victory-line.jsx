import React from "react";
import Radium from "radium";
import d3 from "d3";
import _ from "lodash";

@Radium
class VictoryLine extends React.Component {

  constructor(props) {
    super(props);
    /**
     * Our use-cases are:
     * 1. The user passes in data as an array of {x: 1, y: 2}-style pairs
     * 2. The user provides no x; make it from xMin and xMax
     * 3. */
    if (this.props.data) {
      this.state = {
        data: this.props.data,
        x: this.props.data.map(row => row.x),
        y: this.props.data.map(row => row.y)
      };
    } else {
      this.state = {
        x: this.returnOrGenerateX(),
        y: this.returnOrGenerateY()
      }

      this.state.data = _.zip([this.state.x, this.state.y]);
    }

  }

  returnOrGenerateX() {
    return this.props.x
         ? this.props.x
         : _.range(this.props.xMin, this.props.xMax, this.props.sample)
  }

  returnOrGenerateY() {
    const y = this.props.y;
    if (typeof(y) === "array") {
      return y;
    } else if (typeof(y) === "function") {
      return this.props.x.map(x => y(x))
    } else {
      // asplode
      return null;
    }
  }

  getStyles() {
    return {
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
        "margin": "20px",
        "width": "1000",
        "height": "1000"
      }
    };
  }

  render() {
    const styles = this.getStyles();

    const xScale = this.props.scale(this.props.xMin, styles.width);
    const yScale = this.props.scale(styles.height, this.props.yMin);

    console.log(this.state.data);

    xScale.domain(d3.extent(this.state.data, (data) => data.x));
    yScale.domain(d3.extent(this.state.data, (data) => data.y));

    const d3Line = d3.svg.line()
                     .x(obj => xScale(obj.x))
                     .y(obj => yScale(obj.y));

    const path = d3Line(data);

    return (
      <svg style={[styles.text]} >
        <path d={path} />
      </svg>
    );
  }
}

VictoryLine.propTypes = {
  data: React.PropTypes.node,
  xMin: React.PropTypes.number,
  yMin: React.PropTypes.number,
  xMax: React.PropTypes.number,
  yMax: React.PropTypes.number,
  sample: React.PropTypes.number,
  x: React.PropTypes.array,
  y: React.PropTypes.oneOfType([
    React.PropTypes.array,
    React.PropTypes.func
  ]),
  scale: React.PropTypes.func
};

VictoryLine.defaultProps = {
  xMin: 0,
  yMin: 0,
  xMax: 100,
  yMax: 100,
  data: null,
  sample: 100,
  x: null,
  y: () => Math.round(Math.random(), 1),
  scale: (min, max) => d3.scale.linear().range([min, max])
}

export default VictoryLine;
