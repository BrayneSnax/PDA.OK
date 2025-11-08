# Bug Fixes Summary

## Date: November 8, 2025

### Issues Fixed

#### 1. Mirror & Mystery Emoji Rendering Issue

**Problem:**
- Mirror & Mystery substance was displaying either 2 emojis on each side (🌌🌌 Mirror & Mystery 🌌🌌) or just 1 emoji total
- Previous attempts had hardcoded a fix specifically for this substance, which was causing inconsistent behavior

**Root Cause:**
- The `AllyCard.tsx` component had a hardcoded conditional check for `ally.id === 'mirror'` that forced the display name to be `'🌌 Mirror & Mystery 🌌'`
- This bypassed the normal emoji handling logic and could cause duplicates if the data already had emojis embedded in the `mythicName` field

**Solution:**
- Removed the hardcoded special case for Mirror & Mystery
- Implemented a universal emoji stripping regex that removes ALL emoji characters from `mythicName` before adding the `face` emojis on both sides
- Used Unicode regex pattern `[\u{1F300}-\u{1F9FF}]` with the `u` flag to properly detect and remove emoji characters
- Now all substances are treated consistently: `{face} {cleanMythicName} {face}`

**Files Modified:**
- `/app/components/AllyCard.tsx` (lines 49-58)

**Code Change:**
```typescript
// Before:
if (ally.id === 'mirror' || ally.name === 'Entheogens') {
  displayName = '🌌 Mirror & Mystery 🌌';
} else if (ally.mythicName) {
  const cleanMythicName = ally.mythicName.replace(/🌌/g, '').trim();
  displayName = `${ally.face} ${cleanMythicName} ${ally.face}`;
}

// After:
if (ally.mythicName) {
  const cleanMythicName = ally.mythicName.replace(/[\u{1F300}-\u{1F9FF}]/gu, '').trim();
  displayName = `${ally.face} ${cleanMythicName} ${ally.face}`;
} else {
  displayName = `${ally.face} ${ally.name} ${ally.face}`;
}
```

---

#### 2. AddMovementModal Black Overlay Crash

**Problem:**
- When clicking "+ Log Movement" button, modal would show black overlay but no content
- Modal appeared to be rendering but content was not visible

**Root Cause:**
- The `KeyboardAvoidingView` was wrapping the entire modal content but was inside the overlay
- The `maxHeight: '90%'` constraint was on the `container` but the `KeyboardAvoidingView` didn't have proper height constraints
- This could cause layout calculation issues where the content would be positioned off-screen or have zero height

**Solution:**
- Restructured the modal layout hierarchy:
  1. `Modal` → `View (overlay)` → `KeyboardAvoidingView` → `View (container)` → `ScrollView`
- Added `maxHeight: '90%'` to `keyboardView` style
- Added `maxHeight: '100%'` to both `container` and `scrollView` for proper constraint propagation
- Added `paddingBottom: 40` to `scrollContent` for better spacing
- Changed `transparent` prop from implicit to explicit `transparent={true}`
- Added `handleClose` function to properly reset state when modal closes
- Added `keyboardShouldPersistTaps="handled"` to ScrollView for better keyboard interaction
- Added visual feedback for disabled save button (opacity: 0.5)

**Files Modified:**
- `/app/modal/AddMovementModal.tsx` (complete rewrite)

**Key Changes:**
1. Fixed layout hierarchy
2. Added proper height constraints at each level
3. Improved state management with `handleClose` function
4. Better keyboard handling
5. Visual feedback for button states

---

## Testing Recommendations

### For Mirror & Mystery Fix:
1. Navigate to Substances tab
2. Find "Mirror & Mystery" (Entheogens)
3. Verify it displays as: `🌌 Mirror & Mystery 🌌` (exactly one emoji on each side)
4. Expand the card to verify all content displays correctly
5. Check other substances to ensure they still display correctly with their emojis

### For AddMovementModal Fix:
1. Navigate to Nourish tab
2. Scroll to Movement Field section
3. Tap "+ Log Movement" button
4. Verify modal slides up and displays full content:
   - Title: "Log Physical Interaction"
   - THE 3-PART CHECK-IN section with Time, Act, and Resistance fields
   - GAINING INERTIA text area
   - GOALPOSTS & REFLECTIONS text area
   - Cancel and Log Movement buttons
5. Test filling out the form:
   - Time should auto-populate
   - Enter text in Act field
   - Select a resistance level from dropdown
   - Optionally fill in the two text areas
6. Verify "Log Movement" button is disabled until Act and Resistance are filled
7. Test saving an entry
8. Test canceling and verify state resets

---

## Notes

- Both fixes address issues that arose after the emoji additions to buttons and the movement journal integration
- The Mirror & Mystery fix is more robust and handles any emoji characters, not just the specific 🌌 emoji
- The AddMovementModal fix improves the overall stability of the modal rendering system
- No migration is needed for these fixes as they only affect UI rendering, not data structure
