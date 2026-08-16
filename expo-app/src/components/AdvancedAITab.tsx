import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';

export default function AdvancedAITab() {
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Advanced AI</Text>
        <Text style={styles.headerDescription}>
          Powerful AI tools for deep content analysis
        </Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>🧠 Deep Analysis</Text>
        <Text style={styles.cardContent}>
          Use our advanced AI models to perform comprehensive content analysis, including sentiment analysis, source verification, and pattern detection.
        </Text>
        <TouchableOpacity style={styles.actionButton}>
          <Text style={styles.actionButtonText}>Start Deep Analysis</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>🔍 Pattern Recognition</Text>
        <Text style={styles.cardContent}>
          Identify recurring patterns in misinformation campaigns and detect coordinated inauthentic behavior.
        </Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>📊 Analytics Dashboard</Text>
        <View style={styles.statsGrid}>
          <View style={styles.statBox}>
            <Text style={styles.statValue}>847</Text>
            <Text style={styles.statLabel}>Analyses Run</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statValue}>92%</Text>
            <Text style={styles.statLabel}>Accuracy Rate</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statValue}>23</Text>
            <Text style={styles.statLabel}>Patterns Found</Text>
          </View>
        </View>
      </View>

      <View style={styles.infoCard}>
        <Text style={styles.infoTitle}>⚡ Pro Feature</Text>
        <Text style={styles.infoText}>
          Advanced AI analysis requires a premium subscription. Upgrade to unlock unlimited deep analysis capabilities.
        </Text>
        <TouchableOpacity style={styles.upgradeButton}>
          <Text style={styles.upgradeButtonText}>Upgrade to Pro</Text>
        </TouchableOpacity>
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
    marginBottom: 16,
  },
  actionButton: {
    backgroundColor: '#1E90FF',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  actionButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 8,
    gap: 12,
  },
  statBox: {
    flex: 1,
    minWidth: '30%',
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1E90FF',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'center',
  },
  infoCard: {
    backgroundColor: '#FEF3C7',
    borderRadius: 12,
    padding: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#F59E0B',
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    color: '#92400E',
  },
  infoText: {
    fontSize: 14,
    color: '#92400E',
    lineHeight: 20,
    marginBottom: 12,
  },
  upgradeButton: {
    backgroundColor: '#F59E0B',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  upgradeButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
});