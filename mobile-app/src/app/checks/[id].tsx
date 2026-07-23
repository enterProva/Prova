import { useQuery } from "@tanstack/react-query";
import { useLocalSearchParams } from "expo-router";

import { LinkCheckResultCard } from "@/components/link-check-result-card";
import { Card, LoadingState, Screen, SectionHeader } from "@/components/prova-ui";
import { ThemedText } from "@/components/themed-text";
import { apiJson } from "@/lib/api";
import { useSession } from "@/providers/session-provider";
import type { LinkCheckResult } from "@/types/api";

export default function LinkCheckDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { token } = useSession();
  const linkCheckQuery = useQuery({
    queryKey: ["link-check", id, token ?? "guest"],
    queryFn: () => apiJson<LinkCheckResult>(`/api/link-checks/${id}`, { token }),
    enabled: !!id,
  });

  return (
    <Screen>
      <SectionHeader
        title="Analysis detail"
        subtitle="Drill into a stored link analysis from the current Prova backend."
      />

      {linkCheckQuery.isLoading ? <LoadingState label="Loading analysis..." /> : null}

      {linkCheckQuery.error ? (
        <Card>
          <ThemedText type="smallBold">Could not load this analysis</ThemedText>
          <ThemedText themeColor="textSecondary">
            {linkCheckQuery.error instanceof Error
              ? linkCheckQuery.error.message
              : "Unknown error"}
          </ThemedText>
        </Card>
      ) : null}

      {linkCheckQuery.data ? <LinkCheckResultCard result={linkCheckQuery.data} /> : null}
    </Screen>
  );
}
