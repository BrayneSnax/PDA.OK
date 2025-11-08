import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Modal,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { ColorScheme } from '../constants/Types';

interface Props {
  isVisible: boolean;
  onClose: () => void;
  onAdd: (entry: {
    act: string;
    resistance: string;
    gainingInertia: string;
    goalposts: string;
  }) => void;
  colors: ColorScheme;
}

const RESISTANCE_LEVELS = [
  'Minimal',
  'Noticeable',
  'Overwhelming',
  'Paralyzing',
];

export function AddMovementModal({ isVisible, onClose, onAdd, colors }: Props) {
  const [time] = useState(new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }));
  const [act, setAct] = useState('');
  const [resistance, setResistance] = useState('');
  const [gainingInertia, setGainingInertia] = useState('');
  const [goalposts, setGoalposts] = useState('');
  const [showResistanceDropdown, setShowResistanceDropdown] = useState(false);

  const handleSave = () => {
    if (act.trim() && resistance) {
      onAdd({
        act: act.trim(),
        resistance,
        gainingInertia: gainingInertia.trim(),
        goalposts: goalposts.trim(),
      });
      // Reset
      setAct('');
      setResistance('');
      setGainingInertia('');
      setGoalposts('');
      onClose();
    }
  };

  const handleClose = () => {
    // Reset state when closing
    setAct('');
    setResistance('');
    setGainingInertia('');
    setGoalposts('');
    setShowResistanceDropdown(false);
    onClose();
  };

  return (
    <Modal
      visible={isVisible}
      transparent={true}
      animationType="slide"
      onRequestClose={handleClose}
    >
      <View style={styles.overlay}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardView}
        >
          <View style={[styles.container, { backgroundColor: colors.bg }]}>
            <ScrollView
              style={styles.scrollView}
              contentContainerStyle={styles.scrollContent}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
            >
              {/* Header */}
              <Text style={[styles.title, { color: colors.text }]}>
                Log Physical Interaction
              </Text>

              {/* THE 3-PART CHECK-IN */}
              <Text style={[styles.sectionLabel, { color: colors.dim }]}>
                THE 3-PART CHECK-IN
              </Text>

              <View style={styles.checkInRow}>
                {/* Time */}
                <View style={styles.checkInField}>
                  <Text style={[styles.fieldLabel, { color: colors.text }]}>Time</Text>
                  <View style={[styles.timeDisplay, { backgroundColor: colors.card, borderColor: colors.accent + '40' }]}>
                    <Text style={[styles.timeText, { color: colors.text }]}>{time}</Text>
                  </View>
                </View>

                {/* Act */}
                <View style={[styles.checkInField, { flex: 1 }]}>
                  <Text style={[styles.fieldLabel, { color: colors.text }]}>Act</Text>
                  <TextInput
                    style={[styles.input, { backgroundColor: colors.card, borderColor: colors.accent + '40', color: colors.text }]}
                    value={act}
                    onChangeText={setAct}
                    placeholder="..."
                    placeholderTextColor={colors.dim}
                  />
                </View>

                {/* Resistance */}
                <View style={[styles.checkInField, { flex: 1 }]}>
                  <Text style={[styles.fieldLabel, { color: colors.text }]}>Resistance</Text>
                  <TouchableOpacity
                    style={[styles.dropdown, { backgroundColor: colors.card, borderColor: colors.accent + '40' }]}
                    onPress={() => setShowResistanceDropdown(!showResistanceDropdown)}
                  >
                    <Text style={[styles.dropdownText, { color: resistance ? colors.text : colors.dim }]}>
                      {resistance || '▼'}
                    </Text>
                  </TouchableOpacity>
                  {showResistanceDropdown && (
                    <View style={[styles.dropdownMenu, { backgroundColor: colors.card, borderColor: colors.accent + '40' }]}>
                      {RESISTANCE_LEVELS.map((level) => (
                        <TouchableOpacity
                          key={level}
                          style={styles.dropdownItem}
                          onPress={() => {
                            setResistance(level);
                            setShowResistanceDropdown(false);
                          }}
                        >
                          <Text style={[styles.dropdownItemText, { color: colors.text }]}>{level}</Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  )}
                </View>
              </View>

              {/* GAINING INERTIA */}
              <Text style={[styles.sectionLabel, { color: colors.dim, marginTop: 24 }]}>
                GAINING INERTIA
              </Text>
              <TextInput
                style={[styles.textArea, { backgroundColor: colors.card, borderColor: colors.accent + '40', color: colors.text }]}
                value={gainingInertia}
                onChangeText={setGainingInertia}
                placeholder="What small momentum did you gather? Notice the first step, the shift from stillness..."
                placeholderTextColor={colors.dim}
                multiline
                numberOfLines={4}
                textAlignVertical="top"
              />

              {/* GOALPOSTS & REFLECTIONS */}
              <Text style={[styles.sectionLabel, { color: colors.dim, marginTop: 24 }]}>
                GOALPOSTS & REFLECTIONS
              </Text>
              <TextInput
                style={[styles.textArea, { backgroundColor: colors.card, borderColor: colors.accent + '40', color: colors.text }]}
                value={goalposts}
                onChangeText={setGoalposts}
                placeholder="Where did you aim? What markers did you pass? Trace the path from intention to completion..."
                placeholderTextColor={colors.dim}
                multiline
                numberOfLines={4}
                textAlignVertical="top"
              />

              {/* Buttons */}
              <View style={styles.buttonRow}>
                <TouchableOpacity
                  style={[styles.button, styles.cancelButton, { backgroundColor: colors.card, borderColor: colors.accent + '40' }]}
                  onPress={handleClose}
                >
                  <Text style={[styles.buttonText, { color: colors.dim }]}>Cancel</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.button,
                    styles.saveButton,
                    { backgroundColor: colors.accent, opacity: (!act.trim() || !resistance) ? 0.5 : 1 }
                  ]}
                  onPress={handleSave}
                  disabled={!act.trim() || !resistance}
                >
                  <Text style={[styles.buttonText, { color: colors.card }]}>
                    Log Movement
                  </Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  keyboardView: {
    maxHeight: '90%',
  },
  container: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    maxHeight: '100%',
  },
  scrollView: {
    maxHeight: '100%',
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 20,
    textAlign: 'center',
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 1,
    marginBottom: 12,
  },
  checkInRow: {
    flexDirection: 'row',
    gap: 12,
  },
  checkInField: {
    minWidth: 80,
  },
  fieldLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 6,
  },
  timeDisplay: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  timeText: {
    fontSize: 14,
    fontWeight: '600',
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
  },
  dropdown: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dropdownText: {
    fontSize: 14,
  },
  dropdownMenu: {
    position: 'absolute',
    top: 70,
    left: 0,
    right: 0,
    borderWidth: 1,
    borderRadius: 8,
    zIndex: 1000,
    elevation: 5,
  },
  dropdownItem: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  dropdownItemText: {
    fontSize: 14,
    textAlign: 'center',
  },
  textArea: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    minHeight: 100,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 24,
  },
  button: {
    flex: 1,
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButton: {
    borderWidth: 1,
  },
  saveButton: {},
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
  },
});
