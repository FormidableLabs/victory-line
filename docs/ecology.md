Victory Line
=============
Victory Line
============

`victory-line` draws an SVG line on your screen. Unlike core `d3`, it can graph
functions or passed in data, from a clean `React` interface. Style, data,
interpolate, scale -- all can be overridden by passing in new values.

## Examples

The plain component comes with a random data generator, so rendering will
produce *some* output.

This:

```playground
<VictoryLine />
```

will produce a straight line.

Styles can be overridden by passing them in as a map. Also, we can graph
arbitrary equations.

```playground
<VictoryLine 
  style={{stroke: "blue"}}
  y={(x) => Math.sin(x)}/>
```

Or you can pass in data:

```playground
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
```

