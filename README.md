[![Travis Status][trav_img]][trav_site]

Victory Line
============

`victory-line` draws an SVG line on your screen. Unlike core `d3`, it can graph
functions or passed in data, from a clean `React` interface. Style, data,
interpolate, scale -- all can be overridden by passing in new values.

## Examples

The plain component comes with a random data generator, so rendering will
produce *some* output.

This:

``` javascript
<VictoryLine />
```

Gets you this:

![A chart!](victory-line_rand.png)

Styles can be overridden by passing them in as a map. Also, we can graph
arbitrary equations.

So this:

``` javascript
<VictoryLine style={{stroke: "blue"}}
y={(x) => Math.sin(x)}
sample={25}/>
```

Makes this:

![Oooooh! Ahhhhh!](victory-line_sin.png)

Likewise:

``` javascript
<VictoryLine style={{stroke: "green"}}
y={(x) => x * x} />
```

Makes this:

![V. Nice](victory-line_equation.png)

Or you can pass in your own data:

``` javascript
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

Makes:

![Victory!](victory-line_data-passed-in.png)

## The API

### Props

All props are **optional** -- they can all be omitted, and the component will
still render. So: the values listed for each prop are the values you should pass
_if you pass them at all_.

The following props are supported:

#### `data`

Primary way to pass in a data set for plotting. If the `data` prop is omitted,
`victory-line` will fall back to plotting the `x` and `y` props; if `x` and `y`
are absent, random data is generated and plotted.

`data`, must be of the form `[{x: <x val>, y: <y-val>}]`, where `x
val` and `y val` are numbers.

#### `x`

An array of numbers representing the points along the x axis to plot.

**Defaults to:** `_range(xMin, xMax, sample)`

#### `y`

An array of numbers OR a function in terms of `x` (i.e. `(x) => x * x`).

**Defaults to:** `Math.random()`

#### `xMin`, `xMax`, `yMin`, and `yMax`

Contol the min and max values for their respective axis.

**Defaults to:** The mins default to 0; the maxes default to 100.

#### `sample`

Controls the number of points generated when plotting a function.

**Defaults to:** 100

#### `scale`

A `d3` scale. Currently, teh same scale is used for both the x and y axis.

**Defaults to:** `d3.scale.linear`

#### `interpolation`

A `d3`
[interpolation](https://github.com/mbostock/d3/wiki/SVG-Shapes#line_interpolate). Can
take the name of any valid interpolation as a string.

**Defaults to:** "basis"

## Development

Please see [DEVELOPMENT](DEVELOPMENT.md)

## Contributing

Please see [CONTRIBUTING](CONTRIBUTING.md)

[trav_img]: https://api.travis-ci.org/FormidableLabs/victory-line.svg
[trav_site]: https://travis-ci.org/FormidableLabs/victory-line
