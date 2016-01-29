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

  // describe("rendering with accessors", () => {
  //   it("renders array-type data", () => {
  //     const data = [
  //       [1, 2],
  //       [3, 4]
  //     ];
  //     renderedComponent = TestUtils.renderIntoDocument(<VictoryLine data={data} x={0} y={1} />);
  //     const path = TestUtils.scryRenderedDOMComponentsWithTag(renderedComponent, "path");
  //     expect(path.length).to.equal(1);
  //   });
  //
  //   it("renders data values with null accessor", () => {
  //     const data = [1, 2, 3, 4];
  //     renderedComponent = TestUtils.renderIntoDocument(
  //       <VictoryLine data={data} x={null} y={null} />
  //     );
  //     const path = TestUtils.scryRenderedDOMComponentsWithTag(renderedComponent, "path");
  //     expect(path.length).to.equal(1);
  //   });
  //
  //   it("renders deeply nested data", () => {
  //     const data = [
  //       {a: {b: [{x: 1, y: 2}]}},
  //       {a: {b: [{x: 3, y: 4}]}}
  //     ];
  //     renderedComponent = TestUtils.renderIntoDocument(
  //       <VictoryLine data={data} x={'a.b[0].x'} y={'a.b.0.y'} />
  //     );
  //     const path = TestUtils.scryRenderedDOMComponentsWithTag(renderedComponent, "path");
  //     expect(path.length).to.equal(1);
  //   });
  // });
});
