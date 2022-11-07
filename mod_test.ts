import { assertEquals } from "std/testing/asserts.ts";
import { Color } from "./mod.ts";

Deno.test("Create instance of color through all constuctors", () => {
  const _cmyk = Color.cmyk(77, 0, 9, 11);
  const _hsl = Color.hsl(173, 76, 89);
  const _hsla = Color.hsla(173, 76, 89, 0.5);
  const _hsv = Color.hsl(173, 77, 55);
  const _hsva = Color.hsla(173, 77, 55, 0.5);
  const _hwb = Color.hwb(173, 20, 10);
  const _hwba = Color.hwba(173, 20, 10, 0.5);
  const _rgb = Color.rgb(52, 227, 207);
  const _rgba = Color.rgba(52, 227, 207, 0.5);
});

Deno.test("Test all basic settters", () => {
  const cmyk = Color.cmyk(77, 0, 9, 11);
  const hsl = Color.hsl(173, 76, 89);
  const hsv = Color.hsv(173, 77, 55);
  const hwb = Color.hwb(173, 20, 10);
  const rgb = Color.rgb(52, 227, 207);

  assertEquals(cmyk.setCyan(100).string(), "cmyk(100%, 0%, 9%, 11%)");
  assertEquals(cmyk.setMagenta(100).string(), "cmyk(77%, 100%, 9%, 11%)");
  assertEquals(cmyk.setYellow(100).string(), "cmyk(77%, 0%, 100%, 11%)");
  assertEquals(cmyk.setBlack(100).string(), "cmyk(77%, 0%, 9%, 100%)");

  assertEquals(hsl.setHue(100).string(), "hsl(100, 76%, 89%)");
  assertEquals(hsl.setSaturation(100).string(), "hsl(173, 100%, 89%)");
  assertEquals(hsl.setLightness(100).string(), "hsl(173, 76%, 100%)");

  assertEquals(hsv.setValue(100).string(), "hsv(173, 77%, 100%)");

  assertEquals(hwb.setWhiteness(100).string(), "hwb(173, 91%, 9%)");
  assertEquals(hwb.setBlackness(100).string(), "hwb(173, 17%, 83%)");

  assertEquals(rgb.setRed(100).string(), "rgb(100, 227, 207)");
  assertEquals(rgb.setGreen(100).string(), "rgb(52, 100, 207)");
  assertEquals(rgb.setBlue(100).string(), "rgb(52, 227, 100)");
});

Deno.test("Test color mixing", () => {
  const red = Color.rgb(255, 0, 0);
  const blue = Color.rgb(0, 0, 255);

  assertEquals(red.mix(blue, 0).string(), "rgb(255, 0, 0)");
  assertEquals(red.mix(blue, 0.25).string(), "rgb(191, 0, 64)");
  assertEquals(red.mix(blue).string(), "rgb(128, 0, 128)");
  assertEquals(red.mix(blue, 0.75).string(), "rgb(64, 0, 191)");
  assertEquals(red.mix(blue, 1).string(), "rgb(0, 0, 255)");
});

Deno.test("README Heading", () => {
  const color = Color.rgb(35, 64, 115);
  assertEquals(color.string(), "rgb(35, 64, 115)");
  assertEquals(color.cmyk().string(), "cmyk(70%, 44%, 0%, 55%)");
  assertEquals(color.hsv().string(), "hsv(218, 70%, 45%)");
  assertEquals(color.hex(), "#234073");
});

Deno.test("README Getters", () => {
  const color = Color.rgb(255, 255, 255);

  assertEquals(color.hsl().string(), "hsl(0, 0%, 100%)");

  assertEquals(color.object(), { r: 255, b: 255, g: 255 });

  assertEquals(color.rgb().array(), [255, 255, 255]);

  assertEquals(color.rgbNumber(), 16777215);

  assertEquals(color.hex(), "#ffffff");

  assertEquals(color.red(), 255);
  assertEquals(color.green(), 255);
  assertEquals(color.blue(), 255);
});

Deno.test("README luminosity", () => {
  const color = Color.rgb(255, 0, 255);

  assertEquals(color.luminosity(), 0.2848);

  assertEquals(
    Math.round(Color.rgb(255, 255, 255).contrast(Color.rgb(127, 127, 127))),
    4,
  );

  assertEquals(color.isLight(), false);
  assertEquals(color.isDark(), true);
});

Deno.test("README manipulation", () => {
  const negateColor = Color.rgb(0, 100, 255);
  assertEquals(negateColor.negate().string(), "rgb(255, 155, 0)");

  const brightnessColor = Color.hsl(100, 50, 50);
  const brightnessColor2 = Color.hsl(100, 50, 0);
  assertEquals(brightnessColor.lighten(0.5).string(), "hsl(100, 50%, 75%)");
  assertEquals(brightnessColor2.lighten(0.5).string(), "hsl(100, 50%, 0%)");
  assertEquals(brightnessColor.darken(0.5).string(), "hsl(100, 50%, 25%)");
  assertEquals(brightnessColor2.darken(0.5).string(), "hsl(100, 50%, 0%)");

  const lightnessColor = Color.hsl(100, 50, 10);
  assertEquals(lightnessColor.setLightness(50).string(), "hsl(100, 50%, 50%)");

  assertEquals(brightnessColor.saturate(0.5).string(), "hsl(100, 75%, 50%)");
  assertEquals(brightnessColor.desaturate(0.5).string(), "hsl(100, 25%, 50%)");
  assertEquals(brightnessColor.grayscale().hex(), "#787878");

  const fadeColor = Color.rgba(10, 10, 10, 0.8);
  assertEquals(fadeColor.fade(0.5).string(), "rgba(10, 10, 10, 0.4)");
  assertEquals(fadeColor.opaquer(0.5).string(), "rgba(10, 10, 10, 1)");

  const rotateColor = Color.hsl(60, 20, 20);
  assertEquals(rotateColor.rotate(180).string(), "hsl(240, 20%, 20%)");
  assertEquals(rotateColor.rotate(-90).string(), "hsl(330, 20%, 20%)");

  // chaining
  const chainColor = Color.rgb(150, 10, 240);
  assertEquals(
    chainColor.setGreen(100).grayscale().lighten(0.6).string(),
    "rgb(260, 260, 260)",
  );
});

Deno.test("README Color space conversions", () => {
  const color = Color.rgb(255, 0, 0);
  assertEquals(color.setBlack(255).string(), "rgb(0, 0, 0)");
  assertEquals(color.setHue(200).string(), "rgb(0, 170, 255)");
});
