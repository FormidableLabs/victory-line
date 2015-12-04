import React, { PropTypes } from "react";
import Radium from "radium";
import d3 from "d3";


@Radium
export default class LineSegment extends React.Component {
  static propTypes = {
    data: PropTypes.array,
    interpolation: PropTypes.string,
    scale: PropTypes.object,
    style: PropTypes.object
  };

  static defaultProps = {
  };

  render() {
    const xScale = this.props.scale.x;
    const yScale = this.props.scale.y;
    const lineFunction = d3.svg.line()
      .interpolate(this.props.interpolation)
      .x((data) => xScale(data.x))
      .y((data) => yScale(data.y));
    return (
      <path style={this.props.style} d={lineFunction(this.props.data)}/>
    );
  }
}
