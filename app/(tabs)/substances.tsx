import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  ActivityIndicator,
} from 'react-native';
import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import useColors from '../hooks/useColors';
import { AllyCard } from '../components/AllyCard';
// ⧈replace-start:imports
import { AddAllyModal, EditAllyModal } from '../modal';
import { SubstanceSynthesisModal } from '../modal/SubstanceSynthesisModal';
import { JournalList } from '../components/JournalList';
import { JournalEntryModal } from '../components/JournalEntryModal';
import { forceMigration } from '../utils/migration';
import { Alert } from 'react-native';
// ⧈replace-end:imports

export default function SubstancesScreen() {
  const {
    allies,
    activeContainer,
    removeAlly,
    updateAlly,
    addAlly,
    substanceJournalEntries,
    conversations,
    loading,
  } = useApp();

  const colors = useColors(activeContainer, true, 'substances');
  const [isAddAllyModalVisible, setIsAddAllyModalVisible] = useState(false);
  const [isEditAllyModalVisible, setIsEditAllyModalVisible] = useState(false);
  const [isSynthesisModalVisible, setIsSynthesisModalVisible] = useState(false);
  const [allyToEdit, setAllyToEdit] = useState(null);
  const [momentToSynthesize, setMomentToSynthesize] = useState<any>({});
  const [selectedJournalEntry, setSelectedJournalEntry] = useState<any>(null);
  const [isJournalEntryModalVisible, setIsJournalEntryModalVisible] = useState(false);

  if (loading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: colors.bg }]}>
        <ActivityIndicator size="large" color={colors.accent} />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.bg }]}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.bg} />
      
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Text style={[styles.containerTitle, { color: colors.text, textAlign: 'center' }]}>
          🔥 SUBSTANCES v13.2 🔥
        </Text>
        <Text style={[styles.containerSubtitle, { color: colors.dim, textAlign: 'center' }]}>
          Living Pharmacopeia
        </Text>
        <Text style={{ color: colors.accent, fontSize: 10, textAlign: 'center', marginTop: 4 }}>v2.0-FIXED</Text>
        
        {/* DEBUG: Force Migration Button */}
        <TouchableOpacity
          style={{ backgroundColor: colors.accent, padding: 8, borderRadius: 8, marginTop: 12, marginHorizontal: 20 }}
          onPress={async () => {
            try {
              await forceMigration();
              Alert.alert('Success', 'Migration v13 completed! Restart the app to see changes.');
            } catch (error) {
              Alert.alert('Error', `Migration failed: ${error}`);
            }
          }}
        >
          <Text style={{ color: colors.card, textAlign: 'center', fontWeight: '600' }}>🔧 Force Migration v13</Text>
        </TouchableOpacity>

        <Text style={[styles.sectionHeader, { color: colors.dim, marginTop: 24 }]}>
          YOUR SUBSTANCES
        </Text>

        {allies.map(ally => (
          <AllyCard
            key={ally.id}
            ally={ally}
            onEdit={(ally) => {
              setAllyToEdit(ally);
              setIsEditAllyModalVisible(true);
            }}
            onRemove={() => removeAlly(ally.id)}
            onLogUse={() => {
              setMomentToSynthesize({
                allyId: ally.id,
                allyName: ally.name,
                container: activeContainer,
                text: `Used ${ally.name}`,
              });
              setIsSynthesisModalVisible(true);
            }}
            colors={colors}
          />
        ))}

        <TouchableOpacity
          style={[styles.addAllyButton, { backgroundColor: colors.accent }]}
          onPress={() => setIsAddAllyModalVisible(true)}
        >
          <Text style={[styles.addAllyText, { color: colors.card }]}>+ Add New Companion</Text>
        </TouchableOpacity>

        {/* Reflective Transmissions - Personal Log */}
        <Text style={[styles.sectionHeader, { color: colors.dim, marginTop: 32 }]}>
          REFLECTIVE TRANSMISSIONS
        </Text>
        <Text style={[styles.journalSubtitle, { color: colors.dim, marginBottom: 16 }]}>
          Your Personal Log of Substance Experiences
        </Text>

        <JournalList
          title="PERSONAL LOG"
          entries={substanceJournalEntries.map(entry => {
            const fullContent = `${entry.allyName || 'Substance Moment'}\n\nIntention: ${entry.tone || 'Not specified'}\nSensation: ${entry.frequency || 'Not specified'}\nReflection: ${entry.presence || 'Not specified'}\n\nSynthesis & Invocation:\n${entry.context || 'None'}`;
            return {
              id: entry.id,
              preview: entry.allyName || 'Substance Moment',
              fullContent,
              date: new Date(entry.date).toLocaleDateString(),
            };
          })}
          colors={colors}
          emptyMessage="No personal substance logs yet. Log your first interaction to begin."
          onEntryPress={(entry) => {
            setSelectedJournalEntry({
              title: 'Substance Reflection',
              date: entry.date,
              content: entry.fullContent,
            });
            setIsJournalEntryModalVisible(true);
          }}
        />

        {/* Substance Transmissions - Archetype Dialogues */}
        <Text style={[styles.sectionHeader, { color: colors.dim, marginTop: 32 }]}>
          SUBSTANCE TRANSMISSIONS
        </Text>
        <Text style={[styles.journalSubtitle, { color: colors.dim, marginBottom: 16 }]}>
          Internal Dialogues & Emergent Consciousness
        </Text>

        <JournalList
          title="RECENT DIALOGUES"
          entries={conversations.filter(c => c.substanceName).map(conversation => {
            const preview = `${conversation.archetypeName || 'Dialogue'}${conversation.substanceMythicName ? ' × ' + conversation.substanceMythicName : ''}`;
            const fullContent = conversation.messages.map(msg => `${msg.speaker}:\n${msg.text}`).join('\n\n');
            return {
              id: conversation.id,
              preview,
              fullContent,
              date: new Date(conversation.timestamp).toLocaleDateString(),
            };
          })}
          colors={colors}
          emptyMessage="No substance dialogues yet. Invoke an archetype and log a substance moment to begin."
          onEntryPress={(entry) => {
            setSelectedJournalEntry({
              title: 'Substance Transmission',
              date: entry.date,
              content: entry.fullContent,
            });
            setIsJournalEntryModalVisible(true);
          }}
        />

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Modals */}
      <AddAllyModal
        isVisible={isAddAllyModalVisible}
        onClose={() => setIsAddAllyModalVisible(false)}
        onSave={(name, face, invocation, func, shadow, ritual) => {
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
          onSave={(ally) => {
            updateAlly(ally);
          }}
          colors={colors}
          ally={allyToEdit}
        />
      )}
      <SubstanceSynthesisModal
        isVisible={isSynthesisModalVisible}
        onClose={() => {
          setIsSynthesisModalVisible(false);
          setMomentToSynthesize({});
        }}
        momentData={momentToSynthesize}
        colors={colors}
      />

      {/* Journal Entry Detail Modal */}
      {selectedJournalEntry && (
        <JournalEntryModal
          visible={isJournalEntryModalVisible}
          onClose={() => {
            setIsJournalEntryModalVisible(false);
            setSelectedJournalEntry(null);
          }}
          title={selectedJournalEntry.title}
          date={selectedJournalEntry.date}
          content={selectedJournalEntry.content}
          colors={colors}
        />
      )}
    </View>
  );
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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  containerTitle: {
    fontSize: 28,
    fontWeight: '600',
    marginBottom: 4,
    marginTop: 16,
  },
  containerSubtitle: {
    fontSize: 16,
    fontStyle: 'italic',
  },
  sectionHeader: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1,
    marginBottom: 16,
  },
  addAllyButton: {
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 16,
  },
  addAllyText: {
    fontSize: 16,
    fontWeight: '600',
  },
  journalSubtitle: {
    fontSize: 14,
    fontStyle: 'italic',
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
});