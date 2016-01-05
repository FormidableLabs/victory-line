import React, { PropTypes } from "react";
import Radium from "radium";
import d3Shape from "d3-shape";
import { Chart } from "victory-util";

@Radium
export default class LineSegment extends React.Component {
  static propTypes = {
    data: PropTypes.array,
    interpolation: PropTypes.string,
    scale: PropTypes.object,
    style: PropTypes.object
  };

  getCalculatedValues(props) {
    this.style = Chart.evaluateStyle(props.style, props.data);
    this.interpolation = Chart.evaluateProp(props.interpolation, props.data);
    const xScale = props.scale.x;
    const yScale = props.scale.y;
    const lineFunction = d3Shape.line()
        .curve(d3Shape[this.interpolation])
      .x((data) => xScale(data.x))
      .y((data) => yScale(data.y));
    this.path = lineFunction(props.data);

  }

  renderLine() {
    return (
      <path style={this.style} d={this.path}/>
    );
  }

  render() {
    this.getCalculatedValues(this.props);
    return this.renderLine();
  }
}
