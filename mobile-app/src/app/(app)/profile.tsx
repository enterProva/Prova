import { Alert } from "react-native";

import { Button, Card, Screen, SectionHeader } from "@/components/prova-ui";
import { ThemedText } from "@/components/themed-text";
import { useSession } from "@/providers/session-provider";

export default function ProfileScreen() {
  const { isAuthenticated, signIn, signOut, user } = useSession();

  const handleSignIn = async () => {
    try {
      await signIn();
    } catch (error) {
      Alert.alert("Could not sign in", error instanceof Error ? error.message : "Please try again.");
    }
  };

  return (
    <Screen>
      <SectionHeader
        title="Profile"
      />

      <Card>
        <ThemedText type="smallBold">
          {isAuthenticated ? user?.name || user?.email || "Signed-in user" : "Guest session"}
        </ThemedText>
        <ThemedText themeColor="textSecondary">
          {isAuthenticated
            ? user?.email || "Signed in with mobile auth"
            : "Continue browsing or sign in to connect the app to your Google account."}
        </ThemedText>

        {isAuthenticated ? (
          <>
            <ThemedText>Links checked: {user?.linksChecked ?? 0}</ThemedText>
            <ThemedText>Trust score: {user?.trustScore ?? 50}</ThemedText>
            <ThemedText>Lessons completed: {user?.completedLessons ?? 0}</ThemedText>
            <Button label="Sign out" variant="secondary" onPress={signOut} />
          </>
        ) : (
          <Button label="Sign in with Google" onPress={handleSignIn} />
        )}
      </Card>
    </Screen>
  );
}
