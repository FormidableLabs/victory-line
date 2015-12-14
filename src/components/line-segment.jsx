import React, { PropTypes } from "react";
import Radium from "radium";
import d3Shape from "d3-shape";


@Radium
export default class LineSegment extends React.Component {
  static propTypes = {
    data: PropTypes.array,
    interpolation: PropTypes.string,
    scale: PropTypes.object,
    style: PropTypes.object
  };

  render() {
    const xScale = this.props.scale.x;
    const yScale = this.props.scale.y;
    const lineFunction = d3Shape.line()
        .curve(d3Shape[this.props.interpolation])
      .x((data) => xScale(data.x))
      .y((data) => yScale(data.y));
    return (
      <path style={this.props.style} d={lineFunction(this.props.data)}/>
    );
  }
}
