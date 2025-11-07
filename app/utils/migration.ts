import AsyncStorage from '@react-native-async-storage/async-storage';
import { ContainerItem } from '../constants/Types';
import { generateId } from './time';
import { DEFAULT_GROUNDING_ITEMS, DEFAULT_ALLIES } from '../constants/DefaultData';

const MIGRATION_VERSION_KEY = '@migration_version';
const CURRENT_MIGRATION_VERSION = 8;

// Migration is now only for reordering - Dreamseed already replaces Stillness Signal in DefaultData
// No new anchors to add
const NEW_ANCHORS: Omit<ContainerItem, 'id'>[] = [];

// Define the desired order for anchors by their IDs
const ANCHOR_ORDER_MAP: Record<string, number> = {
  // Evening anchors - Transition Field should be first
  'evening-transition': 1,
  'evening-warmth': 2,
  'evening-closure': 3,
  'evening-decompression': 4,

  // Afternoon Situational - Tension Loop and Disconnection before Sensory Overload
  'afternoon-tension-loop': 1,
  'afternoon-disconnection': 2,
  'afternoon-sensory-overload': 3,
  'afternoon-decision-fatigue': 4,

  // Morning anchors - Orientation before Light Intake
  'morning-ground': 1,
  'morning-orientation': 2,
  'morning-light-intake': 3,
  'morning-hydration': 4,

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

  // Afternoon Uplift
  'afternoon-focused': 1,
  'afternoon-playful': 2,
  'afternoon-curious': 3,
  'afternoon-collaborative': 4,
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
 * Add ultra_micro field to existing anchors by matching with DefaultData
 */
function addUltraMicroField(items: ContainerItem[]): ContainerItem[] {
  // Create a map of default anchors by ID for quick lookup
  const defaultAnchorsMap = new Map<string, ContainerItem>();
  for (const anchor of DEFAULT_GROUNDING_ITEMS) {
    defaultAnchorsMap.set(anchor.id, anchor);
  }
  
  // Update each item with ultra_micro if it exists in DefaultData
  return items.map(item => {
    const defaultAnchor = defaultAnchorsMap.get(item.id);
    if (defaultAnchor && defaultAnchor.ultra_micro && !item.ultra_micro) {
      return {
        ...item,
        ultra_micro: defaultAnchor.ultra_micro
      };
    }
    return item;
  });
}

/**
 * Sync substance allies with DefaultData to ensure face emojis and mythicNames are up to date
 */
function syncSubstanceData(allies: any[]): any[] {
  if (!allies || !Array.isArray(allies)) return allies;
  
  return allies.map(ally => {
    // Find matching default ally by ID
    const defaultAlly = DEFAULT_ALLIES.find(d => d.id === ally.id);
    if (defaultAlly) {
      return {
        ...ally,
        face: defaultAlly.face, // Update emoji
        mythicName: defaultAlly.mythicName, // Update mythical name
      };
    }
    return ally;
  });
}

/**
 * Sync anchor content with DefaultData to update body_cue, micro, ultra_micro, desire
 */
function syncAnchorContent(items: ContainerItem[]): ContainerItem[] {
  // Create a map of default anchors by ID for quick lookup
  const defaultAnchorsMap = new Map<string, ContainerItem>();
  for (const anchor of DEFAULT_GROUNDING_ITEMS) {
    defaultAnchorsMap.set(anchor.id, anchor);
  }
  
  // Update each item with content from DefaultData if it exists
  return items.map(item => {
    const defaultAnchor = defaultAnchorsMap.get(item.id);
    if (defaultAnchor) {
      return {
        ...item,
        body_cue: defaultAnchor.body_cue,
        micro: defaultAnchor.micro,
        ultra_micro: defaultAnchor.ultra_micro,
        desire: defaultAnchor.desire,
      };
    }
    return item;
  });
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

    console.log('Running migration v8: Syncing substance data, anchor content, and reordering...');
    
    // Step 1: Sync substance data (face emojis and mythicNames)
    if (state.allies && Array.isArray(state.allies)) {
      state.allies = syncSubstanceData(state.allies);
      console.log(`Synced ${state.allies.length} substances with DefaultData`);
    }
    
    // Step 2: Sync anchor content from DefaultData (updates Dreamseed and other anchors)
    let updatedItems = syncAnchorContent(state.items);
    console.log(`Synced content for ${updatedItems.length} anchors with DefaultData`);
    
    // Step 3: Add new anchors
    updatedItems = addNewAnchors(updatedItems);
    console.log(`Added ${updatedItems.length - state.items.length} new anchors`);
    
    // Log before reordering
    const lateSituational = updatedItems.filter(i => i.container === 'late' && i.category === 'situational');
    console.log('Late situational BEFORE reorder:', lateSituational.map(i => `${i.id}: ${i.title}`));
    
    // Step 4: Reorder all anchors
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
