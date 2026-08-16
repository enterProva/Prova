import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';

export default function SocialCompanionTab() {
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Social Companion</Text>
        <Text style={styles.headerDescription}>
          Your AI assistant for navigating social media safely
        </Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>🤖 AI Assistant</Text>
        <Text style={styles.cardContent}>
          I'm here to help you identify potential misinformation, verify claims, and make informed decisions about what you see online.
        </Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>💬 Quick Questions</Text>
        <View style={styles.questionItem}>
          <Text style={styles.question}>• "Is this news story credible?"</Text>
        </View>
        <View style={styles.questionItem}>
          <Text style={styles.question}>• "What are the red flags in this post?"</Text>
        </View>
        <View style={styles.questionItem}>
          <Text style={styles.question}>• "Can you help me fact-check this?"</Text>
        </View>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>📊 Your Interaction Stats</Text>
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>23</Text>
            <Text style={styles.statLabel}>Questions Asked</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>18</Text>
            <Text style={styles.statLabel}>Helpful Answers</Text>
          </View>
        </View>
      </View>

      <View style={styles.infoCard}>
        <Text style={styles.infoTitle}>🔒 Privacy First</Text>
        <Text style={styles.infoText}>
          Your conversations are private and secure. We don't store your personal data or share it with third parties.
        </Text>
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
  },
  questionItem: {
    marginBottom: 8,
  },
  question: {
    fontSize: 14,
    color: '#374151',
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
  infoCard: {
    backgroundColor: '#DBEAFE',
    borderRadius: 12,
    padding: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#1E90FF',
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    color: '#1E40A8',
  },
  infoText: {
    fontSize: 14,
    color: '#1E40A8',
    lineHeight: 20,
  },
});