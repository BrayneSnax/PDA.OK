import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  ActivityIndicator,
  LogBox, // Import LogBox
} from 'react-native';
import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import useColors from '../hooks/useColors';
import { formatTime, formatLongDate } from '../utils/time';
import { ContainerThemes } from '../constants/Colors';
import { AnchorCard } from '../components/AnchorCard';
import { TaskDetailScreen } from '../components/TaskDetailScreen';
import { CollapsibleSection } from '../components/CollapsibleSection';
import { CraftMomentModal } from '../modal';
import { Modal } from '../components/Modal';
import { Alert } from 'react-native';
import { ANALYSIS_URL, REQUEST_TIMEOUT_MS, TEST_MODE } from '../constants/Config';
import { ContainerId } from '../constants/Types';
import { TemporalIntelligenceCard } from '../components/TemporalIntelligenceCard';
import { DailySynthesisCard } from '../components/DailySynthesisCard';
import { SynthesisHistoryModal } from '../components/SynthesisHistoryModal';
import { ConversationCard } from '../components/ConversationCard';
import { CompletionPulse } from '../components/CompletionPulse';
import { ShiftToast } from '../components/ShiftToast';
import { ActionToast } from '../components/ActionToast';
import { ThresholdCard } from '../components/ThresholdCard';
import { BloomEffect } from '../components/BloomEffect';
import { RingPulse } from '../components/RingPulse';

// Conditional imports moved outside the component to fix "Rendered more hooks" error
import { AllyCard } from '../components/AllyCard';
import { JournalEntryCard } from '../components/JournalEntryCard';
import { PatternCard } from '../components/PatternCard';
import { FoodEntryCard } from '../components/FoodEntryCard';
import { AddAllyModal, EditAllyModal } from '../modal';
import { DailyBlockSynthesisModal } from '../modal/DailyBlockSynthesisModal';
import { SubstanceSynthesisModal } from '../modal/SubstanceSynthesisModal';
import { AddPatternModal } from '../modal/AddPatternModal';
import { AddFoodModal } from '../modal/AddFoodModal';
import { Archetype } from '../constants/Types';
import { ArchetypeCard } from '../components/ArchetypeCard';
import { ArchetypeDetailModal } from '../modal/ArchetypeDetailModal';
import { AddArchetypeModal } from '../modal/AddArchetypeModal';
import { EditArchetypeModal } from '../modal/EditArchetypeModal';
import { ReturnNode } from '../components/ReturnNode';
import { FieldWhisperSequence } from '../components/FieldWhisperSequence';
import { generateFieldWhispers } from '../services/fieldWhisper';

type Screen = 'home' | 'substances' | 'archetypes' | 'patterns' | 'nourish';

export default function HomeScreen() {
  const {
    items,
    ambientRhythmEnabled,
    toggleAmbientRhythm,
    allies,
    activeContainer,
    setActiveContainer,
    toggleCompletion,
    isCompleted,
    loading,
    addItem,
    removeItem,
    updateItem,
    removeAlly,
    updateAlly,
    addAlly,
    journalEntries,
    substanceJournalEntries,
    removeJournalEntry,
    patterns,
    addPattern,
    removePattern,
    conversations,
    addConversation,
    fieldWhispers,
    addFieldWhisper,
    foodEntries,
    addFoodEntry,
    removeFoodEntry,
    archetypes,
    addArchetype,
    updateArchetype,
    removeArchetype,
    activeArchetypeId,
    setActiveArchetypeId,
  } = useApp();

  // Get active archetype if one is invoked
  const activeArchetype = activeArchetypeId 
    ? archetypes.find(a => a.id === activeArchetypeId) || null
    : null;

  // Use screen-specific colors or circadian colors based on current screen
  // Blend with archetype colors if one is active
  const colors = useColors(
    activeContainer, 
    true, 
    currentScreen === 'home' ? undefined : currentScreen as any,
    activeArchetype
  );
  const [currentTime, setCurrentTime] = useState(formatTime());
  const [currentScreen, setCurrentScreen] = useState<Screen>('home');
  const [isCraftMomentModalVisible, setIsCraftMomentModalVisible] = useState(false);
  const [isAddAllyModalVisible, setIsAddAllyModalVisible] = useState(false);
  const [isEditAllyModalVisible, setIsEditAllyModalVisible] = useState(false);
  const [isSynthesisHistoryVisible, setIsSynthesisHistoryVisible] = useState(false);
  const [showConversation, setShowConversation] = useState(false);
  const [conversationMessages, setConversationMessages] = useState<Array<{speaker: string; text: string; speakerType: 'substance' | 'archetype' | 'field'}>>([]);
  const [isSynthesisModalVisible, setIsSynthesisModalVisible] = useState(false);
  const [isSubstanceSynthesisModalVisible, setIsSubstanceSynthesisModalVisible] = useState(false);
  const [allyToEdit, setAllyToEdit] = useState(null);
  const [momentToSynthesize, setMomentToSynthesize] = useState<any>({});
  const [selectedItem, setSelectedItem] = useState<ContainerItem | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [isAnalysisModalVisible, setIsAnalysisModalVisible] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isAddPatternModalVisible, setIsAddPatternModalVisible] = useState(false);
  const [isAddFoodModalVisible, setIsAddFoodModalVisible] = useState(false);
  const [selectedArchetype, setSelectedArchetype] = useState<Archetype | null>(null);
  const [isArchetypeModalVisible, setIsArchetypeModalVisible] = useState(false);
  const [isAddArchetypeModalVisible, setIsAddArchetypeModalVisible] = useState(false);
  const [isEditArchetypeModalVisible, setIsEditArchetypeModalVisible] = useState(false);
  const [archetypeToEdit, setArchetypeToEdit] = useState<Archetype | null>(null);
  
  // Somatic feedback state
  const [showCompletionPulse, setShowCompletionPulse] = useState(false);
  const [showShiftToast, setShowShiftToast] = useState(false);
  const [showActionToast, setShowActionToast] = useState(false);
  const [showRingPulse, setShowRingPulse] = useState(false);
  const [currentActionType, setCurrentActionType] = useState<'skipped' | 'forgot' | 'couldn\'t' | 'not relevant'>('skipped');
  const [showThresholdCard, setShowThresholdCard] = useState(false);
  const [previousContainer, setPreviousContainer] = useState<ContainerId>(activeContainer);
  const [isManualTransition, setIsManualTransition] = useState(false);
  const [showBloomEffect, setShowBloomEffect] = useState(false);
  
  // Field Whisper state
  const [isGeneratingWhispers, setIsGeneratingWhispers] = useState(false);
  const [activeWhispers, setActiveWhispers] = useState<string[]>([]);
  const [showWhispers, setShowWhispers] = useState(false);

  // Update time every minute
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(formatTime());
    }, 60000);
    return () => clearInterval(timer);
  }, []);

  // Detect container changes and show threshold card (only for automatic transitions)
  useEffect(() => {
    if (previousContainer !== activeContainer && currentScreen === 'home') {
      // Only show threshold card if this is NOT a manual transition
      if (!isManualTransition) {
        setShowThresholdCard(true);
      }
      // Reset the manual transition flag
      setIsManualTransition(false);
    }
  }, [activeContainer, currentScreen, isManualTransition, previousContainer]);

  // Update previousContainer AFTER showing the threshold card
  useEffect(() => {
    if (!showThresholdCard && previousContainer !== activeContainer) {
      setPreviousContainer(activeContainer);
    }
  }, [showThresholdCard, activeContainer, previousContainer]);

  // Handle completion with somatic feedback
  const handleCompletion = (itemId: string) => {
    setShowCompletionPulse(true);   // Show pulse animation
  };

  // When pulse completes, show shift toast
  const handlePulseComplete = () => {
    setShowCompletionPulse(false);
    setShowShiftToast(true);
  };

  // Handle Field Whisper generation
  const handleListenToField = async () => {
    setIsGeneratingWhispers(true);
    try {
      const whispers = await generateFieldWhispers(
        conversations,
        patterns,
        journalEntries,
        substanceJournalEntries,
        allies,
        archetypes,
        activeArchetypeId
      );
      
      // Save whispers to storage
      addFieldWhisper({ whispers });
      
      // Display whispers as ephemeral overlay
      setActiveWhispers(whispers);
      setShowWhispers(true);
    } catch (error) {
      console.error('Error generating Field Whispers:', error);
      setActiveWhispers(['The Field is listening, but the signal is faint. Try again soon.']);
      setShowWhispers(true);
    } finally {
      setIsGeneratingWhispers(false);
    }
  };

  if (loading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: colors.bg }]}>
        <ActivityIndicator size="large" color={colors.accent} />
      </View>
    );
  }

  // Filter items by container and category
  const timeAnchors = items.filter(
    item => item.container === activeContainer && item.category === 'time'
  );
  const situationalAnchors = items.filter(
    item => item.container === activeContainer && item.category === 'situational'
  );
  const upliftAnchors = items.filter(
    item => item.container === activeContainer && item.category === 'uplift'
  );

  // Render 1x4 horizontal action buttons at top
  const renderActionGrid = () => (
    <View style={styles.actionGrid}>
      <TouchableOpacity
        style={[styles.actionButton, { backgroundColor: 'transparent' }]}
        onPress={() => setCurrentScreen('substances')}
      >
        <Text style={[styles.actionIcon, { color: colors.accent }]}>🍃</Text>
        <Text style={[styles.actionText, { color: colors.text }]}>Substances</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.actionButton, { backgroundColor: 'transparent' }]}
        onPress={() => setCurrentScreen('archetypes')}
      >
        <Text style={[styles.actionIcon, { color: colors.accent }]}>🎭</Text>
        <Text style={[styles.actionText, { color: colors.text }]}>Archetypes</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.actionButton, { backgroundColor: 'transparent' }]}
        onPress={() => setCurrentScreen('patterns')}
      >
        <Text style={[styles.actionIcon, { color: colors.accent }]}>🌌</Text>
        <Text style={[styles.actionText, { color: colors.text }]}>Patterns</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.actionButton, { backgroundColor: 'transparent' }]}
        onPress={() => setCurrentScreen('nourish')}
      >
        <Text style={[styles.actionIcon, { color: colors.accent }]}>🍽️</Text>
        <Text style={[styles.actionText, { color: colors.text }]}>Nourish</Text>
      </TouchableOpacity>
    </View>
  );

  // Render Time Container Navigation at bottom with Craft a Moment button
  const renderTimeContainerNav = (showCraftButton: boolean = false) => {
    const containers: ContainerId[] = ['morning', 'afternoon', 'evening', 'late'];
    const icons = { morning: '🌅', afternoon: '🌞', evening: '🌇', late: '🌙' };
    
    return (
      <View>
        {/* Craft a Moment Button - Only show on home screen */}
        {showCraftButton && (
          <TouchableOpacity
            style={[styles.craftMomentButton, { backgroundColor: colors.accent }]}
            onPress={() => setIsCraftMomentModalVisible(true)}
          >
            <Text style={[styles.craftMomentIcon, { color: colors.card }]}>✨</Text>
            <Text style={[styles.craftMomentText, { color: colors.card }]}>Craft a Moment</Text>
          </TouchableOpacity>
        )}

        {/* Time Container Navigation */}
        <View style={[styles.timeContainerNav, { backgroundColor: colors.bg, borderTopColor: colors.dim }]}>
          {containers.map(container => (
            <TouchableOpacity
              key={container}
              style={[
                styles.timeButton,
                activeContainer === container && { backgroundColor: colors.accent + '20' }
              ]}
              onPress={() => {
                // Mark this as a manual transition
                setIsManualTransition(true);
                setActiveContainer(container);
                setCurrentScreen('home');
              }}
            >
              <Text style={[styles.timeIcon, { color: colors.accent }]}>{icons[container]}</Text>
              <Text style={[
                styles.timeText,
                { color: activeContainer === container ? colors.accent : colors.dim }
              ]}>
                {container.charAt(0).toUpperCase() + container.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    );
  };

  // HOME SCREEN (Anchors)
  if (currentScreen === 'home') {
    return (
      <View style={[styles.container, { backgroundColor: colors.bg }]}>
        
        <StatusBar barStyle="dark-content" backgroundColor={colors.bg} />
        
        {/* 2x2 Action Grid at Top */}
        <View style={styles.topSection}>
          {renderActionGrid()}
        </View>

        <ScrollView
	          style={[styles.scrollView, { marginBottom: 0 }]}
	          contentContainerStyle={styles.scrollContent}
	          showsVerticalScrollIndicator={false}
        >
	          {/* Time and Date Display - Reduced Prominence */}
		          <View style={[styles.timeSection, { alignItems: 'center' }]}>
		            <View style={styles.timeRow}>
		              <Text style={[styles.date, { color: colors.dim, textAlign: 'center' }]}>{formatLongDate()}</Text>
		              <Text style={[styles.time, { color: colors.text, fontSize: 14, fontWeight: '400', textAlign: 'center' }]}>{currentTime}</Text>
		            </View>
			              <Text style={[styles.themeText, { 
			                color: colors.dim, 
			                fontWeight: '500', 
			                marginTop: 12, 
			                fontSize: 28, // Increased size
			                fontFamily: 'OleoScript-Bold', // Custom font
			                textAlign: 'center', 
			                lineHeight: 32, // Adjusted line height for script font
			              }]}>
			                {ContainerThemes[activeContainer]}
			              </Text>
		          </View>

          {/* Temporal Intelligence - Adaptive Suggestions Card */}
          <TemporalIntelligenceCard colors={colors} />

          {/* Daily Synthesis - Evening Reflection */}
          <DailySynthesisCard 
            colors={colors} 
            onViewHistory={() => setIsSynthesisHistoryVisible(true)}
          />

	          {/* Personal Moments Section */}
	          <Text style={[styles.sectionHeader, { color: colors.dim, fontSize: 14, fontWeight: '500' }]}>
	            PERSONAL MOMENTS
	          </Text>
	          <CollapsibleSection
	            title="CRAFTED MOMENTS"
	            icon="✨"
	            colors={colors}
	            defaultExpanded={false}
	          >
	            {items.filter(item => item.category === 'crafted').map(item => (
              <AnchorCard
                key={item.id}
                item={item}
                completed={isCompleted(item.id)}
                onToggle={() => handleCompletion(item.id)}
                colors={colors}
                onPress={() => setSelectedItem(item)}
                onDelete={() => removeItem(item.id)}
                onEdit={() => {
                  setSelectedItem(item);
                  setIsEditMode(true);
                }}
              />
	            ))}
	          </CollapsibleSection>

	          {/* Resonant Grounding Field */}
	          {/* Resonant Grounding Field - Single Line Title */}
	          <Text style={[styles.sectionHeader, { color: colors.dim, fontSize: 14, fontWeight: '500', marginTop: 20 }]}>
	            RESONANT FIELD
	          </Text>

          {/* Time-based Anchors */}
          <CollapsibleSection
            title={`${activeContainer.toUpperCase()} ANCHORS`}
            icon="☀️"
            colors={colors}
            defaultExpanded={false}
          >
            {timeAnchors.map(item => (
              <AnchorCard
                key={item.id}
                item={item}
                completed={isCompleted(item.id)}
                onToggle={() => handleCompletion(item.id)}
                colors={colors}
                onPress={() => setSelectedItem(item)}
                onDelete={() => removeItem(item.id)}
                onEdit={() => {
                  setSelectedItem(item);
                  setIsEditMode(true);
                }}
                container={activeContainer}
              />
            ))}
          </CollapsibleSection>

	          {/* Situational Resonance */}
	          <CollapsibleSection
	            title="SITUATIONAL RESONANCE"
            icon="⚡"
            colors={colors}
            defaultExpanded={false}
          >
            {situationalAnchors.map(item => (
              <AnchorCard
                key={item.id}
                item={item}
                completed={isCompleted(item.id)}
                onToggle={() => handleCompletion(item.id)}
                colors={colors}
                onPress={() => setSelectedItem(item)}
                onDelete={() => removeItem(item.id)}
                onEdit={() => {
                  setSelectedItem(item);
                  setIsEditMode(true);
                }}
                container={activeContainer}
              />
            ))}
          </CollapsibleSection>

          {/* Uplift & Expansion */}
          <CollapsibleSection
            title="UPLIFT & EXPANSION"
            icon="✨"
            colors={colors}
            defaultExpanded={false}
          >
            {upliftAnchors.map(item => (
              <AnchorCard
                key={item.id}
                item={item}
                completed={isCompleted(item.id)}
                onToggle={() => handleCompletion(item.id)}
                colors={colors}
                onPress={() => setSelectedItem(item)}
                onDelete={() => removeItem(item.id)}
                onEdit={() => {
                  setSelectedItem(item);
                  setIsEditMode(true);
                }}
                container={activeContainer}
              />
            ))}
          </CollapsibleSection>

	          <View style={{ height: 40 }} />
        </ScrollView>

        {/* Time Container Navigation at Bottom */}
        {renderTimeContainerNav(true)}

        {/* Modals */}
        <CraftMomentModal
          isVisible={isCraftMomentModalVisible}
          onClose={() => setIsCraftMomentModalVisible(false)}
          onSave={(title, container, category, body_cue, micro, desire) => {
            addItem({
              title,
              container,
              category,
              body_cue,
              micro,
              desire,
            });
            // Trigger bloom effect
            setShowBloomEffect(true);
          }}
          colors={colors}
        />

        {/* Task Detail Modal */}
        {selectedItem && (
          <Modal isVisible={!!selectedItem} onClose={() => {
            setSelectedItem(null);
            setIsEditMode(false);
          }}>
            <TaskDetailScreen
              item={selectedItem}
              colors={colors}
              container={activeContainer}
              onClose={() => {
                setSelectedItem(null);
                setIsEditMode(false);
              }}
              isEditMode={isEditMode}
              onSave={(updatedItem) => {
                updateItem(updatedItem.id, updatedItem);
                setIsEditMode(false);
              }}
              onComplete={(status, note) => {
                if (status === 'did it') {
                  // Update existing item with checkmark (handleCompletion does this)
                  handleCompletion(selectedItem.id);
                } else {
                  // For other actions (skipped, forgot, couldn't, not relevant),
                  // show ring pulse, then create a journal entry and show toast
                  setShowRingPulse(true);
                  setCurrentActionType(status);
                  
                  // Delay the toast slightly so ring pulse is visible first
                  setTimeout(() => {
                    setShowActionToast(true);
                  }, 400);
                  
                  addItem({
                    title: selectedItem.title,
                    container: selectedItem.container,
                    category: selectedItem.category,
                    body_cue: selectedItem.body_cue,
                    micro: selectedItem.micro,
                    desire: selectedItem.desire,
                    status: status,
                    note: note,
                  });
                }

                setSelectedItem(null);
              }}
            />
          </Modal>
        )}

        {/* Somatic Feedback Layer */}
        <CompletionPulse
          isVisible={showCompletionPulse}
          color={colors.accent}
          onComplete={handlePulseComplete}
        />
        
        <RingPulse
          isVisible={showRingPulse}
          color={colors.accent}
          onComplete={() => setShowRingPulse(false)}
        />
        
        <BloomEffect
          isVisible={showBloomEffect}
          color={colors.accent}
          onComplete={() => setShowBloomEffect(false)}
        />
        
        <ShiftToast
          isVisible={showShiftToast}
          colors={colors}
          container={activeContainer}
          onDismiss={() => setShowShiftToast(false)}
        />
        
        <ActionToast
          key={currentActionType} // Force remount when action type changes
          isVisible={showActionToast}
          actionType={currentActionType}
          colors={colors}
          container={activeContainer}
          onDismiss={() => setShowActionToast(false)}
        />
        
        <ThresholdCard
          isVisible={showThresholdCard}
          fromContainer={previousContainer}
          toContainer={activeContainer}
          colors={colors}
          onDismiss={() => setShowThresholdCard(false)}
        />

        <SynthesisHistoryModal
          visible={isSynthesisHistoryVisible}
          onClose={() => setIsSynthesisHistoryVisible(false)}
          colors={colors}
        />

        <ConversationCard
          isVisible={showConversation}
          messages={conversationMessages}
          colors={colors}
          onDismiss={() => {
            setShowConversation(false);
            setConversationMessages([]);
          }}
        />
        
        {/* Return Node - appears when archetype is active */}
        {activeArchetype && (
          <ReturnNode
            archetype={activeArchetype}
            onReturn={() => {
              setActiveArchetypeId(null);
              // TODO: Show "Back to center" toast
            }}
          />
        )}
      </View>
    );
  }

  // SUBSTANCES SCREEN
  if (currentScreen === 'substances') {
    return (
      <View style={[styles.container, { backgroundColor: colors.bg }]}>
        <StatusBar barStyle="dark-content" backgroundColor={colors.bg} />
        
        {/* 2x2 Action Grid at Top */}
        <View style={styles.topSection}>
          {renderActionGrid()}
        </View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <Text style={[styles.containerTitle, { color: colors.text }]}>
            Substances
          </Text>
          <Text style={[styles.containerSubtitle, { color: colors.dim }]}>
            living pharmacopoeia
          </Text>

          <Text style={[styles.sectionHeader, { color: colors.dim, marginTop: 24 }]}>
            YOUR SUBSTANCES
          </Text>

          {allies.map(ally => (
            <AllyCard
              key={ally.id}
              ally={ally}
              onEdit={(ally: any) => {
                setAllyToEdit(ally);
                setIsEditAllyModalVisible(true);
              }}
              onRemove={() => removeAlly(ally.id)}
              onLogUse={() => {
                setMomentToSynthesize({
                  allyId: ally.id,
                  allyName: ally.name,
                  allyMythicName: ally.mythicName,
                  container: activeContainer,
                  text: `Used ${ally.mythicName || ally.name}`,
                });
                setIsSubstanceSynthesisModalVisible(true);
              }}
              colors={colors}
            />
          ))}

          <TouchableOpacity
            style={[styles.addButton, { backgroundColor: colors.accent }]}
            onPress={() => setIsAddAllyModalVisible(true)}
          >
            <Text style={[styles.addButtonText, { color: colors.card }]}>+ Add New Companion</Text>
          </TouchableOpacity>

          {/* Substances Journal Section */}
          <Text style={[styles.sectionHeader, { color: colors.dim, marginTop: 32 }]}>
            reflective transmissions
          </Text>
          <Text style={[styles.journalSubtitle, { color: colors.dim, marginBottom: 16 }]}>
            your personal log of substance experiences
          </Text>

          {substanceJournalEntries.length === 0 ? (
            <View style={[styles.emptyCard, { backgroundColor: colors.card + 'B3' }]}>
              <Text style={[styles.emptyText, { color: colors.dim }]}>
                No substance transmissions yet. Log your first interaction to begin.
              </Text>
            </View>
          ) : (
            substanceJournalEntries.slice(0, 10).map((entry) => (
              <View key={entry.id} style={[styles.entryCard, { backgroundColor: colors.card + 'B3' }]}>
                <View style={styles.entryHeader}>
                  <Text style={[styles.entryTitle, { color: colors.text }]}>
                    {entry.allyName || 'Substance Moment'}
                  </Text>
                  <Text style={[styles.entryDate, { color: colors.dim }]}>
                    {new Date(entry.date).toLocaleDateString()}
                  </Text>
                </View>
                
                {entry.tone && (
                  <View style={styles.checkInRow}>
                    <Text style={[styles.checkInLabel, { color: colors.dim }]}>Intention:</Text>
                    <Text style={[styles.checkInValue, { color: colors.text }]}>{entry.tone}</Text>
                  </View>
                )}
                
                {entry.frequency && (
                  <View style={styles.checkInRow}>
                    <Text style={[styles.checkInLabel, { color: colors.dim }]}>Sensation:</Text>
                    <Text style={[styles.checkInValue, { color: colors.text }]}>{entry.frequency}</Text>
                  </View>
                )}
                
                {entry.presence && (
                  <View style={styles.checkInRow}>
                    <Text style={[styles.checkInLabel, { color: colors.dim }]}>Reflection:</Text>
                    <Text style={[styles.checkInValue, { color: colors.text }]}>{entry.presence}</Text>
                  </View>
                )}

                {entry.context && (
                  <View style={styles.reflectionSection}>
                    <Text style={[styles.reflectionLabel, { color: colors.accent }]}>Synthesis & Invocation:</Text>
                    <Text style={[styles.reflectionText, { color: colors.text }]}>{entry.context}</Text>
                  </View>
                )}
              </View>
            ))
          )}

          {/* Substance Transmissions Section */}
          <Text style={[styles.sectionHeader, { color: colors.dim, marginTop: 32 }]}>
            substance transmissions
          </Text>
          <Text style={[styles.journalSubtitle, { color: colors.dim, marginBottom: 16 }]}>
            internal dialogues & emergent consciousness
          </Text>

          {conversations.filter(c => c.substanceName).length === 0 ? (
            <View style={[styles.emptyCard, { backgroundColor: colors.card + 'B3' }]}>
              <Text style={[styles.emptyText, { color: colors.dim }]}>
                No substance dialogues yet. Invoke an archetype and log a substance moment to begin.
              </Text>
            </View>
          ) : (
            conversations.filter(c => c.substanceName).slice(0, 5).map((conversation) => (
              <View key={conversation.id} style={[styles.conversationCard, { backgroundColor: colors.card + 'B3' }]}>
                <View style={styles.conversationHeader}>
                  <Text style={[styles.conversationTitle, { color: colors.text }]}>
                    {conversation.substanceMythicName || conversation.substanceName}
                    {conversation.archetypeName && (
                      <Text style={{ color: colors.dim }}> × {conversation.archetypeName}</Text>
                    )}
                  </Text>
                  <Text style={[styles.conversationDate, { color: colors.dim }]}>
                    {new Date(conversation.timestamp).toLocaleDateString()}
                  </Text>
                </View>
                {conversation.messages.map((msg, idx) => (
                  <View key={idx} style={styles.messageBlock}>
                    <Text style={[styles.messageSpeaker, { color: colors.accent }]}>
                      {msg.speaker}:
                    </Text>
                    <Text style={[styles.messageText, { color: colors.text }]}>
                      {msg.text}
                    </Text>
                  </View>
                ))}
              </View>
            ))
          )}

          <View style={{ height: 80 }} />
        </ScrollView>

        {/* Time Container Navigation at Bottom */}
        {renderTimeContainerNav()}

        {/* Modals */}
        <AddAllyModal
          isVisible={isAddAllyModalVisible}
          onClose={() => setIsAddAllyModalVisible(false)}
          onSave={(name: string, face: string, invocation: string, func: string, shadow: string, ritual: string) => {
            addAlly({
              name,
              face,
              invocation,
              function: func,
              shadow,
              ritual,
              log: [],
            });
          }}
          colors={colors}
        />
        {allyToEdit && (
          <EditAllyModal
            isVisible={isEditAllyModalVisible}
            onClose={() => {
              setIsEditAllyModalVisible(false);
              setAllyToEdit(null);
            }}
            onSave={(ally: any) => {
              updateAlly(ally);
            }}
            colors={colors}
            ally={allyToEdit}
          />
        )}
        <SubstanceSynthesisModal
          isVisible={isSubstanceSynthesisModalVisible}
          onClose={() => {
            setIsSubstanceSynthesisModalVisible(false);
            setMomentToSynthesize({});
          }}
          momentData={momentToSynthesize}
          colors={colors}
          activeArchetype={activeArchetype}
          onConversationGenerated={(messages, conversationData) => {
            // Save conversation to storage instead of showing popup
            if (conversationData) {
              addConversation(conversationData);
            }
          }}
        />
      </View>
    );
  }

  // ARCHETYPES SCREEN
  if (currentScreen === 'archetypes') {
    return (
      <View style={[styles.container, { backgroundColor: colors.bg }]}>
        <StatusBar barStyle="dark-content" backgroundColor={colors.bg} />
        
        {/* 2x2 Action Grid at Top */}
        <View style={styles.topSection}>
          {renderActionGrid()}
        </View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <Text style={[styles.containerTitle, { color: colors.text }]}>
            Archetypes
          </Text>
          <Text style={[styles.containerSubtitle, { color: colors.dim }]}>
            inner modes & invocations
          </Text>

          <Text style={[styles.sectionHeader, { color: colors.dim, marginTop: 24 }]}>
            AVAILABLE MODES
          </Text>

          {/* Archetype Cards */}
          {archetypes.map((archetype) => (
            <ArchetypeCard
              key={archetype.id}
              archetype={archetype}
              onPress={() => {
                setSelectedArchetype(archetype);
                setIsArchetypeModalVisible(true);
              }}
              onEdit={() => {
                setArchetypeToEdit(archetype);
                setIsEditArchetypeModalVisible(true);
              }}
              onDelete={() => {
                if (archetype.isDefault) {
                  Alert.alert('Cannot Delete', 'Default archetypes cannot be deleted.');
                } else {
                  Alert.alert(
                    'Delete Archetype',
                    `Are you sure you want to delete "${archetype.name}"?`,
                    [
                      { text: 'Cancel', style: 'cancel' },
                      { text: 'Delete', style: 'destructive', onPress: () => removeArchetype(archetype.id) },
                    ]
                  );
                }
              }}
              colors={colors}
            />
          ))}

          {/* Create Custom Archetype Button */}
          <TouchableOpacity
            style={[styles.createArchetypeButton, { backgroundColor: colors.accent + '20', borderColor: colors.accent + '40' }]}
            onPress={() => setIsAddArchetypeModalVisible(true)}
          >
            <Text style={[styles.createArchetypeButtonText, { color: colors.accent }]}>✨ Create Custom Archetype</Text>
          </TouchableOpacity>

          {/* Return Ritual Info */}
          <View style={[styles.infoCard, { backgroundColor: colors.card + '99', marginTop: 24 }]}>
            <Text style={[styles.infoTitle, { color: colors.accent }]}>Return Ritual</Text>
            <Text style={[styles.infoText, { color: colors.text }]}>After using any mode:</Text>
            <Text style={[styles.infoText, { color: colors.dim, marginTop: 8 }]}>
              1. Place a hand on your chest.{"\n"}
              2. Breathe once for gratitude: "Thanks for showing up."{"\n"}
              3. Whisper: "Back to center."
            </Text>
            <Text style={[styles.infoText, { color: colors.dim, marginTop: 8, fontStyle: 'italic' }]}>
              That closes the loop and keeps roles from blending or overstaying — you choose them, they don't take over.
            </Text>
          </View>

          {/* Archetype Reflections Section */}
          <Text style={[styles.sectionHeader, { color: colors.dim, marginTop: 32 }]}>
            archetype reflections
          </Text>
          <Text style={[styles.journalSubtitle, { color: colors.dim, marginBottom: 16 }]}>
            personal & collective journals
          </Text>

          {conversations.filter(c => c.archetypeName).length === 0 ? (
            <View style={[styles.emptyCard, { backgroundColor: colors.card + 'B3' }]}>
              <Text style={[styles.emptyText, { color: colors.dim }]}>
                No archetype dialogues yet. Invoke an archetype and log a substance moment to begin.
              </Text>
            </View>
          ) : (
            conversations.filter(c => c.archetypeName).slice(0, 5).map((conversation) => (
              <View key={conversation.id} style={[styles.conversationCard, { backgroundColor: colors.card + 'B3' }]}>
                <View style={styles.conversationHeader}>
                  <Text style={[styles.conversationTitle, { color: colors.text }]}>
                    {conversation.archetypeName}
                    {conversation.substanceMythicName && (
                      <Text style={{ color: colors.dim }}> × {conversation.substanceMythicName || conversation.substanceName}</Text>
                    )}
                  </Text>
                  <Text style={[styles.conversationDate, { color: colors.dim }]}>
                    {new Date(conversation.timestamp).toLocaleDateString()}
                  </Text>
                </View>
                {conversation.messages.map((msg, idx) => (
                  <View key={idx} style={styles.messageBlock}>
                    <Text style={[styles.messageSpeaker, { color: colors.accent }]}>
                      {msg.speaker}:
                    </Text>
                    <Text style={[styles.messageText, { color: colors.text }]}>
                      {msg.text}
                    </Text>
                  </View>
                ))}
              </View>
            ))
          )}

          <View style={{ height: 80 }} />
        </ScrollView>

        {/* Time Container Navigation at Bottom */}
        {renderTimeContainerNav()}

        {/* Archetype Detail Modal */}
        <ArchetypeDetailModal
          archetype={selectedArchetype}
          isVisible={isArchetypeModalVisible}
          onClose={() => {
            setIsArchetypeModalVisible(false);
            setSelectedArchetype(null);
          }}
          onInvoke={(archetype) => {
            setActiveArchetypeId(archetype.id);
            // TODO: Show toast notification
          }}
          colors={colors}
        />

        {/* Add Archetype Modal */}
        <AddArchetypeModal
          isVisible={isAddArchetypeModalVisible}
          onClose={() => setIsAddArchetypeModalVisible(false)}
          onSave={(archetype) => {
            addArchetype(archetype);
            setIsAddArchetypeModalVisible(false);
          }}
          colors={colors}
        />

        {/* Edit Archetype Modal */}
        <EditArchetypeModal
          archetype={archetypeToEdit}
          isVisible={isEditArchetypeModalVisible}
          onClose={() => {
            setIsEditArchetypeModalVisible(false);
            setArchetypeToEdit(null);
          }}
          onSave={(archetype) => {
            updateArchetype(archetype);
            setIsEditArchetypeModalVisible(false);
            setArchetypeToEdit(null);
          }}
          colors={colors}
        />
      </View>
    );
  }

  // PATTERNS SCREEN
  if (currentScreen === 'patterns') {

    return (
      <View style={[styles.container, { backgroundColor: colors.bg }]}>
        <StatusBar barStyle="dark-content" backgroundColor={colors.bg} />
        
        {/* 2x2 Action Grid at Top */}
        <View style={styles.topSection}>
          {renderActionGrid()}
        </View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <Text style={[styles.containerTitle, { color: colors.text }]}>
            Pattern Recognition
          </Text>
          <Text style={[styles.containerSubtitle, { color: colors.dim }]}>
            witnessing the rhythms
          </Text>

          <Text style={[styles.sectionHeader, { color: colors.dim, marginTop: 24 }]}>
            YOUR PATTERNS
          </Text>

          {patterns.length === 0 ? (
            <View style={[styles.emptyCard, { backgroundColor: colors.card + 'B3' }]}>
              <Text style={[styles.emptyText, { color: colors.dim }]}>
                No patterns recorded yet. Tap below to add your first observation.
              </Text>
            </View>
          ) : (
            patterns.map((pattern) => (
              <View key={pattern.id} style={[styles.patternCard, { backgroundColor: colors.card + 'B3' }]}>
                <View style={styles.patternHeader}>
                  <View style={styles.patternHeaderLeft}>
                    {pattern.category && (
                      <Text style={[styles.patternCategory, { color: colors.accent }]}>
                        {pattern.category === 'anchor' && '⚓'}
                        {pattern.category === 'substance' && '🍃'}
                        {pattern.category === 'time' && '⏰'}
                        {pattern.category === 'general' && '🌌'}
                      </Text>
                    )}
                    <Text style={[styles.patternDate, { color: colors.dim }]}>
                      {new Date(pattern.date).toLocaleDateString()}
                    </Text>
                  </View>
                  <TouchableOpacity onPress={() => removePattern(pattern.id)}>
                    <Text style={[styles.deleteButton, { color: colors.dim }]}>×</Text>
                  </TouchableOpacity>
                </View>
                <Text style={[styles.patternText, { color: colors.text }]}>{pattern.text}</Text>
              </View>
            ))
          )}

          <TouchableOpacity
            style={[styles.addButton, { backgroundColor: colors.accent }]}
            onPress={() => setIsAddPatternModalVisible(true)}
          >
            <Text style={[styles.addButtonText, { color: colors.card }]}>+ Record a Pattern</Text>
          </TouchableOpacity>

          <View style={[styles.placeholderCard, { backgroundColor: colors.card + 'B3', marginTop: 32 }]}>
            <Text style={[styles.placeholderIcon, { color: colors.accent }]}>🌌</Text>
            <Text style={[styles.placeholderTitle, { color: colors.text }]}>
              AI Pattern Weaver
            </Text>
            <Text style={[styles.placeholderText, { color: colors.dim }]}>
              Soon, this space will automatically reveal hidden rhythms — tracking how anchors, allies, and moments weave together across time.
            </Text>
          </View>

          {/* Field Whispers Button */}
          <TouchableOpacity
            style={[styles.addButton, { backgroundColor: colors.accent, marginTop: 24 }]}
            onPress={handleListenToField}
            disabled={isGeneratingWhispers}
          >
            <Text style={[styles.addButtonText, { color: colors.card }]}>
              {isGeneratingWhispers ? '🌌 The Field is listening...' : '🌌 Listen to the Field'}
            </Text>
          </TouchableOpacity>

          {/* Conversations Section */}
          {conversations.length > 0 && (
            <>
              <Text style={[styles.sectionHeader, { color: colors.dim, marginTop: 32 }]}>
                CONVERSATIONS
              </Text>
              <Text style={[styles.containerSubtitle, { color: colors.dim, marginBottom: 16 }]}>
                dialogues between substances & archetypes
              </Text>
              {conversations.slice(0, 3).map((conversation) => (
                <View key={conversation.id} style={[styles.conversationCard, { backgroundColor: colors.card + 'B3' }]}>
                  <View style={styles.conversationHeader}>
                    <Text style={[styles.conversationTitle, { color: colors.text }]}>
                      {conversation.substanceMythicName || conversation.substanceName}
                      {conversation.archetypeName && (
                        <Text style={{ color: colors.dim }}> × {conversation.archetypeName}</Text>
                      )}
                    </Text>
                    <Text style={[styles.conversationDate, { color: colors.dim }]}>
                      {new Date(conversation.date).toLocaleDateString()}
                    </Text>
                  </View>
                  {conversation.messages.map((message, idx) => (
                    <View key={idx} style={styles.conversationMessage}>
                      <Text style={[styles.conversationSpeaker, { color: colors.accent }]}>
                        {message.speaker}:
                      </Text>
                      <Text style={[styles.conversationText, { color: colors.text }]}>
                        {message.text}
                      </Text>
                    </View>
                  ))}
                </View>
              ))}
            </>
          )}

          <View style={{ height: 80 }} />
        </ScrollView>

        {/* Time Container Navigation at Bottom */}
        {renderTimeContainerNav()}

        {/* Modal */}
        <AddPatternModal
          isVisible={isAddPatternModalVisible}
          onClose={() => setIsAddPatternModalVisible(false)}
          onSave={(text, category) => {
            addPattern({ text, category });
          }}
          colors={colors}
        />
        
        {/* Field Whisper Overlay */}
        {showWhispers && activeWhispers.length > 0 && (
          <FieldWhisperSequence
            whispers={activeWhispers}
            colors={colors}
            onComplete={() => {
              setShowWhispers(false);
              setActiveWhispers([]);
            }}
          />
        )}
      </View>
    );
  }

  // NOURISH MAP SCREEN
  if (currentScreen === 'nourish') {

    return (
      <View style={[styles.container, { backgroundColor: colors.bg }]}>
        <StatusBar barStyle="dark-content" backgroundColor={colors.bg} />
        
        {/* 1x4 Action Grid at Top */}
        <View style={styles.topSection}>
          {renderActionGrid()}
        </View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <Text style={[styles.containerTitle, { color: colors.text }]}>
            Nourish Map
          </Text>
          <Text style={[styles.containerSubtitle, { color: colors.dim }]}>
            tracking fuel & feeling
          </Text>

          <Text style={[styles.sectionHeader, { color: colors.dim, marginTop: 24 }]}>
            RECENT MEALS
          </Text>

          {foodEntries.length === 0 ? (
            <View style={[styles.emptyCard, { backgroundColor: colors.card + 'B3' }]}>
              <Text style={[styles.emptyText, { color: colors.dim }]}>
                No meals logged yet. Tap below to record your first nourishment.
              </Text>
            </View>
          ) : (
            foodEntries.map((entry) => (
              <View key={entry.id} style={[styles.foodCard, { backgroundColor: colors.card + 'B3' }]}>
                <View style={styles.foodHeader}>
                  <View style={styles.foodHeaderLeft}>
                    <Text style={[styles.foodName, { color: colors.text }]}>{entry.name}</Text>
                  </View>
                  <TouchableOpacity onPress={() => removeFoodEntry(entry.id)}>
                    <Text style={[styles.deleteButton, { color: colors.dim }]}>×</Text>
                  </TouchableOpacity>
                </View>
                
                <Text style={[styles.foodDate, { color: colors.dim }]}>
                  {new Date(entry.date).toLocaleString()}
                </Text>

                {entry.energy_level && (
                  <View style={styles.foodDetail}>
                    <Text style={[styles.foodDetailLabel, { color: colors.dim }]}>Energy:</Text>
                    <Text style={[styles.foodDetailValue, { color: colors.text }]}>
                      {entry.energy_level === 'low' && '🔋 Low'}
                      {entry.energy_level === 'medium' && '⚡ Medium'}
                      {entry.energy_level === 'high' && '✨ High'}
                    </Text>
                  </View>
                )}

                {entry.feeling && (
                  <View style={styles.foodDetail}>
                    <Text style={[styles.foodDetailLabel, { color: colors.dim }]}>Feeling:</Text>
                    <Text style={[styles.foodDetailValue, { color: colors.text }]}>{entry.feeling}</Text>
                  </View>
                )}

                {entry.notes && (
                  <Text style={[styles.foodNotes, { color: colors.dim }]}>{entry.notes}</Text>
                )}
              </View>
            ))
          )}

          <TouchableOpacity
            style={[styles.addButton, { backgroundColor: colors.accent }]}
            onPress={() => setIsAddFoodModalVisible(true)}
          >
            <Text style={[styles.addButtonText, { color: colors.card }]}>+ Log Nourishment</Text>
          </TouchableOpacity>

          <View style={{ height: 80 }} />
        </ScrollView>

        {/* Time Container Navigation at Bottom */}
        {renderTimeContainerNav()}

        {/* Modal */}
        <AddFoodModal
          isVisible={isAddFoodModalVisible}
          onClose={() => setIsAddFoodModalVisible(false)}
          onSave={(entry) => {
            addFoodEntry(entry);
          }}
          colors={colors}
        />
      </View>
    );
  }

  return null;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  topSection: {
    paddingTop: 10, // Reduced from 48 to 10
    paddingHorizontal: 20,
  },
  actionGrid: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: 12,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'column',
    alignItems: 'center',
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 4,
    gap: 4,
  },
  actionIcon: {
    fontSize: 20,
  },
  actionText: {
    fontSize: 10,
    fontWeight: '600',
    textAlign: 'center',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 10, // Added a small top padding to the scroll view content
    paddingBottom: 40,
  },
  timeSection: {
    marginBottom: 24,
    alignItems: 'center', // Center the content of the time section
  },
  timeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center', // Center the time and date row
    gap: 16,
    marginBottom: 8,
  },
  time: {
    fontSize: 14,
    fontWeight: '400',
  },
  themeCard: {
    flex: 1,
    padding: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  themeText: {
    fontSize: 28, // Increased size for the new aesthetic
    fontFamily: 'OleoScript-Bold', // Custom font
    fontStyle: 'normal', // Ensure not italic
    textAlign: 'center',
    lineHeight: 32,
  },
  date: {
    fontSize: 16,
  },
  sectionHeader: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1,
    marginBottom: 16,
  },
  timeContainerNav: {
    flexDirection: 'row',
    borderTopWidth: 1,
    paddingVertical: 8,
    paddingBottom: 24,
  },
  timeButton: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
    borderRadius: 8,
    marginHorizontal: 2,
  },
  timeIcon: {
    fontSize: 20,
    marginBottom: 4,
  },
  timeText: {
    fontSize: 11,
    fontWeight: '600',
  },
  containerTitle: {
    fontSize: 28,
    fontWeight: '600',
    marginBottom: 4,
  },
  containerSubtitle: {
    fontSize: 16,
    fontStyle: 'italic',
  },
  addButton: {
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 16,
  },
  addButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  emptyCard: {
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
  },
  entryCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  entryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  entryTitle: {
    fontSize: 17,
    fontWeight: '600',
  },
  entryDate: {
    fontSize: 13,
  },
  checkInText: {
    fontSize: 13,
    marginBottom: 6,
  },
  reflectionSection: {
    marginTop: 12,
    gap: 4,
  },
  reflectionLabel: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  reflectionText: {
    fontSize: 14,
    lineHeight: 20,
  },
  placeholderCard: {
    borderRadius: 16,
    padding: 24,
    marginTop: 24,
    alignItems: 'center',
  },
  placeholderIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  placeholderTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 12,
    textAlign: 'center',
  },
  placeholderText: {
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
  },
  patternCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  patternHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  patternHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  patternCategory: {
    fontSize: 16,
  },
  patternDate: {
    fontSize: 12,
  },
  deleteButton: {
    fontSize: 24,
    fontWeight: '300',
    padding: 4,
  },
  patternText: {
    fontSize: 15,
    lineHeight: 22,
  },
  craftMomentButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 20,
    marginHorizontal: 20,
    marginBottom: 16,
    borderRadius: 12,
    gap: 8,
  },
  craftMomentIcon: {
    fontSize: 18,
  },
  createArchetypeButton: {
    paddingVertical: 16,
    paddingHorizontal: 20,
    marginTop: 16,
    marginBottom: 24,
    borderRadius: 12,
    borderWidth: 2,
    alignItems: 'center',
  },
  createArchetypeButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  craftMomentText: {
    fontSize: 15,
    fontWeight: '600',
  },
  foodCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  foodHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  foodHeaderLeft: {
    flex: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
  },
  date: {
    fontSize: 14,
    fontWeight: '400',
  },


  foodPortion: {
    fontSize: 14,
  },
  foodDate: {
    fontSize: 12,
    marginBottom: 10,
  },
  foodDetail: {
    flexDirection: 'row',
    marginTop: 6,
    gap: 6,
  },
  foodDetailLabel: {
    fontSize: 13,
    fontWeight: '600',
  },
  foodDetailValue: {
    fontSize: 13,
  },
  foodNotes: {
    fontSize: 13,
    marginTop: 10,
    fontStyle: 'italic',
  },
  analyzeButton: {
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    marginTop: 10,
  },
  analyzeButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 20,
  },
  analysisBackButton: {
    paddingVertical: 10,
    marginBottom: 20,
  },
  analysisBackText: {
    fontSize: 16,
    fontWeight: '500',
  },
  analysisTitle: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 20,
  },
  analysisContent: {
    paddingBottom: 40,
  },
  analysisText: {
    fontSize: 16,
    lineHeight: 24,
  },
  placeholderCard: {
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'transparent',
  },
  placeholderIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  placeholderTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
    textAlign: 'center',
  },
  placeholderText: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
  journalSubtitle: {
    fontSize: 14,
    fontStyle: 'italic',
  },
  checkInRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 6,
  },
  checkInLabel: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  checkInValue: {
    fontSize: 13,
  },
  infoCard: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    lineHeight: 20,
  },
  conversationCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  conversationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  conversationTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  conversationDate: {
    fontSize: 12,
  },
  conversationMessage: {
    marginBottom: 10,
  },
  conversationSpeaker: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 4,
  },
  conversationText: {
    fontSize: 14,
    lineHeight: 20,
  },
});

