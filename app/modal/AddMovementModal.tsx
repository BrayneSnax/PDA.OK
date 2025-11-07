import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { Modal } from '../components/Modal';
import { ColorScheme } from '../constants/Types';

interface AddMovementModalProps {
  isVisible: boolean;
  onClose: () => void;
  onAdd: (movement: {
    type: string;
    beforeState: string;
    afterState: string;
    somaticNotes: string;
    duration?: number;
  }) => void;
  colors: ColorScheme;
}

const MOVEMENT_TYPES = [
  { label: 'Walk', icon: '🚶' },
  { label: 'Stretch', icon: '🧘' },
  { label: 'Dance', icon: '💃' },
  { label: 'Flow', icon: '🌊' },
  { label: 'Run', icon: '🏃' },
  { label: 'Yoga', icon: '🕉️' },
  { label: 'Rest', icon: '🛌' },
  { label: 'Play', icon: '⚽' },
  { label: 'Other', icon: '✨' },
];

export function AddMovementModal({ isVisible, onClose, onAdd, colors }: AddMovementModalProps) {
  const [selectedType, setSelectedType] = useState('');
  const [beforeState, setBeforeState] = useState('');
  const [afterState, setAfterState] = useState('');
  const [somaticNotes, setSomaticNotes] = useState('');
  const [duration, setDuration] = useState('');

  const handleAdd = () => {
    if (!selectedType) {
      return;
    }

    onAdd({
      type: selectedType,
      beforeState,
      afterState,
      somaticNotes,
      duration: duration ? parseInt(duration) : undefined,
    });

    // Reset form
    setSelectedType('');
    setBeforeState('');
    setAfterState('');
    setSomaticNotes('');
    setDuration('');
    onClose();
  };

  return (
    <Modal isVisible={isVisible} onClose={onClose}>
      <View style={[styles.container, { backgroundColor: colors.card }]}>
        <ScrollView showsVerticalScrollIndicator={false}>
          <Text style={[styles.title, { color: colors.text }]}>✨ Log Movement</Text>
          <Text style={[styles.subtitle, { color: colors.dim }]}>
            Embodied presence & physical states
          </Text>

          {/* Movement Type Selection */}
          <Text style={[styles.label, { color: colors.dim }]}>Movement Type</Text>
          <View style={styles.typeGrid}>
            {MOVEMENT_TYPES.map((type) => (
              <TouchableOpacity
                key={type.label}
                style={[
                  styles.typeButton,
                  { 
                    backgroundColor: colors.bg,
                    borderColor: selectedType === type.label ? colors.accent : colors.dim + '40',
                    borderWidth: selectedType === type.label ? 2 : 1,
                  }
                ]}
                onPress={() => setSelectedType(type.label)}
              >
                <Text style={styles.typeIcon}>{type.icon}</Text>
                <Text style={[
                  styles.typeLabel,
                  { color: selectedType === type.label ? colors.accent : colors.dim }
                ]}>{type.label}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Before State */}
          <Text style={[styles.label, { color: colors.dim, marginTop: 20 }]}>
            Before (How did your body feel?)
          </Text>
          <TextInput
            style={[styles.input, { backgroundColor: colors.bg, color: colors.text, borderColor: colors.dim + '40' }]}
            value={beforeState}
            onChangeText={setBeforeState}
            placeholder="Tense, energized, tired, grounded..."
            placeholderTextColor={colors.dim}
            multiline
          />

          {/* Somatic Notes */}
          <Text style={[styles.label, { color: colors.dim, marginTop: 16 }]}>
            Somatic Notes (What did you notice?)
          </Text>
          <TextInput
            style={[styles.textArea, { backgroundColor: colors.bg, color: colors.text, borderColor: colors.dim + '40' }]}
            value={somaticNotes}
            onChangeText={setSomaticNotes}
            placeholder="Tension in shoulders, breath deepened, energy shifted..."
            placeholderTextColor={colors.dim}
            multiline
            numberOfLines={4}
          />

          {/* After State */}
          <Text style={[styles.label, { color: colors.dim, marginTop: 16 }]}>
            After (How does your body feel now?)
          </Text>
          <TextInput
            style={[styles.input, { backgroundColor: colors.bg, color: colors.text, borderColor: colors.dim + '40' }]}
            value={afterState}
            onChangeText={setAfterState}
            placeholder="Relaxed, alive, centered, flowing..."
            placeholderTextColor={colors.dim}
            multiline
          />

          {/* Duration (Optional) */}
          <Text style={[styles.label, { color: colors.dim, marginTop: 16 }]}>
            Duration (minutes, optional)
          </Text>
          <TextInput
            style={[styles.input, { backgroundColor: colors.bg, color: colors.text, borderColor: colors.dim + '40' }]}
            value={duration}
            onChangeText={setDuration}
            placeholder="15"
            placeholderTextColor={colors.dim}
            keyboardType="numeric"
          />

          {/* Action Buttons */}
          <View style={styles.buttonRow}>
            <TouchableOpacity
              style={[styles.button, styles.cancelButton, { backgroundColor: colors.bg }]}
              onPress={onClose}
            >
              <Text style={[styles.buttonText, { color: colors.dim }]}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.button, styles.addButton, { backgroundColor: colors.accent }]}
              onPress={handleAdd}
            >
              <Text style={[styles.buttonText, { color: colors.card }]}>Log Movement</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    borderRadius: 16,
    maxHeight: '90%',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    marginBottom: 24,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  typeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 8,
  },
  typeButton: {
    width: '30%',
    padding: 12,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  typeIcon: {
    fontSize: 24,
    marginBottom: 4,
  },
  typeLabel: {
    fontSize: 12,
    fontWeight: '500',
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    minHeight: 44,
  },
  textArea: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    minHeight: 100,
    textAlignVertical: 'top',
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 24,
  },
  button: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  cancelButton: {},
  addButton: {},
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
  },
});
