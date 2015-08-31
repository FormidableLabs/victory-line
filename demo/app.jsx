/*global document:false*/
import React from "react";
import {VictoryLine} from "../src/index";
import _ from "lodash";

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      data: this.getData(1)
    };
  }

  getData(index) {
    return _.map(_.range(100), (i) => {
      return {
        x: i,
        y: Math.random()
      };
    });
  }

  componentDidMount() {
    window.setInterval(() => {
      this.setState({
        data: this.getData()
      });
    }, 2000);
  }

  render() {
    const style = {
      border: "2px solid black",
      margin: 5,
      width: 500,
      height: 200
    };

    return (
      <div className="demo">
        <svg style={style}>
          <VictoryLine style={{stroke: "blue"}}
            data={this.state.data}/>
        </svg>
        <svg style={style}>
          <VictoryLine style={{stroke: "blue"}}
            y={(x) => Math.sin(x)}
            sample={25}/>
        </svg>
        <svg style={style}>
          <VictoryLine style={{stroke: "green"}}
            y={(x) => x * x} />
        </svg>
        <svg style={style}>
          <VictoryLine
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
        </svg>
        <svg style={style}>
          <VictoryLine/>
        </svg>
      </div>
    );
  }
}

const content = document.getElementById("content");

React.render(<App />, content);
