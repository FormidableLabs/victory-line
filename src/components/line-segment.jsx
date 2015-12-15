import _ from "lodash";
import React, { PropTypes } from "react";
import Radium from "radium";
import d3Shape from "d3-shape";
import {VictoryAnimation} from "victory-animation";

@Radium
export default class LineSegment extends React.Component {
  static propTypes = {
    animate: PropTypes.object,
    data: PropTypes.array,
    interpolation: PropTypes.string,
    scale: PropTypes.object,
    style: PropTypes.object
  };

  evaluateStyle(style) {
    return _.transform(style, (result, value, key) => {
      result[key] = this.evaluateProp(value);
    });
  }

  evaluateProp(prop) {
    return _.isFunction(prop) ? prop.call(this, this.props.data) : prop;
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
    if (this.props.animate) {
      // Do less work by having `VictoryAnimation` tween only values that
      // make sense to tween. In the future, allow customization of animated
      // prop whitelist/blacklist?
      const animateData = _.pick(this.props, ["style", "data", "scale"]);
      return (
        <VictoryAnimation {...this.props.animate} data={animateData}>
          {(props) => <LineSegment {...this.props} {...props} animate={null}/>}
        </VictoryAnimation>
      );
    } else {
      this.getCalculatedValues(this.props);
    }
    return this.renderLine();
  }
}
