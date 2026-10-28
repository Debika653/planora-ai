import React from 'react';
import { Sparkles, Calendar, PlusCircle, Settings, CheckCircle2, ShieldCheck } from 'lucide-react';

interface HeaderProps {
  currentView: 'landing' | 'dashboard' | 'wizard' | 'workspace';
  onNavigate: (view: 'landing' | 'dashboard' | 'wizard' | 'workspace') => void;
  savedEventsCount: number;
  onOpenSettings: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentView,
  onNavigate,
  savedEventsCount,
  onOpenSettings,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-[#FAF8F5]/95 backdrop-blur-md border-b border-[#2D142C]/10 no-print transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between">
        {/* Brand */}
        <button
          onClick={() => onNavigate('landing')}
          className="flex items-center gap-3 text-left group focus:outline-none focus:ring-2 focus:ring-[#E06D53] rounded-lg p-1"
          aria-label="Planora AI Home"
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#2D142C] to-[#7C699E] flex items-center justify-center text-white shadow-md shadow-[#2D142C]/10 group-hover:scale-105 transition-transform">
            <Sparkles className="w-5 h-5 text-[#FA8F79]" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-serif text-xl sm:text-2xl font-bold tracking-tight text-[#2D142C]">
                Planora
              </span>
              <span className="text-xs font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded bg-[#E06D53]/15 text-[#E06D53]">
                AI
              </span>
            </div>
            <p className="text-[11px] text-[#2D142C]/65 hidden sm:block font-medium">
              Celebration & Event Workspace
            </p>
          </div>
        </button>

        {/* Navigation Actions */}
        <nav className="flex items-center gap-2 sm:gap-3" aria-label="Main Navigation">
          <button
            onClick={() => onNavigate('landing')}
            className={`px-3 py-2 rounded-xl text-sm font-medium transition-colors ${
              currentView === 'landing'
                ? 'bg-[#2D142C]/8 text-[#2D142C] font-semibold'
                : 'text-[#2D142C]/70 hover:text-[#2D142C] hover:bg-[#2D142C]/5'
            }`}
          >
            Explore
          </button>

          <button
            onClick={() => onNavigate('dashboard')}
            className={`px-3 py-2 rounded-xl text-sm font-medium flex items-center gap-2 transition-colors ${
              currentView === 'dashboard' || currentView === 'workspace'
                ? 'bg-[#2D142C]/8 text-[#2D142C] font-semibold'
                : 'text-[#2D142C]/70 hover:text-[#2D142C] hover:bg-[#2D142C]/5'
            }`}
          >
            <Calendar className="w-4 h-4 text-[#7C699E]" />
            <span>My Celebrations</span>
            {savedEventsCount > 0 && (
              <span className="w-5 h-5 rounded-full bg-[#E06D53] text-white text-xs font-bold flex items-center justify-center">
                {savedEventsCount}
              </span>
            )}
          </button>

          <button
            onClick={() => onNavigate('wizard')}
            className="px-4 py-2 rounded-xl text-sm font-semibold bg-[#2D142C] text-white hover:bg-[#1E0D1E] active:scale-95 shadow-sm transition-all flex items-center gap-1.5"
          >
            <PlusCircle className="w-4 h-4 text-[#FA8F79]" />
            <span className="hidden sm:inline">Plan Event</span>
            <span className="sm:hidden">New</span>
          </button>

          <button
            onClick={onOpenSettings}
            className="p-2 rounded-xl text-[#2D142C]/70 hover:text-[#2D142C] hover:bg-[#2D142C]/5 transition-colors focus:ring-2 focus:ring-[#E06D53]"
            aria-label="Settings and Storage Status"
            title="Settings & Storage Status"
          >
            <Settings className="w-5 h-5" />
          </button>
        </nav>
      </div>
    </header>
  );
};
