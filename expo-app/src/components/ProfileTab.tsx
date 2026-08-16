import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import useAuth from '../hooks/useAuth';

export default function ProfileTab() {
  const auth = useAuth();

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <View style={styles.header}>
        <View style={styles.avatarContainer}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {auth.user?.firstName?.charAt(0) || auth.user?.name?.charAt(0) || 'U'}
            </Text>
          </View>
        </View>
        <Text style={styles.userName}>
          {auth.user?.firstName && auth.user?.lastName
            ? `${auth.user.firstName} ${auth.user.lastName}`
            : auth.user?.name || 'Guest User'}
        </Text>
        <Text style={styles.userEmail}>{auth.user?.email || 'guest@example.com'}</Text>
        {auth.user?.guest && (
          <View style={styles.guestBadge}>
            <Text style={styles.guestBadgeText}>Guest Mode</Text>
          </View>
        )}
      </View>

      {/* Stats Overview */}
      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{auth.user?.linksChecked || 0}</Text>
          <Text style={styles.statLabel}>Links Checked</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{auth.user?.streakDays || 0}</Text>
          <Text style={styles.statLabel}>Day Streak</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{auth.user?.trustScore || 50}%</Text>
          <Text style={styles.statLabel}>Trust Score</Text>
        </View>
      </View>

      {/* Achievements */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>🏆 Achievements</Text>
        <View style={styles.achievementItem}>
          <View style={styles.achievementIcon}>
            <Text style={styles.achievementEmoji}>🔥</Text>
          </View>
          <View style={styles.achievementInfo}>
            <Text style={styles.achievementName}>First Steps</Text>
            <Text style={styles.achievementDesc}>Check your first link</Text>
          </View>
          <Text style={styles.achievementStatus}>✓</Text>
        </View>
        <View style={styles.achievementItem}>
          <View style={styles.achievementIcon}>
            <Text style={styles.achievementEmoji}>🎯</Text>
          </View>
          <View style={styles.achievementInfo}>
            <Text style={styles.achievementName}>Sharp Eye</Text>
            <Text style={styles.achievementDesc}>Identify 5 misleading posts</Text>
          </View>
          <Text style={styles.achievementStatusLocked}>🔒</Text>
        </View>
        <View style={styles.achievementItem}>
          <View style={styles.achievementIcon}>
            <Text style={styles.achievementEmoji}>📚</Text>
          </View>
          <View style={styles.achievementInfo}>
            <Text style={styles.achievementName}>Student</Text>
            <Text style={styles.achievementDesc}>Complete 3 lessons</Text>
          </View>
          <Text style={styles.achievementStatusLocked}>🔒</Text>
        </View>
      </View>

      {/* Settings */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>⚙️ Settings</Text>
        <TouchableOpacity style={styles.settingItem}>
          <Text style={styles.settingText}>Account Settings</Text>
          <Text style={styles.settingArrow}>›</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.settingItem}>
          <Text style={styles.settingText}>Notifications</Text>
          <Text style={styles.settingArrow}>›</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.settingItem}>
          <Text style={styles.settingText}>Privacy</Text>
          <Text style={styles.settingArrow}>›</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.settingItem}>
          <Text style={styles.settingText}>Help & Support</Text>
          <Text style={styles.settingArrow}>›</Text>
        </TouchableOpacity>
      </View>

      {/* Logout Button */}
      {!auth.user?.guest && (
        <TouchableOpacity style={styles.logoutButton}>
          <Text style={styles.logoutButtonText}>Sign Out</Text>
        </TouchableOpacity>
      )}

      {auth.user?.guest && (
        <TouchableOpacity style={styles.upgradeButton}>
          <Text style={styles.upgradeButtonText}>Create Account</Text>
        </TouchableOpacity>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  contentContainer: {
    padding: 16,
  },
  header: {
    alignItems: 'center',
    marginBottom: 24,
  },
  avatarContainer: {
    marginBottom: 16,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#1E90FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: '#fff',
    fontSize: 32,
    fontWeight: '700',
  },
  userName: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 4,
    color: '#111827',
  },
  userEmail: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 8,
  },
  guestBadge: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  guestBadgeText: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '500',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
  },
  statCard: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1E90FF',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#6B7280',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
    color: '#111827',
  },
  achievementItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  achievementIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  achievementEmoji: {
    fontSize: 20,
  },
  achievementInfo: {
    flex: 1,
  },
  achievementName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 2,
  },
  achievementDesc: {
    fontSize: 12,
    color: '#6B7280',
  },
  achievementStatus: {
    fontSize: 16,
    color: '#10B981',
  },
  achievementStatusLocked: {
    fontSize: 16,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  settingText: {
    fontSize: 14,
    color: '#111827',
  },
  settingArrow: {
    fontSize: 20,
    color: '#6B7280',
  },
  logoutButton: {
    backgroundColor: '#EF4444',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 16,
  },
  logoutButtonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16,
  },
  upgradeButton: {
    backgroundColor: '#1E90FF',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  upgradeButtonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16,
  },
});