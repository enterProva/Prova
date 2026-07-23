import { StyleSheet, View } from "react-native";

import { Card } from "@/components/prova-ui";
import { ThemedText } from "@/components/themed-text";
import { Spacing } from "@/constants/theme";
import { useTheme } from "@/hooks/use-theme";
import type { LinkCheckResult } from "@/types/api";

function getVerdictTone(verdict: LinkCheckResult["verdict"], theme: ReturnType<typeof useTheme>) {
  switch (verdict) {
    case "verified":
      return { badge: theme.success, label: "Verified" };
    case "misleading":
      return { badge: theme.warning, label: "Misleading" };
    case "false":
      return { badge: theme.destructive, label: "False" };
    default:
      return { badge: theme.textSecondary, label: "Pending" };
  }
}

export function LinkCheckResultCard({
  result,
  showLongSummary = true,
}: {
  result: LinkCheckResult;
  showLongSummary?: boolean;
}) {
  const theme = useTheme();
  const verdictTone = getVerdictTone(result.verdict, theme);
  const summary = result.summary?.trim();
  const sources = result.sources ?? result.factCheckSources ?? [];

  return (
    <Card>
      <View style={styles.titleRow}>
        <View style={[styles.badge, { backgroundColor: verdictTone.badge }]}>
          <ThemedText type="smallBold" style={styles.badgeText}>
            {verdictTone.label}
          </ThemedText>
        </View>
        <ThemedText type="small" themeColor="textSecondary">
          {new Date(result.checkedAt).toLocaleString()}
        </ThemedText>
      </View>

      <ThemedText type="smallBold">{result.title || result.url}</ThemedText>
      <ThemedText themeColor="textSecondary">{result.domain || result.url}</ThemedText>

      <View style={styles.metricsRow}>
        <Metric label="Credibility" value={result.credibilityScore ?? 0} />
        <Metric label="Fact Check" value={result.factCheckScore ?? 0} />
        <Metric label="Bias" value={result.biasRating ?? "n/a"} />
      </View>

      {summary ? (
        <ThemedText numberOfLines={showLongSummary ? undefined : 3}>{summary}</ThemedText>
      ) : null}

      {sources.length > 0 ? (
        <View style={styles.sourcesContainer}>
          <ThemedText type="smallBold">Sources</ThemedText>
          {sources.slice(0, 5).map((source) => (
            <ThemedText key={source} themeColor="textSecondary">
              • {source}
            </ThemedText>
          ))}
        </View>
      ) : null}
    </Card>
  );
}

function Metric({ label, value }: { label: string; value: number | string }) {
  return (
    <View style={styles.metric}>
      <ThemedText type="smallBold">{String(value)}</ThemedText>
      <ThemedText type="small" themeColor="textSecondary">
        {label}
      </ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  titleRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: Spacing.two,
    justifyContent: "space-between",
  },
  badge: {
    borderRadius: 999,
    paddingHorizontal: Spacing.two,
    paddingVertical: 6,
  },
  badgeText: {
    color: "#FFFFFF",
  },
  metricsRow: {
    flexDirection: "row",
    gap: Spacing.two,
    justifyContent: "space-between",
  },
  metric: {
    flex: 1,
    gap: Spacing.half,
  },
  sourcesContainer: {
    gap: Spacing.one,
  },
});
