import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';

export interface LinkCheckResult {
  id?: string;
  url: string;
  verdict: 'verified' | 'misleading' | 'false' | 'pending';
  credibilityScore: number;
  biasRating: 'low' | 'medium' | 'high';
  factCheckScore: number;
  sourcesCount: number;
  sources: string[];
  summary?: string;
  modelUsed?: string;
  reasoning?: string;
  title?: string;
  domain?: string;
  checkedAt?: string;
}

export default function LinkCheckerTab() {
  const [url, setUrl] = useState('');
  const [lastCheckedUrl, setLastCheckedUrl] = useState('');
  const [isChecking, setIsChecking] = useState(false);
  const [result, setResult] = useState<LinkCheckResult | null>(null);
  const [recentChecks, setRecentChecks] = useState<LinkCheckResult[]>([]);

  const handleCheck = async () => {
    if (!url.trim()) {
      Alert.alert('URL Required', 'Please enter a URL to check.');
      return;
    }

    try {
      new URL(url);
    } catch {
      Alert.alert('Invalid URL', 'Please enter a valid URL.');
      return;
    }

    setIsChecking(true);
    
    // Simulate API call (replace with actual API integration)
    setTimeout(() => {
      const mockResult: LinkCheckResult = {
        id: Math.random().toString(),
        url,
        verdict: ['verified', 'misleading', 'false', 'pending'][Math.floor(Math.random() * 4)] as any,
        credibilityScore: Math.floor(Math.random() * 40) + 60,
        biasRating: ['low', 'medium', 'high'][Math.floor(Math.random() * 3)] as any,
        factCheckScore: Math.floor(Math.random() * 40) + 60,
        sourcesCount: Math.floor(Math.random() * 5) + 1,
        sources: ['https://example.com/source1', 'https://example.com/source2'],
        summary: 'This is a mock analysis result. Integrate with your backend API for real results.',
        modelUsed: 'compound-beta',
        title: 'Sample Article Title',
        domain: new URL(url).hostname,
        checkedAt: new Date().toISOString(),
      };

      setResult(mockResult);
      setLastCheckedUrl(url);
      setRecentChecks([mockResult, ...recentChecks.slice(0, 4)]);
      setUrl('');
      setIsChecking(false);
    }, 2000);
  };

  const getVerdictColor = (verdict: string) => {
    switch (verdict) {
      case 'verified': return '#10B981';
      case 'misleading': return '#F59E0B';
      case 'false': return '#EF4444';
      default: return '#6B7280';
    }
  };

  const getVerdictIcon = (verdict: string) => {
    switch (verdict) {
      case 'verified': return '✅';
      case 'misleading': return '⚠️';
      case 'false': return '❌';
      default: return '⏳';
    }
  };

  const getVerdictText = (verdict: string) => {
    switch (verdict) {
      case 'verified': return 'Verified Content';
      case 'misleading': return 'Misleading Content';
      case 'false': return 'False Content';
      default: return 'Analysis Pending';
    }
  };

  const getCredibilityLevel = (score: number) => {
    if (score >= 70) return { text: 'High', color: '#10B981' };
    if (score >= 40) return { text: 'Medium', color: '#F59E0B' };
    return { text: 'Low', color: '#EF4444' };
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Link Checker</Text>
        <Text style={styles.headerDescription}>
          Verify the credibility of any link or article with AI-powered analysis
        </Text>
      </View>

      {/* Link Input Form */}
      <View style={styles.inputCard}>
        <Text style={styles.label}>Paste your link here</Text>
        <TextInput
          style={styles.input}
          placeholder="https://example.com/article"
          value={url}
          onChangeText={setUrl}
          autoCapitalize="none"
          keyboardType="url"
        />
        <TouchableOpacity
          style={[styles.checkButton, isChecking && styles.checkButtonDisabled]}
          onPress={handleCheck}
          disabled={isChecking}
        >
          {isChecking ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.checkButtonText}>🔍 Check</Text>
          )}
        </TouchableOpacity>
        <Text style={styles.hintText}>
          We'll analyze the content using multiple AI models and provide detailed reasoning, scores, and sources.
        </Text>
      </View>

      {/* Latest Check Result */}
      {result && lastCheckedUrl === result.url && (
        <View style={styles.resultCard}>
          <View style={styles.resultHeader}>
            <View style={[styles.verdictIcon, { backgroundColor: getVerdictColor(result.verdict) }]}>
              <Text style={styles.verdictIconText}>{getVerdictIcon(result.verdict)}</Text>
            </View>
            <View style={styles.resultHeaderText}>
              <Text style={styles.resultUrl} numberOfLines={2}>{result.url}</Text>
              <View style={styles.badges}>
                <View style={[styles.badge, { backgroundColor: getVerdictColor(result.verdict) }]}>
                  <Text style={styles.badgeText}>{getVerdictText(result.verdict)}</Text>
                </View>
                {result.modelUsed && (
                  <View style={styles.modelBadge}>
                    <Text style={styles.modelBadgeText}>🧠 {result.modelUsed}</Text>
                  </View>
                )}
              </View>
            </View>
          </View>

          <Text style={styles.resultDescription}>
            {result.summary || 'Content analyzed based on domain credibility and content patterns.'}
          </Text>

          {result.title && result.title !== result.url && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Article Title</Text>
              <Text style={styles.sectionContent}>{result.title}</Text>
            </View>
          )}

          {/* Stats Grid */}
          <View style={styles.statsGrid}>
            <View style={styles.statCard}>
              <Text style={styles.statLabel}>Credibility</Text>
              <Text style={[styles.statValue, { color: getCredibilityLevel(result.credibilityScore).color }]}>
                {getCredibilityLevel(result.credibilityScore).text}
              </Text>
              <Text style={styles.statSubtext}>{result.credibilityScore}/100</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statLabel}>Bias Rating</Text>
              <Text style={[styles.statValue, { 
                color: result.biasRating === 'low' ? '#10B981' : 
                      result.biasRating === 'medium' ? '#F59E0B' : '#EF4444' 
              }]}>
                {result.biasRating || 'Unknown'}
              </Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statLabel}>Fact-Check Score</Text>
              <Text style={[styles.statValue, { 
                color: result.factCheckScore >= 70 ? '#10B981' : 
                      result.factCheckScore >= 40 ? '#F59E0B' : '#EF4444' 
              }]}>
                {result.factCheckScore}/100
              </Text>
            </View>
          </View>

          {/* Sources */}
          {result.sources && result.sources.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Sources Referenced</Text>
              <View style={styles.sourcesContainer}>
                {result.sources.slice(0, 5).map((src, idx) => (
                  <View key={idx} style={styles.sourceItem}>
                    <Text style={styles.sourceBullet}>•</Text>
                    <Text style={styles.sourceText} numberOfLines={2}>{src}</Text>
                  </View>
                ))}
                {result.sources.length > 5 && (
                  <Text style={styles.moreSources}>+{result.sources.length - 5} more sources</Text>
                )}
              </View>
            </View>
          )}
        </View>
      )}

      {/* Recent Checks */}
      <View style={styles.recentCard}>
        <Text style={styles.recentTitle}>Recent Checks</Text>
        {recentChecks.length === 0 ? (
          <Text style={styles.noRecentText}>No recent checks yet</Text>
        ) : (
          recentChecks.map((check) => (
            <View key={check.id} style={styles.recentItem}>
              <View style={styles.recentItemLeft}>
                <Text style={styles.recentUrl} numberOfLines={1}>{check.url}</Text>
                <Text style={styles.recentMeta}>
                  {check.checkedAt ? new Date(check.checkedAt).toLocaleDateString() : ''} • {check.domain || new URL(check.url).hostname}
                </Text>
              </View>
              <View style={[styles.recentBadge, { backgroundColor: getVerdictColor(check.verdict) }]}>
                <Text style={styles.recentBadgeText}>{getVerdictText(check.verdict)}</Text>
              </View>
            </View>
          ))
        )}
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
  inputCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    marginBottom: 12,
    color: '#111827',
  },
  checkButton: {
    backgroundColor: '#1E90FF',
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 8,
  },
  checkButtonDisabled: {
    backgroundColor: '#9CA3AF',
  },
  checkButtonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16,
  },
  hintText: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'center',
  },
  resultCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  resultHeader: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  verdictIcon: {
    width: 64,
    height: 64,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  verdictIconText: {
    fontSize: 32,
  },
  resultHeaderText: {
    flex: 1,
  },
  resultUrl: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 8,
  },
  badges: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  modelBadge: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  modelBadgeText: {
    fontSize: 12,
    color: '#374151',
  },
  resultDescription: {
    fontSize: 14,
    color: '#374151',
    marginBottom: 16,
    lineHeight: 20,
  },
  section: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  sectionContent: {
    fontSize: 14,
    color: '#111827',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 16,
    gap: 12,
  },
  statCard: {
    flex: 1,
    minWidth: '30%',
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    padding: 12,
  },
  statLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 4,
  },
  statValue: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 2,
  },
  statSubtext: {
    fontSize: 12,
    color: '#6B7280',
  },
  sourcesContainer: {
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    padding: 12,
  },
  sourceItem: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  sourceBullet: {
    marginRight: 8,
    color: '#6B7280',
  },
  sourceText: {
    flex: 1,
    fontSize: 14,
    color: '#111827',
  },
  moreSources: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 4,
  },
  recentCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  recentTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
    color: '#111827',
  },
  noRecentText: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    padding: 20,
  },
  recentItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    marginBottom: 8,
  },
  recentItemLeft: {
    flex: 1,
    marginRight: 12,
  },
  recentUrl: {
    fontSize: 14,
    fontWeight: '500',
    color: '#111827',
    marginBottom: 4,
  },
  recentMeta: {
    fontSize: 12,
    color: '#6B7280',
  },
  recentBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  recentBadgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
});