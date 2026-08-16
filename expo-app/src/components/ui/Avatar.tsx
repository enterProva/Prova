import React from 'react';
import { View, Image, Text, StyleSheet, ImageStyle, ViewStyle } from 'react-native';

interface AvatarProps extends React.ComponentProps<typeof View> {
  src?: string;
  size?: number;
  initials?: string;
}

export default function Avatar({ src, size = 40, initials, style, ...props }: AvatarProps) {
  return (
    <View style={[{ width: size, height: size, borderRadius: size / 2, overflow: 'hidden', backgroundColor: '#F3F4F6', alignItems: 'center', justifyContent: 'center' }, style as ViewStyle]} {...props}>
      {src ? <Image source={{ uri: src }} style={{ width: size, height: size } as ImageStyle} /> : <Text style={styles.text}>{initials || 'U'}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({ text: { color: '#374151', fontWeight: '700' } });
