# PDA.OK Todo

## Current Fixes Needed

- [x] Fix Mirror & Mystery missing second emoji - migration bug fixed
- [x] Rename "The Mother of Silence" to "Mother of Silence" in Benzodiazepines substance
- [x] Add 🖌️ emojis on both sides of "Craft a Moment" button
- [x] Add ⚡ emojis on both sides of "Generate New Transmission" button
- [x] Add 📸 emojis on both sides of "Record Pattern" button
- [x] Add 🌙 emojis on both sides of "Reflect on Today" button
- [x] Add 🌌 emojis on both sides of "Listen to the Field" button
- [x] Change "Create Custom Archetype" button from ✨ to + prefix (like Add New Companion)
- [x] Actually increase emoji font sizes in cards and buttons (already at 22px mythical, 20px regular)
- [x] Create migration v7 to sync updated data to users (already in place, will auto-run on next app start)

## New Fixes

- [x] Add second emoji to Creator archetype (Synth) - changed icon to ✍️
- [x] Replace Craft a Moment button emoji from 🖌️ to 📝

## Styling Improvements

- [x] Center archetype modal content (icon and title) like nourish modal
- [x] Round bottom edges of nourish modal

- [x] Round bottom edges of Record a Pattern modal

- [x] Round bottom edges of archetype detail modal

## New Feature: Gradual Color Transitions

- [x] Implement smooth color interpolation throughout the day
- [x] Colors should blend continuously rather than jumping at time boundaries
- [x] Maintain existing 4 time containers for anchor organization
- [x] Apply gradual transitions to entire UI (backgrounds, cards, text, accents)

## Final Spacing Adjustments

- [x] Move top header up (reduce top padding)
- [x] Stack date directly on top of time (more compact)
- [x] Add padding between top header and Field's Whisper

## Color Interpolation Scope Fix

- [x] Home screen: gradual color interpolation (smooth transitions)
- [x] Other sections: discrete colors based on current time period (no interpolation)

## Debug Loading Issue

- [x] Check for syntax errors in colorInterpolation.ts
- [x] Check for syntax errors in timeUtils.ts
- [x] Check for syntax errors in useColors.ts
- [x] Verify imports are correct
- [x] Fix screenType parameter passing in all tab files

## Dreamseed Relocation

- [x] Remove Dreamseed button from late anchors section
- [x] Add Dreamseed box to transmissions screen (bottom half)

## Revert Color Interpolation

- [ ] Remove colorInterpolation.ts utility
- [ ] Remove timeUtils.ts utility
- [ ] Restore useColors to simple discrete circadian logic
- [ ] Remove debug console logs

## Correct Requirements

- [x] Revert Dreamseed - keep it at top of Late Anchors (undo Transmissions move)
- [x] Remove "Temperature Ground" anchor from late anchors (already removed)
- [x] Diagnose and fix color interpolation issue (reverted to simple discrete circadian colors)

## New Fixes

- [ ] Restore accidentally removed late anchor (only Temperature Ground should have been removed)
- [x] Increase width and height of background boxes in anchor detail modal (padding 14→18, heights +15px, width extended)

## Latest Fixes

- [x] Increase spacing between NOTICE/ACT/REFLECT labels and content text in anchor detail modal
- [x] Restore original Dreamseed content ("The day dissolves. Write one word to carry into sleep.")

## Migration v8

- [x] Create migration v8 to update Dreamseed body_cue for existing users

## Restore 4th Late Anchor

- [x] Add Stillness Signal back as 4th late time anchor
- [x] Restore original Dreamseed implementation (separate modal/feature, not as a late anchor)
- [x] Keep Dreamseed at top of late anchors section but with original design

## Migration v9

- [x] Update migration to v9 to add Stillness Signal for existing users

## Final Polish

- [x] Add more padding between title and content boxes in anchor detail modal
- [x] Move entire modal background down universally (increased title marginBottom to 24px)
- [x] Add top margin to NOTICE and ACT boxes to push them down more (REFLECT stays as is)
- [x] Increase width of background boxes so text doesn't hang off edges
- [x] Make top navigation buttons (Substances, Archetypes, etc.) use current time-based colors automatically

## Theme System

- [x] Rename "Transmissions" to "Transmits" throughout app
- [x] Create theme system with multiple visual themes (Liminal, Crystalline, Organic, etc.)
- [x] Each theme has its own circadian color palettes (morning/afternoon/evening/late)
- [x] Add theme selector UI to Transmits page
- [x] Integrate theme selection with app state and useColors hook
- [x] Preserve time-based color switching and top button behavior across all themes
- [x] Move theme selector to bottom of Transmits page

## Nourish Page Restructuring

- [x] Move Compass Rose below Log Nourishment button
- [x] Add Movement Field section to bottom half of Nourish page
- [x] Create movement logging UI with type, somatic notes, before/after states
- [x] Add movement entry storage to app state
- [x] Display movement entries in Movement Field section
