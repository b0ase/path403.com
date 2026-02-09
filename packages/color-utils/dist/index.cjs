"use strict";
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/index.ts
var index_exports = {};
__export(index_exports, {
  NAMED_COLORS: () => NAMED_COLORS,
  alpha: () => alpha,
  complement: () => complement,
  contrastRatio: () => contrastRatio,
  darken: () => darken,
  desaturate: () => desaturate,
  getContrastColor: () => getContrastColor,
  grayscale: () => grayscale,
  hslToRgb: () => hslToRgb,
  hslToRgba: () => hslToRgba,
  invert: () => invert,
  isAccessible: () => isAccessible,
  isAccessibleAAA: () => isAccessibleAAA,
  isDark: () => isDark,
  isLight: () => isLight,
  lighten: () => lighten,
  luminance: () => luminance,
  mix: () => mix,
  parse: () => parse,
  parseHex: () => parseHex,
  parseHsl: () => parseHsl,
  parseRgb: () => parseRgb,
  rgbToHex: () => rgbToHex,
  rgbToHsl: () => rgbToHsl,
  rgbToHsv: () => rgbToHsv,
  rotate: () => rotate,
  saturate: () => saturate,
  toHex: () => toHex,
  toHsl: () => toHsl,
  toRgb: () => toRgb
});
module.exports = __toCommonJS(index_exports);
function parseHex(hex) {
  const match = hex.match(/^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})?$/i);
  if (!match) {
    const short = hex.match(/^#?([a-f\d])([a-f\d])([a-f\d])([a-f\d])?$/i);
    if (short) {
      return {
        r: parseInt(short[1] + short[1], 16),
        g: parseInt(short[2] + short[2], 16),
        b: parseInt(short[3] + short[3], 16),
        a: short[4] ? parseInt(short[4] + short[4], 16) / 255 : 1
      };
    }
    return null;
  }
  return {
    r: parseInt(match[1], 16),
    g: parseInt(match[2], 16),
    b: parseInt(match[3], 16),
    a: match[4] ? parseInt(match[4], 16) / 255 : 1
  };
}
function parseRgb(str) {
  const match = str.match(/rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*(?:,\s*([\d.]+)\s*)?\)/i);
  if (!match) return null;
  return {
    r: parseInt(match[1], 10),
    g: parseInt(match[2], 10),
    b: parseInt(match[3], 10),
    a: match[4] ? parseFloat(match[4]) : 1
  };
}
function parseHsl(str) {
  const match = str.match(/hsla?\(\s*(\d+)\s*,\s*(\d+)%\s*,\s*(\d+)%\s*(?:,\s*([\d.]+)\s*)?\)/i);
  if (!match) return null;
  return {
    h: parseInt(match[1], 10),
    s: parseInt(match[2], 10),
    l: parseInt(match[3], 10),
    a: match[4] ? parseFloat(match[4]) : 1
  };
}
function parse(input) {
  if (typeof input === "object") {
    if ("r" in input) {
      return { r: input.r, g: input.g, b: input.b, a: "a" in input ? input.a : 1 };
    }
    if ("h" in input && "s" in input && "l" in input) {
      return hslToRgba(input);
    }
  }
  if (typeof input === "string") {
    if (input.startsWith("#")) {
      return parseHex(input);
    }
    if (input.startsWith("rgb")) {
      return parseRgb(input);
    }
    if (input.startsWith("hsl")) {
      const hsla = parseHsl(input);
      return hsla ? hslToRgba(hsla) : null;
    }
    const named = NAMED_COLORS[input.toLowerCase()];
    if (named) {
      return parseHex(named);
    }
  }
  return null;
}
function rgbToHex(rgb) {
  const r = Math.round(rgb.r).toString(16).padStart(2, "0");
  const g = Math.round(rgb.g).toString(16).padStart(2, "0");
  const b = Math.round(rgb.b).toString(16).padStart(2, "0");
  if ("a" in rgb && rgb.a < 1) {
    const a = Math.round(rgb.a * 255).toString(16).padStart(2, "0");
    return `#${r}${g}${b}${a}`;
  }
  return `#${r}${g}${b}`;
}
function rgbToHsl(rgb) {
  const r = rgb.r / 255;
  const g = rgb.g / 255;
  const b = rgb.b / 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const l = (max + min) / 2;
  if (max === min) {
    return { h: 0, s: 0, l: Math.round(l * 100) };
  }
  const d = max - min;
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
  let h;
  switch (max) {
    case r:
      h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
      break;
    case g:
      h = ((b - r) / d + 2) / 6;
      break;
    default:
      h = ((r - g) / d + 4) / 6;
  }
  return {
    h: Math.round(h * 360),
    s: Math.round(s * 100),
    l: Math.round(l * 100)
  };
}
function hslToRgb(hsl) {
  const h = hsl.h / 360;
  const s = hsl.s / 100;
  const l = hsl.l / 100;
  if (s === 0) {
    const v = Math.round(l * 255);
    return { r: v, g: v, b: v };
  }
  const hue2rgb = (p2, q2, t) => {
    if (t < 0) t += 1;
    if (t > 1) t -= 1;
    if (t < 1 / 6) return p2 + (q2 - p2) * 6 * t;
    if (t < 1 / 2) return q2;
    if (t < 2 / 3) return p2 + (q2 - p2) * (2 / 3 - t) * 6;
    return p2;
  };
  const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
  const p = 2 * l - q;
  return {
    r: Math.round(hue2rgb(p, q, h + 1 / 3) * 255),
    g: Math.round(hue2rgb(p, q, h) * 255),
    b: Math.round(hue2rgb(p, q, h - 1 / 3) * 255)
  };
}
function hslToRgba(hsl) {
  const rgb = hslToRgb(hsl);
  return { ...rgb, a: "a" in hsl ? hsl.a : 1 };
}
function rgbToHsv(rgb) {
  const r = rgb.r / 255;
  const g = rgb.g / 255;
  const b = rgb.b / 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const d = max - min;
  let h = 0;
  const s = max === 0 ? 0 : d / max;
  const v = max;
  if (max !== min) {
    switch (max) {
      case r:
        h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
        break;
      case g:
        h = ((b - r) / d + 2) / 6;
        break;
      case b:
        h = ((r - g) / d + 4) / 6;
        break;
    }
  }
  return {
    h: Math.round(h * 360),
    s: Math.round(s * 100),
    v: Math.round(v * 100)
  };
}
function toHex(input) {
  const rgba = parse(input);
  if (!rgba) return "#000000";
  return rgbToHex(rgba);
}
function toRgb(input) {
  const rgba = parse(input);
  if (!rgba) return "rgb(0, 0, 0)";
  if (rgba.a < 1) {
    return `rgba(${rgba.r}, ${rgba.g}, ${rgba.b}, ${rgba.a})`;
  }
  return `rgb(${rgba.r}, ${rgba.g}, ${rgba.b})`;
}
function toHsl(input) {
  const rgba = parse(input);
  if (!rgba) return "hsl(0, 0%, 0%)";
  const hsl = rgbToHsl(rgba);
  if (rgba.a < 1) {
    return `hsla(${hsl.h}, ${hsl.s}%, ${hsl.l}%, ${rgba.a})`;
  }
  return `hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)`;
}
function lighten(input, amount) {
  const rgba = parse(input);
  if (!rgba) return toHex(input);
  const hsl = rgbToHsl(rgba);
  hsl.l = Math.min(100, hsl.l + amount);
  const result = hslToRgba({ ...hsl, a: rgba.a });
  return rgbToHex(result);
}
function darken(input, amount) {
  const rgba = parse(input);
  if (!rgba) return toHex(input);
  const hsl = rgbToHsl(rgba);
  hsl.l = Math.max(0, hsl.l - amount);
  const result = hslToRgba({ ...hsl, a: rgba.a });
  return rgbToHex(result);
}
function saturate(input, amount) {
  const rgba = parse(input);
  if (!rgba) return toHex(input);
  const hsl = rgbToHsl(rgba);
  hsl.s = Math.min(100, hsl.s + amount);
  const result = hslToRgba({ ...hsl, a: rgba.a });
  return rgbToHex(result);
}
function desaturate(input, amount) {
  const rgba = parse(input);
  if (!rgba) return toHex(input);
  const hsl = rgbToHsl(rgba);
  hsl.s = Math.max(0, hsl.s - amount);
  const result = hslToRgba({ ...hsl, a: rgba.a });
  return rgbToHex(result);
}
function rotate(input, degrees) {
  const rgba = parse(input);
  if (!rgba) return toHex(input);
  const hsl = rgbToHsl(rgba);
  hsl.h = (hsl.h + degrees) % 360;
  if (hsl.h < 0) hsl.h += 360;
  const result = hslToRgba({ ...hsl, a: rgba.a });
  return rgbToHex(result);
}
function alpha(input, a) {
  const rgba = parse(input);
  if (!rgba) return toHex(input);
  rgba.a = Math.max(0, Math.min(1, a));
  return rgbToHex(rgba);
}
function mix(color1, color2, weight = 0.5) {
  const rgba1 = parse(color1);
  const rgba2 = parse(color2);
  if (!rgba1 || !rgba2) return "#000000";
  const w = Math.max(0, Math.min(1, weight));
  return rgbToHex({
    r: Math.round(rgba1.r * (1 - w) + rgba2.r * w),
    g: Math.round(rgba1.g * (1 - w) + rgba2.g * w),
    b: Math.round(rgba1.b * (1 - w) + rgba2.b * w),
    a: rgba1.a * (1 - w) + rgba2.a * w
  });
}
function invert(input) {
  const rgba = parse(input);
  if (!rgba) return "#ffffff";
  return rgbToHex({
    r: 255 - rgba.r,
    g: 255 - rgba.g,
    b: 255 - rgba.b,
    a: rgba.a
  });
}
function grayscale(input) {
  const rgba = parse(input);
  if (!rgba) return "#000000";
  const gray = Math.round(0.299 * rgba.r + 0.587 * rgba.g + 0.114 * rgba.b);
  return rgbToHex({ r: gray, g: gray, b: gray, a: rgba.a });
}
function complement(input) {
  return rotate(input, 180);
}
function luminance(input) {
  const rgba = parse(input);
  if (!rgba) return 0;
  const srgb = [rgba.r, rgba.g, rgba.b].map((c) => {
    c = c / 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * srgb[0] + 0.7152 * srgb[1] + 0.0722 * srgb[2];
}
function contrastRatio(color1, color2) {
  const l1 = luminance(color1);
  const l2 = luminance(color2);
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
}
function isAccessible(foreground, background) {
  return contrastRatio(foreground, background) >= 4.5;
}
function isAccessibleAAA(foreground, background) {
  return contrastRatio(foreground, background) >= 7;
}
function isLight(input) {
  return luminance(input) > 0.5;
}
function isDark(input) {
  return luminance(input) <= 0.5;
}
function getContrastColor(input) {
  return isLight(input) ? "#000000" : "#ffffff";
}
var NAMED_COLORS = {
  aliceblue: "#f0f8ff",
  antiquewhite: "#faebd7",
  aqua: "#00ffff",
  aquamarine: "#7fffd4",
  azure: "#f0ffff",
  beige: "#f5f5dc",
  bisque: "#ffe4c4",
  black: "#000000",
  blanchedalmond: "#ffebcd",
  blue: "#0000ff",
  blueviolet: "#8a2be2",
  brown: "#a52a2a",
  burlywood: "#deb887",
  cadetblue: "#5f9ea0",
  chartreuse: "#7fff00",
  chocolate: "#d2691e",
  coral: "#ff7f50",
  cornflowerblue: "#6495ed",
  cornsilk: "#fff8dc",
  crimson: "#dc143c",
  cyan: "#00ffff",
  darkblue: "#00008b",
  darkcyan: "#008b8b",
  darkgoldenrod: "#b8860b",
  darkgray: "#a9a9a9",
  darkgreen: "#006400",
  darkkhaki: "#bdb76b",
  darkmagenta: "#8b008b",
  darkolivegreen: "#556b2f",
  darkorange: "#ff8c00",
  darkorchid: "#9932cc",
  darkred: "#8b0000",
  darksalmon: "#e9967a",
  darkseagreen: "#8fbc8f",
  darkslateblue: "#483d8b",
  darkslategray: "#2f4f4f",
  darkturquoise: "#00ced1",
  darkviolet: "#9400d3",
  deeppink: "#ff1493",
  deepskyblue: "#00bfff",
  dimgray: "#696969",
  dodgerblue: "#1e90ff",
  firebrick: "#b22222",
  floralwhite: "#fffaf0",
  forestgreen: "#228b22",
  fuchsia: "#ff00ff",
  gainsboro: "#dcdcdc",
  ghostwhite: "#f8f8ff",
  gold: "#ffd700",
  goldenrod: "#daa520",
  gray: "#808080",
  green: "#008000",
  greenyellow: "#adff2f",
  honeydew: "#f0fff0",
  hotpink: "#ff69b4",
  indianred: "#cd5c5c",
  indigo: "#4b0082",
  ivory: "#fffff0",
  khaki: "#f0e68c",
  lavender: "#e6e6fa",
  lavenderblush: "#fff0f5",
  lawngreen: "#7cfc00",
  lemonchiffon: "#fffacd",
  lightblue: "#add8e6",
  lightcoral: "#f08080",
  lightcyan: "#e0ffff",
  lightgoldenrodyellow: "#fafad2",
  lightgray: "#d3d3d3",
  lightgreen: "#90ee90",
  lightpink: "#ffb6c1",
  lightsalmon: "#ffa07a",
  lightseagreen: "#20b2aa",
  lightskyblue: "#87cefa",
  lightslategray: "#778899",
  lightsteelblue: "#b0c4de",
  lightyellow: "#ffffe0",
  lime: "#00ff00",
  limegreen: "#32cd32",
  linen: "#faf0e6",
  magenta: "#ff00ff",
  maroon: "#800000",
  mediumaquamarine: "#66cdaa",
  mediumblue: "#0000cd",
  mediumorchid: "#ba55d3",
  mediumpurple: "#9370db",
  mediumseagreen: "#3cb371",
  mediumslateblue: "#7b68ee",
  mediumspringgreen: "#00fa9a",
  mediumturquoise: "#48d1cc",
  mediumvioletred: "#c71585",
  midnightblue: "#191970",
  mintcream: "#f5fffa",
  mistyrose: "#ffe4e1",
  moccasin: "#ffe4b5",
  navajowhite: "#ffdead",
  navy: "#000080",
  oldlace: "#fdf5e6",
  olive: "#808000",
  olivedrab: "#6b8e23",
  orange: "#ffa500",
  orangered: "#ff4500",
  orchid: "#da70d6",
  palegoldenrod: "#eee8aa",
  palegreen: "#98fb98",
  paleturquoise: "#afeeee",
  palevioletred: "#db7093",
  papayawhip: "#ffefd5",
  peachpuff: "#ffdab9",
  peru: "#cd853f",
  pink: "#ffc0cb",
  plum: "#dda0dd",
  powderblue: "#b0e0e6",
  purple: "#800080",
  rebeccapurple: "#663399",
  red: "#ff0000",
  rosybrown: "#bc8f8f",
  royalblue: "#4169e1",
  saddlebrown: "#8b4513",
  salmon: "#fa8072",
  sandybrown: "#f4a460",
  seagreen: "#2e8b57",
  seashell: "#fff5ee",
  sienna: "#a0522d",
  silver: "#c0c0c0",
  skyblue: "#87ceeb",
  slateblue: "#6a5acd",
  slategray: "#708090",
  snow: "#fffafa",
  springgreen: "#00ff7f",
  steelblue: "#4682b4",
  tan: "#d2b48c",
  teal: "#008080",
  thistle: "#d8bfd8",
  tomato: "#ff6347",
  turquoise: "#40e0d0",
  violet: "#ee82ee",
  wheat: "#f5deb3",
  white: "#ffffff",
  whitesmoke: "#f5f5f5",
  yellow: "#ffff00",
  yellowgreen: "#9acd32"
};
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  NAMED_COLORS,
  alpha,
  complement,
  contrastRatio,
  darken,
  desaturate,
  getContrastColor,
  grayscale,
  hslToRgb,
  hslToRgba,
  invert,
  isAccessible,
  isAccessibleAAA,
  isDark,
  isLight,
  lighten,
  luminance,
  mix,
  parse,
  parseHex,
  parseHsl,
  parseRgb,
  rgbToHex,
  rgbToHsl,
  rgbToHsv,
  rotate,
  saturate,
  toHex,
  toHsl,
  toRgb
});
//# sourceMappingURL=index.cjs.map