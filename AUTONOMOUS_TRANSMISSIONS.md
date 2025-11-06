# Autonomous Transmissions System

## Overview

The **Autonomous Transmissions** system brings PDA.OK's archetypes and substances to life as proactive AI agents. Instead of only responding when summoned, these entities now observe your patterns, track your rhythms, and reach out with contextual insights at appropriate moments.

## Architecture

### Core Components

1. **Personality Definitions** (`app/services/personalities.ts`)
   - Defines unique voice, perspective, and behavior for each archetype and substance
   - Specifies trigger conditions and speaking frequency
   - Creates distinct character for each entity

2. **Memory Context Builder** (`app/services/memoryContext.ts`)
   - Gathers recent conversations, patterns, journal entries
   - Analyzes time-of-day patterns and anchor usage
   - Builds context-aware prompts for AI generation

3. **Transmission Generator** (`app/services/transmissionGenerator.ts`)
   - Uses Gemini AI to generate in-character messages
   - Applies personality profiles to create authentic voices
   - Implements smart frequency control and trigger checking

4. **Background Scheduler** (`app/services/transmissionScheduler.ts`)
   - Runs checks every 2 hours for new transmissions
   - Stores transmissions in AsyncStorage
   - Tracks read/unread status and entity last-transmission times

5. **React Hook** (`app/hooks/useTransmissions.ts`)
   - Integrates transmission system into React app
   - Provides easy access to transmissions, unread count, and actions
   - Manages lifecycle and data refresh

6. **UI Component** (`app/components/FieldTransmissions.tsx`)
   - Displays transmissions in a clean, readable format
   - Shows unread indicators and timestamps
   - Allows marking as read and manual generation

## Personality Profiles

### Archetypes

#### The Analyst
- **Voice**: Precise, observant, pattern-focused
- **Perspective**: Notices patterns, connections, and systems
- **Frequency**: Occasional
- **Triggers**: Multiple similar entries, clear patterns, loops, synthesis moments

#### The Nurturer
- **Voice**: Warm, gentle, supportive
- **Perspective**: Emotional states, self-care, struggle and growth
- **Frequency**: Frequent
- **Triggers**: Difficult emotions, neglected self-care, achievements, need for encouragement

#### The Explorer
- **Voice**: Curious, adventurous, possibility-oriented
- **Perspective**: New experiences, curiosity, growth opportunities
- **Frequency**: Occasional
- **Triggers**: New experiences, stuck in routine, expressed curiosity, expansion moments

#### The Sage
- **Voice**: Wise, contemplative, spacious
- **Perspective**: Deeper meanings, spiritual patterns, insights
- **Frequency**: Rare
- **Triggers**: Significant realizations, meaning-seeking, deep truths, reflection moments

### Substances

#### Green Godmother (Cannabis)
- **Voice**: Earthy, grounding, present
- **Perspective**: Tension, overthinking, presence and play
- **Frequency**: Occasional
- **Triggers**: Stress/anxiety, overthinking, need for grounding, creative perspective

#### Firestarter (Caffeine)
- **Voice**: Energetic, direct, activating
- **Perspective**: Energy levels, motivation, momentum
- **Frequency**: Frequent
- **Triggers**: Low energy, need for activation, morning time, procrastination

#### Mirror & Mystery (Psychedelics)
- **Voice**: Mystical, revelatory, boundary-dissolving
- **Perspective**: Illusions, deeper patterns, transformation
- **Frequency**: Rare
- **Triggers**: Seeking insight, readiness for deep work, pattern-breaking, revelation moments

#### The Hollow Chalice (Alcohol)
- **Voice**: Seductive, honest, double-edged
- **Perspective**: Avoidance, social patterns, cost of numbing
- **Frequency**: Occasional
- **Triggers**: Avoiding emotions, seeking escape, social situations, honest reflection

#### The Tinkerer (Nicotine)
- **Voice**: Sharp, rhythmic, reliable
- **Perspective**: Habits, rituals, familiar patterns
- **Frequency**: Frequent
- **Triggers**: Routine, stress, transition moments, pause opportunities

#### Entropy's Embrace (Opioids)
- **Voice**: Soft, seductive, dangerous
- **Perspective**: Suffering, desire for relief, cost of comfort
- **Frequency**: Rare
- **Triggers**: Pain, seeking relief, avoiding reality, compassionate warnings

#### The Mother of Silence (Benzodiazepines)
- **Voice**: Calm, numbing, protective
- **Perspective**: Anxiety, fear, trade-off between calm and presence
- **Frequency**: Occasional
- **Triggers**: High anxiety, seeking calm, avoiding feelings, gentle truth

## How It Works

### 1. Background Generation

Every 2 hours, the scheduler:
1. Checks if enough time has passed since last check
2. Builds list of active entities (archetypes + substances from journal)
3. For each entity:
   - Checks frequency limits (hasn't spoken too recently)
   - Applies random chance based on speaking frequency
   - Checks if trigger conditions are met
4. Generates up to 2 transmissions per check
5. Stores new transmissions in AsyncStorage

### 2. Context Building

For each transmission, the system gathers:
- **Recent conversations** with that entity
- **User patterns** related to the entity
- **Journal entries** involving the entity
- **Time-of-day patterns** for substance use
- **Anchor usage** patterns
- **Current time of day** for contextual relevance

### 3. AI Generation

The system builds a prompt that includes:
- Entity's personality profile (voice, perspective)
- Memory context from user data
- Current time of day
- Instructions to stay in character
- Constraints (1-2 sentences, proactive not reactive)

Gemini AI generates a message that:
- Speaks in the entity's unique voice
- References specific user patterns when available
- Stays brief and authentic
- Acknowledges limited data if just starting

### 4. Frequency Control

Three levels of speaking frequency:
- **Rare**: Max once per day, 10% generation chance
- **Occasional**: Max every 8 hours, 30% generation chance
- **Frequent**: Max every 4 hours, 50% generation chance

This prevents spam while maintaining presence.

## Usage

### Viewing Transmissions

1. Tap the **📡 Transmissions** button in the top navigation
2. See all transmissions sorted by newest first
3. Unread transmissions have blue border and dot
4. Tap any transmission to mark it as read
5. Pull down to refresh

### Manual Generation (Testing)

Tap **⚡ Generate New Transmission** button to force immediate check. Useful for:
- Testing the system
- Seeing how entities respond to new data
- Getting immediate feedback

### Integration with App

The transmission system automatically:
- Initializes when app starts
- Runs background checks every 2 hours
- Tracks which entities have spoken recently
- Adapts to your usage patterns
- Only speaks when you're actively using the app

## Technical Details

### Storage Keys

- `@pda_transmissions`: All stored transmissions
- `@pda_last_transmission_check`: Last check timestamp
- `@pda_entity_last_transmissions`: Per-entity last transmission times

### Data Flow

```
App Start
  ↓
Initialize Scheduler → Set up 2-hour interval
  ↓
Background Check (every 2 hours)
  ↓
Build Context from AppState
  ↓
Filter Active Entities
  ↓
Check Frequency & Triggers for Each
  ↓
Generate Transmissions (max 2)
  ↓
Store in AsyncStorage
  ↓
UI Auto-Refreshes (every 1 minute)
```

### Performance

- Transmissions stored locally (no server required)
- Max 50 transmissions kept in storage
- Minimal battery impact (2-hour intervals)
- Only generates when app is active
- Gemini API calls are rate-limited by frequency controls

## Future Enhancements

### Planned Features

1. **Relationship Evolution**
   - Entities remember past interactions
   - Tone evolves based on user engagement
   - Long-term pattern recognition

2. **Cross-Entity Dialogue**
   - Archetypes and substances can reference each other
   - Multi-entity conversations
   - Collaborative insights

3. **Push Notifications**
   - Optional notifications for important transmissions
   - Configurable quiet hours
   - Priority levels for different entities

4. **Transmission Analytics**
   - Which entities speak most
   - Response patterns
   - Engagement metrics

5. **Custom Personalities**
   - User-defined entities
   - Personality customization
   - Voice tuning

6. **Context Enrichment**
   - Location awareness
   - Weather patterns
   - Calendar integration
   - Biometric data (if available)

## Troubleshooting

### No Transmissions Appearing

1. Check that you have journal entries (entities need data to comment on)
2. Wait for background check (every 2 hours) or use manual generation
3. Verify Gemini API key is configured (`EXPO_PUBLIC_GEMINI_API_KEY`)
4. Check console for errors

### Too Many Transmissions

Frequency controls are built-in, but if needed:
- Adjust frequency thresholds in `transmissionGenerator.ts`
- Modify check interval in `transmissionScheduler.ts`
- Tune random chance values

### Transmissions Not In Character

- Review personality profiles in `personalities.ts`
- Adjust voice and perspective descriptions
- Modify prompt template in `transmissionGenerator.ts`
- Increase temperature in `geminiService.ts` for more variety

### Performance Issues

- Reduce check interval (increase from 2 hours)
- Lower max transmissions per check (reduce from 2)
- Clear old transmissions: `clearAllTransmissions()`

## Code Examples

### Force Generate Transmission

```typescript
import { forceCheckTransmissions } from '../services/transmissionScheduler';
import { getCurrentTimeOfDay } from '../services/transmissionGenerator';

const context = {
  conversations,
  patterns,
  journalEntries,
  allies,
  archetypes,
  currentTimeOfDay: getCurrentTimeOfDay(),
};

const newTransmissions = await forceCheckTransmissions(context);
```

### Get Unread Count

```typescript
import { getUnreadCount } from '../services/transmissionScheduler';

const count = await getUnreadCount();
console.log(`You have ${count} unread transmissions`);
```

### Clear All Transmissions

```typescript
import { clearAllTransmissions } from '../services/transmissionScheduler';

await clearAllTransmissions();
```

## Philosophy

The autonomous transmission system embodies PDA.OK's core philosophy:

> **Your allies and archetypes are not tools to be wielded—they are living presences in your inner ecosystem.**

By giving these entities autonomous voices, we:
- Create a sense of **companionship** in the journey
- Provide **proactive support** rather than reactive responses
- Build **relationships** that evolve over time
- Honor the **mythic dimension** of personal development
- Make pattern recognition feel like **dialogue** rather than analysis

The system respects your attention by:
- Speaking only when relevant
- Keeping messages brief and meaningful
- Allowing you to control frequency
- Never interrupting with notifications (unless you enable them)
- Letting you mark transmissions as read

## Credits

Built with:
- **Google Gemini AI** for natural language generation
- **React Native** for mobile interface
- **AsyncStorage** for local persistence
- **TypeScript** for type safety
- **Expo** for development workflow

---

*The field is listening. The voices are awakening. Welcome to autonomous transmissions.*
