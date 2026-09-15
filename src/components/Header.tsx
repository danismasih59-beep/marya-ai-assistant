import React, { useState } from 'react';
import { 
  Bot, 
  CheckSquare, 
  ShieldAlert, 
  Terminal, 
  Layers, 
  Bell, 
  RefreshCw, 
  Wifi, 
  Sparkles,
  ChevronRight,
  ExternalLink,
  Smartphone
} from 'lucide-react';
import { FCMNotification } from '../types';

interface HeaderProps {
  activeTab: 'dashboard' | 'ai-studio' | 'security' | 'api-explorer' | 'architecture';
  setActiveTab: (tab: 'dashboard' | 'ai-studio' | 'security' | 'api-explorer' | 'architecture') => void;
  notifications: FCMNotification[];
  onOpenQuickPrompt: () => void;
  isSyncing: boolean;
  onTriggerSync: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  notifications,
  onOpenQuickPrompt,
  isSyncing,
  onTriggerSync
}) => {
  const [showNotifications, setShowNotifications] = useState(false);
  const unreadCount = notifications.filter(n => !n.read).length;

  const navItems = [
    { id: 'dashboard' as const, label: 'Dashboard', icon: CheckSquare },
    { id: 'ai-studio' as const, label: 'AI Voice & Studio', icon: Bot, badge: 'Gemini' },
    { id: 'security' as const, label: 'Security Intelligence', icon: ShieldAlert },
    { id: 'api-explorer' as const, label: 'OpenAPI Sandbox', icon: Terminal, badge: 'FastAPI' },
    { id: 'architecture' as const, label: 'Architecture & Code', icon: Layers }
  ];

  return (
    <header className="sticky top-0 z-40 w-full border-b border-white/10 bg-[#101415]/85 backdrop-blur-xl transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Brand Logo */}
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setActiveTab('dashboard')}>
            <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-tr from-[#494bd6] to-[#03b5d3] p-0.5 shadow-lg shadow-[#494bd6]/30">
              <div className="w-full h-full bg-[#101415] rounded-[10px] flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-[#c0c1ff] animate-pulse" />
              </div>
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-xl font-bold tracking-tight bg-gradient-to-r from-[#c0c1ff] via-[#8083ff] to-[#4cd7f6] bg-clip-text text-transparent">
                  Myra AI
                </span>
                <span className="text-[10px] font-mono font-medium px-2 py-0.5 rounded-full bg-[#1d2022] text-[#4cd7f6] border border-[#4cd7f6]/20">
                  Cloud v1.0
                </span>
              </div>
              <p className="text-[11px] text-[#908fa0] -mt-0.5 hidden sm:block">
                Android Jetpack Compose &amp; FastAPI Core
              </p>
            </div>
          </div>

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex items-center space-x-1">
            {navItems.map(item => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  id={`nav-btn-${item.id}`}
                  onClick={() => setActiveTab(item.id)}
                  className={`relative flex items-center space-x-2 px-3.5 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                    isActive 
                      ? 'text-[#c0c1ff] bg-[#1d2022] border border-[#8083ff]/30 shadow-sm shadow-[#8083ff]/20' 
                      : 'text-[#c7c4d7] hover:text-white hover:bg-white/5 border border-transparent'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-[#c0c1ff]' : 'text-[#908fa0]'}`} />
                  <span>{item.label}</span>
                  {item.badge && (
                    <span className={`text-[10px] px-1.5 py-0.2 rounded-md font-mono ${
                      isActive ? 'bg-[#8083ff]/30 text-[#c0c1ff]' : 'bg-[#191c1e] text-[#908fa0]'
                    }`}>
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Right Actions: Sync Status, Quick Voice trigger, Notifications, Device badge */}
          <div className="flex items-center space-x-2.5">
            
            {/* Sync telemetry pill */}
            <button
              onClick={onTriggerSync}
              title="Differential Memory Sync with PostgreSQL"
              className="flex items-center space-x-2 px-3 py-1.5 rounded-xl bg-[#1d2022] hover:bg-[#272a2c] border border-white/10 text-xs font-mono text-[#c7c4d7] transition-all"
            >
              <div className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#4cd7f6] opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[#4cd7f6] glow-dot-success"></span>
              </div>
              <span className="hidden sm:inline">Cloud Sync</span>
              <RefreshCw className={`w-3.5 h-3.5 text-[#4cd7f6] ${isSyncing ? 'animate-spin' : ''}`} />
            </button>

            {/* Quick AI Voice trigger button */}
            <button
              onClick={onOpenQuickPrompt}
              className="hidden lg:flex items-center space-x-2 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-[#494bd6]/40 to-[#03b5d3]/40 hover:from-[#494bd6]/60 hover:to-[#03b5d3]/60 border border-[#8083ff]/40 text-xs font-medium text-[#c0c1ff] shadow-sm transition-all"
            >
              <Bot className="w-3.5 h-3.5 text-[#4cd7f6]" />
              <span>Voice Prompt</span>
              <kbd className="text-[10px] bg-[#101415]/70 px-1.5 py-0.5 rounded text-[#908fa0] font-mono">⌘K</kbd>
            </button>

            {/* Notifications Popover Toggle */}
            <div className="relative">
              <button
                id="header-notifications-btn"
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative p-2 rounded-xl bg-[#1d2022] hover:bg-[#272a2c] text-[#c7c4d7] hover:text-white border border-white/10 transition-all"
                aria-label="View notifications"
              >
                <Bell className="w-4 h-4" />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-[#ffb4ab] glow-dot-error animate-pulse"></span>
                )}
              </button>

              {/* Notification dropdown */}
              {showNotifications && (
                <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl bg-[#1d2022] border border-white/10 shadow-2xl p-4 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                  <div className="flex items-center justify-between pb-3 border-b border-white/10">
                    <div className="flex items-center space-x-2">
                      <Bell className="w-4 h-4 text-[#c0c1ff]" />
                      <span className="text-sm font-semibold text-white">FCM Push Feed</span>
                    </div>
                    <span className="text-xs text-[#908fa0] font-mono">
                      {notifications.length} updates
                    </span>
                  </div>
                  
                  <div className="divide-y divide-white/5 max-h-72 overflow-y-auto mt-2 pr-1">
                    {notifications.length === 0 ? (
                      <p className="text-xs text-[#908fa0] py-4 text-center">No push notifications dispatched yet.</p>
                    ) : (
                      notifications.map(notif => (
                        <div key={notif.id} className="py-2.5 flex items-start space-x-3">
                          <div className={`mt-0.5 w-2 h-2 rounded-full shrink-0 ${
                            notif.type === 'security' ? 'bg-[#ffb4ab] glow-dot-error' :
                            notif.type === 'sync' ? 'bg-[#4cd7f6] glow-dot-success' : 'bg-[#c0c1ff] glow-dot-primary'
                          }`} />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <p className="text-xs font-semibold text-[#e0e3e5] truncate">{notif.title}</p>
                              <span className="text-[10px] text-[#908fa0] font-mono">
                                {new Date(notif.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </span>
                            </div>
                            <p className="text-xs text-[#c7c4d7] mt-0.5 line-clamp-2">{notif.body}</p>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Android Device Status Indicator */}
            <div className="hidden sm:flex items-center space-x-2 pl-2 border-l border-white/10">
              <div className="flex items-center space-x-2 px-2.5 py-1 rounded-xl bg-[#191c1e] border border-white/5">
                <Smartphone className="w-3.5 h-3.5 text-[#4cd7f6]" />
                <span className="text-xs font-mono text-[#c7c4d7]">Pixel 9 Pro</span>
              </div>
            </div>

          </div>
        </div>
      </div>
    </header>
  );
};
