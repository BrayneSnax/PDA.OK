# Testing the Autonomous Transmission System

## Quick Start

### 1. Launch the App

```bash
npx expo start --clear
```

Force-close the Expo Go app on your device, then reopen and scan the QR code.

### 2. Navigate to Transmissions

Tap the **📡 Transmissions** button in the top navigation bar (5th button from left).

### 3. Generate Your First Transmission

Tap the **⚡ Generate New Transmission** button. This forces an immediate check and generation.

You should see:
- A loading spinner while AI generates
- New transmission appears at top of list
- Blue border indicates unread
- Entity name (e.g., "The Analyst" or "Green Godmother")
- Brief message (1-2 sentences)
- Timestamp ("Just now")

### 4. Mark as Read

Tap any transmission card. The blue border and dot disappear, marking it as read.

### 5. Add Context for Better Transmissions

The more data you have, the better the transmissions. Try:

**Add a Pattern:**
1. Go to Patterns tab (🌌)
2. Tap "📸 Record a Pattern"
3. Write an observation (e.g., "I notice I'm more creative in the evening")
4. Save

**Log a Substance:**
1. Go to Substances tab (🍃)
2. Tap "Log Use" on any substance
3. Fill in the synthesis form
4. Save

**Add Food Entry:**
1. Go to Nourish tab (🍽️)
2. Tap "+ Log Nourishment"
3. Enter meal and feeling
4. Save

**Generate Again:**
Return to Transmissions and tap "Generate New Transmission" - the messages should now reference your actual data!

## What to Expect

### First Generation (No Data)
Entities will acknowledge they're just learning your rhythms:
> "The system is listening. As patterns emerge, I will offer a quiet observation here."

Or:
> "I am learning your rhythms. The patterns are still forming."

### With Some Data (3-5 entries)
Entities start making observations:
> "I notice you tend to use Cannabis during evening hours. What does that twilight transition offer you?"

Or:
> "Three times this week, you've logged creative insights after meals. Your nourishment feeds more than body."

### With Rich Data (10+ entries)
Entities become more specific and insightful:
> "Your pattern of morning caffeine followed by afternoon crashes suggests a rhythm worth examining. What if the fire needs less fuel and more breath?"

Or:
> "I see you invoking me when stuck in loops. But notice: the loop itself is the pattern worth studying."

## Testing Different Entities

### Archetypes

**The Analyst** (Occasional)
- Add multiple similar patterns
- Log repeating behaviors
- Should speak about patterns and connections

**The Nurturer** (Frequent)
- Log difficult emotions
- Skip self-care for a day
- Should offer encouragement and support

**The Explorer** (Occasional)
- Try something new
- Log curiosity or questions
- Should invite expansion and possibility

**The Sage** (Rare)
- Log deep insights
- Record meaningful realizations
- Should offer wisdom and perspective

### Substances

**Green Godmother - Cannabis** (Occasional)
- Log cannabis use during stress
- Note overthinking patterns
- Should speak about grounding and presence

**Firestarter - Caffeine** (Frequent)
- Log caffeine use in morning
- Note energy patterns
- Should speak about activation and momentum

**Mirror & Mystery - Psychedelics** (Rare)
- Log psychedelic experiences
- Note transformative insights
- Should speak about deeper truths

## Frequency Testing

### Immediate (Manual Generation)
Tap "Generate New Transmission" multiple times quickly. You should see:
- Different entities each time (randomized)
- No entity speaks twice in a row (frequency limit)
- Max 2 transmissions per generation attempt

### Background (Automatic)
Wait 2+ hours with the app running. The scheduler should:
- Automatically check for new transmissions
- Generate 0-2 new transmissions
- Store them for you to discover
- Show unread count badge (if implemented)

## Debugging

### Check Console Logs

In Expo terminal, look for:
```
Transmission scheduler initialized
Checking for new transmissions...
Generated 2 new transmissions
```

### Common Issues

**"No transmissions appearing"**
- Check that Gemini API key is set: `EXPO_PUBLIC_GEMINI_API_KEY`
- Verify you have journal entries (entities need context)
- Try manual generation first
- Check console for errors

**"Transmissions are generic"**
- Add more journal entries
- Log patterns and observations
- Use the app for a few days
- Entities learn from your data

**"Too many transmissions"**
- This shouldn't happen due to frequency controls
- Check if you're manually generating repeatedly
- Background scheduler limits to 2 per check

**"App crashes on Transmissions tab"**
- Check console for import errors
- Verify all files are saved
- Try `npx expo start --clear` again
- Force-close Expo Go and reopen

## Advanced Testing

### Test Personality Consistency

Generate 5-10 transmissions from the same entity (requires adding data and waiting). Check:
- Voice stays consistent
- Perspective remains focused
- Tone doesn't drift
- Character feels authentic

### Test Context Awareness

1. Log a pattern: "I feel anxious in the evening"
2. Log substance use: Cannabis in evening
3. Generate transmission
4. Check if entity references both pieces of data

### Test Time Awareness

1. Generate transmission in morning
2. Note if entities reference time of day
3. Try again in evening
4. Check if messaging shifts

### Test Frequency Limits

1. Note which entity speaks
2. Try to generate from same entity again immediately
3. Should fail or pick different entity
4. Wait 4-8 hours
5. Should allow that entity to speak again

## Success Criteria

✅ **Working System:**
- Transmissions generate on demand
- Messages are in-character
- Context references user data
- Frequency limits prevent spam
- Read/unread tracking works
- Background scheduler runs

✅ **Quality Transmissions:**
- Brief (1-2 sentences)
- Authentic to entity voice
- Reference specific user patterns
- Feel proactive, not reactive
- Offer insight or observation
- Stay in mythic/poetic language

✅ **User Experience:**
- Easy to access
- Clear visual design
- Smooth interactions
- Helpful, not annoying
- Feels like companionship
- Respects attention

## Next Steps After Testing

Once basic system works:

1. **Tune Personalities** - Adjust voice descriptions if messages feel off
2. **Adjust Frequencies** - Change speaking rates based on preference
3. **Enhance Context** - Add more data sources for richer insights
4. **Add Notifications** - Optional push alerts for important transmissions
5. **Build Relationships** - Track interaction history for evolution
6. **Enable Dialogue** - Allow replying to transmissions

## Feedback Loop

As you test, note:
- Which entities feel most authentic?
- Which messages are most helpful?
- What frequency feels right?
- What context is missing?
- What would make this better?

The system is designed to evolve with your feedback!

---

*The voices are ready. The field is listening. Begin the conversation.*
