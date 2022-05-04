# color

> Deno library for immutable color conversion and manipulation with support for
> CSS color strings.

```typescript
import { Color } from "https://deno.land/x/color/mod.ts";

const color = Color.rgb(35, 64, 115);
console.log(color.string()); // rgb(35, 64, 115)
console.log(color.cmyk().string()); // cmyk(70%, 44%, 0%, 55%)
console.log(color.hsv().string()); // hsv(218, 70%, 45%)
console.log(color.hex()); // #234073
```

## Usage

### Getters

Convert a color to a different space (hsl(), cmyk(), etc.).

```typescript
color.hsl();
```

Get an object representing the color

```typescript
color.object(); // {r: 255, g: 255, b: 255}
```

Get an array representing the color

```typescript
color.rgb().array(); // [255, 255, 255]
```

Get decimal number representing the color

```typescript
color.rgbNumber(); // 16777215 (0xffffff)
```

Get the hexidecimal value a color represents

```typescript
color.hex(); // #ffffff
```

Get an individual attribute from a color

```typescript
color.red(); // 255
color.green(); // 255
color.blue(); // 255
```

### CSS Strings

CSS strings can be generated from a color using the `.string()` method

```typescript
color.hsl().string(); // 'hsl(320, 50%, 100%)'
```

### Luminosity

The WCAG luminosity of the color. 0 is black, 1 is white.

```typescript
color.luminosity(); // 0.412
```

The WCAG contrast ratio to another color, from 1 (same color) to 21 (contrast
b/w white and black).

```typescript
color.contrast(Color.rgb(50, 10, 5)); // 12
```

Get whether the color is "light" or "dark", useful for deciding text color.

```typescript
color.isLight(); // true
color.isDark(); // false
```

### Manipulation

```typescript
color.negate(); // rgb(0, 100, 255) -> rgb(255, 155, 0)

color.lighten(0.5); // hsl(100, 50%, 50%) -> hsl(100, 50%, 75%)
color.lighten(0.5); // hsl(100, 50%, 0)   -> hsl(100, 50%, 0%)
color.darken(0.5); // hsl(100, 50%, 50%) -> hsl(100, 50%, 25%)
color.darken(0.5); // hsl(100, 50%, 0)   -> hsl(100, 50%, 0%)

color.setLightness(50); // hsl(100, 50%, 10%) -> hsl(100, 50%, 50%)

color.saturate(0.5); // hsl(100, 50%, 50%) -> hsl(100, 75%, 50%)
color.desaturate(0.5); // hsl(100, 50%, 50%) -> hsl(100, 25%, 50%)
color.grayscale(); // #5CBF54 -> #969696

color.fade(0.5); // rgba(10, 10, 10, 0.8) -> rgba(10, 10, 10, 0.4)
color.opaquer(0.5); // rgba(10, 10, 10, 0.8) -> rgba(10, 10, 10, 1)

color.rotate(180); // hsl(60, 20%, 20%) -> hsl(240, 20%, 20%)
color.rotate(-90); // hsl(60, 20%, 20%) -> hsl(330, 20%, 20%)

red.mix(blue); // rgb(255, 0, 0) -> rgb(128, 0, 128)
red.mix(blue, 0.75); // rgb(255, 0, 0) -> rgb(64, 0, 191)

// chaining
color.setGreen(100).grayscale().lighten(0.6);
```

## Color-Space Conversions

Color space rules can be mixed together, and all of the color-space conversions
happen behind the scenes!

```typescript
const rgb = Color.rgb(255, 0, 0);
color.setBlack(255); // rgb(255, 0, 0) -> rgb(0, 0, 0)
color.setHue(200); // rgb(255, 0, 0) -> rgb(0, 170, 255)
```

## Propers

Heavily inspired by: [Color](https://github.com/Qix-/color)
