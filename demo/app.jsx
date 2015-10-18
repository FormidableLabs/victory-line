/*global document:false*/
/*global window:false */
import React from "react";
import ReactDOM from "react-dom";
import {VictoryLine} from "../src/index";
import _ from "lodash";

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      data: this.getData(),
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

  getStyles() {
    const colors = ["red", "orange", "cyan", "green", "blue", "purple"];
    return {
      stroke: colors[_.random(0, 5)],
      strokeWidth: [_.random(1, 5)]
    };
  }

  componentDidMount() {
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
          style={{border: "2px solid black", data: this.state.style}}
          data={this.state.data}
          label="label\none"
          animate={{velocity: 0.03}}/>

        <VictoryLine style={{border: "2px solid black", data: {stroke: "blue"}}}
          y={(x) => Math.sin(x)}
          sample={25}/>

        <VictoryLine style={{border: "2px solid black", data: {stroke: "red"}}}
          y={(x) => x * x} />

        <VictoryLine style={{border: "2px solid black"}}
          data={[
            {x: 1, y: 1},
            {x: 2, y: 4},
            {x: 3, y: 5},
            {x: 4, y: 2},
            {x: 5, y: 11},
            {x: 6, y: 7},
            {x: 7, y: 6},
            {x: 8, y: 7},
            {x: 9, y: 8},
            {x: 10, y: 12}
          ]}/>

        <VictoryLine style={{border: "2px solid black"}}/>
      </div>
    );
  }
}

const content = document.getElementById("content");

ReactDOM.render(<App />, content);
