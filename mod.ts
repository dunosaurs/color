const COLOR_TYPES = [
  "rgb",
  "rgba",
  "hsl",
  "hsla",
  "hsv",
  "hsva",
  "hwb",
  "hwba",
  "cmyk",
] as const;

type ColorTypes = (typeof COLOR_TYPES)[number];

const isColorType = (type: string): type is ColorTypes =>
  COLOR_TYPES.includes(type as ColorTypes);

const parseNumber = (num: string) => {
  const float = Number.parseFloat(num);
  const factor = num.includes("rad")
    ? (360 / (2 * Math.PI))
    : num.includes("turn")
    ? 360
    : 1;

  return float * factor;
};

export class Color {
  channels: number[] = [];
  type: ColorTypes;
  transparency: number;

  private constructor(channels: number[], type: ColorTypes, alpha?: number) {
    this.channels = channels;
    this.type = type;
    this.transparency = alpha || 1;
  }

  // Constructors

  static string(input: string) {
    const [, threeDigitHex] = input.match(/^#([0-9a-f]{3})$/i) ?? [];
    if (threeDigitHex) {
      return new Color([
        Number.parseInt(threeDigitHex.charAt(0), 16) * 0x11,
        Number.parseInt(threeDigitHex.charAt(1), 16) * 0x11,
        Number.parseInt(threeDigitHex.charAt(2), 16) * 0x11,
      ], "rgb");
    }

    const [, sixDigitHex] = input.match(/^#([0-9a-f]{6})$/i) ?? [];
    if (sixDigitHex) {
      return new Color([
        Number.parseInt(sixDigitHex.substring(0, 2), 16),
        Number.parseInt(sixDigitHex.substring(2, 4), 16),
        Number.parseInt(sixDigitHex.substring(4, 6), 16),
      ], "rgb");
    }

    const { type, args } = input.match(
      /^(?<type>rgba?|hsla?|hsva?|hwba?|cmyk)\((?<args>.*)\)/i,
    )?.groups ?? {};
    if (isColorType(type) && args) {
      const channels = args.split(/\s|,/)
        .map((arg) => arg.trim())
        .filter((arg) => arg && !arg.match(/,|\//i))
        .map(parseNumber);

      if (channels.length === 3 || channels.length === 4) {
        return Color[type](...channels as [number, number, number, number]);
      }
    }

    throw new Error(`Color ${input} is not a valid color`);
  }

  /**
   * Creates a color with a red, green, and blue value
   */
  static rgb(r: number, g: number, b: number) {
    return new Color([Math.round(r), Math.round(g), Math.round(b)], "rgb");
  }

  /**
   * Creates a color with a red, green, blue, and alpha value
   */
  static rgba(r: number, g: number, b: number, a: number) {
    return new Color([Math.round(r), Math.round(g), Math.round(b)], "rgba", a);
  }

  /**
   * Creates a color with a hue, saturation, and lightness value
   */
  static hsl(h: number, s: number, l: number) {
    return new Color([Math.round(h), Math.round(s), Math.round(l)], "hsl");
  }

  /**
   * Creates a color with a hue, saturation, lightness, and alpha value
   */
  static hsla(h: number, s: number, l: number, a: number) {
    return new Color([Math.round(h), Math.round(s), Math.round(l)], "hsla", a);
  }

  /**
   * Creates a color with a hue, saturation, and value
   */
  static hsv(h: number, s: number, v: number) {
    return new Color([Math.round(h), Math.round(s), Math.round(v)], "hsv");
  }

  /**
   * Creates a color with a hue, saturation, value, and alpha
   */
  static hsva(h: number, s: number, v: number, a: number) {
    return new Color([Math.round(h), Math.round(s), Math.round(v)], "hsva", a);
  }

  /**
   * Creates a color with a hue, whiteness, and blackness value
   */
  static hwb(h: number, w: number, b: number) {
    if (w + b > 100) {
      return new Color([
        Math.round(h),
        Math.round(((w) / (w + b)) * 100),
        Math.round(((b) / (w + b)) * 100),
      ], "hwb");
    } else {
      return new Color([Math.round(h), Math.round(w), Math.round(b)], "hwb");
    }
  }

  /**
   * Creates a color with a hue, whiteness, blackness, and alpha
   */
  static hwba(h: number, w: number, b: number, a: number) {
    if (w + b > 100) {
      return new Color(
        [
          Math.round(h),
          Math.round(((w) / (w + b)) * 100),
          Math.round(((b) / (w + b)) * 100),
        ],
        "hwba",
        a,
      );
    } else {
      return new Color(
        [Math.round(h), Math.round(w), Math.round(b)],
        "hwba",
        a,
      );
    }
  }

  /**
   * Creates a color with a cyan, magenta, yellow, and black value
   */
  static cmyk(c: number, m: number, y: number, k: number) {
    return new Color([
      Math.round(c),
      Math.round(m),
      Math.round(y),
      Math.round(k),
    ], "cmyk");
  }

  // Conversions to and from color types

  /**
   * Converts from current type to rgb
   */
  rgb() {
    switch (this.type) {
      case "rgba":
      case "rgb":
        return Color.rgb(this.channels[0], this.channels[1], this.channels[2]);

      case "hsla":
      case "hsl": {
        const h = this.channels[0] / 360;
        const s = this.channels[1] / 100;
        const l = this.channels[2] / 100;

        const hue2rgb = (p: number, q: number, t: number) => {
          if (t < 0) t += 1;
          if (t > 1) t -= 1;
          if (t < 1 / 6) return p + (q - p) * 6 * t;
          if (t < 1 / 2) return q;
          if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
          return p;
        };

        let r, g, b;

        if (s == 0) {
          r = g = b = l; // achromatic
        } else {
          const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
          const p = 2 * l - q;
          r = hue2rgb(p, q, h + 1 / 3);
          g = hue2rgb(p, q, h);
          b = hue2rgb(p, q, h - 1 / 3);
        }

        return Color.rgb(r * 255, g * 255, b * 255);
      }

      case "hsva":
      case "hsv": {
        const h = this.channels[0] / 360;
        const s = this.channels[1] / 100;
        const v = this.channels[2] / 100;

        let r = 0, g = 0, b = 0;

        const i = Math.floor(h * 6);
        const f = h * 6 - i;
        const p = v * (1 - s);
        const q = v * (1 - f * s);
        const t = v * (1 - (1 - f) * s);
        switch (i % 6) {
          case 0:
            r = v, g = t, b = p;
            break;
          case 1:
            r = q, g = v, b = p;
            break;
          case 2:
            r = p, g = v, b = t;
            break;
          case 3:
            r = p, g = q, b = v;
            break;
          case 4:
            r = t, g = p, b = v;
            break;
          case 5:
            r = v, g = p, b = q;
            break;
        }

        return Color.rgb(r, g, b);
      }

      case "hwba":
      case "hwb": {
        const h = this.channels[0] / 360;
        let wh = this.channels[1] / 100;
        let bl = this.channels[2] / 100;
        const ratio = wh + bl;
        let f;

        if (ratio > 1) {
          wh /= ratio;
          bl /= ratio;
        }

        const i = Math.floor(6 * h);
        const v = 1 - bl;
        f = 6 * h - i;

        if ((i & 0x01) !== 0) {
          f = 1 - f;
        }

        const n = wh + f * (v - wh);

        let r;
        let g;
        let b;
        switch (i) {
          default:
          case 6:
          case 0:
            r = v;
            g = n;
            b = wh;
            break;
          case 1:
            r = n;
            g = v;
            b = wh;
            break;
          case 2:
            r = wh;
            g = v;
            b = n;
            break;
          case 3:
            r = wh;
            g = n;
            b = v;
            break;
          case 4:
            r = n;
            g = wh;
            b = v;
            break;
          case 5:
            r = v;
            g = wh;
            b = n;
            break;
        }

        return Color.rgb(r, g, b);
      }

      case "cmyk": {
        const c = this.channels[0] / 360;
        const m = this.channels[1] / 100;
        const y = this.channels[2] / 100;
        const k = this.channels[2] / 100;

        const r = 255 * (1 - c) * (1 - k);
        const g = 255 * (1 - m) * (1 - k);
        const b = 255 * (1 - y) * (1 - k);

        return Color.rgb(r, g, b);
      }
    }
  }

  /**
   * Converts from current type to rgba
   */
  rgba() {
    if (this.type === "rgba") {
      return Color.rgba(
        this.channels[0],
        this.channels[1],
        this.channels[2],
        this.transparency,
      );
    }

    const rgb = this.rgb().channels;

    return Color.rgba(rgb[0], rgb[1], rgb[2], this.transparency);
  }

  /**
   * Converts from current type to hsl
   */
  hsl() {
    if (this.type === "hsl") {
      return Color.hsl(this.channels[0], this.channels[1], this.channels[2]);
    }

    const rgb = this.rgba().channels;

    const r = rgb[0] / 255;
    const g = rgb[1] / 255;
    const b = rgb[2] / 255;

    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);

    let h = (max + min) / 2;
    let s = (max + min) / 2;
    const l = (max + min) / 2;

    if (max == min) {
      h = s = 0; // achromatic
    } else {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      switch (max) {
        case r:
          h = (g - b) / d + (g < b ? 6 : 0);
          break;
        case g:
          h = (b - r) / d + 2;
          break;
        case b:
          h = (r - g) / d + 4;
          break;
      }
      h *= 60;
    }

    return Color.hsl(h, s * 100, l * 100);
  }

  /**
   * Converts from current type to hsla
   */
  hsla() {
    if (this.type === "hsla") {
      return Color.hsla(
        this.channels[0],
        this.channels[1],
        this.channels[2],
        this.transparency,
      );
    }
    const hsl = this.hsl().channels;

    return Color.hsla(hsl[0], hsl[1], hsl[2], this.transparency);
  }

  /**
   * Converts from current type to hsv
   */
  hsv() {
    if (this.type === "hsv") {
      return Color.hsv(this.channels[0], this.channels[1], this.channels[2]);
    }

    const rgb = this.rgba().channels;

    const r = rgb[0];
    const g = rgb[1];
    const b = rgb[2];

    const max = Math.max(r, g, b),
      min = Math.min(r, g, b),
      d = max - min,
      s = max === 0 ? 0 : d / max,
      v = max / 255;

    let h = 0;

    switch (max) {
      case min:
        h = 0;
        break;
      case r:
        h = (g - b) + d * (g < b ? 6 : 0);
        h /= 6 * d;
        break;
      case g:
        h = (b - r) + d * 2;
        h /= 6 * d;
        break;
      case b:
        h = (r - g) + d * 4;
        h /= 6 * d;
        break;
    }

    return Color.hsv(h * 360, s * 100, v * 100);
  }

  /**
   * Converts from current type to hsva
   */
  hsva() {
    if (this.type === "hsva") {
      return Color.hsva(
        this.channels[0],
        this.channels[1],
        this.channels[2],
        this.transparency,
      );
    }

    const hsv = this.hsv().channels;

    return Color.hsva(hsv[0], hsv[1], hsv[2], this.transparency);
  }

  /**
   * Converts from current type to hsb
   */
  hwb() {
    const hsv = this.hsv().channels;
    const h = hsv[0] / 360;
    const s = hsv[1] / 100;
    const v = hsv[2] / 100;

    if (this.type === "hwb") {
      return Color.hwb(this.channels[0], this.channels[1], this.channels[2]);
    }

    return Color.hwb(h * 360, ((1 - s) * v) * 100, (1 - v) * 100);
  }

  /**
   * Converts from current type to hsva
   */
  hwba() {
    if (this.type === "hwba") {
      return Color.hwba(
        this.channels[0],
        this.channels[1],
        this.channels[2],
        this.transparency,
      );
    }

    const hwb = this.hwb().channels;

    return Color.hwba(hwb[0], hwb[1], hwb[2], this.transparency);
  }

  /**
   * Converts from current type to cmyk
   */
  cmyk() {
    if (this.type === "cmyk") {
      return Color.cmyk(
        this.channels[0],
        this.channels[1],
        this.channels[2],
        this.channels[3],
      );
    }

    const rgb = this.rgba().channels;
    const r = rgb[0] / 255;
    const g = rgb[1] / 255;
    const b = rgb[2] / 255;

    const k = Math.min(1 - r, 1 - g, 1 - b);
    const c = (1 - r - k) / (1 - k) || 0;
    const m = (1 - g - k) / (1 - k) || 0;
    const y = (1 - b - k) / (1 - k) || 0;

    return Color.cmyk(c * 100, m * 100, y * 100, k * 100);
  }

  /**
   * Converts from current type to a specific type (by string)
   */
  toType(colorType: ColorTypes) {
    switch (colorType) {
      case "rgb":
        return this.rgb();

      case "rgba":
        return this.rgba();

      case "hsl":
        return this.hsl();

      case "hsla":
        return this.hsla();

      case "hsv":
        return this.hsv();

      case "hsva":
        return this.hsva();

      case "hwb":
        return this.hwb();

      case "hwba":
        return this.hwba();

      case "cmyk":
        return this.cmyk();
    }
  }

  /**
   * Converts from current type to a version of type with alpha value
   */
  toTransparent(type: ColorTypes) {
    switch (type) {
      case "cmyk":
        return this.toType("cmyk");
      case "hsla":
      case "hsl":
        return this.toType("hsla");
      case "hsva":
      case "hsv":
        return this.toType("hsva");
      case "hwba":
      case "hwb":
        return this.toType("hwba");
      case "rgba":
      case "rgb":
        return this.toType("rgba");
    }
  }

  // getters

  /**
   * Returns an object with each of the values as a key
   */
  object() {
    const c = this.channels;
    switch (this.type) {
      case "cmyk":
        return { c: c[0], m: c[1], y: c[2], k: c[3] };
      case "hsl":
        return { h: c[0], s: c[1], l: c[2] };
      case "hsla":
        return { h: c[0], s: c[1], l: c[2], a: this.transparency };
      case "hsv":
        return { h: c[0], s: c[1], v: c[2] };
      case "hsva":
        return { h: c[0], s: c[1], v: c[2], a: this.transparency };
      case "hwb":
        return { h: c[0], w: c[1], b: c[2] };
      case "hwba":
        return { h: c[0], w: c[1], b: c[2], a: this.transparency };
      case "rgb":
        return { r: c[0], g: c[1], b: c[2] };
      case "rgba":
        return { r: c[0], g: c[1], b: c[2], a: this.transparency };
    }
  }

  /**
   * Returns an array with each of the channels as a key and a transparency if it is not 1
   */
  array() {
    if (this.transparency === 1) {
      return this.channels;
    }

    return [...this.channels, this.transparency];
  }

  /**
   * Returns the decimal representation of a color
   */
  rgbNumber() {
    const hex = this.hex().substring(1);

    return parseInt(`0x${hex}`);
  }

  /**
   * Returns the hex string from a color
   */
  hex() {
    const rgb = this.rgb().channels;

    const r = rgb[0].toString(16);
    const g = rgb[1].toString(16);
    const b = rgb[2].toString(16);

    return `#${(r.length === 1 ? "0" : "") + r}${
      (g.length === 1 ? "0" : "") + g
    }${(b.length === 1 ? "0" : "") + b}`;
  }

  /**
   * Returns the hex string from a color as well as the alpha channel
   */
  hexa() {
    const rgb = this.rgb().channels;

    const r = rgb[0].toString(16);
    const g = rgb[1].toString(16);
    const b = rgb[2].toString(16);
    const a = Math.round(this.transparency * 255).toString(16);

    return `#${(r.length === 1 ? "0" : "") + r}${
      (g.length === 1 ? "0" : "") + g
    }${(b.length === 1 ? "0" : "") + b}${(a.length === 1 ? "0" : "") + a}`;
  }

  /**
   * Returns the red component of a color
   */
  red() {
    return this.rgb().channels[0];
  }

  /**
   * Returns the green component of a color
   */
  green() {
    return this.rgb().channels[1];
  }

  /**
   * Returns the blue component of a color
   */
  blue() {
    return this.rgb().channels[2];
  }

  /**
   * Returns the alpha component of a color
   */
  alpha() {
    return this.transparency;
  }

  /**
   * Returns the hue component of a color
   */
  hue() {
    return this.hsl().channels[0];
  }

  /**
   * Returns the saturation component of a color
   */
  saturation() {
    return this.hsl().channels[1];
  }

  /**
   * Returns the lightness component of a color
   */
  lightness() {
    return this.hsl().channels[2];
  }

  /**
   * Returns the value component of a color
   */
  value() {
    return this.hsv().channels[2];
  }

  /**
   * Returns the whiteness component of a color
   */
  whiteness() {
    return this.hwb().channels[1];
  }

  /**
   * Returns the blackness component of a color
   */
  blackness() {
    return this.hwb().channels[2];
  }

  /**
   * Returns the cyan component of a color
   */
  cyan() {
    return this.cmyk().channels[0];
  }

  /**
   * Returns the magenta component of a color
   */
  magenta() {
    return this.cmyk().channels[1];
  }

  /**
   * Returns the yellow component of a color
   */
  yellow() {
    return this.cmyk().channels[2];
  }

  /**
   * Returns the black component of a color
   */
  black() {
    return this.cmyk().channels[3];
  }

  /**
   * Returns a css string representation of a color
   */
  string() {
    switch (this.type) {
      case "cmyk":
        return `cmyk(${this.channels[0]}%, ${this.channels[1]}%, ${
          this.channels[2]
        }%, ${this.channels[3]}%)`;
      case "hsl":
        return `hsl(${this.channels[0]}, ${this.channels[1]}%, ${
          this.channels[2]
        }%)`;
      case "hsla":
        return `hsla(${this.channels[0]}, ${this.channels[1]}%, ${
          this.channels[2]
        }, ${this.transparency})`;
      case "hsv":
        return `hsv(${this.channels[0]}, ${this.channels[1]}%, ${
          this.channels[2]
        }%)`;
      case "hsva":
        return `hsva(${this.channels[0]}, ${this.channels[1]}%, ${
          this.channels[2]
        }%, ${this.transparency})`;
      case "hwb":
        return `hwb(${this.channels[0]}, ${this.channels[1]}%, ${
          this.channels[2]
        }%)`;
      case "hwba":
        return `hwba(${this.channels[0]}, ${this.channels[1]}%, ${
          this.channels[2]
        }%, ${this.transparency})`;
      case "rgb":
        return `rgb(${this.channels[0]}, ${this.channels[1]}, ${
          this.channels[2]
        })`;
      case "rgba":
        return `rgba(${this.channels[0]}, ${this.channels[1]}, ${
          this.channels[2]
        }, ${this.transparency})`;
    }
  }

  /**
   * Returns the WCAG luminosity of the color
   */
  luminosity() {
    const rgb = this.rgb().channels;
    const r = rgb[0] / 255;
    const g = rgb[1] / 255;
    const b = rgb[2] / 255;

    const r_s = r <= 0.03928 ? r / 12.92 : Math.pow((r + 0.055) / 1.055, 2.4);
    const g_s = g <= 0.03928 ? g / 12.92 : Math.pow((g + 0.055) / 1.055, 2.4);
    const b_s = b <= 0.03928 ? b / 12.92 : Math.pow((b + 0.055) / 1.055, 2.4);

    return 0.2126 * r_s + 0.7152 * g_s + 0.0722 * b_s;
  }

  /**
   * Returns the WCAG contrast of a color (from 1-21)
   */
  contrast(col: Color) {
    const lum1 = this.luminosity();
    const lum2 = col.luminosity();

    if (lum1 > lum2) {
      return (lum1 + 0.05) / (lum2 + 0.05);
    }

    return (lum2 + 0.05) / (lum1 + 0.05);
  }

  /**
   * Returns if the color is dark (useful for making text black or white)
   */
  isDark() {
    const rgb = this.rgb().channels;

    return (rgb[0] * 2126 + rgb[1] * 7152 + rgb[2] * 722) / 10000 < 128;
  }

  /**
   * Returns if the color is light (useful for making text black or white)
   */
  isLight() {
    return !this.isDark();
  }

  // operations
  /**
   * Sets the red component of a color
   */
  setRed(value: number) {
    const rgb = this.rgb().channels;
    const newColor = Color.rgb(value, rgb[1], rgb[2]);

    return newColor.toType(this.type);
  }

  /**
   * Sets the green component of a color
   */
  setGreen(value: number) {
    const rgb = this.rgb().channels;
    const newColor = Color.rgb(rgb[0], value, rgb[2]);

    return newColor.toType(this.type);
  }

  /**
   * Sets the blue component of a color
   */
  setBlue(value: number) {
    const rgb = this.rgb().channels;
    const newColor = Color.rgb(rgb[0], rgb[1], value);

    return newColor.toType(this.type);
  }

  /**
   * Sets the alpha component of a color. This typecasts hsl->hsla, hsv->hsva, and rgb->rgba
   */
  setAlpha(value: number) {
    const rgba = this.rgba().channels;
    const faded = Color.rgba(
      rgba[0],
      rgba[1],
      rgba[2],
      value,
    );

    return faded.toTransparent(this.type);
  }

  /**
   * Sets the hue component of a color
   */
  setHue(value: number) {
    const hsl = this.hsl().channels;
    const newColor = Color.hsl(value, hsl[1], hsl[2]);

    return newColor.toType(this.type);
  }

  /**
   * Sets the saturation component of a color
   */
  setSaturation(value: number) {
    const hsl = this.hsl().channels;
    const newColor = Color.hsl(hsl[0], value, hsl[2]);

    return newColor.toType(this.type);
  }

  /**
   * Sets the lightness component of a color
   */
  setLightness(value: number) {
    const hsl = this.hsl().channels;
    const newColor = Color.hsl(hsl[0], hsl[1], value);

    return newColor.toType(this.type);
  }

  /**
   * Sets the value component of a color
   */
  setValue(value: number) {
    const hsv = this.hsv().channels;
    const newColor = Color.hsv(hsv[0], hsv[1], value);

    return newColor.toType(this.type);
  }

  /**
   * Sets the whiteness component of a color
   */
  setWhiteness(value: number) {
    const hwb = this.hwb().channels;
    const newColor = Color.hwb(hwb[0], value, hwb[2]);

    return newColor.toType(this.type);
  }

  /**
   * Sets the blackness component of a color
   */
  setBlackness(value: number) {
    const hwb = this.hwb().channels;
    const newColor = Color.hwb(hwb[0], hwb[1], value);

    return newColor.toType(this.type);
  }

  /**
   * Sets the cyan component of a color
   */
  setCyan(value: number) {
    const cmyk = this.cmyk().channels;
    const newColor = Color.cmyk(value, cmyk[1], cmyk[2], cmyk[3]);

    return newColor.toType(this.type);
  }

  /**
   * Sets the magenta component of a color
   */
  setMagenta(value: number) {
    const cmyk = this.cmyk().channels;
    const newColor = Color.cmyk(cmyk[0], value, cmyk[2], cmyk[3]);

    return newColor.toType(this.type);
  }

  /**
   * Sets the yellow component of a color
   */
  setYellow(value: number) {
    const cmyk = this.cmyk().channels;
    const newColor = Color.cmyk(cmyk[0], cmyk[1], value, cmyk[3]);

    return newColor.toType(this.type);
  }

  /**
   * Sets the black component of a color
   */
  setBlack(value: number) {
    const cmyk = this.cmyk().channels;
    const newColor = Color.cmyk(cmyk[0], cmyk[1], cmyk[2], value);

    return newColor.toType(this.type);
  }

  /**
   * Negates the color: (255, 5, 0) -> (0, 250, 255)
   */
  negate() {
    const rgb = this.rgb();
    const negated = Color.rgb(
      255 - rgb.channels[0],
      255 - rgb.channels[1],
      255 - rgb.channels[2],
    );

    return negated.toType(this.type);
  }

  /**
   * Lightens the color by some factor
   */
  lighten(factor: number) {
    const hsl = this.hsl().channels;
    const lightened = Color.hsl(hsl[0], hsl[1], hsl[2] * (1 + factor));

    return lightened.toType(this.type);
  }

  /**
   * Darkens the color by some factor
   */
  darken(factor: number) {
    const hsl = this.hsl().channels;
    const darkened = Color.hsl(hsl[0], hsl[1], hsl[2] * (1 - factor));

    return darkened.toType(this.type);
  }

  /**
   * Saturates the color by some factor
   */
  saturate(factor: number) {
    const hsl = this.hsl().channels;
    const lightened = Color.hsl(hsl[0], hsl[1] * (1 + factor), hsl[2]);

    return lightened.toType(this.type);
  }

  /**
   * Desaturates the color by some factor
   */
  desaturate(factor: number) {
    const hsl = this.hsl().channels;
    const lightened = Color.hsl(hsl[0], hsl[1] * (1 - factor), hsl[2]);

    return lightened.toType(this.type);
  }

  /**
   * Grayscales the color
   */
  grayscale() {
    const rgb = this.rgb().channels;

    const gray = (rgb[0] + rgb[1] + rgb[2]) / 3;

    return Color.rgb(gray, gray, gray);
  }

  /**
   * Fades the color by some factor, this has the same typecasting rules as setAlpha
   */
  fade(factor: number) {
    const rgba = this.rgba().channels;
    const faded = Color.rgba(
      rgba[0],
      rgba[1],
      rgba[2],
      this.transparency * (1 - factor),
    );

    return faded.toTransparent(this.type);
  }

  /**
   * Opaques the color by some factor, this has the same typecasting rules as setAlpha
   */
  opaquer(factor: number) {
    const rgba = this.rgba().channels;
    const opaqued = Color.rgba(
      rgba[0],
      rgba[1],
      rgba[2],
      Math.min(this.transparency * (1 + factor), 1),
    );

    return opaqued.toTransparent(this.type);
  }

  /**
   * Rotates the color by some degree
   */
  rotate(value: number) {
    const hsl = this.hsl().channels;

    let hue = hsl[0] + value;

    while (hue < 0) hue += 360;

    hue %= 360;

    const rotated = Color.hsl(hue, hsl[1], hsl[2]);

    return rotated.toType(this.type);
  }

  /**
   * Mixes two colors by a specified weight.
   * @param mixColor Color to mix this color with
   * @param weight the amount of weight this color should have (defaults to 1/2)
   */
  mix(mixColor: Color, weight = 0.5) {
    const color1 = mixColor.rgb();
    const color2 = this.rgb();

    const p = weight;
    const w = 2 * p - 1;
    const a = color1.alpha() - color2.alpha();

    const w1 = (((w * a === -1) ? w : (w + a) / (1 + w * a)) + 1) / 2;
    const w2 = 1 - w1;

    const mixedColor = Color.rgba(
      w1 * color1.red() + w2 * color2.red(),
      w1 * color1.green() + w2 * color2.green(),
      w1 * color1.blue() + w2 * color2.blue(),
      color1.alpha() * p + color2.alpha() * (1 - p),
    );

    return mixedColor.toType(this.type);
  }
}
