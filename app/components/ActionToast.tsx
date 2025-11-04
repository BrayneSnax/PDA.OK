import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';
import { ColorScheme, ContainerId } from '../constants/Types';

type ActionType = 'did it' | 'skipped' | 'forgot' | 'couldn\'t' | 'not relevant';

interface ActionToastProps {
  isVisible: boolean;
  actionType: ActionType;
  colors: ColorScheme;
  container: ContainerId;
  onDismiss: () => void;
}

// Warm exhale messages for each action type
const warmExhaleMessages: Record<ActionType, string[]> = {
  'did it': [
    'Completion hums softly through the weave.',
    'The field takes notice; a small current turns.',
    'You touched the thread and it remembered you.',
    'The act lands; resonance thickens.',
    'One quiet hinge opens a wider door.',
    'Momentum gathers exactly where you are.',
    'A simple Yes ripples the system.',
    'Presence clicks into place; carry on.',
  ],
  'skipped': [
    'Not this one; the cadence continues.',
    'You stayed with what was real.',
    'Skipping is also a rhythm.',
    'The wave passed; another will rise.',
    'You chose space over friction.',
    'The field adjusts without judgment.',
  ],
  'forgot': [
    'Memory blinked; the thread is still here.',
    'No worry—attention will circle back.',
    'The moment slid by; we can set a softer bell.',
    'Forgetting is human; coherence remains.',
    'A small lapse, not a verdict.',
  ],
  "couldn't": [
    'Limits were true; the system listened.',
    'Today asked too much—thanks for naming it.',
    'The body said "not now"; we honor that.',
    'Constraint acknowledged; no penalty.',
    'A smaller step might fit next time.',
  ],
  'not relevant': [
    'Right call; this one didn\'t belong.',
    'Relevance is a form of care.',
    'Alignment over obligation—good.',
    'The field stays clean when you say no.',
    'Clarity protects attention.',
  ],
};

// Track message indices for rotation
const messageIndices: Record<ActionType, number> = {
  'did it': 0,
  'skipped': 0,
  'forgot': 0,
  "couldn't": 0,
  'not relevant': 0,
};

// Get message and duration for each action type
const getActionConfig = (actionType: ActionType) => {
  const messages = warmExhaleMessages[actionType] || warmExhaleMessages['did it'];
  const currentIndex = messageIndices[actionType];
  const message = messages[currentIndex];
  
  // Rotate to next message
  messageIndices[actionType] = (currentIndex + 1) % messages.length;
  
  const configs: Record<ActionType, { duration: number; animation: string }> = {
    'did it': {
      duration: 2000,
      animation: 'fade',
    },
    'skipped': {
      duration: 1800,
      animation: 'ripple',
    },
    'forgot': {
      duration: 2000,
      animation: 'shimmer',
    },
    "couldn't": {
      duration: 2000,
      animation: 'dim',
    },
    'not relevant': {
      duration: 1800,
      animation: 'horizontal-shimmer',
    },
  };

  return { message, ...configs[actionType] };
};

// Get time-of-day background color for toast
const getToastBackground = (container: ContainerId) => {
  const backgrounds = {
    morning: '#D4A574E6',
    afternoon: '#5FA8B8E6',
    evening: '#E8B4A8E6',
    late: '#8B9DC3E6',
  };
  return backgrounds[container] || backgrounds.morning;
};

export const ActionToast: React.FC<ActionToastProps> = ({ 
  isVisible, 
  actionType,
  colors,
  container,
  onDismiss 
}) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current; // Slide up from bottom
  const scaleAnim = useRef(new Animated.Value(0.95)).current;
  const shimmerAnim = useRef(new Animated.Value(0)).current;

  const config = getActionConfig(actionType);

  useEffect(() => {
    if (isVisible) {
      // Reset animations
      fadeAnim.setValue(0);
      slideAnim.setValue(20);
      scaleAnim.setValue(0.95);
      shimmerAnim.setValue(0);

      // Fade in and slide up gently
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();

      // Shimmer effect for "forgot" action
      if (config.animation === 'shimmer') {
        Animated.sequence([
          Animated.timing(shimmerAnim, {
            toValue: 1,
            duration: 400,
            useNativeDriver: true,
          }),
          Animated.timing(shimmerAnim, {
            toValue: 0,
            duration: 400,
            useNativeDriver: true,
          }),
        ]).start();
      }

      // Horizontal shimmer for "not relevant" - single pass
      if (config.animation === 'horizontal-shimmer') {
        Animated.timing(shimmerAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }).start();
      }

      // Auto-dismiss based on action duration
      const timer = setTimeout(() => {
        dismissToast();
      }, config.duration);

      return () => clearTimeout(timer);
    }
  }, [isVisible, actionType]);

  const dismissToast = () => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 400,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 20,
        duration: 400,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 0.95,
        duration: 400,
        useNativeDriver: true,
      }),
    ]).start(() => {
      onDismiss();
    });
  };

  if (!isVisible && fadeAnim._value === 0) return null;

  // Apply different opacity based on animation type
  const getOpacityStyle = () => {
    if (config.animation === 'dim') {
      return fadeAnim.interpolate({
        inputRange: [0, 1],
        outputRange: [0, 0.85], // Slightly dimmed
      });
    }
    if (config.animation === 'fade-through') {
      return fadeAnim.interpolate({
        inputRange: [0, 0.5, 1],
        outputRange: [0, 1, 0], // Fade in then out
      });
    }
    return fadeAnim;
  };

  return (
    <Animated.View
      style={[
        styles.container,
        {
          opacity: getOpacityStyle(),
          transform: [
            { translateY: slideAnim },
            { scale: scaleAnim },
          ],
        },
      ]}
    >
      <View
        style={[
          styles.toast,
          { 
            backgroundColor: getToastBackground(container),
            borderColor: colors.accent + '30',
          },
        ]}
      >
        {/* Shimmer overlay for "forgot" */}
        {config.animation === 'shimmer' && (
          <Animated.View
            style={[
              styles.shimmerOverlay,
              {
                opacity: shimmerAnim,
                backgroundColor: colors.accent + '20',
              },
            ]}
          />
        )}

        {/* Horizontal shimmer for "not relevant" */}
        {config.animation === 'horizontal-shimmer' && (
          <Animated.View
            style={[
              styles.horizontalShimmer,
              {
                opacity: shimmerAnim.interpolate({
                  inputRange: [0, 0.5, 1],
                  outputRange: [0, 0.4, 0],
                }),
                transform: [
                  {
                    translateX: shimmerAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [-200, 200],
                    }),
                  },
                ],
              },
            ]}
          />
        )}
        
        <Text style={[styles.text, { color: colors.text }]}>
          {config.message}
        </Text>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 100,
    left: 20,
    right: 20,
    zIndex: 1001,
    alignItems: 'center',
  },
  toast: {
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 16,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 2,
    overflow: 'hidden',
  },
  text: {
    fontSize: 13,
    fontWeight: '500',
    fontStyle: 'italic',
    letterSpacing: 0.2,
    textAlign: 'center',
    lineHeight: 18,
  },
  shimmerOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 16,
  },
  horizontalShimmer: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: 100,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
  },
});
