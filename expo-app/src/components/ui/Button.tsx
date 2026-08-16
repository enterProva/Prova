import React from 'react';
import { Pressable, Text, StyleSheet, ViewStyle, TextStyle } from 'react-native';

interface ButtonProps extends React.ComponentProps<typeof Pressable> {
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
  style?: ViewStyle | ViewStyle[];
}

export default function Button({ variant = 'default', size = 'md', children, style, ...props }: ButtonProps) {
  return (
    <Pressable style={[styles.button, styles[variant as keyof typeof styles], styles[size as keyof typeof styles], style]} {...props}>
      <Text style={[styles.text, variant === 'default' ? styles.textPrimary : styles.textSecondary]}>{children}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: { alignItems: 'center', justifyContent: 'center', borderRadius: 10 },
  default: { backgroundColor: '#1E90FF' },
  outline: { backgroundColor: '#fff', borderWidth: 1, borderColor: '#E5E7EB' },
  ghost: { backgroundColor: 'transparent' },
  sm: { paddingVertical: 8, paddingHorizontal: 12 },
  md: { paddingVertical: 12, paddingHorizontal: 16 },
  lg: { paddingVertical: 16, paddingHorizontal: 20 },
  text: { fontWeight: '700' },
  textPrimary: { color: '#fff' },
  textSecondary: { color: '#374151' },
});
