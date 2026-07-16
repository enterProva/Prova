import { useAuth } from "@/hooks/useAuth";
import { Shield, Home, Search, PauseCircle, GraduationCap, Users, Bot, Brain, User, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import type { TabType } from "@/pages/home";

interface SidebarProps {
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
  isOpen: boolean;
  onClose: () => void;
}

export default function Sidebar({ activeTab, setActiveTab, isOpen, onClose }: SidebarProps) {
  const { user, isAuthenticated } = useAuth();

  const handleLogout = () => {
    window.location.href = "/api/logout";
  };

  const navigationItems = [
    { id: 'feed', icon: Home, label: 'Feed' },
    { id: 'link-checker', icon: Search, label: 'Link Checker' },
    { id: 'pause-nudges', icon: PauseCircle, label: 'Pause Nudges' },
    { id: 'learn', icon: GraduationCap, label: 'Learn' },
    { id: 'community', icon: Users, label: 'Community' },
    { 
      id: 'social-companion', 
      icon: Bot, 
      label: 'Social Companion',
      badge: { text: 'Soon', variant: 'secondary' as const }
    },
    { 
      id: 'advanced-ai', 
      icon: Brain, 
      label: 'Advanced AI',
      badge: { text: 'Beta', variant: 'secondary' as const }
    },
  ];

  const getInitials = (firstName?: string | null, lastName?: string | null) => {
    const first = firstName?.charAt(0) || '';
    const last = lastName?.charAt(0) || '';
    return first + last || 'G';
  };

  return (
    <div
    className={`
    fixed inset-y-0 left-0 z-30 w-64 bg-white shadow-lg border-r
    transform transition-transform duration-300
    ${isOpen ? 'translate-x-0' : '-translate-x-full'}
    lg:translate-x-0
  `}
  data-testid="sidebar"
>
      {/* Header */}
      <div className="p-6 border-b">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center animate-pulse">
            <Shield className="w-6 h-6 text-white" data-testid="icon-shield-sidebar" />
          </div>
          <div>
            <h1 className="font-bold text-xl animate-pulse" data-testid="text-app-title">PPP</h1>
            <p className="text-xs text-gray-500 animate-pulse" data-testid="text-app-subtitle">
              Pause, Prove & Protect
            </p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="p-4 space-y-2">
        {navigationItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          
          return (
            <button
              key={item.id}
              onClick={() => {
                setActiveTab(item.id as TabType);
                onClose();
              }}
              className={`w-full flex items-center space-x-3 p-3 rounded-xl transition-all duration-300
                ${isActive 
                  ? 'bg-blue-50 text-primary font-semibold shadow-md scale-105' 
                  : 'text-gray-700 hover:bg-gray-50 hover:scale-105'}
                `}
              data-testid={`nav-item-${item.id}`}
            >
              <Icon className={`w-5 h-5 transition-colors duration-200 ${isActive ? 'text-primary' : ''}`} />
              <span className="font-medium">{item.label}</span>
              {item.badge && (
                <Badge 
                  variant={item.badge.variant}
                  className="ml-auto text-xs animate-pulse"
                  data-testid={`badge-${item.id}`}
                >
                  {item.badge.text}
                </Badge>
              )}
            </button>
          );
        })}
      </nav>

      {/* User Profile */}
      <div className="absolute bottom-0 left-0 right-0 p-4 border-t">
        {isAuthenticated && user ? (
          <div className="space-y-2">
            <button
              onClick={() => {
                setActiveTab('profile');
                onClose();
              }}
              className={`w-full flex items-center space-x-3 p-3 rounded-xl transition-all duration-300
                ${activeTab === 'profile' ? 'bg-blue-50 text-primary shadow-md scale-105' : 'hover:bg-gray-50 hover:scale-105'}`}
              data-testid="nav-item-profile"
            >
              <Avatar className="w-8 h-8 animate-pulse">
                <AvatarImage src={(user as any)?.profileImageUrl || undefined} />
                <AvatarFallback data-testid="avatar-initials">
                  {getInitials((user as any)?.firstName, (user as any)?.lastName)}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 text-left">
                <p className="font-medium text-sm">{(user as any)?.firstName && (user as any)?.lastName 
                  ? `${(user as any).firstName} ${(user as any).lastName}`
                  : (user as any)?.email || 'User'
                }</p>
                <p className="text-xs text-gray-500">View Profile</p>
              </div>
            </button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLogout}
              className="w-full justify-start text-gray-600 hover:text-red-600 transition-all duration-300 hover:scale-105"
              data-testid="button-logout"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        ) : (
          <div className="space-y-2">
            <Button
              onClick={() => {
                setActiveTab('profile');
                onClose();
              }}
              variant="ghost"
              className={`w-full justify-start transition-all duration-300 ${activeTab === 'profile' ? 'bg-blue-50 text-primary scale-105 shadow-md' : 'text-gray-600 hover:scale-105 hover:bg-gray-50'}`}
              data-testid="nav-item-guest-profile"
            >
              <User className="w-4 h-4 mr-2" />
              Guest Profile
            </Button>
            <Button
              onClick={() => window.location.href = "/api/login"}
              variant="ghost"
              size="sm"
              className="w-full justify-start text-primary hover:bg-blue-50 transition-all duration-300 hover:scale-105"
              data-testid="button-login-sidebar"
            >
              Login / Sign Up
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
