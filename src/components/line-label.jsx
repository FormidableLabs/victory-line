import _ from "lodash";
import React, { PropTypes } from "react";
import Radium from "radium";
import {VictoryAnimation} from "victory-animation";
import {VictoryLabel} from "victory-label";


@Radium
export default class LineLabel extends React.Component {
  static propTypes = {
    animate: PropTypes.object,
    data: PropTypes.array,
    labelComponent: PropTypes.any,
    position: PropTypes.object,
    style: PropTypes.object
  };

  evaluateStyle(style) {
    return _.transform(style, (result, value, key) => {
      result[key] = _.isFunction(value) ? value.call(this, this.props.data) : value;
    });
  }

  renderLabelComponent(props) {
    const component = props.label;
    const style = this.evaluateStyle(_.merge({padding: 0}, props.style, component.props.style));
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
    const style = this.evaluateStyle(_.merge({padding: 0}, props.style));
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
    if (this.props.animate) {
      // Do less work by having `VictoryAnimation` tween only values that
      // make sense to tween. In the future, allow customization of animated
      // prop whitelist/blacklist?
      const animateData = _.pick(this.props, ["position", "style", "data"]);
      return (
        <VictoryAnimation {...this.props.animate} data={animateData}>
          {(props) => <LineLabel {...this.props} {...props} animate={null}/>}
        </VictoryAnimation>
      );
    }
    return (
      <g>
        {this.renderLabel(this.props)}
      </g>
    );
  }
}
