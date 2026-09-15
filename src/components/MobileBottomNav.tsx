import React from 'react';
import { CheckSquare, Bot, ShieldAlert, Terminal, Layers } from 'lucide-react';

interface MobileBottomNavProps {
  activeTab: 'dashboard' | 'ai-studio' | 'security' | 'api-explorer' | 'architecture';
  setActiveTab: (tab: 'dashboard' | 'ai-studio' | 'security' | 'api-explorer' | 'architecture') => void;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  activeTab,
  setActiveTab
}) => {
  const navItems = [
    { id: 'dashboard' as const, label: 'Tasks', icon: CheckSquare },
    { id: 'ai-studio' as const, label: 'Voice AI', icon: Bot },
    { id: 'security' as const, label: 'Security', icon: ShieldAlert },
    { id: 'api-explorer' as const, label: 'API', icon: Terminal },
    { id: 'architecture' as const, label: 'Arch', icon: Layers }
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#101415]/95 border-t border-white/10 backdrop-blur-xl px-2 py-1.5 flex items-center justify-around">
      {navItems.map(item => {
        const Icon = item.icon;
        const isActive = activeTab === item.id;
        return (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`flex flex-col items-center justify-center py-1 px-3 rounded-xl transition-all cursor-pointer ${
              isActive ? 'text-[#c0c1ff]' : 'text-[#908fa0] hover:text-white'
            }`}
          >
            <Icon className={`w-5 h-5 ${isActive ? 'text-[#c0c1ff]' : 'text-[#908fa0]'}`} />
            <span className="text-[10px] font-mono mt-0.5">{item.label}</span>
          </button>
        );
      })}
    </nav>
  );
};
