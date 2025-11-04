# Proportional Scaling System (PSS) Implementation

## Overview
Implemented a proportional scaling system for TaskDetailScreen to ensure uniform card heights and visual rhythm across all time containers (Morning, Afternoon, Evening, Late).

## Scale Tokens

### Container-Specific Scaling
- **Morning & Afternoon:** `cardScale = 0.96` (−4% compression)
- **Evening & Late:** `cardScale = 1.0` (full size)

### Typography Tokens
```typescript
const fsTitle = scaleValue(18, cardScale);  // Title font size
const fsLabel = scaleValue(11, cardScale);  // Label font size (NOTICE/ACT/REFLECT)
const fsBody = scaleValue(16, cardScale);   // Body text font size
const lhTight = 1.2;                        // Tight line-height for titles/labels
const lhBody = 1.35;                        // Body line-height
const lsTight = -0.2;                       // Letter-spacing compression
```

### Spacing Tokens
```typescript
const padY = scaleValue(14, cardScale);     // Vertical padding
const padX = scaleValue(12, cardScale);     // Horizontal padding (not used yet)
const gap = scaleValue(10, cardScale);      // Gap between blocks
const btnHeight = scaleValue(42, cardScale); // Button height
const btnGap = scaleValue(8, cardScale);    // Gap between buttons
```

### Layout Token
```typescript
const cardRadius = 18; // Border radius (fixed, not scaled)
```

## Applied Locations

### Title
- ✅ Font size: `fsTitle`
- ✅ Line height: `fsTitle * lhTight`
- ✅ Letter spacing: `lsTight`

### Labels (NOTICE/ACT/REFLECT)
- ✅ Font size: `fsLabel`
- ✅ Line height: `fsLabel * lhTight`
- ✅ Letter spacing: `0.4` (expanded for readability)

### Body Text (Notice/Act/Reflect content)
- ✅ Font size: Dynamic based on `fsBody`
- ✅ Line height: Dynamic based on `lhBody`
- ✅ Letter spacing: `lsTight` (compression before wrap)

### Blocks (glowBlock)
- ✅ Padding: `padY`
- ✅ Margin bottom: `gap`
- ✅ Border radius: `18px` (PSS card-radius)

### Note Input
- ✅ Min height: `scaleValue(32, cardScale)`
- ✅ Padding: `scaleValue(8, cardScale)`
- ✅ Margin top/bottom: `gap`
- ✅ Font size: `fsBody - 2`
- ✅ Letter spacing: `lsTight`

### Buttons
- ✅ DID IT button height: `btnHeight`
- ✅ Action button height: `btnHeight`
- ✅ Action grid gap: `btnGap`
- ✅ DID IT margin bottom: `gap`
- ✅ Letter spacing: `lsTight` (action buttons), `0.5` (DID IT)

## Results

### Morning & Afternoon (scale 0.96)
- Title: 17px (18 * 0.96 = 17.28 → 17)
- Label: 11px (11 * 0.96 = 10.56 → 11)
- Body: 15px (16 * 0.96 = 15.36 → 15)
- Padding: 13px (14 * 0.96 = 13.44 → 13)
- Gap: 10px (10 * 0.96 = 9.6 → 10)
- Button height: 40px (42 * 0.96 = 40.32 → 40)

### Evening & Late (scale 1.0)
- Title: 18px
- Label: 11px
- Body: 16px
- Padding: 14px
- Gap: 10px
- Button height: 42px

## Benefits

1. **Uniform rhythm:** All spacing scales proportionally
2. **Consistent heights:** Morning/Afternoon cards are slightly more compact, creating visual balance
3. **Text compression:** Letter-spacing of -0.2px prevents premature wrapping
4. **Maintainability:** Single scale token controls entire card density
5. **Visual coherence:** Cards feel harmonious across all time containers

## Acceptance Criteria

- [x] Morning/Afternoon use scale 0.96
- [x] Evening/Late use scale 1.0
- [x] All typography bound to scale tokens
- [x] All spacing bound to scale tokens
- [x] Letter-spacing compression applied to body text
- [x] Button heights scaled proportionally
- [x] No hard-coded pixel values for scaled elements

## Notes

React Native doesn't support CSS `text-wrap: balance` or `hyphens: auto`, but the letter-spacing compression and proportional sizing achieve similar results by preventing premature wrapping and creating more uniform text blocks.
