import isFunction from "lodash/lang/isFunction";
import transform from "lodash/object/transform";
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

  evaluateStyle(style) {
    return transform(style, (result, value, key) => {
      result[key] = this.evaluateProp(value);
    });
  }

  evaluateProp(prop) {
    return isFunction(prop) ? prop.call(this, this.props.data) : prop;
  }

  getCalculatedValues(props) {
    this.style = this.evaluateStyle(props.style);
    this.interpolation = this.evaluateProp(props.interpolation);
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
