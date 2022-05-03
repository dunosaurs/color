import { assertEquals } from "./test_deps.ts";
import { Color } from "./mod.ts";

Deno.test("Create instance of color through all constuctors", () => {
  const _cmyk = Color.cmyk(77, 0, 9, 11)
  const _hsl = Color.hsl(173, 76, 89)
  const _hsv = Color.hsl(173, 77, 55)
  const _rgb = Color.rgb(52, 227, 207)
  const _rgba = Color.rgba(52, 227, 207, 0.5)
})

Deno.test("README Heading", () => {
  const color = Color.rgb(35, 64, 115);
  assertEquals(color.string(), 'rgb(35, 64, 115)');
  assertEquals(color.cmyk().string(), 'cmyk(70%, 44%, 0%, 55%)');
  assertEquals(color.hsv().string(), 'hsv(218, 70%, 45%)');
  assertEquals(color.hex(), '#234073');
})

Deno.test("README Getters", () => {
  const color = Color.rgb(255, 255, 255);

  assertEquals(color.hsl().string(), "hsl(0, 0%, 100%)");

  assertEquals(color.object(), {r: 255, b: 255, g: 255});

  assertEquals(color.rgb().array() , [255, 255, 255]);

  assertEquals(color.rgbNumber() , 16777215);

  assertEquals(color.hex() , '#ffffff');

  assertEquals(color.red() , 255);
  assertEquals(color.green(), 255);
  assertEquals(color.blue(), 255);

})

Deno.test("README luminosity", () => {
  const color = Color.rgb(255, 0, 255);

  assertEquals(color.luminosity(), 0.2848);

  assertEquals(Math.round(Color.rgb(255, 255, 255).contrast(Color.rgb(127, 127, 127))), 4);

  assertEquals(color.isLight(), false);
  assertEquals(color.isDark(), true);
})

Deno.test("README manipulation", () => {
  const negateColor = Color.rgb(0, 100, 255);
  assertEquals(negateColor.negate().string(), 'rgb(255, 155, 0)');

  const brightnessColor = Color.hsl(100, 50, 50)
  const brightnessColor2 = Color.hsl(100, 50, 0)
  assertEquals(brightnessColor.lighten(0.5).string(), 'hsl(100, 50%, 75%)');
  assertEquals(brightnessColor2.lighten(0.5).string(), 'hsl(100, 50%, 0%)');
  assertEquals(brightnessColor.darken(0.5).string(), 'hsl(100, 50%, 25%)');
  assertEquals(brightnessColor2.darken(0.5).string(), 'hsl(100, 50%, 0%)');

  const lightnessColor = Color.hsl(100, 50, 10)
  assertEquals(lightnessColor.lightness(50).string(), 'hsl(100, 50%, 50%)');

  assertEquals(brightnessColor.saturate(0.5).string(), 'hsl(100, 75%, 50%)');
  assertEquals(brightnessColor.desaturate(0.5).string(), 'hsl(100, 25%, 50%)');
  assertEquals(brightnessColor.grayscale().hex(), '#787878')

  const fadeColor = Color.rgba(10, 10, 10, 0.8)
  assertEquals(fadeColor.fade(0.5).string(), 'rgba(10, 10, 10, 0.4)');
  assertEquals(fadeColor.opaquer(0.5).string(), 'rgba(10, 10, 10, 1)');

  const rotateColor = Color.hsl(60, 20, 20)
  assertEquals(rotateColor.rotate(180).string(), 'hsl(240, 20%, 20%)');
  assertEquals(rotateColor.rotate(-90).string(), 'hsl(330, 20%, 20%)');

  // chaining
  const chainColor = Color.rgb(150, 10, 240)
  assertEquals(chainColor.setGreen(100).grayscale().lighten(0.6).string(), 'rgb(260, 260, 260)');

})

const chainColor = Color.rgb(150, 10, 240)
console.log(chainColor.luminosity, chainColor.lum)