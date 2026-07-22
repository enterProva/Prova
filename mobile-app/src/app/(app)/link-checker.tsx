import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link, type Href } from "expo-router";
import { useState } from "react";
import { Alert, Pressable, StyleSheet, TextInput, View } from "react-native";

import { LinkCheckResultCard } from "@/components/link-check-result-card";
import { Button, Card, LoadingState, Screen, SectionHeader } from "@/components/prova-ui";
import { ThemedText } from "@/components/themed-text";
import { useTheme } from "@/hooks/use-theme";
import { apiJson } from "@/lib/api";
import { Spacing } from "@/constants/theme";
import { useSession } from "@/providers/session-provider";
import type { LinkCheckResult } from "@/types/api";

export default function LinkCheckerScreen() {
  const theme = useTheme();
  const queryClient = useQueryClient();
  const { token } = useSession();
  const [latestResult, setLatestResult] = useState<LinkCheckResult | null>(null);
  const [url, setUrl] = useState("");

  const recentChecksQuery = useQuery({
    queryKey: ["link-checks", token ?? "guest"],
    queryFn: () => apiJson<LinkCheckResult[]>("/api/link-checks/user?limit=10", { token }),
  });

  const checkLinkMutation = useMutation({
    mutationFn: (nextUrl: string) =>
      apiJson<LinkCheckResult>("/api/link-checks", {
        method: "POST",
        token,
        body: { url: nextUrl },
      }),
    onSuccess: (result) => {
      setLatestResult(result);
      setUrl("");
      queryClient.setQueryData<LinkCheckResult[]>(["link-checks", token ?? "guest"], (previous = []) => {
        const withoutDuplicate = previous.filter((item) => item.id !== result.id);
        return [result, ...withoutDuplicate];
      });
    },
  });

  const handleCheckLink = async () => {
    if (!url.trim()) {
      Alert.alert("URL required", "Paste a link to analyze before continuing.");
      return;
    }

    try {
      new URL(url);
    } catch {
      Alert.alert("Invalid URL", "Please enter a full URL, including https://");
      return;
    }

    try {
      await checkLinkMutation.mutateAsync(url);
    } catch (error) {
      Alert.alert(
        "Analysis failed",
        error instanceof Error ? error.message : "Please try another link."
      );
    }
  };

  return (
    <Screen>
      <SectionHeader
        title="Link Checker"
      />

      <Card>
        <ThemedText type="smallBold">Analyze a URL</ThemedText>
        <TextInput
          autoCapitalize="none"
          autoCorrect={false}
          keyboardType="url"
          onChangeText={setUrl}
          placeholder="https://example.com/article"
          placeholderTextColor={theme.textSecondary}
          style={[
            styles.input,
            {
              backgroundColor: theme.input,
              borderColor: theme.border,
              color: theme.text,
            },
          ]}
          value={url}
        />
        <Button
          label={checkLinkMutation.isPending ? "Checking..." : "Check link"}
          onPress={handleCheckLink}
        />
      </Card>

      {latestResult ? <LinkCheckResultCard result={latestResult} /> : null}

      <SectionHeader title="Recent checks" subtitle="Open any saved analysis to review it in detail." />

      {recentChecksQuery.isLoading ? <LoadingState label="Loading recent checks..." /> : null}
      {recentChecksQuery.error ? (
        <Card>
          <ThemedText type="smallBold">Could not load recent checks</ThemedText>
          <ThemedText themeColor="textSecondary">
            {recentChecksQuery.error instanceof Error
              ? recentChecksQuery.error.message
              : "Unknown error"}
          </ThemedText>
        </Card>
      ) : null}

      {recentChecksQuery.data?.map((check) => (
        <Card key={check.id}>
          <Link href={`/checks/${check.id}` as Href} asChild>
            <Pressable style={styles.recentCheck}>
              <View style={styles.recentCheckCopy}>
                <ThemedText type="smallBold">{check.title || check.url}</ThemedText>
                <ThemedText themeColor="textSecondary">
                  {check.domain || check.url}
                </ThemedText>
                {check.summary ? (
                  <ThemedText numberOfLines={2}>{check.summary}</ThemedText>
                ) : null}
              </View>
              <ThemedText type="smallBold">{check.credibilityScore ?? 0}/100</ThemedText>
            </Pressable>
          </Link>
        </Card>
      ))}
    </Screen>
  );
}

const styles = StyleSheet.create({
  input: {
    borderRadius: 18,
    borderWidth: 1,
    minHeight: 52,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
  },
  recentCheck: {
    alignItems: "center",
    flexDirection: "row",
    gap: Spacing.two,
    justifyContent: "space-between",
  },
  recentCheckCopy: {
    flex: 1,
    gap: Spacing.half,
  },
});
