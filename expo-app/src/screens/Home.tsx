import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable, SafeAreaView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import FeedTab from '../components/FeedTab';
import LinkCheckerTab from '../components/LinkCheckerTab';
import PauseNudgesTab from '../components/PauseNudgesTab';
import LearnTab from '../components/LearnTab';
import CommunityTab from '../components/CommunityTab';
import SocialCompanionTab from '../components/SocialCompanionTab';
import AdvancedAITab from '../components/AdvancedAITab';
import ProfileTab from '../components/ProfileTab';
import SidebarDrawer from '../components/SidebarDrawer';
import QuickCheckModal from '../components/QuickCheckModal';
import FloatingActionButton from '../components/FloatingActionButton';
import useAuth from '../hooks/useAuth';

export type TabType = 'feed' | 'link-checker' | 'pause-nudges' | 'learn' | 'community' | 'social-companion' | 'advanced-ai' | 'profile';

export default function Home() {
  const [activeTab, setActiveTab] = useState<TabType>('feed');
  const navigation = useNavigation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [quickCheckOpen, setQuickCheckOpen] = useState(false);
  const auth = useAuth();

  const renderActiveTab = () => {
    switch (activeTab) {
      case 'feed':
        return <FeedTab />;
      case 'link-checker':
        return <LinkCheckerTab />;
      case 'pause-nudges':
        return <PauseNudgesTab />;
      case 'learn':
        return <LearnTab />;
      case 'community':
        return <CommunityTab />;
      case 'social-companion':
        return <SocialCompanionTab />;
      case 'advanced-ai':
        return <AdvancedAITab />;
      case 'profile':
        return <ProfileTab />;
      default:
        return <FeedTab />;
    }
  };

  const getTabLabel = (tab: TabType) => {
    const labels: Record<TabType, string> = {
      'feed': 'Feed',
      'link-checker': 'Check',
      'pause-nudges': 'Pause',
      'learn': 'Learn',
      'community': 'Community',
      'social-companion': 'AI',
      'advanced-ai': 'Advanced',
      'profile': 'Profile',
    };
    return labels[tab];
  };

  const getTabIcon = (tab: TabType) => {
    const icons: Record<TabType, string> = {
      'feed': '🏠',
      'link-checker': '🔍',
      'pause-nudges': '⏸️',
      'learn': '📚',
      'community': '👥',
      'social-companion': '🤖',
      'advanced-ai': '🧠',
      'profile': '👤',
    };
    return icons[tab];
  };

  const bottomNavTabs: TabType[] = ['feed', 'link-checker', 'pause-nudges', 'learn', 'profile'];

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={styles.logo}>
            <Text style={styles.logoText}>🛡️</Text>
          </View>
          <Text style={styles.headerTitle}>PPP</Text>
        </View>
        <Pressable onPress={() => setSidebarOpen(true)}>
          <Text style={styles.headerAction}>☰</Text>
        </Pressable>
      </View>

      <View style={styles.content}>
        {renderActiveTab()}
      </View>

      <View style={styles.bottomNav}>
        {bottomNavTabs.map((tab) => (
          <Pressable 
            key={tab} 
            onPress={() => setActiveTab(tab)} 
            style={[styles.tabButton, activeTab === tab && styles.tabActive]}
          >
            <Text style={styles.tabIcon}>{getTabIcon(tab)}</Text>
            <Text style={activeTab === tab ? styles.tabTextActive : styles.tabText}>
              {getTabLabel(tab)}
            </Text>
          </Pressable>
        ))}
      </View>

      <SidebarDrawer 
        isOpen={sidebarOpen} 
        onClose={() => setSidebarOpen(false)} 
        onSelect={(tab) => {
          setActiveTab(tab as TabType);
          setSidebarOpen(false);
        }} 
        activeTab={activeTab}
      />

      <FloatingActionButton onPress={() => setQuickCheckOpen(true)} />

      <QuickCheckModal 
        isOpen={quickCheckOpen} 
        onClose={() => setQuickCheckOpen(false)} 
        onCheckComplete={() => { 
          setQuickCheckOpen(false); 
          setActiveTab('link-checker'); 
        }} 
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFB' },
  header: { 
    height: 56, 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'space-between', 
    paddingHorizontal: 16, 
    borderBottomWidth: 1, 
    borderBottomColor: '#E5E7EB',
    backgroundColor: '#fff',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logo: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#1E90FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  logoText: {
    fontSize: 18,
  },
  headerTitle: { fontSize: 18, fontWeight: '700', color: '#111827' },
  headerAction: { fontSize: 24, color: '#1E90FF' },
  content: { flex: 1 },
  bottomNav: { 
    flexDirection: 'row', 
    borderTopWidth: 1, 
    borderTopColor: '#E5E7EB', 
    paddingVertical: 8,
    backgroundColor: '#fff',
  },
  tabButton: { 
    flex: 1, 
    alignItems: 'center', 
    paddingVertical: 8,
  },
  tabActive: { backgroundColor: '#EFF6FF' },
  tabIcon: {
    fontSize: 20,
    marginBottom: 4,
  },
  tabText: { 
    color: '#6B7280', 
    fontSize: 12,
    fontWeight: '500',
  },
  tabTextActive: { 
    color: '#1E90FF', 
    fontWeight: '700',
    fontSize: 12,
  },
});
