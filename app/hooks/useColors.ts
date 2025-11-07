import { useColorScheme as useRNColorScheme } from 'react-native';
import { ColorScheme, ContainerId, Archetype } from '../constants/Types';
import { CircadianPalette, ScreenPalettes } from '../constants/Colors';
import { blendArchetypeColors } from '../utils/colorBlending';
import { getInterpolatedCircadianColors } from '../utils/colorInterpolation';
import { getCurrentTimeContainer } from '../utils/timeUtils';

type ScreenType = 'home' | 'substances' | 'patterns' | 'nourish' | 'archetypes';

export default function useColors(
  activeContainer?: ContainerId,
  useCircadian: boolean = true,
  screenType?: ScreenType,
  activeArchetype?: Archetype | null
): ColorScheme {
  const systemTheme = useRNColorScheme();

  // Fallback colors
  const LightColorsFallback = { 
    bg: '#fff', 
    accent: '#000', 
    text: '#000', 
    dim: '#ccc', 
    signal: '#f00', 
    card: '#fff' 
  };
  const DarkColorsFallback = { 
    bg: '#000', 
    accent: '#fff', 
    text: '#fff', 
    dim: '#333', 
    signal: '#0f0', 
    card: '#000' 
  };

  // Determine base colors
  let baseColors: ColorScheme;
  
  console.log('[useColors] screenType:', screenType, 'activeContainer:', activeContainer);
  console.log('[useColors] ScreenPalettes keys:', Object.keys(ScreenPalettes));
  console.log('[useColors] Checking:', screenType && screenType !== 'home' && ScreenPalettes[screenType]);
  
  if (useCircadian && screenType === 'home') {
    // Interpolated circadian palette ONLY for home screen
    // Get smooth color transition based on current time
    baseColors = getInterpolatedCircadianColors(
      CircadianPalette.morning,
      CircadianPalette.afternoon,
      CircadianPalette.evening,
      CircadianPalette.late
    );
  } else if (useCircadian) {
    // Discrete circadian palette for other screens
    // Use the current time container's colors without interpolation
    const currentContainer = getCurrentTimeContainer();
    baseColors = CircadianPalette[currentContainer];
  } else {
    // Fallback
    baseColors = systemTheme === 'dark' ? DarkColorsFallback : LightColorsFallback;
  }

  // If an archetype is active, blend its colors with the base
  if (activeArchetype) {
    return blendArchetypeColors(
      baseColors,
      activeArchetype.color_theme.overlay,
      activeArchetype.color_theme.accent
    );
  }

  return baseColors;
}
