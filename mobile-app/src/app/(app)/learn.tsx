import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";
import { Alert, Pressable, StyleSheet, View } from "react-native";

import { Button, Card, Screen, SectionHeader } from "@/components/prova-ui";
import { ThemedText } from "@/components/themed-text";
import {
  LESSON_LIBRARY,
  LESSON_TIPS,
  type LessonDefinition,
} from "@/constants/prova-content";
import { Spacing } from "@/constants/theme";
import { useTheme } from "@/hooks/use-theme";
import { apiJson } from "@/lib/api";
import { useSession } from "@/providers/session-provider";
import type { LearningProgress, LessonStatus } from "@/types/api";

type LessonState = LessonDefinition & {
  completedAt?: string | null;
  progressPercent: number;
  status: LessonStatus;
};

function clampProgress(value: number) {
  return Math.max(0, Math.min(100, value));
}

function buildLessonState(progressRecords: LearningProgress[] | undefined) {
  return LESSON_LIBRARY.map<LessonState>((lesson, index) => {
    const saved = progressRecords?.find((item) => item.lessonId === lesson.lessonId);
    const defaultStatus = index === 0 ? "available" : lesson.starterStatus;
    const status = saved?.status ?? defaultStatus;

    return {
      ...lesson,
      completedAt: saved?.completedAt ?? null,
      progressPercent: clampProgress(saved?.progressPercent ?? (status === "completed" ? 100 : 0)),
      status,
    };
  }).map((lesson, index, lessons) => {
    if (lesson.status !== "locked") {
      return lesson;
    }

    const previousLesson = lessons[index - 1];
    if (previousLesson?.status === "completed") {
      return {
        ...lesson,
        status: "available",
      };
    }

    return lesson;
  });
}

export default function LearnScreen() {
  const theme = useTheme();
  const queryClient = useQueryClient();
  const { isAuthenticated, token, user } = useSession();
  const [guestOverrides, setGuestOverrides] = useState<Record<string, Partial<LessonState>>>({});
  const [selectedLessonId, setSelectedLessonId] = useState(LESSON_LIBRARY[0].lessonId);
  const [tipIndex, setTipIndex] = useState(0);

  const progressQuery = useQuery({
    queryKey: ["learning-progress", token],
    queryFn: () => apiJson<LearningProgress[]>("/api/learning/progress", { token }),
    enabled: isAuthenticated && !!token,
  });

  useEffect(() => {
    const intervalId = setInterval(() => {
      setTipIndex((value) => (value + 1) % LESSON_TIPS.length);
    }, 7000);

    return () => clearInterval(intervalId);
  }, []);

  const lessons = useMemo(() => {
    const baseLessons = buildLessonState(progressQuery.data);

    if (isAuthenticated) {
      return baseLessons;
    }

    return baseLessons.map((lesson) => ({
      ...lesson,
      ...guestOverrides[lesson.lessonId],
    }));
  }, [guestOverrides, isAuthenticated, progressQuery.data]);

  useEffect(() => {
    if (!lessons.some((lesson) => lesson.lessonId === selectedLessonId)) {
      setSelectedLessonId(lessons[0]?.lessonId ?? LESSON_LIBRARY[0].lessonId);
    }
  }, [lessons, selectedLessonId]);

  const selectedLesson = lessons.find((lesson) => lesson.lessonId === selectedLessonId) ?? lessons[0];
  const completedLessons = lessons.filter((lesson) => lesson.status === "completed").length;
  const totalLessons = lessons.length;
  const completionPercent = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;

  const saveProgressMutation = useMutation({
    mutationFn: (nextLesson: LessonState) =>
      apiJson<LearningProgress>(`/api/learning/progress/${nextLesson.lessonId}`, {
        method: "PATCH",
        token,
        body: {
          lessonTitle: nextLesson.lessonTitle,
          category: nextLesson.category,
          status: nextLesson.status,
          progressPercent: nextLesson.progressPercent,
          completedAt: nextLesson.status === "completed" ? new Date().toISOString() : null,
        },
      }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["learning-progress", token] });
    },
  });

  const updateLesson = async (nextLesson: LessonState) => {
    if (!isAuthenticated) {
      setGuestOverrides((current) => ({
        ...current,
        [nextLesson.lessonId]: {
          completedAt: nextLesson.status === "completed" ? new Date().toISOString() : null,
          progressPercent: nextLesson.progressPercent,
          status: nextLesson.status,
        },
      }));
      return;
    }

    try {
      await saveProgressMutation.mutateAsync(nextLesson);
    } catch (error) {
      Alert.alert(
        "Could not update your lesson",
        error instanceof Error ? error.message : "Please try again."
      );
    }
  };

  const handleStartOrContinue = async () => {
    if (!selectedLesson || selectedLesson.status === "locked") {
      return;
    }

    const nextProgress = clampProgress(Math.max(selectedLesson.progressPercent, 25));
    await updateLesson({
      ...selectedLesson,
      progressPercent: nextProgress,
      status: nextProgress >= 100 ? "completed" : "in_progress",
    });
  };

  const handleMarkStepComplete = async () => {
    if (!selectedLesson || selectedLesson.status === "locked") {
      return;
    }

    const nextProgress = clampProgress(selectedLesson.progressPercent + 34);
    await updateLesson({
      ...selectedLesson,
      progressPercent: nextProgress,
      status: nextProgress >= 100 ? "completed" : "in_progress",
    });
  };

  return (
    <Screen>
      <SectionHeader
        title="Learn"
        subtitle="Build the habits behind Prova’s analysis with short, mobile-friendly lessons."
      />

      <Card
        style={[
          styles.progressCard,
          {
            backgroundColor: theme.success,
            borderColor: theme.success,
          },
        ]}>
        <View style={styles.progressCopy}>
          <ThemedText type="smallBold" style={styles.progressEyebrow}>
            LEARNING TRACK
          </ThemedText>
          <ThemedText type="subtitle" style={styles.progressTitle}>
            {completedLessons} of {totalLessons} lessons completed
          </ThemedText>
          <ThemedText style={styles.progressTip}>Tip: {LESSON_TIPS[tipIndex]}</ThemedText>
        </View>
        <View style={styles.progressBarTrack}>
          <View
            style={[
              styles.progressBarFill,
              {
                backgroundColor: "#FFFFFF",
                width: `${completionPercent}%`,
              },
            ]}
          />
        </View>
      </Card>

      <Card>
        <SectionHeader
          title="Lesson map"
          subtitle={
            isAuthenticated
              ? "Your progress is saved to the current backend."
              : "Guest mode lets you preview the path before you sign in."
          }
        />

        {progressQuery.isLoading ? (
          <ThemedText themeColor="textSecondary">Loading your lesson progress...</ThemedText>
        ) : null}

        {progressQuery.error ? (
          <ThemedText themeColor="textSecondary">
            {progressQuery.error instanceof Error
              ? progressQuery.error.message
              : "Could not load your lesson progress."}
          </ThemedText>
        ) : null}

        {lessons.map((lesson) => {
          const isSelected = lesson.lessonId === selectedLessonId;
          const isLocked = lesson.status === "locked";

          return (
            <Pressable
              key={lesson.lessonId}
              disabled={isLocked}
              onPress={() => setSelectedLessonId(lesson.lessonId)}
              style={[
                styles.lessonRow,
                {
                  backgroundColor: isSelected ? theme.accent : theme.backgroundElement,
                  borderColor: isSelected ? theme.primary : theme.backgroundSelected,
                  opacity: isLocked ? 0.55 : 1,
                },
              ]}>
              <View style={styles.lessonCopy}>
                <ThemedText type="smallBold">{lesson.lessonTitle}</ThemedText>
                <ThemedText themeColor="textSecondary">
                  {lesson.category} · {lesson.progressPercent}% complete
                </ThemedText>
              </View>
              <View
                style={[
                  styles.statusBadge,
                  {
                    backgroundColor:
                      lesson.status === "completed"
                        ? theme.success
                        : lesson.status === "in_progress"
                          ? theme.primary
                          : lesson.status === "available"
                            ? theme.warning
                            : theme.backgroundSelected,
                  },
                ]}>
                <ThemedText
                  type="smallBold"
                  style={{
                    color:
                      lesson.status === "locked" ? theme.text : theme.primaryForeground,
                  }}>
                  {lesson.status.replace("_", " ")}
                </ThemedText>
              </View>
            </Pressable>
          );
        })}
      </Card>

      {selectedLesson ? (
        <Card>
          <SectionHeader title={selectedLesson.lessonTitle} subtitle={selectedLesson.description} />

          <View style={styles.detailMeta}>
            <ThemedText type="smallBold">Progress</ThemedText>
            <ThemedText themeColor="textSecondary">{selectedLesson.progressPercent}% complete</ThemedText>
          </View>

          {selectedLesson.steps.map((step, index) => (
            <View key={step} style={styles.stepRow}>
              <View
                style={[
                  styles.stepBadge,
                  {
                    backgroundColor: theme.primary,
                  },
                ]}>
                <ThemedText type="smallBold" style={styles.stepBadgeText}>
                  {index + 1}
                </ThemedText>
              </View>
              <ThemedText style={styles.stepCopy}>{step}</ThemedText>
            </View>
          ))}

          <Card style={styles.tipCard}>
            <ThemedText type="smallBold">Why this matters</ThemedText>
            <ThemedText themeColor="textSecondary">{selectedLesson.tip}</ThemedText>
          </Card>

          <View style={styles.actionRow}>
            <Button
              disabled={selectedLesson.status === "locked" || saveProgressMutation.isPending}
              label={
                selectedLesson.status === "completed"
                  ? "Completed"
                  : selectedLesson.status === "in_progress"
                    ? "Continue lesson"
                    : "Start lesson"
              }
              onPress={() => void handleStartOrContinue()}
              style={styles.actionButton}
            />
            <Button
              disabled={
                selectedLesson.status === "locked" ||
                selectedLesson.status === "completed" ||
                saveProgressMutation.isPending
              }
              label="Mark step done"
              onPress={() => void handleMarkStepComplete()}
              style={styles.actionButton}
              variant="secondary"
            />
          </View>

          {!isAuthenticated ? (
            <ThemedText themeColor="textSecondary">
              Sign in when you want this lesson state to sync with your Prova account.
            </ThemedText>
          ) : null}

          {user?.completedLessons ? (
            <ThemedText themeColor="textSecondary">
              Profile total: {user.completedLessons} completed lesson{user.completedLessons === 1 ? "" : "s"}.
            </ThemedText>
          ) : null}
        </Card>
      ) : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  progressCard: {
    gap: Spacing.three,
  },
  progressCopy: {
    gap: Spacing.two,
  },
  progressEyebrow: {
    color: "#DCFCE7",
  },
  progressTitle: {
    color: "#FFFFFF",
  },
  progressTip: {
    color: "#F0FDF4",
  },
  progressBarTrack: {
    backgroundColor: "rgba(255,255,255,0.25)",
    borderRadius: 999,
    height: 12,
    overflow: "hidden",
  },
  progressBarFill: {
    borderRadius: 999,
    height: "100%",
  },
  lessonRow: {
    alignItems: "center",
    borderRadius: 20,
    borderWidth: 1,
    flexDirection: "row",
    gap: Spacing.two,
    justifyContent: "space-between",
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
  },
  lessonCopy: {
    flex: 1,
    gap: Spacing.half,
  },
  statusBadge: {
    borderRadius: 999,
    paddingHorizontal: Spacing.two,
    paddingVertical: 6,
  },
  detailMeta: {
    gap: Spacing.half,
  },
  stepRow: {
    flexDirection: "row",
    gap: Spacing.two,
  },
  stepBadge: {
    alignItems: "center",
    borderRadius: 999,
    height: 28,
    justifyContent: "center",
    marginTop: 2,
    width: 28,
  },
  stepBadgeText: {
    color: "#FFFFFF",
  },
  stepCopy: {
    flex: 1,
  },
  tipCard: {
    padding: Spacing.two,
  },
  actionRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.two,
  },
  actionButton: {
    flex: 1,
    minWidth: 160,
  },
});
