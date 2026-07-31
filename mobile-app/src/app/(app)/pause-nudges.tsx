import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";
import { Alert, Pressable, StyleSheet, View } from "react-native";

import { Button, Card, Screen, SectionHeader } from "@/components/prova-ui";
import { ThemedText } from "@/components/themed-text";
import { NUDGE_LIBRARY, type NudgeTemplate } from "@/constants/prova-content";
import { Spacing } from "@/constants/theme";
import { useTheme } from "@/hooks/use-theme";
import { apiJson } from "@/lib/api";
import { useSession } from "@/providers/session-provider";
import type { PauseNudge, PauseNudgeResponse } from "@/types/api";

function getNextNudge(currentPrompt: string) {
  const available = NUDGE_LIBRARY.filter(
    (nudge) => nudge.prompt !== currentPrompt
  );

  return available[Math.floor(Math.random() * available.length)] ?? NUDGE_LIBRARY[0];
}

export default function PauseNudgesScreen() {
  const theme = useTheme();
  const queryClient = useQueryClient();
  const { isAuthenticated, token, user } = useSession();

  const [currentNudge, setCurrentNudge] = useState<NudgeTemplate>(
    NUDGE_LIBRARY[0]
  );
  const [guestCompletedCount, setGuestCompletedCount] = useState(0);
  const [guestSkippedCount, setGuestSkippedCount] = useState(0);
  const [responseMessage, setResponseMessage] = useState<string | null>(null);

  const nudgesQuery = useQuery({
    queryKey: ["pause-nudges", token],
    queryFn: () => apiJson<PauseNudge[]>("/api/pause-nudges", { token }),
    enabled: isAuthenticated && !!token,
  });

  useEffect(() => {
    const intervalId = setInterval(() => {
      setCurrentNudge((previous) => getNextNudge(previous.prompt));
    }, 12000);

    return () => clearInterval(intervalId);
  }, []);

  const respondMutation = useMutation({
    mutationFn: (response: PauseNudgeResponse) =>
      apiJson<PauseNudge>("/api/pause-nudges", {
        method: "POST",
        token,
        body: {
          nudgeType: currentNudge.type,
          prompt: currentNudge.prompt,
          response,
        },
      }),

    onSuccess: async (_, response) => {
      await queryClient.invalidateQueries({
        queryKey: ["pause-nudges", token],
      });

      setResponseMessage(
        response === "completed"
          ? "Nice pause. You logged a mindful moment."
          : "Saved. You can come back to this prompt later."
      );

      setCurrentNudge((previous) => getNextNudge(previous.prompt));
    },
  });

  const recentNudges = nudgesQuery.data ?? [];

  const completedCount = recentNudges.filter(
    (nudge) => nudge.response === "completed"
  ).length;

  const skippedCount = recentNudges.filter(
    (nudge) => nudge.response === "skipped"
  ).length;

  const stats = useMemo(
    () => ({
      completed: isAuthenticated ? completedCount : guestCompletedCount,
      skipped: isAuthenticated ? skippedCount : guestSkippedCount,
      streak: user?.streakDays ?? 0,
    }),
    [
      completedCount,
      guestCompletedCount,
      guestSkippedCount,
      isAuthenticated,
      skippedCount,
      user?.streakDays,
    ]
  );

  const handleResponse = async (response: PauseNudgeResponse) => {
    setResponseMessage(null);

    if (!isAuthenticated) {
      if (response === "completed") {
        setGuestCompletedCount((value) => value + 1);
        setResponseMessage(
          "Nice pause. Sign in when you want this reflected on your profile."
        );
      } else {
        setGuestSkippedCount((value) => value + 1);
        setResponseMessage("Saved locally for this session.");
      }

      setCurrentNudge((previous) => getNextNudge(previous.prompt));
      return;
    }

    try {
      await respondMutation.mutateAsync(response);
    } catch (error) {
      Alert.alert(
        "Could not save your response",
        error instanceof Error ? error.message : "Please try again."
      );
    }
  };

  return (
    <Screen>
      <SectionHeader
        title="Pause Nudges"
        subtitle="Slow the scroll, check your reaction, and build better sharing habits."
      />

      <Card
        style={[
          styles.heroCard,
          {
            backgroundColor: theme.primary,
            borderColor: theme.primary,
          },
        ]}
      >
        <View style={styles.heroCopy}>
          <ThemedText style={styles.figtreeBold}>
            BEFORE YOU SHARE
          </ThemedText>

          <ThemedText style={styles.serifTitle}>
            {currentNudge.prompt}
          </ThemedText>

          <ThemedText style={styles.figtreeLight}>
            {currentNudge.detail}
          </ThemedText>
        </View>

        <View style={styles.heroActions}>
          <Button
            disabled={respondMutation.isPending}
            label={respondMutation.isPending ? "Saving..." : "I reflected"}
            onPress={() => void handleResponse("completed")}
            style={styles.heroPrimaryButton}
          />

          <Button
            disabled={respondMutation.isPending}
            label="Skip for now"
            onPress={() => void handleResponse("skipped")}
            style={styles.heroSecondaryButton}
            variant="secondary"
          />

          <Pressable
            onPress={() =>
              setCurrentNudge((previous) =>
                getNextNudge(previous.prompt)
              )
            }
          >
            <ThemedText style={styles.figtreeCenter}>
              Show another prompt
            </ThemedText>
          </Pressable>
        </View>
      </Card>

      {responseMessage ? (
        <Card>
          <ThemedText style={styles.figtreeBold}>
            Mindful moment saved
          </ThemedText>

          <ThemedText style={styles.figtreeText}>
            {responseMessage}
          </ThemedText>
        </Card>
      ) : null}

      <View style={styles.statsRow}>
        <Card style={styles.statCard}>
          <ThemedText style={styles.serifNumber}>
            {stats.completed}
          </ThemedText>
          <ThemedText style={styles.figtreeBold}>
            Reflections
          </ThemedText>
          <ThemedText style={styles.figtreeText}>
            Completed prompts
          </ThemedText>
        </Card>

        <Card style={styles.statCard}>
          <ThemedText style={styles.serifNumber}>
            {stats.skipped}
          </ThemedText>
          <ThemedText style={styles.figtreeBold}>
            Saved for later
          </ThemedText>
          <ThemedText style={styles.figtreeText}>
            Skipped prompts
          </ThemedText>
        </Card>

        <Card style={styles.statCard}>
          <ThemedText style={styles.serifNumber}>
            {stats.streak}
          </ThemedText>
          <ThemedText style={styles.figtreeBold}>
            Streak days
          </ThemedText>
          <ThemedText style={styles.figtreeText}>
            Profile activity
          </ThemedText>
        </Card>
      </View>

      <Card>
        <SectionHeader
          title="Prompt themes"
          subtitle="The app rotates between a few kinds of pause moments."
        />

        {[
          {
            label: "Reading",
            body: "Read the full claim before deciding what it means.",
          },
          {
            label: "Emotional",
            body: "Notice whether the post is trying to rush you into reacting.",
          },
          {
            label: "Source",
            body: "Ask who is making the claim and whether they can be verified.",
          },
          {
            label: "Context",
            body: "Look for missing dates, images, quotes, or surrounding facts.",
          },
        ].map((themeCard) => (
          <View key={themeCard.label} style={styles.themeRow}>
            <ThemedText style={styles.figtreeBold}>
              {themeCard.label}
            </ThemedText>

            <ThemedText style={styles.figtreeText}>
              {themeCard.body}
            </ThemedText>
          </View>
        ))}
      </Card>

      <Card>
        <SectionHeader
          title="Recent nudges"
          subtitle={
            isAuthenticated
              ? "Your saved responses from the current Prova backend."
              : "Sign in to sync your pause history across devices."
          }
        />

        {!isAuthenticated ? (
          <ThemedText style={styles.figtreeText}>
            Guest mode keeps this experience usable, but it will not save your pause history.
          </ThemedText>
        ) : null}

        {recentNudges.slice(0, 5).map((nudge) => (
          <View key={nudge.id} style={styles.recentRow}>
            <View style={styles.recentCopy}>
              <ThemedText style={styles.figtreeBold}>
                {nudge.prompt}
              </ThemedText>

              <ThemedText style={styles.figtreeText}>
                {new Date(nudge.createdAt).toLocaleString()}
              </ThemedText>
            </View>

            <View style={styles.responseBadge}>
              <ThemedText style={styles.figtreeBold}>
                {(nudge.response ?? "new").replace("_", " ")}
              </ThemedText>
            </View>
          </View>
        ))}
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  serifTitle: {
    fontFamily: "Serif",
    color: "#FFFFFF",
  },

  serifNumber: {
    fontFamily: "Serif",
  },

  figtreeText: {
    fontFamily: "Figtree",
  },

  figtreeBold: {
    fontFamily: "FigtreeSemiBold",
  },

  figtreeLight: {
    fontFamily: "Figtree",
    color: "#EAF5FF",
  },

  figtreeCenter: {
    fontFamily: "Figtree",
    color: "#FFFFFF",
    textAlign: "center",
  },

  heroCard: {
    gap: Spacing.three,
  },

  heroCopy: {
    gap: Spacing.two,
  },

  heroActions: {
    gap: Spacing.two,
  },

  heroPrimaryButton: {
    backgroundColor: "#FFFFFF",
    borderColor: "#FFFFFF",
  },

  heroSecondaryButton: {
    backgroundColor: "#DCEEFE",
    borderColor: "#DCEEFE",
  },

  statsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.two,
  },

  statCard: {
    flex: 1,
    minWidth: 140,
  },

  themeRow: {
    gap: Spacing.half,
  },

  recentRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: Spacing.two,
    justifyContent: "space-between",
  },

  recentCopy: {
    flex: 1,
    gap: Spacing.half,
  },

  responseBadge: {
    borderRadius: 999,
    paddingHorizontal: Spacing.two,
    paddingVertical: 6,
  },
});