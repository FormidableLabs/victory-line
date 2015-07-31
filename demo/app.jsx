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
        <VictoryLine data={[
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
      </div>
    );
  }
}

const content = document.getElementById("content");

React.render(<App />, content);
