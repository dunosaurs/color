type colorTypes = "rgb" | "rgba" | "hsl" | "hsla" | "hsv" | "hsva" | "cmyk";

export class Color {
  channels: number[] = [];
  type: colorTypes;
  transparency: number;

  private constructor(channels: number[], type: colorTypes, alpha?: number) {
    this.channels = channels;
    this.type = type;
    this.transparency = alpha || 1;
  }

  // Constructors

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
   * Creates a color with a red, green, blue, and alpha value
   */
  static hsl(h: number, s: number, l: number) {
    return new Color([Math.round(h), Math.round(s), Math.round(l)], "hsl");
  }

  /**
   * Creates a color with a red, green, blue, and alpha value
   */
  static hsla(h: number, s: number, l: number, a: number) {
    return new Color([Math.round(h), Math.round(s), Math.round(l)], "hsla", a);
  }

  /**
   * Creates a color with a red, green, blue, and alpha value
   */
  static hsv(h: number, s: number, v: number) {
    return new Color([Math.round(h), Math.round(s), Math.round(v)], "hsv");
  }

  /**
   * Creates a color with a red, green, blue, and alpha value
   */
  static hsva(h: number, s: number, v: number, a: number) {
    return new Color([Math.round(h), Math.round(s), Math.round(v)], "hsva", a);
  }

  /**
   * Creates a color with a red, green, blue, and alpha value
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
    const rgb = this.rgb().channels;

    return Color.rgba(rgb[0], rgb[1], rgb[2], this.transparency);
  }

  /**
   * Converts from current type to hsl
   */
  hsl() {
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
    const hsl = this.hsl().channels;

    return Color.hsla(hsl[0], hsl[1], hsl[2], this.transparency);
  }

  /**
   * Converts from current type to hsv
   */
  hsv() {
    const rgb = this.rgba().channels;

    const r = rgb[0];
    const g = rgb[1];
    const b = rgb[2];

    const max = Math.max(r, g, b),
      min = Math.min(r, g, b),
      d = max - min,
      s = (max === 0 ? 0 : d / max),
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
    const hsv = this.hsv().channels;

    return Color.hsva(hsv[0], hsv[1], hsv[2], this.transparency);
  }

  cmyk() {
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
  toType(colorType: colorTypes) {
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

      case "cmyk":
        return this.cmyk();
    }
  }

  // getters
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
      case "rgb":
        return { r: c[0], g: c[1], b: c[2] };
      case "rgba":
        return { r: c[0], g: c[1], b: c[2], a: this.transparency };
    }
  }

  array() {
    if (this.transparency === 1) {
      return this.channels;
    }

    return [...this.channels, this.transparency];
  }

  rgbNumber() {
    const hex = this.hex().substring(1);

    return parseInt(`0x${hex}`);
  }

  hex() {
    const rgb = this.rgb().channels;

    const r = rgb[0].toString(16);
    const g = rgb[1].toString(16);
    const b = rgb[2].toString(16);

    return `#${(r.length === 1 ? "0" : "") + r}${
      (g.length === 1 ? "0" : "") + g
    }${(b.length === 1 ? "0" : "") + b}`;
  }

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

  red() {
    const rgb = this.rgb();

    return rgb.channels[0];
  }

  green() {
    const rgb = this.rgb();

    return rgb.channels[1];
  }

  blue() {
    const rgb = this.rgb();

    return rgb.channels[2];
  }

  alpha() {
    return this.transparency;
  }

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

  lum() {
    const hsl = this.hsl().channels;

    return hsl[2];
  }

  contrast(col: Color) {
    const lum1 = this.luminosity();
    const lum2 = col.luminosity();

    if (lum1 > lum2) {
      return (lum1 + 0.05) / (lum2 + 0.05);
    }

    return (lum2 + 0.05) / (lum1 + 0.05);
  }

  isDark() {
    const rgb = this.rgb().channels;

    return (rgb[0] * 2126 + rgb[1] * 7152 + rgb[2] * 722) / 10000 < 128;
  }

  isLight() {
    return !this.isDark();
  }

  // operations
  setRed(value: number) {
    const rgb = this.rgb().channels;
    const negated = Color.rgb(value, rgb[1], rgb[2]);

    return negated.toType(this.type);
  }

  setGreen(value: number) {
    const rgb = this.rgb().channels;
    const negated = Color.rgb(rgb[0], value, rgb[2]);

    return negated.toType(this.type);
  }

  setBlue(value: number) {
    const rgb = this.rgb().channels;
    const negated = Color.rgb(rgb[0], rgb[1], value);

    return negated.toType(this.type);
  }

  negate() {
    const rgb = this.rgb();
    const negated = Color.rgb(
      255 - rgb.channels[0],
      255 - rgb.channels[1],
      255 - rgb.channels[2],
    );

    return negated.toType(this.type);
  }

  lighten(factor: number) {
    const hsl = this.type === "hsl" ? this.channels : this.hsl().channels;
    const lightened = Color.hsl(hsl[0], hsl[1], hsl[2] * (1 + factor));

    return this.type === "hsl" ? lightened : lightened.toType(this.type);
  }

  darken(factor: number) {
    const hsl = this.type === "hsl" ? this.channels : this.hsl().channels;
    const darkened = Color.hsl(hsl[0], hsl[1], hsl[2] * (1 - factor));

    return this.type === "hsl" ? darkened : darkened.toType(this.type);
  }

  lightness(value: number) {
    const hsl = this.type === "hsl" ? this.channels : this.hsl().channels;
    const lightened = Color.hsl(hsl[0], hsl[1], value);

    return lightened.toType(this.type);
  }

  saturate(factor: number) {
    const hsl = this.type === "hsl" ? this.channels : this.hsl().channels;
    const lightened = Color.hsl(hsl[0], hsl[1] * (1 + factor), hsl[2]);

    return lightened.toType(this.type);
  }

  desaturate(factor: number) {
    const hsl = this.type === "hsl" ? this.channels : this.hsl().channels;
    const lightened = Color.hsl(hsl[0], hsl[1] * (1 - factor), hsl[2]);

    return lightened.toType(this.type);
  }

  grayscale() {
    const rgb = this.rgb().channels;

    const gray = (rgb[0] + rgb[1] + rgb[2]) / 3;

    return Color.rgb(gray, gray, gray);
  }

  fade(factor: number) {
    const rgba = this.rgba().channels;
    const faded = Color.rgba(
      rgba[0],
      rgba[1],
      rgba[2],
      this.transparency * (1 - factor),
    );

    switch (this.type) {
      case "cmyk":
        return faded.toType("cmyk");
      case "hsla":
      case "hsl":
        return faded.toType("hsla");
      case "hsva":
      case "hsv":
        return faded.toType("hsva");
      case "rgba":
      case "rgb":
        return faded.toType("rgba");
    }
  }

  opaquer(factor: number) {
    const rgba = this.rgba().channels;
    const opaqued = Color.rgba(
      rgba[0],
      rgba[1],
      rgba[2],
      Math.min(this.transparency * (1 + factor), 1),
    );

    switch (this.type) {
      case "cmyk":
        return opaqued.toType("cmyk");
      case "hsla":
      case "hsl":
        return opaqued.toType("hsla");
      case "hsva":
      case "hsv":
        return opaqued.toType("hsva");
      case "rgba":
      case "rgb":
        return opaqued.toType("rgba");
    }
  }

  rotate(value: number) {
    const hsl = this.hsl().channels;

    let hue = hsl[0] + value;

    while (hue < 0) hue += 360;

    hue %= 360;

    const rotated = Color.hsl(hue, hsl[1], hsl[2]);

    return rotated.toType(this.type);
  }
}
