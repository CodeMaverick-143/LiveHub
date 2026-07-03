// @ts-nocheck
import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Platform, Alert } from 'react-native';
import { AlertButton, AlertState } from './types';


interface AlertContextType {
  showAlert: (title: string, message?: string, buttons?: AlertButton[]) => void;
}


const AlertContext = createContext<AlertContextType | undefined>(undefined);


interface AlertProviderProps {
  children: ReactNode;
}

export function AlertProvider({ children }: AlertProviderProps) {
  const [alertState, setAlertState] = useState<AlertState>({
    visible: false,
    title: '',
    message: '',
    buttons: []
  });

  const showAlert = (
    title: string,
    message?: string,
    buttons?: AlertButton[]
  ) => {
    
    const normalizedMessage = message || '';
    const normalizedButtons = buttons?.length ? buttons : [{ 
      text: 'OK',
      onPress: () => {}
    }];

    if (Platform.OS === 'web') {
      
      setAlertState({
        visible: true,
        title,
        message: normalizedMessage,
        buttons: normalizedButtons
      });
    } else {
      
      const alertButtons = normalizedButtons.map(button => ({
        text: button.text,
        onPress: button.onPress,
        style: button.style
      }));
      
      Alert.alert(title, normalizedMessage, alertButtons);
    }
  };

  const hideAlert = () => {
    setAlertState(prev => ({ ...prev, visible: false }));
  };

  const handleButtonPress = (button: AlertButton) => {
    try {
      
      if (typeof button.onPress === 'function') {
        button.onPress();
      }
      
      hideAlert();
    } catch (error) {
      console.warn('[Template:AlertProvider] Button press error:', error);
      hideAlert();
    }
  };

  const contextValue: AlertContextType = {
    showAlert
  };

  return (
    <AlertContext.Provider value={contextValue}>
      {children}
      {Platform.OS === 'web' && (
        <WebAlertModal
          alertState={alertState}
          onButtonPress={handleButtonPress}
          onHide={hideAlert}
        />
      )}
    </AlertContext.Provider>
  );
}


export function useAlertContext(): AlertContextType {
  const context = useContext(AlertContext);
  
  if (context === undefined) {
    throw new Error('useAlertContext must be used within an AlertProvider');
  }
  
  return context;
}


import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';

interface WebAlertModalProps {
  alertState: AlertState;
  onButtonPress: (button: AlertButton) => void;
  onHide: () => void;
}

function WebAlertModal({ alertState, onButtonPress, onHide }: WebAlertModalProps) {
  if (!alertState.visible) {
    return null;
  }

  
  const getButtonStyle = (button: AlertButton, index: number) => {
    const isLast = index === alertState.buttons.length - 1;
    const baseStyle = [styles.button];
    
    if (alertState.buttons.length > 1 && !isLast) {
      baseStyle.push(styles.buttonWithBorder);
    }
    
    return baseStyle;
  };

  
  const getButtonTextStyle = (button: AlertButton) => {
    switch (button.style) {
      case 'cancel':
        return styles.cancelButtonText;
      case 'destructive':
        return styles.destructiveButtonText;
      default:
        return styles.defaultButtonText;
    }
  };

  return (
    <Modal visible={alertState.visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.container}>
          <View style={styles.content}>
            <Text style={styles.title}>{alertState.title}</Text>
            {alertState.message ? (
              <Text style={styles.message}>{alertState.message}</Text>
            ) : null}
          </View>
          
          <View style={styles.buttonContainer}>
            {alertState.buttons.length === 1 ? (
              
              <TouchableOpacity 
                style={[styles.button, styles.singleButton]}
                onPress={() => onButtonPress(alertState.buttons[0])}
                activeOpacity={0.8}
              >
                <Text style={getButtonTextStyle(alertState.buttons[0])}>
                  {alertState.buttons[0].text}
                </Text>
              </TouchableOpacity>
            ) : (
              
              <View style={styles.multiButtonContainer}>
                {alertState.buttons.map((button, index) => (
                  <TouchableOpacity
                    key={index}
                    style={getButtonStyle(button, index)}
                    onPress={() => onButtonPress(button)}
                    activeOpacity={0.8}
                  >
                    <Text style={getButtonTextStyle(button)}>
                      {button.text}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  container: {
    backgroundColor: '#16181D',
    borderRadius: 12,
    minWidth: 280,
    maxWidth: 420,
    borderWidth: 1,
    borderColor: '#23262E',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.25,
        shadowRadius: 20,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  content: {
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 20,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#F8FAFC',
    marginBottom: 8,
    textAlign: 'center',
    letterSpacing: -0.2,
  },
  message: {
    fontSize: 14,
    color: '#94A3B8',
    textAlign: 'center',
    lineHeight: 19,
  },
  buttonContainer: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#23262E',
  },
  multiButtonContainer: {
    flexDirection: 'row',
  },
  button: {
    paddingVertical: 15,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 52,
    flex: 1,
    backgroundColor: 'transparent',
  },
  singleButton: {
    flex: 0,
    width: '100%',
  },
  buttonWithBorder: {
    borderRightWidth: StyleSheet.hairlineWidth,
    borderRightColor: '#23262E',
  },
  defaultButtonText: {
    color: '#5E6AD2',
    fontSize: 15,
    fontWeight: '600',
  },
  cancelButtonText: {
    color: '#94A3B8',
    fontSize: 15,
    fontWeight: '400',
  },
  destructiveButtonText: {
    color: '#EF4444',
    fontSize: 15,
    fontWeight: '600',
  },
});