/**
 * Client tests
 */
import React from "react";
import ReactDOM from "react-dom";
import VictoryLine from "src/components/victory-line";
// Use `TestUtils` to inject into DOM, simulate events, etc.
// See: https://facebook.github.io/react/docs/test-utils.html
import TestUtils from "react-addons-test-utils";

let renderedComponent;

describe("components/victory-line", () => {
  describe("default component rendering", () => {
    before(() => {
      renderedComponent = TestUtils.renderIntoDocument(<VictoryLine/>);
    });

    it("renders a canvas with the correct width and height", () => {

      const output = ReactDOM.findDOMNode(renderedComponent);

      // default width and height
      expect(output.width).to.equal(VictoryLine.defaultProps.width);
      expect(output.height).to.equal(VictoryLine.defaultProps.height);
    });
  });
  // TODO: testing strategy for canvas components
});
