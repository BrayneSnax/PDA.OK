import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, TextInput, Animated } from 'react-native';
import { ContainerItem, ColorScheme, ContainerId } from '../constants/Types';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface Props {
  item: ContainerItem;
  colors: ColorScheme;
  container: ContainerId;
  onClose: () => void;
  onComplete: (status: 'did it' | 'skipped' | 'forgot' | 'couldn\'t' | 'not relevant', note: string) => void;
  isEditMode?: boolean;
  onSave?: (updatedItem: ContainerItem) => void;
}

// Get time-of-day responsive glow for boxes
const getTimeGlowStyle = (container: ContainerId) => {
  const glowStyles = {
    morning: {
      backgroundColor: '#D4A57445', // Richer honey/amber tone (was pale #F5E6CC)
      borderColor: '#D4A57480', // Warmer, more saturated border
      shadowColor: '#D4A574',
      labelColor: '#B8864E', // Darker label for contrast
    },
    afternoon: {
      backgroundColor: '#5FA8B845', // Richer teal/aqua (was pale #B0E0E6)
      borderColor: '#5FA8B880', // More saturated border
      shadowColor: '#5FA8B8',
      labelColor: '#4A8A9A', // Darker for contrast
    },
    evening: {
      backgroundColor: '#8C4B3F48', // Increased from 30 to 48
      borderColor: '#8C4B3F85', // Increased from 65 to 85
      shadowColor: '#8C4B3F',
      labelColor: '#E8B4A8',
    },
    late: {
      backgroundColor: '#3A3F4545', // Increased from 28 to 45
      borderColor: '#3A3F4580', // Increased from 60 to 80
      shadowColor: '#3A3F45',
      labelColor: '#8B9DC3',
    },
  };

  return glowStyles[container] || glowStyles.morning;
};

// Dynamic font size based on character count
const getDynamicFontSize = (text: string, baseSize: number, baseLineHeight: number) => {
  const length = text.length;
  
  // Thresholds for font size reduction
  if (length < 50) {
    return { fontSize: baseSize, lineHeight: baseLineHeight };
  } else if (length < 80) {
    return { fontSize: baseSize - 1, lineHeight: baseLineHeight - 2 };
  } else if (length < 120) {
    return { fontSize: baseSize - 2, lineHeight: baseLineHeight - 3 };
  } else if (length < 160) {
    return { fontSize: baseSize - 3, lineHeight: baseLineHeight - 4 };
  } else {
    return { fontSize: baseSize - 4, lineHeight: baseLineHeight - 5 };
  }
};

export const TaskDetailScreen = ({ item, colors, container, onClose, onComplete, isEditMode = false, onSave }: Props) => {
  const insets = useSafeAreaInsets();
  const [note, setNote] = useState('');
  const [editedTitle, setEditedTitle] = useState(item.title || '');
  const [editedNotice, setEditedNotice] = useState(item.body_cue || '');
  const [editedAct, setEditedAct] = useState(item.micro || '');
  const [editedReflect, setEditedReflect] = useState(item.desire || '');
  const allActionButtons = ['skipped', 'forgot', 'couldn\'t', 'not relevant'];
  const actionButtons = allActionButtons.slice(0, item.actionButtons || 4);
  
  const timeGlow = getTimeGlowStyle(container);

  // Get dynamic font sizes for each text field
  const noticeFontStyle = getDynamicFontSize(item.body_cue || '', 18, 26);
  const actFontStyle = getDynamicFontSize(item.micro || '', 17, 24);
  const reflectFontStyle = getDynamicFontSize(item.desire || '', 16, 23);

  return (
    <View style={[styles.container, { backgroundColor: colors.bg, paddingBottom: 0 }]}>

      {isEditMode ? (
        <TextInput
          style={[styles.title, styles.titleInput, { color: colors.text, textAlign: 'center', borderColor: timeGlow.borderColor }]}
          value={editedTitle}
          onChangeText={setEditedTitle}
          placeholder="Task title"
          placeholderTextColor={colors.dim}
        />
      ) : (
        <Text style={[styles.title, { color: colors.text, textAlign: 'center' }]}>{item.title}</Text>
      )}

      <View style={styles.content}>
        {/* Notice Block with label inside */}
        <View style={[
          styles.glowBlock,
          styles.largeBlock,
          {
            backgroundColor: timeGlow.backgroundColor,
            borderColor: timeGlow.borderColor,
            shadowColor: timeGlow.shadowColor,
            padding: container === 'evening' || container === 'late' ? 10 : 12,
            marginBottom: container === 'evening' || container === 'late' ? 6 : 8,
          }
        ]}>
          <Text style={[styles.inlineLabel, { color: timeGlow.labelColor }]}>NOTICE</Text>
          {isEditMode ? (
            <TextInput
              style={[
                styles.glowText,
                styles.editableText,
                {
                  color: colors.text,
                  fontSize: noticeFontStyle.fontSize,
                  lineHeight: noticeFontStyle.lineHeight,
                  fontWeight: '600',
                }
              ]}
              value={editedNotice}
              onChangeText={setEditedNotice}
              placeholder="Notice..."
              placeholderTextColor={colors.dim}
              multiline
            />
          ) : (
            <Text style={[
              styles.glowText,
              {
                color: colors.text,
                fontSize: noticeFontStyle.fontSize,
                lineHeight: noticeFontStyle.lineHeight,
                fontWeight: '600',
              }
            ]}>
              {item.body_cue || 'No notice provided'}
            </Text>
          )}
        </View>

        {/* Act Block with label inside */}
        <View style={[
          styles.glowBlock,
          styles.mediumBlock,
          {
            backgroundColor: timeGlow.backgroundColor,
            borderColor: timeGlow.borderColor,
            shadowColor: timeGlow.shadowColor,
            padding: container === 'evening' || container === 'late' ? 10 : 12,
            marginBottom: container === 'evening' || container === 'late' ? 6 : 8,
          }
        ]}>
          <Text style={[styles.inlineLabel, { color: timeGlow.labelColor }]}>ACT</Text>
          {isEditMode ? (
            <TextInput
              style={[
                styles.glowText,
                styles.editableText,
                {
                  color: colors.text,
                  fontSize: actFontStyle.fontSize,
                  lineHeight: actFontStyle.lineHeight,
                  fontWeight: '500',
                }
              ]}
              value={editedAct}
              onChangeText={setEditedAct}
              placeholder="Act..."
              placeholderTextColor={colors.dim}
              multiline
            />
          ) : (
            <Text style={[
              styles.glowText,
              {
                color: colors.text,
                fontSize: actFontStyle.fontSize,
                lineHeight: actFontStyle.lineHeight,
                fontWeight: '500',
              }
            ]}>
              {item.micro || 'No action provided'}
            </Text>
          )}
        </View>
        
        {/* Reflect Block with label inside (if exists) */}
        {item.desire && (
          <View style={[
            styles.glowBlock,
            styles.smallBlock,
            {
              backgroundColor: timeGlow.backgroundColor,
              borderColor: timeGlow.borderColor,
              shadowColor: timeGlow.shadowColor,
              padding: container === 'morning' || container === 'afternoon' ? 12 : 14,
              marginBottom: container === 'morning' ? 8 : container === 'afternoon' ? 8 : container === 'evening' ? 16 : 12,
            }
          ]}>
            <Text style={[styles.inlineLabel, { color: timeGlow.labelColor }]}>REFLECT</Text>
            {isEditMode ? (
              <TextInput
                style={[
                  styles.glowText,
                  styles.editableText,
                  {
                    color: colors.text,
                    fontSize: reflectFontStyle.fontSize,
                    lineHeight: reflectFontStyle.lineHeight,
                    fontWeight: '500',
                  }
                ]}
                value={editedReflect}
                onChangeText={setEditedReflect}
                placeholder="Reflect..."
                placeholderTextColor={colors.dim}
                multiline
              />
            ) : (
              <Text style={[
                styles.glowText,
                {
                  color: colors.text,
                  fontSize: reflectFontStyle.fontSize,
                  lineHeight: reflectFontStyle.lineHeight,
                  fontWeight: '500',
                }
              ]}>
                {item.desire}
              </Text>
            )}
          </View>
        )}

        {/* Note Input - compact */}
        <TextInput
          style={[
            styles.noteInput,
            {
              backgroundColor: timeGlow.backgroundColor,
              color: colors.text,
              borderColor: timeGlow.borderColor,
            },
          ]}
          placeholder="Sprawl text if the moment drives you..."
          placeholderTextColor={colors.dim}
          value={note}
          onChangeText={setNote}
          multiline={true}
          numberOfLines={2}
        />

        {/* Action Buttons - compact grid or Save button in edit mode */}
        {isEditMode ? (
          <TouchableOpacity
            style={[styles.actionButton, styles.didItButton, { backgroundColor: colors.accent }]}
            onPress={() => {
              if (onSave) {
                onSave({
                  ...item,
                  title: editedTitle,
                  body_cue: editedNotice,
                  micro: editedAct,
                  desire: editedReflect,
                });
              }
              onClose();
            }}
          >
            <Text style={[styles.didItText, { color: colors.bg }]}>SAVE CHANGES</Text>
          </TouchableOpacity>
        ) : (
          <View style={styles.actionGrid}>
            {/* Did It Button - full width, prominent */}
            <TouchableOpacity
              style={[styles.actionButton, styles.didItButton, { backgroundColor: colors.accent }]}
              onPress={() => onComplete('did it', note)}
            >
              <Text style={[styles.didItText, { color: colors.bg }]}>DID IT</Text>
            </TouchableOpacity>

            {actionButtons.map((action) => (
              <TouchableOpacity
                key={action}
                style={[
                  styles.actionButton,
                  {
                    backgroundColor: colors.accent + '15',
                    borderColor: colors.accent + '30',
                    borderWidth: 1,
                    opacity: action === 'not relevant' ? 0.7 : 1,
                    width: '48%',
                  },
                ]}
                onPress={() => onComplete(action as any, note)}
              >
                <Text style={[styles.actionText, { color: colors.text }]}>{action}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 0, // Reduced from 6 to shift content up
  },

  title: {
    fontSize: 19,
    fontWeight: '700',
    marginBottom: 4,
    marginTop: 4,
  },
  // Label inside the bubble - centered, same color as text
  inlineLabel: {
    fontSize: 9,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1.2,
    textAlign: 'center',
    marginBottom: 10,
    opacity: 0.6, // Slightly dimmed but same color
  },
  content: {
    flex: 1,
  },
  // Organic glow blocks
  glowBlock: {
    borderRadius: 16,
    padding: 14, // Default padding
    marginBottom: 12, // Base margin (overridden per container)
    borderWidth: 1,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.28,
    shadowRadius: 14,
    elevation: 6,
  },
  largeBlock: {
    minHeight: 70,
  },
  mediumBlock: {
    minHeight: 74,
  },
  smallBlock: {
    minHeight: 66,
  },
  glowText: {
    textAlign: 'center',
  },
  didItButton: {
    width: '100%',
    paddingVertical: 10,
    marginBottom: 5,
    borderRadius: 14,
  },
  didItText: {
    fontSize: 17,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  actionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 4,
  },
  actionButton: {
    borderRadius: 12,
    paddingVertical: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionText: {
    fontSize: 14,
    fontWeight: '500',
  },
  noteInput: {
    minHeight: 26,
    borderRadius: 14,
    padding: 6,
    marginTop: 5,
    marginBottom: 5,
    borderWidth: 1,
    fontSize: 14,
    lineHeight: 19,
  },
  titleInput: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  editableText: {
    minHeight: 40,
  },
});
