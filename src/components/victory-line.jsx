import React from "react";
import Radium from "radium";
import d3 from "d3";

const defaultXScale = d3.scale.linear().range([0, 50]);
const defaultYScale = d3.scale.linear().range([50, 0]);

@Radium
class VictoryLine extends React.Component {
  constructor(props) {
    super(props);
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
        "strokeWidth": ".4px"
      },
      svg: {
        "border": "2px solid black",
        "margin": "20px"
      }
    };
  }

  render() {
    const styles = this.getStyles();

    const xFunc = this.props.xScale || defaultXScale;
    const yFunc = this.props.yScale || defaultYScale;

    const data = this.props.data;

    xFunc.domain();
    yFunc.domain(d3.extent(data, function(d) { return d.y; }));

    const d3Line = d3.svg.line()
                     .x(obj => xFunc(obj.x))
                     .y(obj => yFunc(obj.y));

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
  stroke: React.PropTypes.string
  fill: React.PropTypes.string,
  xDomain: React.PropTypes.func
};

VictoryLine.defaultProps = {
  width: "1000",
  height: "1000",
  stroke: "black",
  fill: "none",
  xDomain: d3.extent(data, function(d) { return d.x; }),
  yDomain: d3.extent(data, function(d) { return d.y; })
    /* xScale: d3.scale.linear().range([0, this.props.width]),
       yScale: d3.scale.linear().range([this.props.height, 0]) */
}

export default VictoryLine;
