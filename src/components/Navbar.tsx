import React from 'react';
import {
  Scan,
  Activity,
  ShieldCheck,
  Users,
  Sparkles,
} from 'lucide-react';
import { PWAInstallButton } from './PWAInstallButton';

export type MainTab = 'scanner' | 'diagnostic' | 'actives' | 'clients';

interface Props {
  activeTab: MainTab;
  setActiveTab: (tab: MainTab) => void;
  instituteName?: string;
  isAiReady?: boolean;
}

export const Navbar: React.FC<Props> = ({
  activeTab,
  setActiveTab,
  instituteName = "Institut Derm'Esthétique Pro",
  isAiReady = true,
}) => {
  return (
    <header className="no-print sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-stone-200/90 shadow-2xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-20">
          {/* Logo & Institute Branding */}
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-rose-950 via-rose-900 to-stone-900 text-rose-200 flex items-center justify-center shadow-sm shrink-0">
              <Sparkles className="w-5 h-5 text-rose-300" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-serif font-bold text-xl text-stone-900 tracking-tight">
                  DermEsthetic <span className="text-rose-800 font-sans text-sm font-semibold tracking-wide">PRO</span>
                </span>
                <span className="hidden sm:inline-block text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-rose-50 text-rose-800 border border-rose-200/80">
                  Salon & Institut
                </span>
              </div>
              <p className="text-xs text-stone-500 font-medium truncate max-w-xs sm:max-w-none">
                Diagnostic Clinique Visage & Corps · Toxicologie INCI & Scanner
              </p>
            </div>
          </div>

          {/* Navigation Items (Segmented buttons) */}
          <nav className="hidden md:flex items-center gap-1 p-1 bg-stone-100 rounded-2xl border border-stone-200/60">
            <button
              onClick={() => setActiveTab('scanner')}
              className={`px-4 py-2 text-xs font-semibold rounded-xl transition-all flex items-center gap-2 ${
                activeTab === 'scanner'
                  ? 'bg-white text-stone-900 shadow-2xs'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              <Scan className="w-3.5 h-3.5 text-rose-700" />
              Scanner Code-barre & INCI
            </button>
            <button
              onClick={() => setActiveTab('diagnostic')}
              className={`px-4 py-2 text-xs font-semibold rounded-xl transition-all flex items-center gap-2 ${
                activeTab === 'diagnostic'
                  ? 'bg-white text-stone-900 shadow-2xs'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              <Activity className="w-3.5 h-3.5 text-rose-700" />
              Diagnostic Peau (Visage & Corps)
            </button>
            <button
              onClick={() => setActiveTab('actives')}
              className={`px-4 py-2 text-xs font-semibold rounded-xl transition-all flex items-center gap-2 ${
                activeTab === 'actives'
                  ? 'bg-white text-stone-900 shadow-2xs'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" />
              Guide Actifs & Toxicologie
            </button>
            <button
              onClick={() => setActiveTab('clients')}
              className={`px-4 py-2 text-xs font-semibold rounded-xl transition-all flex items-center gap-2 ${
                activeTab === 'clients'
                  ? 'bg-white text-stone-900 shadow-2xs'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              <Users className="w-3.5 h-3.5 text-stone-700" />
              Dossiers Clientes
            </button>
          </nav>

          {/* Right Quick Controls: PWA Install */}
          <div className="flex items-center gap-2 sm:gap-3">
            <PWAInstallButton />
          </div>
        </div>

        {/* Mobile Navigation Bar */}
        <div className="md:hidden flex overflow-x-auto py-2.5 gap-1 border-t border-stone-100 no-scrollbar">
          <button
            onClick={() => setActiveTab('scanner')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'scanner'
                ? 'bg-rose-950 text-white'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            <Scan className="w-3.5 h-3.5" />
            Scanner INCI
          </button>
          <button
            onClick={() => setActiveTab('diagnostic')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'diagnostic'
                ? 'bg-rose-950 text-white'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            <Activity className="w-3.5 h-3.5" />
            Diagnostic Peau
          </button>
          <button
            onClick={() => setActiveTab('actives')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'actives'
                ? 'bg-rose-950 text-white'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            Guide Actifs
          </button>
          <button
            onClick={() => setActiveTab('clients')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'clients'
                ? 'bg-rose-950 text-white'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            Clientes
          </button>
        </div>
      </div>
    </header>
  );
};
