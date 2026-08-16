import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';

export default function CommunityTab() {
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Community</Text>
        <Text style={styles.headerDescription}>
          Connect with others committed to truth and accuracy
        </Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>🌟 Active Discussions</Text>
        <TouchableOpacity style={styles.discussionItem}>
          <Text style={styles.discussionTitle}>Best practices for fact-checking social media</Text>
          <Text style={styles.discussionMeta}>45 replies • 2 hours ago</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.discussionItem}>
          <Text style={styles.discussionTitle}>How to talk to family about misinformation</Text>
          <Text style={styles.discussionMeta}>32 replies • 5 hours ago</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.discussionItem}>
          <Text style={styles.discussionTitle}>Share your success stories</Text>
          <Text style={styles.discussionMeta}>18 replies • 1 day ago</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>🏆 Top Contributors</Text>
        <View style={styles.contributorItem}>
          <View style={styles.contributorAvatar}>
            <Text style={styles.contributorInitial}>S</Text>
          </View>
          <View style={styles.contributorInfo}>
            <Text style={styles.contributorName}>Sarah Johnson</Text>
            <Text style={styles.contributorStats}>1,234 helpful flags</Text>
          </View>
        </View>
        <View style={styles.contributorItem}>
          <View style={styles.contributorAvatar}>
            <Text style={styles.contributorInitial}>M</Text>
          </View>
          <View style={styles.contributorInfo}>
            <Text style={styles.contributorName}>Michael Chen</Text>
            <Text style={styles.contributorStats}>987 helpful flags</Text>
          </View>
        </View>
      </View>

      <TouchableOpacity style={styles.createButton}>
        <Text style={styles.createButtonText}>Start a Discussion</Text>
      </TouchableOpacity>
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
    marginBottom: 20,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 8,
    color: '#111827',
  },
  headerDescription: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
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
  discussionItem: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  discussionTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: '#111827',
    marginBottom: 4,
  },
  discussionMeta: {
    fontSize: 12,
    color: '#6B7280',
  },
  contributorItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  contributorAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#1E90FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  contributorInitial: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16,
  },
  contributorInfo: {
    flex: 1,
  },
  contributorName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 2,
  },
  contributorStats: {
    fontSize: 12,
    color: '#6B7280',
  },
  createButton: {
    backgroundColor: '#1E90FF',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  createButtonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16,
  },
});