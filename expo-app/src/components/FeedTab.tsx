import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, Image, StyleSheet, ScrollView } from 'react-native';
import { Card, CardContent } from './ui/Card';
import Avatar from './ui/Avatar';
import Badge from './ui/Badge';
import useAuth from '../hooks/useAuth';

interface FeedPost {
  id: string;
  author?: { firstName?: string; lastName?: string; email?: string; profileImageUrl?: string };
  content: string;
  createdAt: string;
  imageUrl?: string;
  linkCheck?: { verdict: 'verified' | 'misleading' | 'false' | 'pending' };
}

export default function FeedTab() {
  const [posts, setPosts] = useState<FeedPost[]>([]);
  const [linksChecked, setLinksChecked] = useState(0);
  const auth = useAuth();

  useEffect(() => {
    const dummyPosts: FeedPost[] = [
      {
        id: '1',
        author: { firstName: 'Abike', lastName: 'Adeniyi', profileImageUrl: '' },
        content: 'Check out this amazing article on AI advancements!',
        createdAt: new Date().toISOString(),
        imageUrl: 'https://picsum.photos/500/300?random=1',
        linkCheck: { verdict: 'verified' },
      },
      {
        id: '2',
        author: { firstName: 'Pawana', lastName: 'Singh', profileImageUrl: '' },
        content: 'This claim seems suspicious to me.',
        createdAt: new Date().toISOString(),
        linkCheck: { verdict: 'misleading' },
      },
      {
        id: '3',
        author: { firstName: 'Anupriya', lastName: 'Sharma', email: 'anupriya@example.com' },
        content: 'Totally false news about the latest tech!',
        createdAt: new Date().toISOString(),
        linkCheck: { verdict: 'false' },
      },
    ];

    setPosts(dummyPosts);
    setLinksChecked(auth.user?.linksChecked || 0);
  }, []);

  // Simulate new posts appearing
  useEffect(() => {
    const interval = setInterval(() => {
      const newPost: FeedPost = {
        id: Math.random().toString(),
        author: { firstName: 'Demo', lastName: 'User' },
        content: 'This is a new post appearing in real time!',
        createdAt: new Date().toISOString(),
        linkCheck: { verdict: ['verified', 'misleading', 'false', 'pending'][Math.floor(Math.random() * 4)] as any },
        imageUrl: Math.random() > 0.5 ? `https://picsum.photos/500/300?random=${Math.floor(Math.random() * 100)}` : undefined,
      };

      setPosts((prev) => [newPost, ...prev]);
      setLinksChecked((prev) => prev + 1);
    }, 5000);

    return () => clearInterval(interval);
  }, []);

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
      case 'verified': return 'Verified';
      case 'misleading': return 'Misleading';
      case 'false': return 'False';
      default: return 'Checking';
    }
  };

  const renderItem = ({ item }: { item: FeedPost }) => {
    return (
      <Card style={styles.postCard}>
        <CardContent>
          <View style={styles.postHeader}>
            <Avatar initials={item.author?.firstName?.charAt(0) || 'U'} />
            <View style={styles.postHeaderInfo}>
              <Text style={styles.author}>
                {item.author?.firstName && item.author?.lastName
                  ? `${item.author.firstName} ${item.author.lastName}`
                  : item.author?.email || 'Anonymous'}
              </Text>
              {item.linkCheck && (
                <Badge style={{ backgroundColor: getVerdictColor(item.linkCheck.verdict) } as any}>
                  {getVerdictIcon(item.linkCheck.verdict)} {getVerdictText(item.linkCheck.verdict)}
                </Badge>
              )}
              <Text style={styles.time}>{new Date(item.createdAt).toLocaleTimeString()}</Text>
            </View>
          </View>

          <Text style={styles.content}>{item.content}</Text>
          {item.imageUrl && <Image source={{ uri: item.imageUrl }} style={styles.image} />}
        </CardContent>
      </Card>
    );
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Your Feed</Text>
        <Text style={styles.headerDescription}>Stay informed with verified content and community insights</Text>
      </View>

      {/* Stats Cards */}
      {auth.user && (
        <View style={styles.statsContainer}>
          <Card style={styles.statCard as any}>
            <CardContent style={styles.statCardContent as any}>
              <View style={styles.statInfo}>
                <Text style={styles.statLabel}>Links Checked</Text>
                <Text style={styles.statValue}>{linksChecked}</Text>
              </View>
              <View style={styles.statIcon}>
                <Text style={styles.statIconText}>🔍</Text>
              </View>
            </CardContent>
          </Card>

          <Card style={styles.statCard}>
            <CardContent style={styles.statCardContent}>
              <View style={styles.statInfo}>
                <Text style={styles.statLabel}>Streak</Text>
                <Text style={styles.statValue}>{auth.user?.streakDays || 0} days</Text>
              </View>
              <View style={styles.statIcon}>
                <Text style={styles.statIconText}>🔥</Text>
              </View>
            </CardContent>
          </Card>

          <Card style={styles.statCard}>
            <CardContent style={styles.statCardContent}>
              <View style={styles.statInfo}>
                <Text style={styles.statLabel}>Trust Score</Text>
                <Text style={styles.statValue}>{auth.user?.trustScore || 50}%</Text>
              </View>
              <View style={styles.statIcon}>
                <Text style={styles.statIconText}>🏅</Text>
              </View>
            </CardContent>
          </Card>
        </View>
      )}

      {/* Feed Posts */}
      <FlatList
        data={posts}
        keyExtractor={(p) => p.id}
        renderItem={renderItem}
        scrollEnabled={false}
      />
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
  statsContainer: {
    flexDirection: 'row',
    marginBottom: 20,
    gap: 12,
  },
  statCard: {
    flex: 1,
  },
  statCardContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  statInfo: {
    flex: 1,
  },
  statLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 4,
  },
  statValue: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1E90FF',
  },
  statIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#DBEAFE',
    alignItems: 'center',
    justifyContent: 'center',
  },
  statIconText: {
    fontSize: 24,
  },
  feedList: {
    gap: 16,
  },
  postCard: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  postHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  postHeaderInfo: {
    marginLeft: 12,
    flex: 1,
  },
  author: {
    fontWeight: '600',
    fontSize: 16,
    color: '#111827',
    marginBottom: 4,
  },
  time: {
    color: '#6B7280',
    fontSize: 12,
    marginTop: 4,
  },
  content: {
    fontSize: 14,
    color: '#1F2937',
    lineHeight: 20,
    marginBottom: 12,
  },
  image: {
    width: '100%',
    height: 192,
    borderRadius: 12,
  },
});
