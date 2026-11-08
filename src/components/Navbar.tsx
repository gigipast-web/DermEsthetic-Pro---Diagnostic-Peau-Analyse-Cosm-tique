import React from 'react';
import {
  Scan,
  Activity,
  ShieldCheck,
  Users,
  Sparkles,
  LogIn,
  Crown,
  Smartphone,
} from 'lucide-react';
import { PWAInstallButton } from './PWAInstallButton';
import { LanguageSelector } from './LanguageSelector';
import { PractitionerUser } from '../types';
import { useLanguage } from '../context/LanguageContext';

export type MainTab = 'scanner' | 'diagnostic' | 'actives' | 'clients';

interface Props {
  activeTab: MainTab;
  setActiveTab: (tab: MainTab) => void;
  instituteName?: string;
  isAiReady?: boolean;
  currentUser?: PractitionerUser | null;
  onOpenProfile?: () => void;
  onOpenAuth?: () => void;
  onOpenSubscription?: () => void;
  onOpenGooglePlayModal?: () => void;
}

export const Navbar: React.FC<Props> = ({
  activeTab,
  setActiveTab,
  currentUser,
  onOpenProfile,
  onOpenAuth,
  onOpenSubscription,
  onOpenGooglePlayModal,
}) => {
  const { t } = useLanguage();

  return (
    <header className="no-print sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-stone-200/90 shadow-2xs">
      <div className="max-w-7xl mx-auto px-2 sm:px-6">
        <div className="flex items-center justify-between h-14 sm:h-20 gap-1 sm:gap-4">
          {/* Logo & Institute Branding - Compact on 9/16 mobile */}
          <div className="flex items-center gap-1.5 sm:gap-3 shrink min-w-0">
            <div className="w-7 h-7 sm:w-11 sm:h-11 rounded-lg sm:rounded-2xl bg-gradient-to-br from-rose-950 via-rose-900 to-stone-900 text-rose-200 flex items-center justify-center shadow-xs shrink-0">
              <Sparkles className="w-3.5 h-3.5 sm:w-5 sm:h-5 text-rose-300" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1 sm:gap-2">
                <span className="font-serif font-bold text-xs sm:text-xl text-stone-900 tracking-tight truncate">
                  DermEsthetic <span className="text-rose-800 font-sans text-[9px] sm:text-sm font-semibold tracking-wide">PRO</span>
                </span>
                <span className="hidden lg:inline-block text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-rose-50 text-rose-800 border border-rose-200/80">
                  {currentUser ? currentUser.instituteName : t.nav.institute}
                </span>
              </div>
              <p className="hidden sm:block text-[11px] sm:text-xs text-stone-500 font-medium truncate max-w-[190px] sm:max-w-xs md:max-w-none">
                {currentUser
                  ? `${currentUser.fullName} (${currentUser.role})`
                  : t.nav.subTitleLoggedOut}
              </p>
            </div>
          </div>

          {/* Navigation Items (Segmented buttons on desktop) */}
          <nav className="hidden lg:flex items-center gap-1 p-1 bg-stone-100 rounded-2xl border border-stone-200/60">
            <button
              onClick={() => setActiveTab('scanner')}
              className={`px-3.5 py-2 text-xs font-semibold rounded-xl transition-all flex items-center gap-2 cursor-pointer ${
                activeTab === 'scanner'
                  ? 'bg-white text-stone-900 shadow-2xs'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              <Scan className="w-3.5 h-3.5 text-rose-700" />
              {t.nav.scanner}
            </button>
            <button
              onClick={() => setActiveTab('diagnostic')}
              className={`px-3.5 py-2 text-xs font-semibold rounded-xl transition-all flex items-center gap-2 cursor-pointer ${
                activeTab === 'diagnostic'
                  ? 'bg-white text-stone-900 shadow-2xs'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              <Activity className="w-3.5 h-3.5 text-rose-700" />
              {t.nav.diagnostic}
            </button>
            <button
              onClick={() => setActiveTab('actives')}
              className={`px-3.5 py-2 text-xs font-semibold rounded-xl transition-all flex items-center gap-2 cursor-pointer ${
                activeTab === 'actives'
                  ? 'bg-white text-stone-900 shadow-2xs'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" />
              {t.nav.actives}
            </button>
            <button
              onClick={() => setActiveTab('clients')}
              className={`px-3.5 py-2 text-xs font-semibold rounded-xl transition-all flex items-center gap-2 cursor-pointer ${
                activeTab === 'clients'
                  ? 'bg-white text-stone-900 shadow-2xs'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              <Users className="w-3.5 h-3.5 text-stone-700" />
              {t.nav.clients}
            </button>
          </nav>

          {/* Right Quick Controls: Language Dropdown, 29€ Tab, Inscription / Profile */}
          <div className="flex items-center gap-1 sm:gap-2 shrink-0">
            {/* Multilingual Dropdown Menu */}
            <LanguageSelector variant="navbar" />

            <div className="hidden sm:block">
              <PWAInstallButton />
            </div>

            {/* Google Play Beta Test Button */}
            {onOpenGooglePlayModal && (
              <button
                onClick={onOpenGooglePlayModal}
                title="Tester l'application sur Google Play (Android)"
                className="hidden md:flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 sm:py-2 text-xs font-semibold rounded-xl border border-stone-200 bg-stone-50 hover:bg-rose-50/80 hover:border-rose-300 text-stone-700 hover:text-rose-950 transition-all cursor-pointer shadow-2xs shrink-0"
              >
                <Smartphone className="w-3.5 h-3.5 text-rose-800" />
                <span className="hidden xl:inline">Google Play Bêta</span>
                <span className="xl:hidden">Android</span>
              </button>
            )}

            {/* Monthly Subscription / Plans Button ("Onglet 29€") */}
            <button
              onClick={onOpenSubscription}
              title="Abonnements & Forfaits mensuels cabine"
              className="flex items-center gap-1 px-1.5 sm:px-3 py-1.5 sm:py-2 rounded-xl bg-gradient-to-r from-rose-950 to-stone-900 hover:from-rose-900 hover:to-stone-800 text-white text-[10.5px] sm:text-xs font-semibold shadow-2xs transition-all cursor-pointer group shrink-0"
            >
              <Crown className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-rose-300 group-hover:scale-110 transition-transform" />
              <span className="hidden md:inline">
                {currentUser?.subscription
                  ? `${currentUser.subscription.planName} (${currentUser.subscription.priceMonthly}€/m)`
                  : t.subscription.navPill}
              </span>
              <span className="md:hidden font-bold">
                {currentUser?.subscription ? `${currentUser.subscription.priceMonthly}€` : '29€'}
              </span>
            </button>

            {/* Inscription / Connexion ou Profil ("Onglet Inscription") */}
            {currentUser ? (
              <button
                onClick={onOpenProfile}
                title={t.nav.profileTooltip}
                className="flex items-center gap-1 sm:gap-2 p-1 sm:px-2.5 sm:py-1.5 rounded-xl sm:rounded-2xl bg-stone-100 hover:bg-rose-50/80 border border-stone-200/90 text-stone-800 transition-all cursor-pointer group shadow-2xs shrink-0"
              >
                <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-lg sm:rounded-xl bg-gradient-to-br from-rose-950 to-stone-900 text-rose-200 font-bold text-xs flex items-center justify-center shrink-0 shadow-xs">
                  {currentUser.fullName.charAt(0)}
                </div>
                <div className="hidden xl:block text-left pr-1">
                  <div className="text-xs font-bold text-stone-900 group-hover:text-rose-950 leading-tight">
                    {currentUser.fullName}
                  </div>
                  <div className="text-[10px] text-stone-500 font-medium truncate max-w-[110px]">
                    {currentUser.instituteName}
                  </div>
                </div>
              </button>
            ) : (
              <button
                onClick={onOpenAuth}
                className="px-2 sm:px-3.5 py-1.5 sm:py-2 bg-rose-950 hover:bg-rose-900 active:bg-rose-950 text-white rounded-xl text-[10.5px] sm:text-xs font-bold flex items-center gap-1 sm:gap-1.5 transition-all shadow-xs cursor-pointer shrink-0"
              >
                <LogIn className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-rose-300" />
                <span>
                  Inscription
                </span>
              </button>
            )}
          </div>
        </div>

        {/* Medium and Mobile Navigation Bar - In 9/16 mode: All tabs framed & accessible */}
        <div className="lg:hidden flex items-center overflow-x-auto py-2 gap-1.5 border-t border-stone-100 no-scrollbar">
          <button
            onClick={() => setActiveTab('scanner')}
            className={`px-2.5 py-1.5 text-xs font-semibold rounded-lg whitespace-nowrap flex items-center gap-1 transition-all cursor-pointer shrink-0 ${
              activeTab === 'scanner'
                ? 'bg-rose-950 text-white shadow-2xs'
                : 'text-stone-600 hover:text-stone-900 bg-stone-50'
            }`}
          >
            <Scan className="w-3.5 h-3.5" />
            {t.nav.scannerShort}
          </button>
          <button
            onClick={() => setActiveTab('diagnostic')}
            className={`px-2.5 py-1.5 text-xs font-semibold rounded-lg whitespace-nowrap flex items-center gap-1 transition-all cursor-pointer shrink-0 ${
              activeTab === 'diagnostic'
                ? 'bg-rose-950 text-white shadow-2xs'
                : 'text-stone-600 hover:text-stone-900 bg-stone-50'
            }`}
          >
            <Activity className="w-3.5 h-3.5" />
            {t.nav.diagnosticShort}
          </button>
          <button
            onClick={() => setActiveTab('actives')}
            className={`px-2.5 py-1.5 text-xs font-semibold rounded-lg whitespace-nowrap flex items-center gap-1 transition-all cursor-pointer shrink-0 ${
              activeTab === 'actives'
                ? 'bg-rose-950 text-white shadow-2xs'
                : 'text-stone-600 hover:text-stone-900 bg-stone-50'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            {t.nav.activesShort}
          </button>
          <button
            onClick={() => setActiveTab('clients')}
            className={`px-2.5 py-1.5 text-xs font-semibold rounded-lg whitespace-nowrap flex items-center gap-1 transition-all cursor-pointer shrink-0 ${
              activeTab === 'clients'
                ? 'bg-rose-950 text-white shadow-2xs'
                : 'text-stone-600 hover:text-stone-900 bg-stone-50'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            {t.nav.clientsShort}
          </button>

          {/* DEDICATED MOBILE TABS FOR 29€ & INSCRIPTION (ALWAYS IN FRAME) */}
          <button
            onClick={onOpenSubscription}
            className="px-2.5 py-1.5 text-xs font-bold rounded-lg whitespace-nowrap flex items-center gap-1 transition-all cursor-pointer bg-gradient-to-r from-amber-50 to-rose-50 hover:from-amber-100 hover:to-rose-100 text-rose-950 border border-rose-200/80 shrink-0"
          >
            <Crown className="w-3.5 h-3.5 text-rose-800" />
            <span>29€ / mois</span>
          </button>

          <button
            onClick={currentUser ? onOpenProfile : onOpenAuth}
            className="px-2.5 py-1.5 text-xs font-bold rounded-lg whitespace-nowrap flex items-center gap-1 transition-all cursor-pointer bg-stone-100 hover:bg-stone-200 text-stone-800 border border-stone-200 shrink-0"
          >
            <LogIn className="w-3.5 h-3.5 text-stone-700" />
            <span>{currentUser ? 'Mon Profil' : 'Inscription'}</span>
          </button>
        </div>
      </div>
    </header>
  );
};
