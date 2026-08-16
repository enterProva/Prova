import { useState } from "react";
import { useIsMobile } from "@/hooks/use-mobile";
import Sidebar from "@/components/sidebar";
import FloatingActionButton from "@/components/floating-action-button";
import QuickCheckModal from "@/components/quick-check-modal";
import FeedTab from "@/components/tabs/feed-tab";
import LinkCheckerTab, { type LinkCheckResult } from "@/components/tabs/link-checker-tab";
import PauseNudgesTab from "@/components/tabs/pause-nudges-tab";
import LearnTab from "@/components/tabs/learn-tab";
import CommunityTab from "@/components/tabs/community-tab";
import SocialCompanionTab from "@/components/tabs/social-companion-tab";
import AdvancedAITab from "@/components/tabs/advanced-ai-tab";
import ProfileTab from "@/components/tabs/profile-tab";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";

export type TabType = 'feed' | 'link-checker' | 'pause-nudges' | 'learn' | 'community' | 'social-companion' | 'advanced-ai' | 'profile';

export default function Home() {
  const [activeTab, setActiveTab] = useState<TabType>('feed');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(true);
  const [quickCheckOpen, setQuickCheckOpen] = useState(false);
  const [quickCheckResult, setQuickCheckResult] = useState<LinkCheckResult | null>(null);
  const isMobile = useIsMobile();

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const renderActiveTab = () => {
    switch (activeTab) {
      case 'feed':
        return <FeedTab />;
      case 'link-checker':
        return <LinkCheckerTab initialResult={quickCheckResult} />;
      case 'pause-nudges':
        return <PauseNudgesTab />;
      case 'learn':
        return <LearnTab />;
      case 'community':
        return <CommunityTab />;
      case 'social-companion':
        return <SocialCompanionTab />;
      case 'advanced-ai':
        return <AdvancedAITab />;
      case 'profile':
        return <ProfileTab />;
      default:
        return <FeedTab />;
    }
  };

  return (
    <div className="min-h-screen bg-transparent" data-testid="page-home">
      {/* Mobile Header */}
      {isMobile && (
        <div className="bg-white shadow-sm border-b px-4 py-3 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-transparent rounded-lg flex items-center justify-center">
              <img src="/mobile-app-logo.png" alt="Prova" className="w-6 h-6 object-contain" data-testid="img-logo-mobile" />
            </div>
            <h1 className="font-bold text-lg tracking-[-0.05em]" data-testid="text-app-title-mobile">PROVA</h1>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleSidebar}
            data-testid="button-mobile-menu"
          >
            <Menu className="w-6 h-6 text-gray-600" />
          </Button>
        </div>
      )}

      <div className="flex bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.7),_rgba(245,247,251,0.8))]">
        {/* Sidebar */}
        <Sidebar 
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          isOpen={sidebarOpen}
          isCollapsed={sidebarCollapsed}
          onClose={() => setSidebarOpen(false)}
          onMouseEnter={() => !isMobile && setSidebarCollapsed(false)}
          onMouseLeave={() => !isMobile && setSidebarCollapsed(true)}
        />

        {/* Mobile overlay */}
        {isMobile && sidebarOpen && (
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 z-20"
            onClick={() => setSidebarOpen(false)}
            data-testid="overlay-mobile-sidebar"
          />
        )}

        {/* Main Content */}
        <div className="flex-1 lg:ml-0">
          {renderActiveTab()}
        </div>
      </div>

      {/* Mobile Bottom Navigation */}
      {isMobile && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t shadow-lg z-10">
          <div className="grid grid-cols-5 gap-1 p-2">
            {[
              { id: 'feed', icon: 'home', label: 'Feed' },
              { id: 'link-checker', icon: 'search', label: 'Check' },
              { id: 'pause-nudges', icon: 'pause-circle', label: 'Pause' },
              { id: 'learn', icon: 'graduation-cap', label: 'Learn' },
              { id: 'profile', icon: 'user', label: 'Profile' },
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id as TabType)}
                className={`flex flex-col items-center p-2 rounded-lg transition-colors duration-200 ${
                  activeTab === item.id 
                    ? 'bg-blue-50 text-primary' 
                    : 'text-gray-600 hover:text-primary'
                }`}
                data-testid={`button-mobile-tab-${item.id}`}
              >
                <i className={`fas fa-${item.icon} text-lg`}></i>
                <span className="text-xs mt-1">{item.label}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Floating Action Button */}
      <FloatingActionButton onClick={() => setQuickCheckOpen(true)} />

      {/* Quick Check Modal */}
      <QuickCheckModal 
        isOpen={quickCheckOpen}
        onClose={() => setQuickCheckOpen(false)}
        onCheckComplete={(result) => {
          setQuickCheckResult(result);
          setQuickCheckOpen(false);
          setActiveTab('link-checker');
        }}
      />
    </div>
  );
}
