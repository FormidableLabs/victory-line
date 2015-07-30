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
    d3Line(obj) {
        return d3.svg.line()
                 .x(obj => obj.x)
                 .y(obj => obj.y);
    }

    render() {
        const styles = this.getStyles();

        const xFunc = this.props.xScale || defaultXScale;
        const yFunc = this.props.yScale || defaultYScale;

        const d3Line = d3.svg.line()
                         .x(obj => xFunc(obj.x))
                         .y(obj => yFunc(obj.y));

        const path = d3Line(
                      [{"x": 5, "y": 5},
                       {"x": 6, "y": 6},
                       {"x": 7, "y": 7}]);

        console.log(path);
        return (
            <g height="100" width="100">
                <path stroke="black"
                      height="100"
                      width="100"
                  d={path} />
            </g>
        );
    }
}

VictoryLine.propTypes = {
    color: React.PropTypes.string
};

VictoryLine.defaultProps = {
    /* width: 100,
       height: 100
       xScale: d3.scale.linear().range([0, this.props.width]),
       yScale: d3.scale.linear().range([this.props.height, 0]) */
}

export default VictoryLine;
