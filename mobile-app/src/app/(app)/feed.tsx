import { useQuery } from "@tanstack/react-query";
import { Image, Pressable, StyleSheet, View } from "react-native";

import { apiJson } from "@/lib/api";
import { Link, type Href } from "expo-router";
import { Card, LoadingState, Screen, SectionHeader } from "@/components/prova-ui";
import { ThemedText } from "@/components/themed-text";
import { Spacing } from "@/constants/theme";
import { useSession } from "@/providers/session-provider";
import type { FeedPost } from "@/types/api";

export default function FeedScreen() {
  const { token } = useSession();

  const feedQuery = useQuery({
    queryKey: ["feed", token ?? "guest"],
    queryFn: () => apiJson<FeedPost[]>("/api/feed?limit=20", { token }),
  });

  return (
    <Screen>
      <SectionHeader title="Your Feed" />

      {feedQuery.isLoading ? (
        <LoadingState label="Loading feed..." />
      ) : null}

      {feedQuery.error ? (
        <Card>
          <ThemedText style={styles.figtreeBold}>
            Could not load the feed
          </ThemedText>

          <ThemedText style={styles.figtreeText}>
            {feedQuery.error instanceof Error
              ? feedQuery.error.message
              : "Unknown error"}
          </ThemedText>
        </Card>
      ) : null}

      {feedQuery.data?.map((post) => {
        const authorName =
          post.author?.name ||
          [post.author?.firstName, post.author?.lastName]
            .filter(Boolean)
            .join(" ") ||
          post.author?.email ||
          "Anonymous";

        return (
          <Card key={post.id}>
            <View style={styles.postMeta}>
              <ThemedText style={styles.figtreeBold}>
                {authorName}
              </ThemedText>

              <ThemedText style={styles.figtreeSecondary}>
                {new Date(post.createdAt).toLocaleString()}
              </ThemedText>
            </View>

            <ThemedText style={styles.figtreeText}>
              {post.content}
            </ThemedText>

            {post.imageUrl ? (
              <Image
                source={{ uri: post.imageUrl }}
                style={styles.image}
              />
            ) : null}

            {post.linkCheck?.id ? (
              <Link href={`/checks/${post.linkCheck.id}` as Href} asChild>
                <Pressable style={styles.linkCheckPill}>
                  <ThemedText style={styles.figtreeBold}>
                    {post.linkCheck.verdict.toUpperCase()}
                  </ThemedText>

                  <ThemedText style={styles.figtreeSecondary}>
                    Open linked analysis
                  </ThemedText>
                </Pressable>
              </Link>
            ) : null}
          </Card>
        );
      })}
    </Screen>
  );
}

const styles = StyleSheet.create({
  figtreeText: {
    fontFamily: "Figtree",
  },

  figtreeBold: {
    fontFamily: "FigtreeSemiBold",
  },

  figtreeSecondary: {
    fontFamily: "Figtree",
    opacity: 0.7,
  },

  postMeta: {
    gap: Spacing.half,
  },

  image: {
    borderRadius: 18,
    height: 180,
    width: "100%",
  },

  linkCheckPill: {
    gap: Spacing.half,
  },
});