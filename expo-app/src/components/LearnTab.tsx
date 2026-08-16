import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';

interface Lesson {
  id: string;
  title: string;
  description: string;
  duration: string;
  level: 'Beginner' | 'Intermediate' | 'Advanced';
  completed: boolean;
}

export default function LearnTab() {
  const lessons: Lesson[] = [
    {
      id: '1',
      title: 'Introduction to Media Literacy',
      description: 'Learn the basics of evaluating sources and understanding media bias.',
      duration: '10 min',
      level: 'Beginner',
      completed: true,
    },
    {
      id: '2',
      title: 'Identifying Clickbait',
      description: 'Discover common tactics used in clickbait headlines and how to spot them.',
      duration: '15 min',
      level: 'Beginner',
      completed: false,
    },
    {
      id: '3',
      title: 'Fact-Checking Techniques',
      description: 'Master professional fact-checking methods you can use daily.',
      duration: '20 min',
      level: 'Intermediate',
      completed: false,
    },
    {
      id: '4',
      title: 'Understanding Deepfakes',
      description: 'Learn about AI-generated content and how to detect manipulated media.',
      duration: '25 min',
      level: 'Advanced',
      completed: false,
    },
  ];

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'Beginner': return '#10B981';
      case 'Intermediate': return '#F59E0B';
      case 'Advanced': return '#EF4444';
      default: return '#6B7280';
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Learn</Text>
        <Text style={styles.headerDescription}>
          Build your media literacy skills with interactive lessons
        </Text>
      </View>

      {/* Progress Overview */}
      <View style={styles.progressCard}>
        <View style={styles.progressHeader}>
          <Text style={styles.progressTitle}>Your Progress</Text>
          <Text style={styles.progressStats}>1/4 Completed</Text>
        </View>
        <View style={styles.progressBarContainer}>
          <View style={[styles.progressBar, { width: '25%' }]} />
        </View>
        <Text style={styles.progressText}>25% Complete</Text>
      </View>

      {/* Lessons List */}
      <Text style={styles.sectionTitle}>Lessons</Text>
      {lessons.map((lesson) => (
        <TouchableOpacity key={lesson.id} style={styles.lessonCard}>
          <View style={styles.lessonHeader}>
            <View style={styles.lessonInfo}>
              <Text style={styles.lessonTitle}>{lesson.title}</Text>
              <Text style={styles.lessonDescription}>{lesson.description}</Text>
            </View>
            {lesson.completed && (
              <View style={styles.completedBadge}>
                <Text style={styles.completedText}>✓</Text>
              </View>
            )}
          </View>
          <View style={styles.lessonFooter}>
            <View style={[styles.levelBadge, { backgroundColor: getLevelColor(lesson.level) }]}>
              <Text style={styles.levelText}>{lesson.level}</Text>
            </View>
            <Text style={styles.duration}>⏱️ {lesson.duration}</Text>
          </View>
        </TouchableOpacity>
      ))}
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
  progressCard: {
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
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  progressTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  progressStats: {
    fontSize: 14,
    color: '#6B7280',
  },
  progressBarContainer: {
    height: 8,
    backgroundColor: '#E5E7EB',
    borderRadius: 4,
    marginBottom: 8,
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#1E90FF',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 12,
    color: '#6B7280',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
    color: '#111827',
  },
  lessonCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  lessonHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  lessonInfo: {
    flex: 1,
    marginRight: 12,
  },
  lessonTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
    color: '#111827',
  },
  lessonDescription: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
  },
  completedBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#10B981',
    alignItems: 'center',
    justifyContent: 'center',
  },
  completedText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 14,
  },
  lessonFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  levelBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  levelText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  duration: {
    fontSize: 12,
    color: '#6B7280',
  },
});