import { useAuth } from "@/hooks/useAuth";
import { Home, Search, PauseCircle, GraduationCap, Users, Bot, Brain, User, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import type { TabType } from "@/pages/home";

interface SidebarProps {
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
  isOpen: boolean;
  isCollapsed: boolean;
  onClose: () => void;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
}

export default function Sidebar({ activeTab, setActiveTab, isOpen, isCollapsed, onClose, onMouseEnter, onMouseLeave }: SidebarProps) {
  const { user, isAuthenticated } = useAuth();

  // Authentication removed for demo; provide client-side session clear if needed
  const handleEndSession = () => {
    // Clear guest/demo profile and reload
    if (typeof window !== "undefined") {
      sessionStorage.removeItem("guestProfile");
      sessionStorage.setItem("isGuest", "false");
      window.location.reload();
    }
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
    fixed inset-y-0 left-0 z-30 border-r border-white/60 bg-white/80 shadow-[0_18px_45px_rgba(37,52,79,0.08)]
    backdrop-blur-xl transform transition-all duration-300
    ${isOpen ? 'translate-x-0' : '-translate-x-full'}
    ${isCollapsed ? 'w-20' : 'w-64'}
    lg:translate-x-0
  `}
  data-testid="sidebar"
  onMouseEnter={onMouseEnter}
  onMouseLeave={onMouseLeave}
>
      {/* Header */}
      <div className="p-3 border-b border-slate-100 bg-gradient-to-r from-white via-slate-50 to-sky-50">
        <div className={`flex items-center ${isCollapsed ? 'justify-center' : 'justify-between'}`}>
          <div className={`flex items-center ${isCollapsed ? 'justify-center w-full' : 'space-x-3'}`}>
            <div className="w-10 h-10 bg-transparent rounded-xl flex items-center justify-center shadow-none">
              <img src="/mobile%20app-logo.png" alt="Prova" className="w-8 h-8 object-contain" data-testid="img-logo-sidebar" />
            </div>
            {!isCollapsed && (
              <div>
                <h1 className="font-bold text-xl tracking-[-0.05em]" data-testid="text-app-title">PROVA</h1>
                <p className="text-xs text-[#617891]" data-testid="text-app-subtitle">
                  Pause. Prove. Protect.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="p-3 space-y-2">
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
              className={`w-full flex items-center rounded-2xl transition-all duration-300
                ${isCollapsed ? 'justify-center p-2.5' : 'space-x-3 p-3'}
                ${isActive 
                  ? 'bg-[#edf3ff] text-[#25344f] font-semibold shadow-[0_8px_20px_rgba(37,52,79,0.08)] scale-[1.02]' 
                  : 'text-[#25344f] hover:bg-[#f5f7fa] hover:scale-[1.01]'}
                `}
              data-testid={`nav-item-${item.id}`}
              title={isCollapsed ? item.label : undefined}
            >
              <Icon className={`w-5 h-5 transition-colors duration-200 ${isActive ? 'text-primary' : ''}`} />
              {!isCollapsed && <span className="font-medium">{item.label}</span>}
              {!isCollapsed && item.badge && (
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
      <div className="absolute bottom-0 left-0 right-0 p-3 border-t">
        {isAuthenticated && user ? (
          <div className="space-y-2">
            <button
              onClick={() => {
                setActiveTab('profile');
                onClose();
              }}
              className={`w-full flex items-center rounded-xl transition-all duration-300
                ${isCollapsed ? 'justify-center p-2' : 'space-x-3 p-3'}
                ${activeTab === 'profile' ? 'bg-[#edf3f9] text-[#25344f] shadow-md scale-105' : 'hover:bg-[#f5f7fa] hover:scale-105'}`}
              data-testid="nav-item-profile"
              title={isCollapsed ? 'Profile' : undefined}
            >
              <Avatar className="w-8 h-8 animate-pulse">
                <AvatarImage src={(user as any)?.profileImageUrl || undefined} />
                <AvatarFallback data-testid="avatar-initials">
                  {getInitials((user as any)?.firstName, (user as any)?.lastName)}
                </AvatarFallback>
              </Avatar>
              {!isCollapsed && (
                <div className="flex-1 text-left">
                  <p className="font-medium text-sm">{(user as any)?.firstName && (user as any)?.lastName 
                    ? `${(user as any).firstName} ${(user as any).lastName}`
                    : (user as any)?.email || 'User'
                  }</p>
                  <p className="text-xs text-gray-500">View Profile</p>
                </div>
              )}
            </button>
            {!isCollapsed && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleEndSession}
                className="w-full justify-start text-[#25344f] hover:text-[#617891] transition-all duration-300 hover:scale-105"
                data-testid="button-end-session"
              >
                <LogOut className="w-4 h-4 mr-2" />
                End Session
              </Button>
            )}
          </div>
        ) : (
          <div className="space-y-2">
            <Button
              onClick={() => {
                setActiveTab('profile');
                onClose();
              }}
              variant="ghost"
              className={`w-full transition-all duration-300 ${isCollapsed ? 'justify-center px-0 py-3' : 'justify-start'} ${activeTab === 'profile' ? 'bg-[#edf3f9] text-[#25344f] scale-105 shadow-md' : 'text-[#25344f] hover:scale-105 hover:bg-[#f5f7fa]'}`}
              data-testid="nav-item-guest-profile"
              title={isCollapsed ? 'Guest Profile' : undefined}
            >
              <User className="w-4 h-4 mr-2" />
              {!isCollapsed && 'Guest Profile'}
            </Button>
            {/* Google auth removed for demo builds */}
          </div>
        )}
      </div>
    </div>
  );
}
