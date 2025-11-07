import { ContainerId } from '../constants/Types';

/**
 * Get the current time container based on the time of day
 * Returns discrete container without interpolation
 */
export function getCurrentTimeContainer(): ContainerId {
  const now = new Date();
  const hours = now.getHours();
  
  // Morning: 5am-11am
  if (hours >= 5 && hours < 11) {
    return 'morning';
  }
  // Afternoon: 11am-5pm
  else if (hours >= 11 && hours < 17) {
    return 'afternoon';
  }
  // Evening: 5pm-10pm
  else if (hours >= 17 && hours < 22) {
    return 'evening';
  }
  // Late: 10pm-5am
  else {
    return 'late';
  }
}
