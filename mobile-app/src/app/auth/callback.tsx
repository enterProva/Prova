import { Redirect, type Href, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import { Alert } from "react-native";

import { LoadingState, Screen } from "@/components/prova-ui";
import { useSession } from "@/providers/session-provider";

export default function AuthCallbackScreen() {
  const params = useLocalSearchParams<{ code?: string }>();
  const { completeAuthCode, isAuthenticated } = useSession();
  const [isCompleting, setIsCompleting] = useState(true);

  useEffect(() => {
    async function complete() {
      if (!params.code) {
        setIsCompleting(false);
        return;
      }

      try {
        await completeAuthCode(params.code);
      } catch (error) {
        Alert.alert(
          "Could not finish sign-in",
          error instanceof Error ? error.message : "Please try again."
        );
      } finally {
        setIsCompleting(false);
      }
    }

    void complete();
  }, [completeAuthCode, params.code]);

  if (isAuthenticated) {
    return <Redirect href={"/feed" as Href} />;
  }

  if (!isCompleting) {
    return <Redirect href={"/sign-in" as Href} />;
  }

  return (
    <Screen>
      <LoadingState label="Completing secure sign-in..." />
    </Screen>
  );
}
