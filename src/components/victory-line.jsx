import React from "react";
import Radium from "radium";
import d3 from "d3";
import _ from "lodash";
import log from "../log";
import {VictoryAnimation} from "victory-animation";


class VLine extends React.Component {
  constructor(props) {
    super(props);
    this.getCalculatedValues(props);
  }

  componentWillReceiveProps(nextProps) {
    this.getCalculatedValues(nextProps);
  }

  getCalculatedValues(props) {
    this.style = this.getStyles(props);
    this.range = {
      x: this.getRange(props, "x"),
      y: this.getRange(props, "y")
    };
    this.domain = {
      x: this.getDomain(props, "x"),
      y: this.getDomain(props, "y")
    };
    this.scale = {
      x: this.getScale(props, "x"),
      y: this.getScale(props, "y")
    };
    this.dataset = this.getData(props);
  }

  getStyles(props) {
    return _.merge({
      fill: "none",
      stroke: "darkgrey",
      strokeWidth: 2,
      margin: 5,
      width: 500,
      height: 200
    }, this.props.style);
  }

  getScale(props, axis) {
    const scale = props.scale[axis] ? props.scale[axis]().copy() :
      props.scale().copy();
    const range = this.range[axis];
    const domain = this.domain[axis];
    scale.range(range);
    scale.domain(domain);
    // hacky check for identity scale
    if (_.difference(scale.range(), range).length !== 0) {
      // identity scale, reset the domain and range
      scale.range(range);
      scale.domain(range);
      log.warn("Identity Scale: domain and range must be identical. " +
        "Domain has been reset to match range.");
    }
    return scale;
  }

  getDomain(props, axis) {
    if (props.domain) {
      return props.domain[axis] || props.domain;
    } else if (props.data || _.isArray(props[axis])) {
      return this._getDomainFromData(props, axis);
    } else {
      return this._getDomainFromScale(props, axis);
    }
  }


  // helper method for getDomain
  _getDomainFromData(props, axis) {
    // if data is given, return the max/min of the data
    if (props.data) {
      return [_.min(_.pluck(props.data, axis)), _.max(_.pluck(props.data, axis))];
    } else {
      // return the max / min of the array specified by props[axis]
      return [_.min(props[axis]), _.max(props[axis])];
    }
  }

  // helper method for getDomain
  _getDomainFromScale(props, axis) {
    // The scale will never be undefined due to default props
    const scaleDomain = props.scale[axis] ? props.scale[axis]().domain() :
      props.scale().domain();

    // Warn when particular types of scales need more information to produce meaningful lines
    if (_.isDate(scaleDomain[0])) {
      log.warn("please specify a domain or data when using time scales");
    } else if (scaleDomain.length === 0) {
      log.warn("please specify a domain or data when using ordinal or quantile scales");
    } else if (scaleDomain.length === 1) {
      log.warn("please specify a domain or data when using a threshold scale");
    }
    // return the default domain for the scale
    return scaleDomain;
  }

  getRange(props, axis) {
    if (props.range) {
      return props.range[axis] ? props.range[axis] : props.range;
    }
    // if the range is not given in props, calculate it from width, height and margin
    return axis === "x" ?
      [this.style.margin, this.style.width - this.style.margin] :
      [this.style.height - this.style.margin, this.style.margin];
  }

  getData(props) {
    if (props.data) {
      return props.data;
    }
    const x = this.returnOrGenerateX(props);
    const y = this.returnOrGenerateY(props, x);
    const n = _.min([x.length, y.length]);
    // create a dataset from x and y with n points
    const dataset = _.zip(_.take(x, n), _.take(y, n));
    // return data as an array of objects
    return _.map(dataset, (point) => {
      return {x: point[0], y: point[1]};
    });
  }

  returnOrGenerateX(props) {
    if (props.x) {
      return props.x;
    }
    // if x is not given in props, create an array of values evenly
    // spaced across the x domain
    const domain = this.domain.x;
    const samples = _.isArray(props.y) ? props.y.length : props.samples;
    const step = _.max(domain) / samples;
    // return an array of x values spaced across the domain,
    // include the maximum of the domain
    return _.union(_.range(_.min(domain), _.max(domain), step), [_.max(domain)]);
  }

  returnOrGenerateY(props, x) {
    if (_.isFunction(props.y)) {
      // if y is a function, apply the function y to to each value of the array x,
      // and return the results as an array
      return _.map(x, (datum) => props.y(datum));
    }
    // y is either a function or an array, and is never undefined
    // if it isn't a function, just return it.
    return props.y;
  }

  drawLine() {
    const xScale = this.scale.x;
    const yScale = this.scale.y;
    const lineFunction = d3.svg.line()
      .interpolate(this.props.interpolation)
      .x((data) => xScale(data.x))
      .y((data) => yScale(data.y));
    return <path style={this.style} d={lineFunction(this.dataset)}/>;
  }

  render() {
    if (this.props.containerElement === "svg") {
      return (
        <svg style={this.style}>
          {this.drawLine()}
        </svg>
      );
    }
    return (
      <g style={this.style}>
        {this.drawLine()}
      </g>
    );
  }
}

@Radium
class VictoryLine extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    if (this.props.animate) {
      // dont interpolate y if it is a function!
      const yFunc = _.isFunction(this.props.y) ? this.props.y : undefined;
      return (
        <VictoryAnimation data={this.props}>
          {(props) => {
            return (
              <VLine
                {...props}
                animate={this.props.animate}
                scale={this.props.scale}
                y={yFunc || props.y}
                containerElement={this.props.containerElement}
                interpolation={this.props.interpolation}/>
            );
          }}
        </VictoryAnimation>
      );
    }
    return (<VLine {...this.props}/>);
  }
}

const propTypes = {
  style: React.PropTypes.node,
  data: React.PropTypes.arrayOf(
    React.PropTypes.shape({
      x: React.PropTypes.any,
      y: React.PropTypes.any
    })
  ),
  x: React.PropTypes.array,
  y: React.PropTypes.oneOfType([
    React.PropTypes.array,
    React.PropTypes.func
  ]),
  domain: React.PropTypes.oneOfType([
    React.PropTypes.array,
    React.PropTypes.shape({
      x: React.PropTypes.array,
      y: React.PropTypes.array
    })
  ]),
  range: React.PropTypes.oneOfType([
    React.PropTypes.array,
    React.PropTypes.shape({
      x: React.PropTypes.array,
      y: React.PropTypes.array
    })
  ]),
  scale: React.PropTypes.oneOfType([
    React.PropTypes.func,
    React.PropTypes.shape({
      x: React.PropTypes.func,
      y: React.PropTypes.func
    })
  ]),
  samples: React.PropTypes.number,
  interpolation: React.PropTypes.oneOf([
    "linear",
    "linear-closed",
    "step",
    "step-before",
    "step-after",
    "basis",
    "basis-open",
    "basis-closed",
    "bundle",
    "cardinal",
    "cardinal-open",
    "cardinal-closed",
    "monotone"
  ]),
  animate: React.PropTypes.bool,
  containerElement: React.PropTypes.oneOf(["svg", "g"])
};

const defaultProps = {
  interpolation: "basis",
  samples: 50,
  scale: () => d3.scale.linear(),
  y: (x) => x,
  animate: false,
  containerElement: "svg"
};

VictoryLine.propTypes = propTypes;
VictoryLine.defaultProps = defaultProps;
VLine.propTypes = propTypes;
VLine.defaultProps = defaultProps;

export default VictoryLine;
