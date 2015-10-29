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

will produce a straight line.

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

An array of numbers representing the points along the x axis to plot. If no array is provided, `x` will be calculated based on the `domain` and the number of `samples`.

#### `y`

An array of numbers OR a function in terms of `x` (i.e. `(x) => x * x`).

**Defaults to:** `Math.random()`

#### `domain`

`domain` can be passed in as a single array, or as an object with arrays corresponding to each dimension like so:

```
domain={{
  x: [0, 5],
  y: [5, 0]
}}
```

If `domain` is not explicitly specified, it will be calculated from `data`, `x`, or `y`.  If these values are not specified either, the `domain` will be set to the default domain for the provided scale.

#### `range`

`range` can be passed in as a single array, or as an object with arrays corresponding to each dimension like so:

```
range={{
  x: [0, 5],
  y: [5, 0]
}}
```

If `range` is not explicitly specified, it will be calculated from `height`, `width`, and `margin` properties of the styles for this component.

#### `sample`

Controls the number of points generated when plotting a function.

**Defaults to:** 100

#### `scale`

A `d3` scale. `scale` can be given as a function, or as an object specifying  a scale function each dimension, like so:

```
scale: {{
  x: () => d3.scale.linear(),
  y: () => d3.scale.log()
}}
```

**Defaults to:** `d3.scale.linear`

#### `interpolation`

A `d3`
[interpolation](https://github.com/mbostock/d3/wiki/SVG-Shapes#line_interpolate). Can
take the name of any valid interpolation as a string.

**Defaults to:** "basis"

#### `containerElement`

This prop determines whether to render Victory Scatter in a `<g>` or `<svg>` element. It is useful to set this prop to "g" if you are composing Victory Scatter with other victory components.

**PropTypes** "g" or "svg"

**Default** `containerElement: "svg"`

#### `animate`

This prop determines whether or not to animate transitions as data changes.  Animation is handled by [Victory Animation](https://github.com/FormidableLabs/victory-animation)

**PropTypes** bool

**Default** `animate: false`

#### `velocity`

This value controls the speed of your animation transitions. It only applies if the `animate` prop is set to `true`.

**PropTypes** number

**Default** `velocity: 0.02`

## Development

Please see [DEVELOPMENT](DEVELOPMENT.md)

## Contributing

Please see [CONTRIBUTING](CONTRIBUTING.md)

[trav_img]: https://api.travis-ci.org/FormidableLabs/victory-line.svg
[trav_site]: https://travis-ci.org/FormidableLabs/victory-line
