import { type ReactNode } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
  type PressableProps,
  type StyleProp,
  type ViewStyle,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Spacing } from "@/constants/theme";
import { useTheme } from "@/hooks/use-theme";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";

export function Screen({
  children,
  style,
}: {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
}) {
  const theme = useTheme();

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[styles.content, style]}
        showsVerticalScrollIndicator={false}>
        {children}
      </ScrollView>
    </SafeAreaView>
  );
}

export function Card({
  children,
  style,
  ...rest
}: {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
}) {
  const theme = useTheme();

  return (
    <ThemedView
      type="backgroundElement"
      style={[
        styles.card,
        {
          borderColor: theme.backgroundSelected,
        },
        style,
      ]}
      {...rest}>
      {children}
    </ThemedView>
  );
}

type ButtonProps = Omit<PressableProps, "style"> & {
  label: string;
  style?: StyleProp<ViewStyle>;
  variant?: "primary" | "secondary";
};

export function Button({ label, style, variant = "primary", ...rest }: ButtonProps) {
  const theme = useTheme();
  const isPrimary = variant === "primary";

  return (
    <Pressable
      style={({ pressed }) => [
        styles.button,
        {
          backgroundColor: isPrimary ? theme.primary : theme.backgroundElement,
          borderColor: isPrimary ? theme.primary : theme.backgroundSelected,
          opacity: pressed ? 0.82 : 1,
        },
        style,
      ]}
      {...rest}>
      <ThemedText
        type="smallBold"
        style={{
          color: isPrimary ? theme.primaryForeground : theme.text,
        }}>
        {label}
      </ThemedText>
    </Pressable>
  );
}

export function SectionHeader({
  title,
  subtitle,
}: {
  title: string;
  subtitle?: string;
}) {
  return (
    <View style={styles.sectionHeader}>
      <ThemedText type="subtitle">{title}</ThemedText>
      {subtitle ? <ThemedText themeColor="textSecondary">{subtitle}</ThemedText> : null}
    </View>
  );
}

export function LoadingState({ label = "Loading..." }: { label?: string }) {
  const theme = useTheme();

  return (
    <View style={styles.loadingState}>
      <ActivityIndicator color={theme.primary} />
      <ThemedText themeColor="textSecondary" style={{ color: theme.textSecondary }}>
        {label}
      </ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  scroll: {
    flex: 1,
  },
  content: {
    gap: Spacing.three,
    padding: Spacing.three,
    paddingBottom: Spacing.six,
  },
  card: {
    borderRadius: 24,
    borderWidth: 1,
    gap: Spacing.two,
    padding: Spacing.three,
  },
  button: {
    alignItems: "center",
    borderRadius: 999,
    borderWidth: 1,
    justifyContent: "center",
    minHeight: 52,
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.two,
  },
  sectionHeader: {
    gap: Spacing.one,
  },
  loadingState: {
    alignItems: "center",
    gap: Spacing.two,
    justifyContent: "center",
    paddingVertical: Spacing.five,
  },
});
