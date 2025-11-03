import React from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Modal, ScrollView } from 'react-native';

import { Ally, ColorScheme, ContainerId } from '../constants/Types';

// --- AddAllyModal (Existing) ---

interface AddAllyModalProps {
  isVisible: boolean;
  onClose: () => void;
  onSave: (name: string, face: string, invocation: string, func: string, shadow: string, ritual: string) => void;
  colors: ColorScheme;
}

export const AddAllyModal: React.FC<AddAllyModalProps> = ({ isVisible, onClose, onSave, colors }) => {
  const [name, setName] = React.useState('');
  const [face, setFace] = React.useState('');
  const [invocation, setInvocation] = React.useState('');
  const [func, setFunc] = React.useState('');
  const [shadow, setShadow] = React.useState('');
  const [ritual, setRitual] = React.useState('');

  const handleSave = () => {
    if (name.trim()) {
      onSave(name, face || '✨', invocation, func, shadow, ritual);
      // Reset form
      setName('');
      setFace('');
      setInvocation('');
      setFunc('');
      setShadow('');
      setRitual('');
      onClose();
    }
  };

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={isVisible}
      onRequestClose={onClose}
    >
      <View style={styles.centeredView}>
        <View style={[styles.modalView, { backgroundColor: colors.bg }]}>
          <Text style={[styles.modalTitle, { color: colors.text }]}>Add New Ally</Text>
          <ScrollView style={styles.scrollView}>
            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: colors.dim }]}>Name* (e.g., Caffeine, Sunlight)</Text>
              <TextInput
                style={[styles.input, { borderColor: colors.dim, color: colors.text, backgroundColor: colors.card }]}
                onChangeText={setName}
                value={name}
                placeholder="Ally Name"
                placeholderTextColor={colors.dim}
              />
            </View>
            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: colors.dim }]}>Face (Emoji Icon)</Text>
              <TextInput
                style={[styles.input, { borderColor: colors.dim, color: colors.text, backgroundColor: colors.card }]}
                onChangeText={setFace}
                value={face}
                placeholder="✨"
                placeholderTextColor={colors.dim}
                maxLength={2}
              />
            </View>
            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: colors.dim }]}>Invocation (How you call it to action)</Text>
              <TextInput
                style={[styles.input, { borderColor: colors.dim, color: colors.text, backgroundColor: colors.card }]}
                onChangeText={setInvocation}
                value={invocation}
                placeholder="A gentle nudge"
                placeholderTextColor={colors.dim}
                multiline
              />
            </View>
            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: colors.dim }]}>Function (What it does for you)</Text>
              <TextInput
                style={[styles.input, { borderColor: colors.dim, color: colors.text, backgroundColor: colors.card }]}
                onChangeText={setFunc}
                value={func}
                placeholder="Boosts focus and energy"
                placeholderTextColor={colors.dim}
                multiline
              />
            </View>
            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: colors.dim }]}>Shadow (The downside/risk)</Text>
              <TextInput
                style={[styles.input, { borderColor: colors.dim, color: colors.text, backgroundColor: colors.card }]}
                onChangeText={setShadow}
                value={shadow}
                placeholder="Jitters, crash, dependence"
                placeholderTextColor={colors.dim}
                multiline
              />
            </View>
            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: colors.dim }]}>Ritual (How you use it mindfully)</Text>
              <TextInput
                style={[styles.input, { borderColor: colors.dim, color: colors.text, backgroundColor: colors.card }]}
                onChangeText={setRitual}
                value={ritual}
                placeholder="Only before 12pm, with a glass of water"
                placeholderTextColor={colors.dim}
                multiline
              />
            </View>
            <View style={{ height: 20 }} />
          </ScrollView>
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[styles.button, styles.cancelButton, { borderColor: colors.dim }]}
              onPress={onClose}
            >
              <Text style={[styles.textStyle, { color: colors.text }]}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.button, styles.saveButton, { backgroundColor: colors.accent }]}
              onPress={handleSave}
              disabled={!name.trim()}
            >
              <Text style={[styles.textStyle, { color: colors.card }]}>Save Ally</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

// --- EditAllyModal (New) ---

interface EditAllyModalProps {
  isVisible: boolean;
  onClose: () => void;
  onSave: (ally: Ally) => void;
  colors: ColorScheme;
  ally: Ally;
}

export const EditAllyModal: React.FC<EditAllyModalProps> = ({ isVisible, onClose, onSave, colors, ally }) => {
  const [name, setName] = React.useState(ally?.name || '');
  const [face, setFace] = React.useState(ally?.face || '');
  const [invocation, setInvocation] = React.useState(ally?.invocation || '');
  const [func, setFunc] = React.useState(ally?.function || '');
  const [shadow, setShadow] = React.useState(ally?.shadow || '');
  const [ritual, setRitual] = React.useState(ally?.ritual || '');

  React.useEffect(() => {
    if (ally) {
      setName(ally.name);
      setFace(ally.face);
      setInvocation(ally.invocation);
      setFunc(ally.function);
      setShadow(ally.shadow);
      setRitual(ally.ritual);
    } else {
      // Reset state if ally is null/undefined
      setName('');
      setFace('');
      setInvocation('');
      setFunc('');
      setShadow('');
      setRitual('');
    }
  }, [ally]);

  const handleSave = () => {
    if (name.trim()) {
      onSave({
        ...ally,
        name,
        face: face || '✨',
        invocation,
        function: func,
        shadow,
        ritual,
      });
      onClose();
    }
  };

  if (!ally) return null; // Prevent rendering if ally is not set

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={isVisible}
      onRequestClose={onClose}
    >
      <View style={styles.centeredView}>
        <View style={[styles.modalView, { backgroundColor: colors.bg }]}>
          <Text style={[styles.modalTitle, { color: colors.text }]}>Edit Ally: {ally.name}</Text>
          <ScrollView style={styles.scrollView}>
            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: colors.dim }]}>Name* (e.g., Caffeine, Sunlight)</Text>
              <TextInput
                style={[styles.input, { borderColor: colors.dim, color: colors.text, backgroundColor: colors.card }]}
                onChangeText={setName}
                value={name}
                placeholder="Ally Name"
                placeholderTextColor={colors.dim}
              />
            </View>
            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: colors.dim }]}>Face (Emoji Icon)</Text>
              <TextInput
                style={[styles.input, { borderColor: colors.dim, color: colors.text, backgroundColor: colors.card }]}
                onChangeText={setFace}
                value={face}
                placeholder="✨"
                placeholderTextColor={colors.dim}
                maxLength={2}
              />
            </View>
            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: colors.dim }]}>Invocation (How you call it to action)</Text>
              <TextInput
                style={[styles.input, { borderColor: colors.dim, color: colors.text, backgroundColor: colors.card }]}
                onChangeText={setInvocation}
                value={invocation}
                placeholder="A gentle nudge"
                placeholderTextColor={colors.dim}
                multiline
              />
            </View>
            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: colors.dim }]}>Function (What it does for you)</Text>
              <TextInput
                style={[styles.input, { borderColor: colors.dim, color: colors.text, backgroundColor: colors.card }]}
                onChangeText={setFunc}
                value={func}
                placeholder="Boosts focus and energy"
                placeholderTextColor={colors.dim}
                multiline
              />
            </View>
            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: colors.dim }]}>Shadow (The downside/risk)</Text>
              <TextInput
                style={[styles.input, { borderColor: colors.dim, color: colors.text, backgroundColor: colors.card }]}
                onChangeText={setShadow}
                value={shadow}
                placeholder="Jitters, crash, dependence"
                placeholderTextColor={colors.dim}
                multiline
              />
            </View>
            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: colors.dim }]}>Ritual (How you use it mindfully)</Text>
              <TextInput
                style={[styles.input, { borderColor: colors.dim, color: colors.text, backgroundColor: colors.card }]}
                onChangeText={setRitual}
                value={ritual}
                placeholder="Only before 12pm, with a glass of water"
                placeholderTextColor={colors.dim}
                multiline
              />
            </View>
            <View style={{ height: 20 }} />
          </ScrollView>
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[styles.button, styles.cancelButton, { borderColor: colors.dim }]}
              onPress={onClose}
            >
              <Text style={[styles.textStyle, { color: colors.text }]}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.button, styles.saveButton, { backgroundColor: colors.accent }]}
              onPress={handleSave}
              disabled={!name.trim()}
            >
              <Text style={[styles.textStyle, { color: colors.card }]}>Save Changes</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

// --- CraftMomentModal (Existing) ---

interface CraftMomentModalProps {
  isVisible: boolean;
  onClose: () => void;
  onSave: (title: string, container: ContainerId, category: 'time' | 'situational' | 'uplift' | 'crafted', body_cue: string, micro: string, desire: string) => void;
  colors: ColorScheme;
}



export const CraftMomentModal: React.FC<CraftMomentModalProps> = ({ isVisible, onClose, onSave, colors }) => {
  const [title, setTitle] = React.useState('');
  const [bodyCue, setBodyCue] = React.useState('');
  const [micro, setMicro] = React.useState('');
  const [desire, setDesire] = React.useState('');

  const handleSave = () => {
    if (title.trim()) {
      // All crafted moments go to 'morning' container by default (doesn't matter since they're filtered by category)
      onSave(title, 'morning', 'crafted', bodyCue, micro, desire);
      // Reset form
      setTitle('');
      setBodyCue('');
      setMicro('');
      setDesire('');
      onClose();
    }
  };

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={isVisible}
      onRequestClose={onClose}
    >
      <View style={styles.centeredView}>
        <View style={[styles.modalView, { backgroundColor: colors.bg }]}>
          <Text style={[styles.modalTitle, { color: colors.text }]}>Craft a Moment</Text>
          <ScrollView style={styles.scrollView}>
            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: colors.dim }]}>Moment Title* (e.g., Hydrate, Stretch)</Text>
              <TextInput
                style={[styles.input, { borderColor: colors.dim, color: colors.text, backgroundColor: colors.card }]}
                onChangeText={setTitle}
                value={title}
                placeholder="A simple, meaningful action"
                placeholderTextColor={colors.dim}
              />
            </View>


            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: colors.dim }]}>Notice</Text>
              <Text style={[styles.helperText, { color: colors.dim, fontSize: 11, fontStyle: 'italic', marginBottom: 6 }]}>A word or phrase is enough...</Text>
              <TextInput
                style={[styles.input, { borderColor: colors.dim, color: colors.text, backgroundColor: colors.card }]}
                onChangeText={setBodyCue}
                value={bodyCue}
                placeholder="When I feel a slump in energy..."
                placeholderTextColor={colors.dim}
                multiline
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: colors.dim }]}>Act</Text>
              <Text style={[styles.helperText, { color: colors.dim, fontSize: 11, fontStyle: 'italic', marginBottom: 6 }]}>A word or phrase is enough...</Text>
              <TextInput
                style={[styles.input, { borderColor: colors.dim, color: colors.text, backgroundColor: colors.card }]}
                onChangeText={setMicro}
                value={micro}
                placeholder="One deep breath"
                placeholderTextColor={colors.dim}
                multiline
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: colors.dim }]}>Reflect</Text>
              <Text style={[styles.helperText, { color: colors.dim, fontSize: 11, fontStyle: 'italic', marginBottom: 6 }]}>A word or phrase is enough...</Text>
              <TextInput
                style={[styles.input, { borderColor: colors.dim, color: colors.text, backgroundColor: colors.card }]}
                onChangeText={setDesire}
                value={desire}
                placeholder="To feel present and grounded"
                placeholderTextColor={colors.dim}
                multiline
              />
            </View>
            <View style={{ height: 20 }} />
          </ScrollView>
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[styles.button, styles.cancelButton, { borderColor: colors.dim }]}
              onPress={onClose}
            >
              <Text style={[styles.textStyle, { color: colors.text }]}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.button, styles.saveButton, { backgroundColor: colors.accent }]}
              onPress={handleSave}
              disabled={!title.trim()}
            >
              <Text style={[styles.textStyle, { color: colors.card }]}>Craft Moment</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};


// --- Styles (Shared) ---

const styles = StyleSheet.create({
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalView: {
    margin: 20,
    borderRadius: 20,
    padding: 25,
    alignItems: 'stretch',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    width: '90%',
    maxHeight: '85%',
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: '600',
    marginBottom: 20,
    textAlign: 'center',
  },
  scrollView: {
    maxHeight: '80%',
  },
  inputGroup: {
    marginBottom: 15,
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 5,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  input: {
    borderRadius: 10,
    padding: 15,
    fontSize: 16,
    borderWidth: 1,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  button: {
    borderRadius: 10,
    padding: 15,
    elevation: 2,
    flex: 1,
    marginHorizontal: 5,
    alignItems: 'center',
  },
  cancelButton: {
    borderWidth: 1,
  },
  saveButton: {
    opacity: 1, // Will be handled by disabled prop on TouchableOpacity
  },
  textStyle: {
    fontWeight: 'bold',
    textAlign: 'center',
    fontSize: 16,
  },
  radioGroup: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  radio: {
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
  },
});
