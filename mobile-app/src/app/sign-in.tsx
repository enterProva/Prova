import { Redirect, type Href } from "expo-router";
import { Alert, StyleSheet, View } from "react-native";

import { Button, Card, Screen, SectionHeader } from "@/components/prova-ui";
import { ThemedText } from "@/components/themed-text";
import { Spacing } from "@/constants/theme";
import { useSession } from "@/providers/session-provider";

export default function SignInScreen() {
  const { continueAsGuest, hasEnteredApp, isAuthenticated, signIn } = useSession();

  if (isAuthenticated || hasEnteredApp) {
    return <Redirect href={"/feed" as Href} />;
  }

  const handleGoogleSignIn = async () => {
    try {
      await signIn();
    } catch (error) {
      Alert.alert("Sign-in failed", error instanceof Error ? error.message : "Please try again.");
    }
  };

  return (
    <Screen>
      <View style={styles.hero}>
        <ThemedText type="title">Prova</ThemedText>
        <ThemedText themeColor="textSecondary">
          Pause, prove, and protect yourself from misinformation with a mobile-first Prova experience.
        </ThemedText>
      </View>

      <Card>
        <SectionHeader
          title="Start on mobile"
          subtitle="Use Google to sync your activity, or continue without an account and browse the core experience first."
        />
        <Button label="Continue with Google" onPress={handleGoogleSignIn} />
        <Button label="Continue without account" variant="secondary" onPress={continueAsGuest} />
      </Card>

      <Card>
        <SectionHeader title="What’s included" />
        <ThemedText>• AI-powered link checking against the existing Prova backend</ThemedText>
        <ThemedText>• Feed access backed by the current Express and Firebase stack</ThemedText>
        <ThemedText>• A native profile and session flow built for Expo</ThemedText>
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  hero: {
    gap: Spacing.two,
    paddingTop: Spacing.four,
  },
});
