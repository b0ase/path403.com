/**
 * @b0ase/color-utils
 *
 * Color utilities: parsing, conversion, manipulation, and contrast.
 *
 * @packageDocumentation
 */
/** RGB color */
interface RGB {
    r: number;
    g: number;
    b: number;
}
/** RGBA color */
interface RGBA extends RGB {
    a: number;
}
/** HSL color */
interface HSL {
    h: number;
    s: number;
    l: number;
}
/** HSLA color */
interface HSLA extends HSL {
    a: number;
}
/** HSV color */
interface HSV {
    h: number;
    s: number;
    v: number;
}
/** Color input (various formats) */
type ColorInput = string | RGB | RGBA | HSL | HSLA;
/**
 * Parse hex color
 */
declare function parseHex(hex: string): RGBA | null;
/**
 * Parse RGB/RGBA string
 */
declare function parseRgb(str: string): RGBA | null;
/**
 * Parse HSL/HSLA string
 */
declare function parseHsl(str: string): HSLA | null;
/**
 * Parse any color format
 */
declare function parse(input: ColorInput): RGBA | null;
/**
 * RGB to hex
 */
declare function rgbToHex(rgb: RGB | RGBA): string;
/**
 * RGB to HSL
 */
declare function rgbToHsl(rgb: RGB): HSL;
/**
 * HSL to RGB
 */
declare function hslToRgb(hsl: HSL): RGB;
/**
 * HSL to RGBA
 */
declare function hslToRgba(hsl: HSL | HSLA): RGBA;
/**
 * RGB to HSV
 */
declare function rgbToHsv(rgb: RGB): HSV;
declare function toHex(input: ColorInput): string;
declare function toRgb(input: ColorInput): string;
declare function toHsl(input: ColorInput): string;
/**
 * Lighten color
 */
declare function lighten(input: ColorInput, amount: number): string;
/**
 * Darken color
 */
declare function darken(input: ColorInput, amount: number): string;
/**
 * Saturate color
 */
declare function saturate(input: ColorInput, amount: number): string;
/**
 * Desaturate color
 */
declare function desaturate(input: ColorInput, amount: number): string;
/**
 * Rotate hue
 */
declare function rotate(input: ColorInput, degrees: number): string;
/**
 * Set opacity
 */
declare function alpha(input: ColorInput, a: number): string;
/**
 * Mix two colors
 */
declare function mix(color1: ColorInput, color2: ColorInput, weight?: number): string;
/**
 * Invert color
 */
declare function invert(input: ColorInput): string;
/**
 * Grayscale
 */
declare function grayscale(input: ColorInput): string;
/**
 * Get complementary color
 */
declare function complement(input: ColorInput): string;
/**
 * Get relative luminance
 */
declare function luminance(input: ColorInput): number;
/**
 * Get contrast ratio between two colors
 */
declare function contrastRatio(color1: ColorInput, color2: ColorInput): number;
/**
 * Check if color passes WCAG AA (4.5:1 for normal text)
 */
declare function isAccessible(foreground: ColorInput, background: ColorInput): boolean;
/**
 * Check if color passes WCAG AAA (7:1 for normal text)
 */
declare function isAccessibleAAA(foreground: ColorInput, background: ColorInput): boolean;
/**
 * Check if color is light
 */
declare function isLight(input: ColorInput): boolean;
/**
 * Check if color is dark
 */
declare function isDark(input: ColorInput): boolean;
/**
 * Get best contrast color (black or white)
 */
declare function getContrastColor(input: ColorInput): string;
declare const NAMED_COLORS: Record<string, string>;

export { type ColorInput, type HSL, type HSLA, type HSV, NAMED_COLORS, type RGB, type RGBA, alpha, complement, contrastRatio, darken, desaturate, getContrastColor, grayscale, hslToRgb, hslToRgba, invert, isAccessible, isAccessibleAAA, isDark, isLight, lighten, luminance, mix, parse, parseHex, parseHsl, parseRgb, rgbToHex, rgbToHsl, rgbToHsv, rotate, saturate, toHex, toHsl, toRgb };
