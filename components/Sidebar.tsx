import React from 'react';
import { Layout, Library, Search, BookOpen, Settings } from 'lucide-react';

interface SidebarProps {
  currentView: 'discover' | 'library' | 'reader' | 'settings';
  setCurrentView: (view: 'discover' | 'library' | 'reader' | 'settings') => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentView, setCurrentView }) => {
  const navItems = [
    { id: 'discover', label: 'Discover', icon: Search },
    { id: 'library', label: 'My Library', icon: Library },
    { id: 'reader', label: 'Reader', icon: BookOpen, hidden: true },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <div className="w-20 lg:w-64 h-full bg-white border-r border-slate-200 flex flex-col shrink-0 transition-all duration-300 relative z-20">
      <div className="p-6 flex items-center justify-center lg:justify-start gap-3">
        <div className="w-8 h-8 bg-brand-600 rounded-lg flex items-center justify-center text-white font-serif font-bold text-xl shadow-lg shadow-brand-200">
          L
        </div>
        <span className="hidden lg:block font-serif font-bold text-xl text-slate-800">Lumina</span>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-2">
        {navItems.filter(item => !item.hidden || currentView === 'reader').map((item) => {
          const Icon = item.icon;
          const isActive = currentView === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setCurrentView(item.id as any)}
              className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-colors duration-200 group
                ${isActive 
                  ? 'bg-brand-50 text-brand-700 font-medium' 
                  : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
                }`}
            >
              <Icon className={`w-6 h-6 ${isActive ? 'text-brand-600' : 'text-slate-400 group-hover:text-slate-600'}`} />
              <span className="hidden lg:block">{item.label}</span>
            </button>
          );
        })}
      </nav>

      <div className="p-4 border-t border-slate-100">
        <div className="bg-slate-900 rounded-xl p-4 text-white hidden lg:block shadow-lg">
          <h3 className="text-sm font-medium mb-1 flex items-center gap-2">
            <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
            Gemini Active
          </h3>
          <p className="text-xs text-slate-400 leading-relaxed">Search grounding & Imagen enabled.</p>
        </div>
        <div className="mt-4 text-center lg:text-left pl-1">
            <p className="text-[10px] text-slate-300 font-medium hidden lg:block">Designed by Altin Kelmendi</p>
        </div>
      </div>
    </div>
  );
};