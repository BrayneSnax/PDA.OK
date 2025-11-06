/**
 * Transmission Scheduler
 * Manages background generation of autonomous transmissions
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { 
  generateMultipleTransmissions, 
  getCurrentTimeOfDay,
  Transmission,
  TransmissionContext 
} from './transmissionGenerator';

const STORAGE_KEY = '@pda_transmissions';
const LAST_CHECK_KEY = '@pda_last_transmission_check';
const ENTITY_LAST_TRANSMISSION_KEY = '@pda_entity_last_transmissions';

// Check for new transmissions every 2 hours
const CHECK_INTERVAL_MS = 2 * 60 * 60 * 1000;

/**
 * Stored transmission data
 */
interface StoredTransmission extends Transmission {
  read: boolean;
}

/**
 * Entity last transmission tracking
 */
interface EntityLastTransmissions {
  [key: string]: string; // entityType-entityName -> ISO timestamp
}

/**
 * Load all transmissions from storage
 */
export async function loadTransmissions(): Promise<StoredTransmission[]> {
  try {
    const json = await AsyncStorage.getItem(STORAGE_KEY);
    if (!json) return [];
    
    const transmissions = JSON.parse(json);
    // Convert timestamp strings back to Date objects
    return transmissions.map((t: any) => ({
      ...t,
      timestamp: new Date(t.timestamp),
    }));
  } catch (error) {
    console.error('Error loading transmissions:', error);
    return [];
  }
}

/**
 * Save transmissions to storage
 */
export async function saveTransmissions(transmissions: StoredTransmission[]): Promise<void> {
  try {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(transmissions));
  } catch (error) {
    console.error('Error saving transmissions:', error);
  }
}

/**
 * Add new transmission to storage
 */
export async function addTransmission(transmission: Transmission): Promise<void> {
  const transmissions = await loadTransmissions();
  const stored: StoredTransmission = {
    ...transmission,
    read: false,
  };
  
  transmissions.unshift(stored); // Add to beginning
  
  // Keep only last 50 transmissions
  if (transmissions.length > 50) {
    transmissions.splice(50);
  }
  
  await saveTransmissions(transmissions);
  
  // Update entity last transmission time
  await updateEntityLastTransmission(transmission.type, transmission.entityName, transmission.timestamp);
}

/**
 * Mark transmission as read
 */
export async function markTransmissionRead(transmissionId: string): Promise<void> {
  const transmissions = await loadTransmissions();
  const transmission = transmissions.find(t => t.id === transmissionId);
  
  if (transmission) {
    transmission.read = true;
    await saveTransmissions(transmissions);
  }
}

/**
 * Get unread transmission count
 */
export async function getUnreadCount(): Promise<number> {
  const transmissions = await loadTransmissions();
  return transmissions.filter(t => !t.read).length;
}

/**
 * Load entity last transmission times
 */
async function loadEntityLastTransmissions(): Promise<EntityLastTransmissions> {
  try {
    const json = await AsyncStorage.getItem(ENTITY_LAST_TRANSMISSION_KEY);
    return json ? JSON.parse(json) : {};
  } catch (error) {
    console.error('Error loading entity last transmissions:', error);
    return {};
  }
}

/**
 * Update entity last transmission time
 */
async function updateEntityLastTransmission(
  type: 'archetype' | 'substance',
  name: string,
  timestamp: Date
): Promise<void> {
  try {
    const data = await loadEntityLastTransmissions();
    const key = `${type}-${name}`;
    data[key] = timestamp.toISOString();
    await AsyncStorage.setItem(ENTITY_LAST_TRANSMISSION_KEY, JSON.stringify(data));
  } catch (error) {
    console.error('Error updating entity last transmission:', error);
  }
}

/**
 * Get entity last transmission time
 */
async function getEntityLastTransmission(
  type: 'archetype' | 'substance',
  name: string
): Promise<Date | undefined> {
  const data = await loadEntityLastTransmissions();
  const key = `${type}-${name}`;
  const timestamp = data[key];
  return timestamp ? new Date(timestamp) : undefined;
}

/**
 * Check if it's time to generate new transmissions
 */
async function shouldCheckForTransmissions(): Promise<boolean> {
  try {
    const lastCheckStr = await AsyncStorage.getItem(LAST_CHECK_KEY);
    if (!lastCheckStr) return true;
    
    const lastCheck = new Date(lastCheckStr);
    const now = new Date();
    const timeSince = now.getTime() - lastCheck.getTime();
    
    return timeSince >= CHECK_INTERVAL_MS;
  } catch (error) {
    console.error('Error checking last transmission time:', error);
    return true;
  }
}

/**
 * Update last check time
 */
async function updateLastCheckTime(): Promise<void> {
  try {
    await AsyncStorage.setItem(LAST_CHECK_KEY, new Date().toISOString());
  } catch (error) {
    console.error('Error updating last check time:', error);
  }
}

/**
 * Generate and store new transmissions if needed
 */
export async function checkAndGenerateTransmissions(
  context: TransmissionContext
): Promise<Transmission[]> {
  // Check if it's time
  const shouldCheck = await shouldCheckForTransmissions();
  if (!shouldCheck) {
    return [];
  }

  console.log('Checking for new transmissions...');

  // Build entity list with last transmission times
  const entities: Array<{ name: string; type: 'archetype' | 'substance'; lastTransmission?: Date }> = [];
  
  // Add archetypes
  for (const archetype of context.archetypes) {
    const lastTransmission = await getEntityLastTransmission('archetype', archetype.name);
    entities.push({
      name: archetype.name,
      type: 'archetype',
      lastTransmission,
    });
  }
  
  // Add substances (from allies)
  const uniqueSubstances = new Set<string>();
  context.journalEntries.forEach(entry => {
    if (entry.allyName) {
      uniqueSubstances.add(entry.allyName);
    }
  });
  
  for (const substanceName of uniqueSubstances) {
    const lastTransmission = await getEntityLastTransmission('substance', substanceName);
    entities.push({
      name: substanceName,
      type: 'substance',
      lastTransmission,
    });
  }

  // Generate transmissions (max 2 per check)
  const newTransmissions = await generateMultipleTransmissions(
    entities,
    context,
    2 // Max 2 transmissions per check
  );

  // Store new transmissions
  for (const transmission of newTransmissions) {
    await addTransmission(transmission);
  }

  // Update last check time
  await updateLastCheckTime();

  console.log(`Generated ${newTransmissions.length} new transmissions`);
  
  return newTransmissions;
}

/**
 * Initialize transmission scheduler
 * Call this when app starts
 */
export function initializeTransmissionScheduler(
  getContext: () => TransmissionContext
): void {
  // Check immediately on init
  setTimeout(() => {
    const context = getContext();
    checkAndGenerateTransmissions(context);
  }, 5000); // Wait 5 seconds after app start

  // Set up interval for periodic checks
  setInterval(() => {
    const context = getContext();
    checkAndGenerateTransmissions(context);
  }, CHECK_INTERVAL_MS);

  console.log('Transmission scheduler initialized');
}

/**
 * Force check for transmissions (for testing or manual trigger)
 */
export async function forceCheckTransmissions(
  context: TransmissionContext
): Promise<Transmission[]> {
  // Temporarily clear last check time to force generation
  await AsyncStorage.removeItem(LAST_CHECK_KEY);
  return await checkAndGenerateTransmissions(context);
}

/**
 * Clear all transmissions (for testing)
 */
export async function clearAllTransmissions(): Promise<void> {
  await AsyncStorage.removeItem(STORAGE_KEY);
  await AsyncStorage.removeItem(LAST_CHECK_KEY);
  await AsyncStorage.removeItem(ENTITY_LAST_TRANSMISSION_KEY);
  console.log('All transmissions cleared');
}
