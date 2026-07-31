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
      Alert.alert(
        "Could not sign in",
        error instanceof Error ? error.message : "Please try again."
      );
    }
  };

  return (
    <Screen>
      <SectionHeader title="Profile" />

      <Card>
        <ThemedText style={styles.figtreeBold}>
          {isAuthenticated
            ? user?.name || user?.email || "Signed-in user"
            : "Guest session"}
        </ThemedText>

        <ThemedText style={styles.figtreeText}>
          {isAuthenticated
            ? user?.email || "Signed in with mobile auth"
            : "Continue browsing or sign in to connect the app to your Google account."}
        </ThemedText>

        {isAuthenticated ? (
          <>
            <ThemedText style={styles.figtreeText}>
              Links checked: {user?.linksChecked ?? 0}
            </ThemedText>

            <ThemedText style={styles.figtreeText}>
              Trust score: {user?.trustScore ?? 50}
            </ThemedText>

            <ThemedText style={styles.figtreeText}>
              Lessons completed: {user?.completedLessons ?? 0}
            </ThemedText>

            <Button
              label="Sign out"
              variant="secondary"
              onPress={signOut}
            />
          </>
        ) : (
          <Button
            label="Sign in with Google"
            onPress={handleSignIn}
          />
        )}
      </Card>
    </Screen>
  );
}

const styles = {
  figtreeText: {
    fontFamily: "Figtree",
  },

  figtreeBold: {
    fontFamily: "FigtreeSemiBold",
  },
};