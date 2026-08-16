import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, View, Text, Pressable, SafeAreaView } from 'react-native';
import { TabType } from '../screens/Home';

interface SidebarDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (tab: TabType) => void;
  activeTab: TabType;
}

export default function SidebarDrawer({ isOpen, onClose, onSelect, activeTab }: SidebarDrawerProps) {
  const translateX = useRef(new Animated.Value(-300)).current;

  useEffect(() => {
    Animated.timing(translateX, { toValue: isOpen ? 0 : -300, duration: 250, useNativeDriver: true }).start();
  }, [isOpen]);

  const menuItems = [
    { id: 'feed' as TabType, label: 'Feed', icon: '🏠' },
    { id: 'link-checker' as TabType, label: 'Link Checker', icon: '🔍' },
    { id: 'pause-nudges' as TabType, label: 'Pause Nudges', icon: '⏸️' },
    { id: 'learn' as TabType, label: 'Learn', icon: '📚' },
    { id: 'community' as TabType, label: 'Community', icon: '👥' },
    { id: 'social-companion' as TabType, label: 'Social Companion', icon: '🤖' },
    { id: 'advanced-ai' as TabType, label: 'Advanced AI', icon: '🧠' },
    { id: 'profile' as TabType, label: 'Profile', icon: '👤' },
  ];

  return (
    <>
      {isOpen && <Pressable style={styles.overlay} onPress={onClose} />}

      <Animated.View style={[styles.drawer, { transform: [{ translateX }] }] }>
        <SafeAreaView>
          <View style={styles.header}>
            <View style={styles.logo}>
              <Text style={styles.logoText}>🛡️</Text>
            </View>
            <Text style={styles.title}>PPP</Text>
            <Text style={styles.subtitle}>Pause, Prove & Protect</Text>
          </View>

          <View style={styles.nav}>
            {menuItems.map((item) => (
              <Pressable 
                key={item.id} 
                onPress={() => { onSelect(item.id); onClose(); }} 
                style={[styles.navItem, activeTab === item.id && styles.navItemActive]}
              >
                <Text style={styles.navIcon}>{item.icon}</Text>
                <Text style={[styles.navText, activeTab === item.id && styles.navTextActive]}>
                  {item.label}
                </Text>
                {activeTab === item.id && <Text style={styles.activeIndicator}>✓</Text>}
              </Pressable>
            ))}
          </View>

          <View style={styles.footer}>
            <Pressable onPress={onClose} style={styles.closeBtn}>
              <Text style={styles.closeText}>Close Menu</Text>
            </Pressable>
          </View>
        </SafeAreaView>
      </Animated.View>
    </>
  );
}

const styles = StyleSheet.create({
  overlay: { 
    position: 'absolute', 
    top: 0, 
    left: 0, 
    right: 0, 
    bottom: 0, 
    backgroundColor: '#000', 
    opacity: 0.4 
  },
  drawer: { 
    position: 'absolute', 
    left: 0, 
    top: 0, 
    bottom: 0, 
    width: 300, 
    backgroundColor: '#fff', 
    shadowColor: '#000', 
    shadowOpacity: 0.1, 
    elevation: 6 
  },
  header: { 
    padding: 20, 
    borderBottomWidth: 1, 
    borderBottomColor: '#F3F4F6',
  },
  logo: { 
    width: 48, 
    height: 48, 
    borderRadius: 12, 
    backgroundColor: '#1E90FF', 
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  logoText: {
    fontSize: 24,
  },
  title: { 
    fontSize: 20, 
    fontWeight: '700',
    color: '#111827',
  },
  subtitle: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 4,
  },
  nav: { 
    paddingHorizontal: 12, 
    paddingTop: 8,
    flex: 1,
  },
  navItem: { 
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14, 
    paddingHorizontal: 12,
    borderBottomWidth: 1, 
    borderBottomColor: '#F3F4F6',
  },
  navItemActive: {
    backgroundColor: '#EFF6FF',
    borderLeftWidth: 3,
    borderLeftColor: '#1E90FF',
  },
  navIcon: {
    fontSize: 20,
    marginRight: 12,
    width: 24,
  },
  navText: { 
    fontSize: 15,
    color: '#374151',
    flex: 1,
  },
  navTextActive: {
    color: '#1E90FF',
    fontWeight: '600',
  },
  activeIndicator: {
    color: '#1E90FF',
    fontWeight: '700',
  },
  footer: { 
    paddingHorizontal: 12, 
    paddingBottom: 24,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  closeBtn: { 
    padding: 14, 
    alignItems: 'center', 
    backgroundColor: '#F3F4F6', 
    borderRadius: 10 
  },
  closeText: { 
    color: '#111827', 
    fontWeight: '600',
    fontSize: 14,
  },
});
