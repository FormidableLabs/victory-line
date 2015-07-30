/*global document:false*/
import React from "react";
import {VictoryLine} from "../src/index";

class App extends React.Component {
  render() {
    return (
      <div className="demo">
        <svg>
          < VictoryLine/>
        </svg>
        <svg>
          < VictoryLine color={"red"}/>
        </svg>
      </div>
    );
  }
}

const content = document.getElementById("content");

React.render(<App/>, content);
