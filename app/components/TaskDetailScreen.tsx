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
  
  // Breathing animation for action buttons
  const breathScale = useRef(new Animated.Value(1)).current;
  const breathOpacity = useRef(new Animated.Value(0.8)).current;
  
  useEffect(() => {
    // Create continuous breathing animation with both scale and opacity
    const breathing = Animated.loop(
      Animated.parallel([
        Animated.sequence([
          Animated.timing(breathScale, {
            toValue: 1.05,
            duration: 1800,
            useNativeDriver: true,
          }),
          Animated.timing(breathScale, {
            toValue: 1,
            duration: 1800,
            useNativeDriver: true,
          }),
        ]),
        Animated.sequence([
          Animated.timing(breathOpacity, {
            toValue: 1,
            duration: 1800,
            useNativeDriver: true,
          }),
          Animated.timing(breathOpacity, {
            toValue: 0.8,
            duration: 1800,
            useNativeDriver: true,
          }),
        ]),
      ])
    );
    breathing.start();
    return () => breathing.stop();
  }, []);
  
  const timeGlow = getTimeGlowStyle(container);

  // Get dynamic font sizes for each text field
  const noticeFontStyle = getDynamicFontSize(item.body_cue || '', 18, 26);
  const actFontStyle = getDynamicFontSize(item.micro || '', 17, 24);
  const reflectFontStyle = getDynamicFontSize(item.desire || '', 16, 23);

  return (
    <View style={[styles.container, { backgroundColor: colors.bg, paddingBottom: 0 }]}>
      <TouchableOpacity style={styles.backButton} onPress={onClose}>
        <Text style={[styles.backText, { color: colors.text }]}>← back</Text>
      </TouchableOpacity>

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
            marginBottom: container === 'morning' ? 10 : container === 'afternoon' ? 10 : container === 'evening' ? 19 : 14, // Container-specific spacing - reduced for morning/afternoon to fit all 4 buttons
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
            marginBottom: container === 'morning' ? 10 : container === 'afternoon' ? 10 : container === 'evening' ? 19 : 14,
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
              marginBottom: container === 'morning' ? 10 : container === 'afternoon' ? 10 : container === 'evening' ? 19 : 14,
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
              <Animated.View
                key={action}
                style={{
                  width: '48%',
                  transform: [{ scale: breathScale }],
                  opacity: breathOpacity,
                }}
              >
                <TouchableOpacity
                  style={[
                    styles.actionButton,
                    {
                      backgroundColor: colors.accent + '15',
                      borderColor: colors.accent + '30',
                      borderWidth: 1,
                      opacity: action === 'not relevant' ? 0.7 : 1,
                      width: '100%',
                    },
                  ]}
                  onPress={() => onComplete(action as any, note)}
                >
                  <Text style={[styles.actionText, { color: colors.text }]}>{action}</Text>
                </TouchableOpacity>
              </Animated.View>
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
  backButton: {
    paddingVertical: 2, // Reduced from 4
    marginBottom: 2, // Reduced from 4
  },
  backText: {
    fontSize: 16,
    fontWeight: '500',
  },
  title: {
    fontSize: 20, // Reduced from 22
    fontWeight: '700',
    marginBottom: 2, // Reduced from 4
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
    padding: 14, // Reduced for morning/afternoon
    marginBottom: 12, // Base margin (overridden per container)
    borderWidth: 1,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.28,
    shadowRadius: 14,
    elevation: 6,
  },
  largeBlock: {
    minHeight: 75, // Reduced to fit all buttons
  },
  mediumBlock: {
    minHeight: 80, // Reduced to fit all buttons
  },
  smallBlock: {
    minHeight: 70, // Reduced to fit all buttons
  },
  glowText: {
    textAlign: 'center',
  },
  didItButton: {
    width: '100%',
    paddingVertical: 12,
    marginBottom: 8, // Reduced to remove extra space
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
    gap: 6,
  },
  actionButton: {
    borderRadius: 12,
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionText: {
    fontSize: 14,
    fontWeight: '500',
  },
  noteInput: {
    minHeight: 32, // Reduced for morning/afternoon
    borderRadius: 14,
    padding: 8, // Reduced for morning/afternoon
    marginTop: 8, // Reduced for morning/afternoon
    marginBottom: 8, // Reduced for morning/afternoon
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
