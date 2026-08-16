import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';

export default function PauseNudgesTab() {
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Pause Nudges</Text>
        <Text style={styles.headerDescription}>
          Take a moment to reflect before sharing content
        </Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>🤔 Think Before You Share</Text>
        <Text style={styles.cardContent}>
          Before sharing that article or post, take a moment to consider:
        </Text>
        <View style={styles.bulletPoints}>
          <Text style={styles.bullet}>• Is the source credible?</Text>
          <Text style={styles.bullet}>• Have you verified the claims?</Text>
          <Text style={styles.bullet}>• Could this be misleading?</Text>
          <Text style={styles.bullet}>• What's the intent behind this content?</Text>
        </View>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>⏱️ The 3-Second Rule</Text>
        <Text style={styles.cardContent}>
          Take 3 seconds to pause and reflect before hitting share. This simple habit can dramatically reduce the spread of misinformation.
        </Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>📊 Your Pause Stats</Text>
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>12</Text>
            <Text style={styles.statLabel}>Pauses Taken</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>8</Text>
            <Text style={styles.statLabel}>Shares Avoided</Text>
          </View>
        </View>
      </View>
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
  cardContent: {
    fontSize: 14,
    color: '#374151',
    lineHeight: 20,
    marginBottom: 12,
  },
  bulletPoints: {
    marginTop: 8,
  },
  bullet: {
    fontSize: 14,
    color: '#374151',
    marginBottom: 8,
    lineHeight: 20,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 8,
  },
  statItem: {
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
});