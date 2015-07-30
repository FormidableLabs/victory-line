/*global document:false*/
import React from "react";
import {VictoryLine} from "../src/index";

class App extends React.Component {
    render() {
        return (
            <div className="demo">
                < VictoryLine data={this.props.data} />
            </div>
        );
    }
}

const data = [
    {"x": 2, "y": 3},
    {"x": 4, "y": 5},
    {"x": 5, "y": 7},
    {"x": 6, "y": 11},
    {"x": 7, "y": 15},
    {"x": 8, "y": 8},
];

const content = document.getElementById("content");

React.render(<App data={data} />, content);
