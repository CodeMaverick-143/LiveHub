import React from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { StyleSheet } from 'react-native';

interface Props {
  children: React.ReactNode;
}

export default function GestureProvider({ children }: Props) {
  return (
    <GestureHandlerRootView style={styles.root}>
      {children}
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
});
