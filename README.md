# PDA.OK - Personal Data Almanac

A React Native/Expo app for tracking and understanding relationships with substances, time, and embodiment through a poetic, grounded framework.

---

## 🌌 Project Philosophy

PDA.OK is not a typical habit tracker. It's a **living pharmacopeia** that treats substances as allies with distinct personalities, functions, and shadows. The app uses:

- **Time Containers** (Morning, Afternoon, Evening, Late) - each with unique color palettes and energy
- **Mythic Naming** - substances have both clinical names (e.g., "Entheogens") and mythic names (e.g., "Mirror & Mystery")
- **Embodiment Tracking** - movement, nourishment, and physical interaction logging
- **Temporal Intelligence** - anchors, patterns, and field whispers that respond to time and context
- **Synthesis & Reflection** - journaling with structured prompts for integration

**Design Principle:** Poetic language meets functional tracking. Every interaction should feel intentional, not clinical.

---

## 🏗️ Architecture Overview

### Tech Stack
- **React Native** with **Expo** (managed workflow)
- **TypeScript** for type safety
- **AsyncStorage** for local data persistence
- **Expo Router** for file-based navigation
- **React Navigation** for tab-based UI

### Key Directories
```
app/
├── (tabs)/              # Main tab screens (index, journal, substances)
├── components/          # Reusable UI components (AllyCard, AnchorCard, etc.)
├── constants/           # DefaultData, Types, Colors, Themes
├── context/             # AppContext (global state management)
├── hooks/               # useColors, useTransmissions
├── modal/               # Modal components (AddMovementModal, etc.)
├── services/            # AI integration, pattern analysis
├── utils/               # storage, migration, time utilities
└── _layout.tsx          # Root layout with font loading
```

### Data Model
- **Allies** (substances) - id, name, mythicName, face (emoji), invocation, function, shadow, ritual
- **ContainerItems** (anchors) - time-based grounding actions
- **Moments** - timestamped entries (replaces old JournalEntry)
- **Patterns** - recurring observations
- **Archetypes** - personality frameworks for synthesis

### State Management
- **AppContext** (`app/context/AppContext.tsx`) - single source of truth
- **AsyncStorage** - persists to `@pda_app_state` key
- **Migration System** - version-based data migrations (currently v13)

---

## 🚀 Development Setup

### Prerequisites
- Node.js 18+
- npm or yarn
- Expo Go app on your phone (for testing)
- Git

### Installation
```bash
git clone https://github.com/BrayneSnax/PDA.OK.git
cd PDA.OK
npm install
```

### Running the App

**Option 1: LAN (Recommended)**
```bash
npx expo start --lan
```
- Requires PC and phone on same WiFi
- Faster, more reliable than tunnel
- No cache issues

**Option 2: Tunnel (Slower, Cache Issues)**
```bash
npx expo start --tunnel
```
- Works when LAN doesn't
- **Known Issue:** Aggressive caching - new code may not load even after `git pull`
- If stuck, try LAN or local build instead

**Option 3: Local Android Build (No Expo Go)**
```bash
npx expo run:android
```
- Requires Android Studio
- Builds APK locally (free, no EAS needed)
- Bypasses all Expo Go cache issues

### Development Tips
- **Clear cache:** `npx expo start -c`
- **Force quit Expo Go** after pulling new code
- **Check terminal logs** for migration status
- **Use LAN when possible** to avoid tunnel cache

---

## 🎨 Design System

### Color Palettes
Each time container has its own color scheme (see `app/constants/Colors.ts`):
- **Morning:** Warm oranges, soft yellows
- **Afternoon:** Bright blues, energetic tones
- **Evening:** Deep purples, sunset hues
- **Late:** Dark blues, midnight tones

### Themes
Three visual themes available (see `app/constants/Themes.ts`):
- **Liminal** - Soft, transitional, gentle
- **Crystalline** - Sharp, clear, structured
- **Organic** - Earthy, flowing, natural

### Typography
- **Primary Font:** Oleo Script Bold (loaded in `_layout.tsx`)
- **Fallback:** System default

### Component Patterns
- **Cards:** Expandable/collapsible with `∨` / `∧` indicators
- **Modals:** Bottom-sheet style with rounded top corners
- **Buttons:** Accent color background, card color text
- **Section Headers:** Uppercase, small, dim color, letter-spaced

---

## 🔧 Common Tasks

### Adding a New Substance (Ally)
1. Add to `DEFAULT_ALLIES` in `app/constants/DefaultData.ts`
2. Use format: `{ id, name, mythicName, face, invocation, function, shadow, ritual }`
3. **Important:** `mythicName` should NOT include emojis - they're added by AllyCard
4. Migration will sync to existing users automatically

### Adding a New Anchor
1. Add to `DEFAULT_GROUNDING_ITEMS` in `app/constants/DefaultData.ts`
2. Include: `id, title, body_cue, micro, ultra_micro, desire, container, category`
3. Add to `NEW_ANCHORS` in `app/utils/migration.ts`
4. Bump `CURRENT_MIGRATION_VERSION`

### Creating a Migration
```typescript
// In app/utils/migration.ts
const CURRENT_MIGRATION_VERSION = 14; // Increment

// Add migration logic in runMigration()
if (state.someField) {
  state.someField = transformData(state.someField);
}
```

### Debugging AsyncStorage
```typescript
// Check what's stored
const state = await AsyncStorage.getItem('@pda_app_state');
console.log(JSON.parse(state));

// Check migration version
const version = await AsyncStorage.getItem('@migration_version');
console.log('Migration version:', version);
```

---

## ⚠️ Known Issues & Solutions

### Issue: Tunnel Cache Not Loading New Code
**Symptoms:** 
- `git pull` succeeds
- New code pushed to GitHub
- App still shows old behavior
- Console logs don't appear

**Solutions:**
1. Switch to LAN: `npx expo start --lan`
2. Delete `.expo` folder: `rm -rf .expo`
3. Use local build: `npx expo run:android`
4. Uninstall/reinstall Expo Go (nuclear option)

### Issue: Migration Not Running
**Check:**
1. Is `CURRENT_MIGRATION_VERSION` incremented?
2. Is storage key `@pda_app_state` (not `@app_state`)?
3. Does `needsMigration()` return true?
4. Check terminal for "Running migration v{X}..." log

**Force migration:**
```typescript
import { forceMigration } from './app/utils/migration';
await forceMigration(); // Bypasses version check
```

### Issue: Ally Emojis Not Displaying Correctly
**Root Cause:** Emojis embedded in `mythicName` instead of using `face` field

**Fix:** 
- `mythicName` should be plain text: `'Mirror & Mystery'`
- `face` should be emoji: `'🌌'`
- AllyCard renders: `{face} {mythicName} {face}`

**Hardcoded fix exists** in `app/components/AllyCard.tsx` for Mirror & Mystery specifically.

---

## 📝 Notes for AI Collaborators

### Code Style
- Use TypeScript types from `app/constants/Types.ts`
- Prefer functional components with hooks
- Use `useCallback` for functions passed to children
- Keep components under 300 lines (extract to smaller components)

### State Updates
- **Always** use AppContext methods (`addAlly`, `updateAlly`, etc.)
- **Never** mutate state directly
- AsyncStorage saves happen automatically via `useEffect` in AppContext

### Modal Patterns
All modals follow this structure:
```typescript
interface Props {
  isVisible: boolean;
  onClose: () => void;
  onAdd: (data: SomeType) => void;
  colors: ColorScheme;
}
```

### Migration Best Practices
1. **Always** increment `CURRENT_MIGRATION_VERSION`
2. **Always** use correct storage key: `@pda_app_state`
3. **Always** handle missing/undefined fields gracefully
4. **Test** with both empty and populated AsyncStorage
5. **Log** migration steps for debugging

### Common Pitfalls
- ❌ Don't embed emojis in `mythicName` - use `face` field
- ❌ Don't forget `useState` import in new components
- ❌ Don't use `@app_state` - it's `@pda_app_state`
- ❌ Don't skip migration version increments
- ❌ Don't rely on tunnel for testing - use LAN

### Debugging Checklist
1. Check terminal logs (not just UI)
2. Verify AsyncStorage contents
3. Confirm migration version
4. Test with fresh install (no saved data)
5. Test with existing data
6. Force quit Expo Go between tests

---

## 🗂️ Important Files

### Core Logic
- `app/context/AppContext.tsx` - Global state, all CRUD operations
- `app/utils/storage.ts` - AsyncStorage wrapper
- `app/utils/migration.ts` - Data migration system
- `app/constants/DefaultData.ts` - Default allies, anchors, archetypes

### Key Components
- `app/components/AllyCard.tsx` - Substance display card
- `app/components/AnchorCard.tsx` - Time anchor card
- `app/modal/AddMovementModal.tsx` - Movement logging
- `app/modal/SubstanceSynthesisModal.tsx` - Substance journaling

### Main Screens
- `app/(tabs)/index.tsx` - Nourish page (home)
- `app/(tabs)/substances.tsx` - Substances list
- `app/(tabs)/journal.tsx` - Journal/timeline

---

## 📚 Resources

- **Expo Docs:** https://docs.expo.dev/
- **React Navigation:** https://reactnavigation.org/
- **TypeScript:** https://www.typescriptlang.org/docs/

---

## 🐛 Recent Fixes (See FIXES_APPLIED.md)

- ✅ Movement modal useState import
- ✅ Migration storage key mismatch
- ✅ Mirror & Mystery emoji display
- ⚠️ Tunnel cache issue (use LAN instead)

---

## 🤝 Contributing

This is a personal project, but if you're an AI helping build it:

1. Read `FIXES_APPLIED.md` for recent changes
2. Check `app/constants/Types.ts` for data structures
3. Follow existing patterns in components
4. Test with both empty and populated data
5. Use LAN connection for reliable testing
6. Increment migration version for data changes
7. Document significant changes

---

## 📄 License

Personal project - all rights reserved.

---

**Built with intention. Used with care.** 🌌
