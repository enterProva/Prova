import { Redirect, type Href } from "expo-router";

import { LoadingState } from "@/components/prova-ui";
import { useSession } from "@/providers/session-provider";

export default function IndexRoute() {
  const { hasEnteredApp, isBootstrapping, isAuthenticated } = useSession();

  if (isBootstrapping) {
    return <LoadingState label="Preparing Prova..." />;
  }

  if (isAuthenticated || hasEnteredApp) {
    return <Redirect href={"/feed" as Href} />;
  }

  return <Redirect href={"/sign-in" as Href} />;
}
