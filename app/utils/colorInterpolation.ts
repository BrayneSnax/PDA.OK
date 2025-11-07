import { ColorScheme } from '../constants/Types';

/**
 * Convert hex color to RGB components
 */
function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : null;
}

/**
 * Convert RGB components to hex color
 */
function rgbToHex(r: number, g: number, b: number): string {
  return '#' + [r, g, b].map(x => {
    const hex = Math.round(x).toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  }).join('');
}

/**
 * Interpolate between two hex colors
 * @param color1 Starting color (hex)
 * @param color2 Ending color (hex)
 * @param factor Interpolation factor (0-1)
 */
export function interpolateColor(color1: string, color2: string, factor: number): string {
  const rgb1 = hexToRgb(color1);
  const rgb2 = hexToRgb(color2);
  
  if (!rgb1 || !rgb2) return color1;
  
  const r = rgb1.r + factor * (rgb2.r - rgb1.r);
  const g = rgb1.g + factor * (rgb2.g - rgb1.g);
  const b = rgb1.b + factor * (rgb2.b - rgb1.b);
  
  return rgbToHex(r, g, b);
}

/**
 * Interpolate between two color schemes
 * @param scheme1 Starting color scheme
 * @param scheme2 Ending color scheme
 * @param factor Interpolation factor (0-1)
 */
export function interpolateColorScheme(
  scheme1: ColorScheme,
  scheme2: ColorScheme,
  factor: number
): ColorScheme {
  return {
    bg: interpolateColor(scheme1.bg, scheme2.bg, factor),
    accent: interpolateColor(scheme1.accent, scheme2.accent, factor),
    text: interpolateColor(scheme1.text, scheme2.text, factor),
    dim: interpolateColor(scheme1.dim, scheme2.dim, factor),
    signal: interpolateColor(scheme1.signal, scheme2.signal, factor),
    card: interpolateColor(scheme1.card, scheme2.card, factor),
  };
}

/**
 * Get interpolated color scheme based on current time of day
 * Smoothly transitions between morning → afternoon → evening → late
 */
export function getInterpolatedCircadianColors(
  morningColors: ColorScheme,
  afternoonColors: ColorScheme,
  eveningColors: ColorScheme,
  lateColors: ColorScheme
): ColorScheme {
  const now = new Date();
  const hours = now.getHours();
  const minutes = now.getMinutes();
  const timeInHours = hours + minutes / 60;
  
  // Define time boundaries (in 24-hour format)
  // Morning: 5am-11am
  // Afternoon: 11am-5pm  
  // Evening: 5pm-10pm
  // Late: 10pm-5am
  
  if (timeInHours >= 5 && timeInHours < 11) {
    // Morning period (5am-11am)
    // Interpolate from morning to afternoon
    const factor = (timeInHours - 5) / 6; // 0 at 5am, 1 at 11am
    return interpolateColorScheme(morningColors, afternoonColors, factor);
  } else if (timeInHours >= 11 && timeInHours < 17) {
    // Afternoon period (11am-5pm)
    // Interpolate from afternoon to evening
    const factor = (timeInHours - 11) / 6; // 0 at 11am, 1 at 5pm
    return interpolateColorScheme(afternoonColors, eveningColors, factor);
  } else if (timeInHours >= 17 && timeInHours < 22) {
    // Evening period (5pm-10pm)
    // Interpolate from evening to late
    const factor = (timeInHours - 17) / 5; // 0 at 5pm, 1 at 10pm
    return interpolateColorScheme(eveningColors, lateColors, factor);
  } else {
    // Late period (10pm-5am)
    // Interpolate from late to morning
    let factor: number;
    if (timeInHours >= 22) {
      // 10pm to midnight
      factor = (timeInHours - 22) / 7; // 0 at 10pm
    } else {
      // Midnight to 5am
      factor = (timeInHours + 2) / 7; // Continue from midnight
    }
    return interpolateColorScheme(lateColors, morningColors, factor);
  }
}
