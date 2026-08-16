import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';

interface BadgeProps {
  children: React.ReactNode;
  style?: ViewStyle;
}

export default function Badge({ children, style }: BadgeProps) {
  return (
    <View style={[styles.badge, style]}>
      <Text style={styles.text}>{children}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: { backgroundColor: '#F3F4F6', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  text: { color: '#374151', fontSize: 12, fontWeight: '600' },
});
