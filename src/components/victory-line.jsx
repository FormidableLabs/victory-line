import React from "react";
import Radium from "radium";
import d3 from "d3";

@Radium
class VictoryLine extends React.Component {
  constructor(props) {
    super(props);
  }

  genData() {
    const numPts = 100;

    let pts = [];
    let i = 0;

    while (pts.length < numPts) {
      let x = i;
      let y = Math.round(Math.random() * numPts, 1);
      pts.push({"x": x, "y": y});
      i = i + 1;
    }

    console.log(pts);
    return pts;
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
        "margin": "20px"
      }
    };
  }

  render() {
    const styles = this.getStyles();

    const xScale = this.props.scale(this.props.xMin, this.props.width);
    const yScale = this.props.scale(this.props.height, this.props.yMin);

    const data = this.props.data || this.genData();

    xScale.domain(this.props.xExtent(data));
    yScale.domain(this.props.yExtent(data));

    const d3Line = d3.svg.line()
                     .x(obj => xScale(obj.x))
                     .y(obj => yScale(obj.y));

    const path = d3Line(data);

    return (
      <svg height={this.props.height}
           width={this.props.width}
           >
        <path d={path}
              stroke={this.props.stroke}
              fill={this.props.fill}
        />
      </svg>
    );
  }
}

VictoryLine.propTypes = {
  color: React.PropTypes.string,
  data: React.PropTypes.node,
  width: React.PropTypes.string,
  height: React.PropTypes.string,
  stroke: React.PropTypes.string,
  fill: React.PropTypes.string,
  xDomain: React.PropTypes.func,
  yDomain: React.PropTypes.func,
  xMin: React.PropTypes.number,
  yMin: React.PropTypes.number,
};

VictoryLine.defaultProps = {
  width: "1000",
  height: "1000",
  stroke: "black",
  fill: "none",
  xMin: 0,
  yMin: 0,
  xExtent: (data) => d3.extent(data, function(d) { return d.x; }),
  yExtent: (data) => d3.extent(data, function(d) { return d.y; }),
  scale: (min, max) => d3.scale.linear().range([min, max])
}

export default VictoryLine;
