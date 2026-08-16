import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import useAuth from '../hooks/useAuth';

export default function AuthSelection() {
  const navigation = useNavigation();
  const { isAuthenticated, isGuest, setIsGuest } = useAuth();
  const hasNavigated = useRef(false);

  // Redirect to Home if authenticated or in guest mode (run once)
  useEffect(() => {
    if (isAuthenticated && isGuest && !hasNavigated.current) {
      hasNavigated.current = true;
      navigation.navigate('Home' as any);
    }
  }, [isAuthenticated, isGuest, navigation]);

  const handleLogin = () => {
    // TODO: Implement real authentication with backend
    // For now, just navigate to Home
    navigation.navigate('Home' as any);
  };

  const handleGuestMode = async () => {
    await setIsGuest(true);
    navigation.navigate('Home' as any);
  };

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <View style={styles.iconContainer}>
          <Text style={styles.icon}>🛡️</Text>
        </View>
        <Text style={styles.title}>Get Started</Text>
        <Text style={styles.subtitle}>Choose how you'd like to proceed</Text>

        <Pressable style={[styles.button, styles.primary]} onPress={handleLogin}>
          <Text style={styles.primaryText}>👤 Login / Sign Up</Text>
        </Pressable>

        <Pressable style={[styles.button, styles.outline]} onPress={handleGuestMode}>
          <Text style={styles.outlineText}>👁️ Continue as Guest</Text>
        </Pressable>

        <Text style={styles.hint}>Guest mode has limited features</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    alignItems: 'center', 
    justifyContent: 'center', 
    padding: 20, 
    backgroundColor: '#F3F4F6' 
  },
  card: { 
    width: '100%', 
    maxWidth: 420, 
    backgroundColor: '#fff', 
    padding: 24, 
    borderRadius: 12, 
    shadowColor: '#000', 
    shadowOpacity: 0.05, 
    shadowRadius: 6,
    elevation: 4,
  },
  iconContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  icon: {
    fontSize: 48,
  },
  title: { 
    fontSize: 22, 
    fontWeight: '700', 
    marginBottom: 8,
    textAlign: 'center',
    color: '#111827',
  },
  subtitle: { 
    color: '#6B7280', 
    marginBottom: 24,
    textAlign: 'center',
    fontSize: 14,
  },
  button: { 
    paddingVertical: 14, 
    paddingHorizontal: 10, 
    borderRadius: 12, 
    marginTop: 12, 
    alignItems: 'center',
  },
  primary: { 
    backgroundColor: '#1E90FF' 
  },
  primaryText: { 
    color: '#fff', 
    fontWeight: '700',
    fontSize: 16,
  },
  outline: { 
    borderWidth: 1, 
    borderColor: '#E5E7EB', 
    backgroundColor: '#fff' 
  },
  outlineText: { 
    color: '#374151', 
    fontWeight: '600',
    fontSize: 16,
  },
  hint: {
    color: '#9CA3AF',
    fontSize: 12,
    textAlign: 'center',
    marginTop: 16,
  },
});
