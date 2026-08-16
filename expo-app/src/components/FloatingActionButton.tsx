import React from 'react';
import { Pressable, Text, StyleSheet, View } from 'react-native';

export default function FloatingActionButton({ onPress }: { onPress?: () => void }) {
  return (
    <View style={styles.container} pointerEvents="box-none">
      <Pressable onPress={onPress} style={styles.fab}>
        <Text style={styles.plus}>+</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { position: 'absolute', right: 16, bottom: 80 },
  fab: { width: 64, height: 64, borderRadius: 32, backgroundColor: '#1E90FF', alignItems: 'center', justifyContent: 'center', shadowColor: '#000', shadowOpacity: 0.15, elevation: 6 },
  plus: { color: '#fff', fontSize: 36, lineHeight: 36 },
});
