import React from 'react';
import { Modal as ReactNativeModal, View, StyleSheet, TouchableWithoutFeedback } from 'react-native';

interface Props {
  isVisible: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

export const Modal = ({ isVisible, onClose, children }: Props) => {
  return (
    <ReactNativeModal
      animationType="slide"
      transparent={true}
      visible={isVisible}
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.centeredView}>
          <TouchableWithoutFeedback>
            <View style={styles.modalView}>
              {children}
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </ReactNativeModal>
  );
};

const styles = StyleSheet.create({
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)', // Dim the background
  },
  modalView: {
    margin: 20,
    borderRadius: 20,
    overflow: 'hidden', // Clip content to the rounded corners
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    width: '90%', // Set a width to the modal
    maxWidth: 640, // Max width for larger screens
    maxHeight: '88%', // Guard on very long content
    alignSelf: 'center', // Center the card
    // NO flex: 1 - allow content-driven height
    flexGrow: 0,
    flexShrink: 1,
  },
});

