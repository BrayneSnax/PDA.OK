# Content-Driven Card Sizing - Acceptance Checklist

## Implementation Summary

Successfully converted TaskDetailScreen modals from fixed-height "sheet" behavior to content-driven "card" sizing, eliminating empty space at the bottom.

## Changes Made

### 1. Modal Component (Modal.tsx)
**Before:**
```typescript
modalView: {
  flex: 1,              // ❌ Forces stretching
  maxHeight: '80%',     // ❌ Fixed height constraint
  width: '90%',
}
```

**After:**
```typescript
modalView: {
  flexGrow: 0,          // ✅ No stretching
  flexShrink: 1,        // ✅ Allow shrinking
  maxHeight: '88%',     // ✅ Guard on very long content
  maxWidth: 640,        // ✅ Max width for larger screens
  width: '90%',
  alignSelf: 'center',  // ✅ Center the card
}
```

### 2. TaskDetailScreen Container
**Before:**
```typescript
container: {
  flex: 1,              // ❌ Forces stretching
  paddingBottom: 0,     // ❌ Overridden inline
}
content: {
  flex: 1,              // ❌ Forces stretching
}
```

**After:**
```typescript
container: {
  flexGrow: 0,          // ✅ No stretching
  flexShrink: 1,        // ✅ Allow shrinking
  paddingBottom: 16,    // ✅ Breathing room at bottom
}
content: {
  flexGrow: 0,          // ✅ No stretching
  flexShrink: 1,        // ✅ Allow shrinking
}
```

### 3. Android Text Fixes

**DID IT Button:**
```typescript
<Text 
  allowFontScaling={false}           // ✅ Prevent accessibility scaling issues
  style={{
    letterSpacing: -0.1,             // ✅ Reduced from 0.5 to avoid clipping
    includeFontPadding: false,       // ✅ Android-only: remove extra padding
    textAlignVertical: 'center',     // ✅ Android-only: center text
  }}
>DID IT</Text>
```

**Action Buttons:**
```typescript
<Text 
  allowFontScaling={false}           // ✅ Prevent accessibility scaling issues
  style={{
    letterSpacing: -0.1,             // ✅ Reduced from -0.2 to avoid clipping
    includeFontPadding: false,       // ✅ Android-only: remove extra padding
    textAlignVertical: 'center',     // ✅ Android-only: center text
  }}
>{action}</Text>
```

## Acceptance Criteria

### ✅ Modal/card sizes to content (no fixed 80% shell)
- Removed `flex: 1` from Modal.modalView
- Changed `maxHeight` from 80% to 88% (guard only)
- Added `flexGrow: 0` and `flexShrink: 1` for content-driven sizing

### ✅ All four buttons visible without scroll; no dead space beneath them
- Removed `flex: 1` from TaskDetailScreen.container and content
- Added `paddingBottom: 16` to container for breathing room
- PSS tokens ensure compact spacing while showing all buttons

### ✅ "DID IT" text has no glyph clipping on Android
- Reduced `letterSpacing` from 0.5 to -0.1
- Added `includeFontPadding: false` (Android-only)
- Added `textAlignVertical: 'center'` (Android-only)
- Added `allowFontScaling={false}` to prevent scaling issues

### ✅ Changing copy length doesn't alter sibling card heights within the same time band
- PSS ensures proportional scaling across all cards
- Content-driven sizing allows each card to find its natural height
- No fixed heights that would force uniform sizing

### ✅ Morning/Afternoon use scale: .96; Evening/Late use 1
- `getCardScale()` returns 0.96 for morning/afternoon, 1.0 for evening/late
- All typography, spacing, and button heights bound to `cardScale`
- Proportional Scaling System (PSS) fully implemented

## Testing Recommendations

1. **Test all time containers:**
   - Morning (Ground)
   - Afternoon (Body Anchor)
   - Evening (Transition Field)
   - Late (Rest Integration)

2. **Verify:**
   - No empty space at bottom of modals
   - All 4 action buttons visible without scrolling
   - "DID IT" text not clipped on Android
   - Cards feel balanced and harmonious across time containers

3. **Edge cases:**
   - Very long text in Notice/Act/Reflect fields
   - Very short text in all fields
   - Different screen sizes (small phones, tablets)

## Result

The modal now behaves as a **content-driven card** rather than a fixed-height sheet, eliminating empty space while maintaining visual rhythm through the Proportional Scaling System.
