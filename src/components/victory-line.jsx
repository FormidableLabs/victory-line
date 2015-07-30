import React from "react";
import Radium from "radium";
import d3 from "d3";

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

    const xScale = this.props.scale(this.props.xMin, this.props.width);
    const yScale = this.props.scale(this.props.height, this.props.yMin);

    const data = this.props.data;

    this.props.xDomain(data);
    this.props.yDomain(data);

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
  xDomain: (data) => d3.extent(data, function(d) { return d.x; }),
  yDomain: (data) => d3.extent(data, function(d) { return d.y; }),
  scale: (min, max) => d3.scale.linear().range([min, max])
}

export default VictoryLine;
