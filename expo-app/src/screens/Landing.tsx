import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Pressable, Animated } from 'react-native';
import { useNavigation } from '@react-navigation/native';

export default function Landing() {
  const navigation = useNavigation();
  const [isVisible] = useState(new Animated.Value(0));

  useEffect(() => {
    Animated.timing(isVisible, { toValue: 1, duration: 1000, useNativeDriver: true }).start();
  }, []);

  const handleContinue = () => {
    navigation.navigate('Auth' as any);
  };

  return (
    <Animated.View style={[styles.container, { opacity: isVisible }]}>
      <View style={styles.logoContainer}>
        <View style={styles.logo}>
          <Text style={styles.logoText}>🛡️</Text>
        </View>
      </View>
      
      <Text style={styles.title}>Welcome to PPP</Text>
      <Text style={styles.subtitle}>
        An interactive tool that helps you pause, verify, and protect yourself from misinformation.
      </Text>
      
      <Pressable 
        style={styles.button} 
        onPress={handleContinue}
      >
        <Text style={styles.buttonText}>Continue</Text>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#1E90FF', 
    alignItems: 'center', 
    justifyContent: 'center', 
    padding: 20,
  },
  logoContainer: {
    marginBottom: 32,
  },
  logo: { 
    width: 80, 
    height: 80, 
    borderRadius: 40, 
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
  },
  logoText: {
    fontSize: 40,
  },
  title: { 
    color: '#fff', 
    fontSize: 32, 
    fontWeight: '700', 
    marginBottom: 12,
    textAlign: 'center',
  },
  subtitle: { 
    color: '#DDEEFF', 
    fontSize: 16, 
    textAlign: 'center', 
    marginBottom: 32,
    lineHeight: 24,
    paddingHorizontal: 20,
  },
  button: { 
    backgroundColor: '#fff', 
    paddingVertical: 16, 
    paddingHorizontal: 32, 
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  buttonText: { 
    color: '#1E90FF', 
    fontWeight: '700',
    fontSize: 16,
  },
});
