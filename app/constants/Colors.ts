import { ContainerId } from "./Types";

// Hex values are chosen to match the named color and mood, ensuring adequate contrast
// and avoiding bright, "shiny" colors as requested.

export const CircadianPalette = {
  // --- Palette Refinement: Lower Contrast, Softer Glow ---
  morning: {
    // Mood: calm, bright, optimistic but not loud. Feels like filtered sunlight through linen.
    bg: "#F5E6CC", // Muted Pale Gold/Lemon Chiffon (Core background)
    bgGradient: "linear-gradient(180deg, #F5E6CC 0%, #F8EDD6 100%)", // Pale gold bloom
    accent: "#A2B8A6", // Muted Sage (Accent background)
    text: "#4D483B", // Deep brown-gray (Text)
    dim: "#B3A698", // Warm taupe (Secondary text)
    signal: "#F2A08E", // Gentle coral (Signal color)
    card: "#FFFFFF",
    cardOverlay: "rgba(162, 184, 166, 0.08)", // Subtle sage glow on cards
  },
  afternoon: {
    // Mood: hydrated, clear, open. Feels like light through water or sky reflection.
    bg: "#E0FFFF", // Near Electric Blue (Core background - #7DF9FF is too bright)
    bgGradient: "linear-gradient(180deg, #E0FFFF 0%, #E8FFFF 100%)", // Deeper coral drift
    accent: "#B0E0E6", // Pale sand/desaturated turquoise (Accent background)
    text: "#3B4D48", // Dark gray with faint green tint (Text)
    dim: "#A9A9A9", // Cool stone (Secondary text)
    signal: "#40E0D0", // Aqua/Teal (Signal color)
    card: "#FFFFFF",
    cardOverlay: "rgba(176, 224, 230, 0.10)", // Aqua shimmer on cards
  },
  evening: {
    // Mood: warm descent; the body exhales. Feels like candlelight on clay walls.
    bg: "#4D3A30", // Deep Copper/Brown (Ancient Copper - Core background)
    bgGradient: "linear-gradient(180deg, #4D3A30 0%, #5A4438 100%)", // Plum fade
    accent: "#8C4B3F", // Deeper rust (Accent background)
    text: "#F0E5D8", // Light Cream/Off-white (Text - High contrast for dark background)
    dim: "#B87333", // Copper/umber (Secondary text)
    signal: "#D4AF37", // Muted amber (Signal color)
    card: "#333333", // Darker card
    cardOverlay: "rgba(140, 75, 63, 0.12)", // Warm rust glow on cards
  },
  late: {
    // Mood: cocooned, quiet, protective. Feels like deep forest or night air.
    bg: "#1A1A1A", // Near Black (Core background - Darkest for night)
    bgGradient: "linear-gradient(180deg, #1A1A1A 0%, #242438 100%)", // Indigo wash
    accent: "#5A6E5A", // Dark moss (Accent background)
    text: "#F0F0F0", // Off-white (Text - High contrast for dark background)
    dim: "#A9B8A6", // Muted sage (Secondary text)
    signal: "#4682B4", // Moon-blue (Signal color)
    card: "#333333", // Darker card
    cardOverlay: "rgba(90, 110, 90, 0.08)", // Moss whisper on cards
  },
  // Neutral/Utility Containers
  situational: {
    // Mood: flexible, mid-tone palette that can overlay all others.
    bg: "#D3D3D3", // Neutral gray with whisper of blue (Core background)
    accent: "#A9A9A9", // Light slate (Accent background)
    text: "#36454F", // Charcoal (Text)
    dim: "#C0C0C0", // Mist gray (Secondary text)
    signal: "#B19CD9", // Gentle lavender (Signal color)
    card: "#FFFFFF",
  },
  uplift: {
    // Mood: clear energy, upward flow without glare. Feels like dawn sky after rain.
    bg: "#E6E6FA", // Very light periwinkle (Core background)
    accent: "#B19CD9", // Soft lilac (Accent background)
    text: "#000080", // Dark indigo (Text)
    dim: "#B19CD9", // Muted violet (Secondary text)
    signal: "#00CED1", // Thin line of cyan (Signal color)
    card: "#FFFFFF",
  },
};

export const StateIndicators = {
  mint: "#A2B8A6", // Rest
  grey: "#A9A9A9", // Neutral
  violet: "#B19CD9", // Focus
};

export const ContainerThemes: Record<ContainerId, string> = {
  morning: "Coming Online",
  afternoon: "Recalibration",
  evening: "Integration",
  late: "Descent",
  situational: "Situational Resonance",
  uplift: "Uplift & Expansion",
};

// Screen-specific color palettes (not time-bound)
export const ScreenPalettes = {
  substances: {
    // Earthy greens/browns - pharmacopoeia vibes
    bg: "#E8E5D8", // Warm cream
    accent: "#7A9B76", // Sage green
    text: "#3D3D2E", // Deep olive
    dim: "#9B9B88", // Muted sage
    signal: "#B8956A", // Warm tan
    card: "#F5F3EB", // Off-white
  },
  patterns: {
    // Cool blues/grays - analytical, observational
    bg: "#E6EBF0", // Soft blue-gray
    accent: "#6B8CAE", // Steel blue
    text: "#2C3E50", // Dark slate
    dim: "#95A5B8", // Muted blue-gray
    signal: "#5D7A99", // Deep blue
    card: "#F8FAFB", // Almost white
  },
  nourish: {
    // Warm creams/golds - nourishment, sustenance
    bg: "#F5EFE0", // Warm cream
    accent: "#D4A574", // Golden tan
    text: "#4A3F2E", // Warm brown
    dim: "#B8A890", // Muted gold
    signal: "#C89B5A", // Honey gold
    card: "#FFFBF5", // Warm white
  },
  archetypes: {
    // Soft purples/indigos - inner modes, consciousness
    bg: "#E8E6F0", // Soft lavender-gray
    accent: "#8B7FA8", // Muted purple
    text: "#3A3545", // Deep indigo
    dim: "#A399B8", // Soft purple-gray
    signal: "#9B8FB5", // Lavender
    card: "#F5F3FA", // Very light lavender
  },
};
