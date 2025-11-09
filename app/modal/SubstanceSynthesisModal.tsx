import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Modal, Platform, KeyboardAvoidingView } from 'react-native';
import { Picker } from '@react-native-picker/picker';

import { ContainerId, ColorScheme, Moment } from '../constants/Types';
import { useApp } from '../context/AppContext';
import useColors from '../hooks/useColors';
import { generateSubstanceVoice } from '../services/substanceVoice';
import { generateArchetypeToSubstance, generateSubstanceToArchetype } from '../services/archetypeDialogue';

interface Props {
  isVisible: boolean;
  onClose: () => void;
  momentData: Partial<Moment>;
  colors: ColorScheme;
  onConversationGenerated?: (messages: Array<{speaker: string; text: string; speakerType: 'substance' | 'archetype' | 'field'}>, conversationData?: any) => void;
  activeArchetype?: any;
}

// Updated modal with text inputs instead of dropdowns
export const SubstanceSynthesisModal = ({ isVisible, onClose, momentData, onConversationGenerated, activeArchetype }: Props) => {
  const colors = useColors(momentData?.container || 'morning');
  const { 
    addSubstanceMoment,
    conversations,
    patterns,
    journalEntries,
    substanceJournalEntries,
    allies,
  } = useApp();

  const [synthesisState, setSynthesisState] = useState({
    intention: '',
    sensation: '',
    reflection: '',
    synthesis: '',
  });

  useEffect(() => {
    if (isVisible && momentData) {
      // Auto-populate time with current time in 12-hour format
      const now = new Date();
      const hours = now.getHours();
      const minutes = now.getMinutes();
      const ampm = hours >= 12 ? 'PM' : 'AM';
      const displayHours = hours % 12 || 12;
      const displayMinutes = minutes < 10 ? `0${minutes}` : minutes;
      const currentTime = `${displayHours}:${displayMinutes} ${ampm}`;
      
      setSynthesisState({
        intention: currentTime, // Auto-populate Time field
        sensation: '',
        reflection: '',
        synthesis: '',
      });
    }
  }, [isVisible]);

  const handleSave = () => {
    // All fields are optional - no validation required

    const finalMoment: Omit<Moment, 'id' | 'timestamp' | 'date'> = {
      ...momentData,
      // Map new fields to Moment type structure
      tone: synthesisState.intention,
      frequency: synthesisState.sensation,
      presence: synthesisState.reflection,
      context: synthesisState.synthesis,
      action_reflection: '',
      result_shift: '',
      conclusion_offering: '',
      text: momentData.text || 'Substance moment recorded',
      container: momentData.container || 'morning',
    } as Omit<Moment, 'id' | 'timestamp' | 'date'>;

    addSubstanceMoment(finalMoment);
    
    // Generate conversation silently for internal coherence (saved to journal)
    if (momentData.allyName) {
      generateConversation(momentData.allyName, synthesisState.intention, synthesisState.synthesis);
    }
    
    onClose();
  };

  const handleTextChange = (key: keyof typeof synthesisState, value: string) => {
    setSynthesisState(prev => ({ ...prev, [key]: value }));
  };

  const generateConversation = async (substanceName: string, intention: string, synthesis: string) => {
    const messages: Array<{speaker: string; text: string; speakerType: 'substance' | 'archetype' | 'field'}> = [];

    try {
      // Prepare memory data
      const memoryData = {
        conversations,
        patterns,
        journalEntries: [...journalEntries, ...substanceJournalEntries],
        allies,
      };
      
      // Generate substance voice with memory
      const userNote = `${intention}. ${synthesis}`.trim();
      const mythicName = (momentData as any).allyMythicName;
      const displayName = mythicName || substanceName;
      const substanceMessage = await generateSubstanceVoice(substanceName, userNote, mythicName, memoryData);
      
      messages.push({
        speaker: displayName,
        text: substanceMessage,
        speakerType: 'substance',
      });

      // If archetype is active, generate dialogue
      if (activeArchetype) {
        // Archetype responds to substance with memory
        const archetypeMessage = await generateArchetypeToSubstance(
          activeArchetype,
          substanceName,
          substanceMessage,
          memoryData
        );
        
        if (archetypeMessage) {
          messages.push({
            speaker: activeArchetype.name,
            text: archetypeMessage,
            speakerType: 'archetype',
          });
        }

        // Substance responds to archetype with memory
        const substanceToArchetype = await generateSubstanceToArchetype(
          substanceName,
          activeArchetype,
          substanceMessage,
          memoryData
        );
        
        if (substanceToArchetype) {
          messages.push({
            speaker: substanceName,
            text: substanceToArchetype,
            speakerType: 'substance',
          });
        }
      }

      // Save conversation to storage (no popup)
      if (messages.length > 0) {
        const mythicName = (momentData as any).allyMythicName;
        const conversationData = {
          substanceName,
          substanceMythicName: mythicName,
          archetypeName: activeArchetype?.name,
          messages,
        };
        // Call onConversationGenerated which should now save to storage
        if (onConversationGenerated) {
          onConversationGenerated(messages, conversationData);
        }
      }
    } catch (error) {
      console.error('Error generating conversation:', error);
    }
  };

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={isVisible}
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={[styles.centeredView, { backgroundColor: colors.bg + 'CC' }]}
      >
        <View style={[styles.modalView, { backgroundColor: colors.card }]}>
          <Text style={[styles.modalTitle, { color: colors.text }]}>Journalistic Synthesis</Text>
          <Text style={[styles.modalSubtitle, { color: colors.dim }]}>
            Reflect on the Moment.
          </Text>

          <View style={styles.contentContainer}>
            <View style={styles.checkInSection}>
              <Text style={[styles.sectionTitle, { color: colors.accent }]}>THE 3-PART CHECK-IN</Text>

              <View style={styles.horizontalFieldsRow}>
                <View style={styles.horizontalField}>
                  <Text style={[styles.label, { color: colors.text }]}>Time</Text>
                  <TextInput
                    style={[styles.textInput, styles.miniTextInput, { color: colors.text, backgroundColor: colors.bg, borderColor: colors.dim }]}
                    placeholder="..."
                    placeholderTextColor={colors.dim}
                    value={synthesisState.intention}
                    onChangeText={(text) => handleTextChange('intention', text)}
                  />
                </View>

                <View style={styles.horizontalField}>
                  <Text style={[styles.label, { color: colors.text }]}>Dose</Text>
                  <TextInput
                    style={[styles.textInput, styles.miniTextInput, { color: colors.text, backgroundColor: colors.bg, borderColor: colors.dim }]}
                    placeholder="..."
                    placeholderTextColor={colors.dim}
                    value={synthesisState.sensation}
                    onChangeText={(text) => handleTextChange('sensation', text)}
                  />
                </View>

                <View style={styles.horizontalField}>
                  <Text style={[styles.label, { color: colors.text }]}>Offering</Text>
                  <View style={[styles.pickerContainer, { backgroundColor: colors.bg, borderColor: colors.dim }]}>
                    <Picker
                      selectedValue={synthesisState.reflection}
                      onValueChange={(value) => handleTextChange('reflection', value)}
                      style={[styles.picker, { color: colors.text }]}
                      dropdownIconColor={colors.text}
                    >
                      <Picker.Item label="Select offering..." value="" />
                      <Picker.Item label="Gratitude" value="Gratitude" />
                      <Picker.Item label="Intention" value="Intention" />
                      <Picker.Item label="Prayer" value="Prayer" />
                      <Picker.Item label="Silence" value="Silence" />
                      <Picker.Item label="Breath" value="Breath" />
                      <Picker.Item label="Water to earth" value="Water to earth" />
                      <Picker.Item label="Food to altar" value="Food to altar" />
                      <Picker.Item label="Time in nature" value="Time in nature" />
                      <Picker.Item label="Creative work" value="Creative work" />
                      <Picker.Item label="Service to others" value="Service to others" />
                    </Picker>
                  </View>
                </View>
              </View>
            </View>

            <View style={styles.promptSection}>
              <Text style={[styles.guidedReflectionTitle, { color: colors.accent }]}>GUIDED INVOCATION</Text>
              <Text style={[styles.promptTitle, { color: colors.text }]}>Synthesis & Reflection</Text>
              <TextInput
                style={[styles.textInput, styles.largeTextInput, { color: colors.text, backgroundColor: colors.bg, borderColor: colors.dim }]}
                placeholder="Trace the atmosphere of the ritual — sensations, emotions, and any shift that followed..."
                placeholderTextColor={colors.dim}
                value={synthesisState.synthesis}
                onChangeText={(text) => handleTextChange('synthesis', text)}
                multiline
                numberOfLines={8}
              />
            </View>
          </View>

          <View style={styles.buttonRow}>
            <TouchableOpacity
              style={[styles.button, styles.cancelButton, { backgroundColor: colors.dim }]}
              onPress={onClose}
            >
              <Text style={[styles.buttonText, { color: colors.card }]}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.button, styles.saveButton, { backgroundColor: colors.accent }]}
              onPress={handleSave}
            >
              <Text style={[styles.buttonText, { color: colors.card }]}>Synthesize Moment</Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalView: {
    width: '90%',
    maxHeight: '75%',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 6,
  },
  modalSubtitle: {
    fontSize: 13,
    marginBottom: 12,
  },
  contentContainer: {
    flex: 1,
  },
  checkInSection: {
    marginBottom: 12,
  },
  horizontalFieldsRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 8,
  },
  horizontalField: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 8,
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 4,
  },
  textInput: {
    borderRadius: 8,
    borderWidth: 1,
    padding: 10,
    fontSize: 13,
  },
  miniTextInput: {
    minHeight: 38,
  },
  pickerContainer: {
    borderRadius: 8,
    borderWidth: 1,
    overflow: 'hidden',
    minHeight: 38,
    justifyContent: 'center',
  },
  picker: {
    height: 38,
  },
  largeTextInput: {
    minHeight: 80,
    maxHeight: 100,
    textAlignVertical: 'top',
  },
  promptSection: {
    marginBottom: 12,
  },
  guidedReflectionTitle: {
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 8,
  },
  promptTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 6,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
    gap: 12,
  },
  button: {
    flex: 1,
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButton: {},
  saveButton: {},
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
  },
});
