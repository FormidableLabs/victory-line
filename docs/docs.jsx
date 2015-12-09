import React from "react";
import ReactDOM from "react-dom";
import Ecology from "ecology";
import Radium, { Style } from "radium";
import { VictoryTheme } from "formidable-landers";
import {parse as parseComponent} from "react-docgen";

@Radium
class Docs extends React.Component {
  render() {
    return (
      <div>
        <Ecology
          overview={require("!!raw!./ecology.md")}
          source={parseComponent(require("!!raw!../src/components/victory-line"))}
          scope={{React, ReactDOM, VictoryLine: require("../src/components/victory-line")}}
          playgroundtheme="elegant" />
        <Style rules={VictoryTheme}/>
      </div>
    )
  }
}

export default Docs;
