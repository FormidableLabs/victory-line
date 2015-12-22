import isFunction from "lodash/lang/isFunction";
import merge from "lodash/object/merge";
import transform from "lodash/object/transform";
import React, { PropTypes } from "react";
import Radium from "radium";
import {VictoryLabel} from "victory-label";

@Radium
export default class LineLabel extends React.Component {
  static propTypes = {
    data: PropTypes.array,
    labelComponent: PropTypes.any,
    position: PropTypes.object,
    style: PropTypes.object
  };

  evaluateStyle(style) {
    return transform(style, (result, value, key) => {
      result[key] = isFunction(value) ? value.call(this, this.props.data) : value;
    });
  }

  renderLabelComponent(props) {
    const component = props.label;
    const style = this.evaluateStyle(merge({padding: 0}, props.style, component.props.style));
    const children = component.props.children || "";
    const newProps = {
      x: component.props.x || props.position.x + style.padding,
      y: component.props.y || props.position.y - style.padding,
      data: props.data, // Pass data for custom label component to access
      textAnchor: component.props.textAnchor || "start",
      verticalAnchor: component.props.verticalAnchor || "middle",
      style
    };
    return React.cloneElement(component, newProps, children);
  }

  renderVictoryLabel(props) {
    const style = this.evaluateStyle(merge({padding: 0}, props.style));
    return (
      <VictoryLabel
        x={props.position.x + style.padding}
        y={props.position.y - style.padding}
        data={props.data}
        textAnchor={"start"}
        verticalAnchor={"middle"}
        style={style}
      >
        {props.label}
      </VictoryLabel>
    );
  }

  renderLabel(props) {
    return props.label && props.label.props ?
      this.renderLabelComponent(props) : this.renderVictoryLabel(props);
  }

  render() {
    return (
      <g>
        {this.renderLabel(this.props)}
      </g>
    );
  }
}
