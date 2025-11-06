import AsyncStorage from '@react-native-async-storage/async-storage';
import { ContainerItem } from '../constants/Types';
import { generateId } from './time';

const MIGRATION_VERSION_KEY = '@migration_version';
const CURRENT_MIGRATION_VERSION = 3;

// New anchor tiles to add
const NEW_ANCHORS: Omit<ContainerItem, 'id'>[] = [
  {
    title: 'Begin Flow',
    body_cue: 'First light on skin.',
    micro: 'One slow inhale.',
    desire: 'Arrival is enough.',
    container: 'morning',
    category: 'time',
  },
  {
    title: 'Micro Motion',
    body_cue: 'Energy pooling.',
    micro: 'Stretch one limb.',
    desire: 'Motion translates to meaning.',
    container: 'afternoon',
    category: 'time',
  },
  {
    title: 'Field Resonance',
    body_cue: 'What harmonized today?',
    micro: 'One-line synthesis.',
    desire: 'Integration reveals pattern.',
    container: 'evening',
    category: 'time',
  },
  {
    title: 'Dreamseed',
    body_cue: 'The day dissolves.',
    micro: 'Write one word.',
    desire: 'Release returns awareness to mystery.',
    container: 'late',
    category: 'time',
  },
  {
    title: 'Creative Pulse',
    body_cue: 'A surge of focus.',
    micro: 'Capture what sparked.',
    desire: 'Creation flows through attention.',
    container: 'afternoon',
    category: 'uplift',
  },
];

// Define the desired order for anchors by their IDs
const ANCHOR_ORDER_MAP: Record<string, number> = {
  // Evening anchors - Transition Field should be first
  'evening-transition': 1,
  'evening-warmth': 2,
  'evening-field-resonance': 3, // New anchor
  'evening-closure': 4,
  'evening-decompression': 5,

  // Afternoon Situational - Tension Loop and Disconnection before Sensory Overload
  'afternoon-tension-loop': 1,
  'afternoon-disconnection': 2,
  'afternoon-sensory-overload': 3,
  'afternoon-decision-fatigue': 4,

  // Morning anchors - Orientation before Light Intake
  'morning-begin-flow': 1, // New anchor
  'morning-ground': 2,
  'morning-orientation': 3,
  'morning-light-intake': 4,
  'morning-hydration': 5,

  // Late Situational - Guilt Spiral at top
  'late-guilt-spiral': 1,
  'late-restlessness': 2,
  'late-physical-ache': 3,
  'late-lonely-mind-chatter': 4,

  // Late Uplift - Infinite at top
  'late-infinite': 1,
  'late-peaceful': 2,
  'late-restored': 3,
  'late-dream-ready': 4,

  // Afternoon Uplift - Creative Pulse first
  'afternoon-creative-pulse': 1, // New anchor
  'afternoon-focused': 2,
  'afternoon-playful': 3,
  'afternoon-curious': 4,
  'afternoon-collaborative': 5,
};

/**
 * Check if migration is needed
 */
export async function needsMigration(): Promise<boolean> {
  try {
    const version = await AsyncStorage.getItem(MIGRATION_VERSION_KEY);
    const currentVersion = version ? parseInt(version, 10) : 0;
    return currentVersion < CURRENT_MIGRATION_VERSION;
  } catch (error) {
    console.error('Error checking migration version:', error);
    return false;
  }
}

/**
 * Add new anchor tiles that don't exist yet
 */
function addNewAnchors(existingItems: ContainerItem[]): ContainerItem[] {
  const existingTitles = new Set(existingItems.map(item => item.title.toLowerCase()));
  const newItems: ContainerItem[] = [];

  for (const anchor of NEW_ANCHORS) {
    if (!existingTitles.has(anchor.title.toLowerCase())) {
      const now = new Date();
      newItems.push({
        ...anchor,
        id: `${anchor.container}-${anchor.title.toLowerCase().replace(/\s+/g, '-')}`,
        createdAt: now.toISOString(),
        createdTimestamp: now.getTime(),
      });
    }
  }

  return [...existingItems, ...newItems];
}

/**
 * Reorder anchors based on ANCHOR_ORDER_MAP
 * Groups items by container+category, then sorts within each group
 */
function reorderAnchors(items: ContainerItem[]): ContainerItem[] {
  // Group items by container and category
  const groups = new Map<string, ContainerItem[]>();
  
  for (const item of items) {
    const key = `${item.container}-${item.category}`;
    if (!groups.has(key)) {
      groups.set(key, []);
    }
    groups.get(key)!.push(item);
  }
  
  // Sort items within each group
  const sortedGroups: ContainerItem[] = [];
  for (const [key, groupItems] of groups.entries()) {
    const sorted = groupItems.sort((a, b) => {
      const orderA = ANCHOR_ORDER_MAP[a.id] ?? 9999;
      const orderB = ANCHOR_ORDER_MAP[b.id] ?? 9999;
      
      // If both have defined order, sort by order
      if (orderA !== 9999 && orderB !== 9999) {
        return orderA - orderB;
      }
      
      // If only one has defined order, prioritize it
      if (orderA !== 9999) return -1;
      if (orderB !== 9999) return 1;
      
      // If neither has defined order, maintain original order (by timestamp)
      return (a.createdTimestamp || 0) - (b.createdTimestamp || 0);
    });
    sortedGroups.push(...sorted);
  }
  
  return sortedGroups;
}

/**
 * Run migration on app state
 */
export async function runMigration(): Promise<void> {
  try {
    const stateJson = await AsyncStorage.getItem('@app_state');
    if (!stateJson) {
      console.log('No saved state found, skipping migration');
      await AsyncStorage.setItem(MIGRATION_VERSION_KEY, CURRENT_MIGRATION_VERSION.toString());
      return;
    }

    const state = JSON.parse(stateJson);
    
    if (!state.items || !Array.isArray(state.items)) {
      console.log('No items found in state, skipping migration');
      await AsyncStorage.setItem(MIGRATION_VERSION_KEY, CURRENT_MIGRATION_VERSION.toString());
      return;
    }

    console.log('Running migration v3: Adding new anchors and reordering...');
    
    // Step 1: Add new anchors
    let updatedItems = addNewAnchors(state.items);
    console.log(`Added ${updatedItems.length - state.items.length} new anchors`);
    
    // Log before reordering
    const lateSituational = updatedItems.filter(i => i.container === 'late' && i.category === 'situational');
    console.log('Late situational BEFORE reorder:', lateSituational.map(i => `${i.id}: ${i.title}`));
    
    // Step 2: Reorder all anchors
    updatedItems = reorderAnchors(updatedItems);
    
    // Log after reordering
    const lateSituationalAfter = updatedItems.filter(i => i.container === 'late' && i.category === 'situational');
    console.log('Late situational AFTER reorder:', lateSituationalAfter.map(i => `${i.id}: ${i.title}`));
    console.log('Anchors reordered');

    // Save updated state
    state.items = updatedItems;
    await AsyncStorage.setItem('@app_state', JSON.stringify(state));
    
    // Mark migration as complete
    await AsyncStorage.setItem(MIGRATION_VERSION_KEY, CURRENT_MIGRATION_VERSION.toString());
    
    console.log('Migration completed successfully');
  } catch (error) {
    console.error('Migration failed:', error);
    throw error;
  }
}

/**
 * Force run migration (for testing)
 */
export async function forceMigration(): Promise<void> {
  await AsyncStorage.removeItem(MIGRATION_VERSION_KEY);
  await runMigration();
}
