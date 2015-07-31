/*global document:false*/
import React from "react";
import {VictoryLine} from "../src/index";

class App extends React.Component {
  render() {
    return (
      <div className="demo">
        <VictoryLine style={{stroke: "blue"}}
                     y={(x) => Math.sin(x)}
                     sample={25}/>
        <VictoryLine style={{stroke: "green"}}
                     y={(x) => x * x} />
        <VictoryLine />
      </div>
    );
  }
}

const content = document.getElementById("content");

React.render(<App />, content);
