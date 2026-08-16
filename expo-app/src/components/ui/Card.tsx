import React from 'react';
import { View, StyleSheet } from 'react-native';

interface CardProps extends React.ComponentProps<typeof View> {
  children?: React.ReactNode;
}

export const Card: React.FC<CardProps> = ({ children, style, ...props }) => {
  return (
    <View style={[styles.card, style]} {...props}>
      {children}
    </View>
  );
};

export const CardContent: React.FC<CardProps> = ({ children, style, ...props }) => (
  <View style={[styles.content, style]} {...props}>{children}</View>
);

const styles = StyleSheet.create({
  card: { backgroundColor: '#fff', borderRadius: 12, shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 8, elevation: 2, marginBottom: 12 },
  content: { padding: 12 },
});

export default Card;
