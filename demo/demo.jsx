/*global window:false */
import React from "react";
import _ from "lodash";
import {VictoryLine} from "../src/index";
import {VictoryChart} from "victory-chart";
import {VictoryLabel} from "victory-label";

export default class App extends React.Component {
  constructor() {
    super();
    this.state = {
      data: this.getData(),
      arrayData: this.getArrayData(),
      style: {
        stroke: "blue",
        strokeWidth: 2
      }
    };
  }

  getData() {
    return _.map(_.range(100), (i) => {
      return {
        x: i,
        y: Math.random()
      };
    });
  }
  getArrayData() {
    return _.range(40).map((i) => [i, i + (Math.random() * 3)]);
  }

  getStyles() {
    const colors = ["red", "orange", "cyan", "green", "blue", "purple"];
    return {
      stroke: colors[_.random(0, 5)],
      strokeWidth: [_.random(1, 5)]
    };
  }

  componentWillMount() {
    window.setInterval(() => {
      this.setState({
        data: this.getData(),
        style: this.getStyles()
      });
    }, 2000);
  }

  render() {
    return (
      <div className="demo">
        <VictoryLine
          style={{parent: {border: "1px solid black", margin: "5px"}, data: this.state.style}}
          data={this.state.data}
          label={"label\none"}
          animate={{velocity: 0.03}}
        />

        <ChartWrap>
          <VictoryLine
            style={{parent: {border: "1px solid black", margin: "5px"}, data: {stroke: "blue"}}}
            y={(d) => Math.sin(2 * Math.PI * d.x)}
            label={<VictoryLabel>{"label\ntwo"}</VictoryLabel>}
            sample={25}
          />
        </ChartWrap>

        <ChartWrap>
          <VictoryLine
            style={{parent: {border: "1px solid black", margin: "5px"}, data: {stroke: "red"}}}
            data={_.range(0, 100)}
            x={null}
            y={(d) => d * d}
          />
        </ChartWrap>

        <ChartWrap>
          <VictoryLine
            style={{parent: {border: "1px solid black", margin: "5px"}}}
            data={this.state.arrayData}
            x={0}
            y={1}
          />
        </ChartWrap>

        <VictoryChart>
          <VictoryLine
            style={{data: {stroke: "red"}}}
            data={[
              {x: 1, y: 2},
              {x: 2, y: 3},
              {x: 3, y: 5},
              {x: 4, y: 9}
            ]}
          />
          <VictoryLine
            style={{data: {stroke: "blue"}}}
            data={[
              {x: 3, y: 6},
              {x: 4, y: 10},
              {x: 5, y: 12},
              {x: 6, y: 14}
            ]}
          />
        </VictoryChart>

        <ChartWrap>
          <VictoryLine
            style={{parent: {border: "1px solid black", margin: "5px"}}}
            data={[
              {x: new Date(1982, 1, 1), y: 125},
              {x: new Date(1987, 1, 1), y: 257},
              {x: new Date(1993, 1, 1), y: 345},
              {x: new Date(1997, 1, 1), y: 515},
              {x: new Date(2001, 1, 1), y: 132},
              {x: new Date(2005, 1, 1), y: 305},
              {x: new Date(2011, 1, 1), y: 270},
              {x: new Date(2015, 1, 1), y: 470}
            ]}
          />
        </ChartWrap>

        <ChartWrap>
          <VictoryLine
            style={{parent: {border: "1px solid black", margin: "5px"}}}
            data={[
              {x: 1, y: 1},
              {x: 2, y: 3},
              {x: 3, y: 5},
              {x: 4, y: 2},
              {x: 5, y: null},
              {x: 6, y: null},
              {x: 7, y: 6},
              {x: 8, y: 7},
              {x: 9, y: 8},
              {x: 10, y: 12}
            ]}
          />
        </ChartWrap>

        <ChartWrap>
          <VictoryLine
            style={{parent: {border: "1px solid black", margin: "5px"}}}
            scale={{x: "linear", y: "log"}}
          />
        </ChartWrap>
      </div>
    );
  }
}

class ChartWrap extends React.Component {
  static propTypes = {
    width: React.PropTypes.number,
    height: React.PropTypes.number,
    children: React.PropTypes.any
  };
  static defaultProps = {
    width: 350,
    height: 250
  };
  // renders both a standalone chart, and a version wrapped in VictoryChart,
  // to test both cases at once
  render() {
    return (
      <div>
        {React.cloneElement(this.props.children, this.props)}
        <VictoryChart {...this.props}>{this.props.children}</VictoryChart>
      </div>
    );
  }
}
