import {
  Scan,
  Activity,
  ShieldCheck,
  Users,
  Sparkles,
  User,
  LogIn,
} from 'lucide-react';
import { PWAInstallButton } from './PWAInstallButton';
import { PractitionerUser } from '../types';

export type MainTab = 'scanner' | 'diagnostic' | 'actives' | 'clients';

interface Props {
  activeTab: MainTab;
  setActiveTab: (tab: MainTab) => void;
  instituteName?: string;
  isAiReady?: boolean;
  currentUser?: PractitionerUser | null;
  onOpenProfile?: () => void;
  onOpenAuth?: () => void;
}

export const Navbar: React.FC<Props> = ({
  activeTab,
  setActiveTab,
  instituteName = "Institut Derm'Esthétique Pro",
  isAiReady = true,
  currentUser,
  onOpenProfile,
  onOpenAuth,
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
                  {currentUser ? currentUser.instituteName : 'Salon & Institut'}
                </span>
              </div>
              <p className="text-xs text-stone-500 font-medium truncate max-w-xs sm:max-w-none">
                {currentUser
                  ? `${currentUser.fullName} (${currentUser.role})`
                  : 'Diagnostic Clinique Visage & Corps · Toxicologie INCI & Scanner'}
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

          {/* Right Quick Controls: Profile & PWA Install */}
          <div className="flex items-center gap-2 sm:gap-3">
            <PWAInstallButton />

            {currentUser ? (
              <button
                onClick={onOpenProfile}
                title="Mon profil praticienne & paramètres d'institut"
                className="flex items-center gap-2 p-1.5 sm:px-3 sm:py-1.5 rounded-2xl bg-stone-100 hover:bg-rose-50/80 border border-stone-200/90 text-stone-800 transition-all cursor-pointer group shadow-2xs"
              >
                <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-rose-950 to-stone-900 text-rose-200 font-bold text-xs flex items-center justify-center shrink-0 shadow-xs">
                  {currentUser.fullName.charAt(0)}
                </div>
                <div className="hidden sm:block text-left pr-1">
                  <div className="text-xs font-bold text-stone-900 group-hover:text-rose-950 leading-tight">
                    {currentUser.fullName}
                  </div>
                  <div className="text-[10px] text-stone-500 font-medium truncate max-w-[120px]">
                    {currentUser.instituteName}
                  </div>
                </div>
              </button>
            ) : (
              <button
                onClick={onOpenAuth}
                className="px-3.5 py-2 bg-rose-950 hover:bg-rose-900 active:bg-rose-950 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
              >
                <LogIn className="w-3.5 h-3.5 text-rose-300" />
                <span className="hidden sm:inline">S'inscrire / Connexion</span>
                <span className="sm:hidden">Espace Pro</span>
              </button>
            )}
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
