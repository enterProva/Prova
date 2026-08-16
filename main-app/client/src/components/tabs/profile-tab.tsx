import { useAuth, type User } from "@/hooks/useAuth";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { User as UserIcon, LogOut } from "lucide-react";

export default function ProfileTab() {
  const { user, isAuthenticated, isGuest, hasFullAccess, setIsGuest, setGuestProfile } = useAuth();

  const handleEndSession = () => {
    setGuestProfile(null);
    setIsGuest(false);
    if (typeof window !== "undefined") window.location.reload();
  };

  const getInitials = (name?: string | null) => {
    if (!name) return "G";
    return name
      .split(" ")
      .map((n) => n.charAt(0))
      .join("")
      .toUpperCase();
  };

  const displayName = user?.guest && !hasFullAccess ? "Guest User" : user?.name || "User";
  const avatarUrl = user?.guest && !hasFullAccess ? undefined : user?.avatarUrl;

  return (
    <div className="p-4 lg:p-6" data-testid="tab-profile">
      <div className="max-w-2xl mx-auto">
        {user ? (
          <Card>
            <CardContent className="p-8 text-center">
              <Avatar className="w-24 h-24 mx-auto mb-6">
                {avatarUrl ? (
                  <AvatarImage src={avatarUrl} />
                ) : (
                  <AvatarFallback className="text-2xl font-bold bg-gradient-to-r from-[#25344f] to-[#617891] text-white">
                    {getInitials(displayName)}
                  </AvatarFallback>
                )}
              </Avatar>

              <h2 className="text-2xl font-bold mb-2" data-testid="text-user-name">
                {displayName}
              </h2>

              {user.email && hasFullAccess && (
                <p className="text-gray-600 mb-6" data-testid="text-user-email">
                  {user.email}
                </p>
              )}

              {hasFullAccess && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-primary" data-testid="stat-user-links-checked">
                      {user.linksChecked || 0}
                    </div>
                    <div className="text-sm text-gray-600">Links Checked</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-success" data-testid="stat-user-streak">
                      {user.streakDays || 0}
                    </div>
                    <div className="text-sm text-gray-600">Day Streak</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-warning" data-testid="stat-user-trust-score">
                      {user.trustScore || 50}%
                    </div>
                    <div className="text-sm text-gray-600">Trust Score</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600" data-testid="stat-user-completed-lessons">
                      {user.completedLessons || 0}
                    </div>
                    <div className="text-sm text-gray-600">Lessons</div>
                  </div>
                </div>
              )}

              {isGuest && !hasFullAccess ? (
                <div className="space-y-4">
                  <Button onClick={handleEndSession} className="w-full" data-testid="button-end-session-profile">
                    End Session
                  </Button>
                  <p className="text-sm text-gray-500">
                    Guest Preview — limited features. Use UNESCO Judge Demo for full-access evaluation.
                  </p>
                </div>
              ) : (
                <Button
                  onClick={handleEndSession}
                  variant="outline"
                  className="text-primary"
                  data-testid="button-end-session-profile"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  End Session
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardContent className="p-8 text-center">
              <div className="w-24 h-24 bg-gradient-to-r from-[#25344f] to-[#617891] rounded-full flex items-center justify-center mx-auto mb-6">
                <UserIcon className="w-12 h-12 text-white" data-testid="icon-guest-user" />
              </div>
              <h2 className="text-2xl font-bold mb-4" data-testid="text-guest-title">
                Guest Preview
              </h2>
              <p className="text-gray-600 mb-8" data-testid="text-guest-description">
                Use the Guest Preview or UNESCO Judge Demo from the Get Started screen to explore the app.
              </p>
              <Button onClick={() => (window.location.href = "/auth")} className="w-full" data-testid="button-get-started-profile">
                Get Started
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
