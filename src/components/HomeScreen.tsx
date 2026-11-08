import React, { useState } from 'react';
import {
  Sparkles,
  ArrowRight,
  Scan,
  Activity,
  ShieldCheck,
  Users,
  CheckCircle2,
  ChevronRight,
  Fingerprint,
  Layers,
  HeartHandshake,
  Smartphone,
  Eye,
  Sliders,
} from 'lucide-react';
import { MainTab } from './Navbar';

interface Props {
  onStartAnalysis: () => void;
  onNavigateTab: (tab: MainTab) => void;
  onOpenGooglePlayModal?: () => void;
}

export const HomeScreen: React.FC<Props> = ({
  onStartAnalysis,
  onNavigateTab,
  onOpenGooglePlayModal,
}) => {
  const [activeZone, setActiveZone] = useState<'hydration' | 'elasticity' | 'barrier' | 'glow'>('hydration');

  return (
    <div className="bg-stone-50 text-stone-900 selection:bg-rose-200 selection:text-rose-950">
      {/* =========================================================================
          HERO SECTION: ÉCRAN D'ACCUEIL DERMESTHETIC PRO
          - À gauche : Logo & Signature
          - Au centre : Portrait féminin en gros plan avec cartographie faciale
          - En bas : Bouton élégant « Commencer mon analyse »
         ========================================================================= */}
      <section className="relative overflow-hidden bg-gradient-to-b from-[#F7F3EE] via-[#EFE7DE] to-[#F7F3EE] border-b border-[#E5DACD] pt-6 pb-12 sm:pt-10 sm:pb-16 lg:py-16">
        {/* Soft champagne & gold ambient glows */}
        <div className="absolute top-0 left-1/4 w-96 h-96 rounded-full bg-rose-200/20 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-10 w-96 h-96 rounded-full bg-amber-100/40 blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            
            {/* -------------------------------------------------------------
                COLONNE GAUCHE (Logo, Titre, Signature & Actions)
               ------------------------------------------------------------- */}
            <div className="lg:col-span-5 space-y-6 text-center lg:text-left">
              {/* Logo Dermesthetic Pro */}
              <div className="inline-flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-rose-950 via-rose-900 to-stone-900 text-rose-200 flex items-center justify-center shadow-md shadow-rose-950/20">
                  <Sparkles className="w-6 h-6 text-rose-300" />
                </div>
                <div className="text-left">
                  <div className="font-serif font-bold text-2xl tracking-tight text-stone-950 leading-none">
                    DermEsthetic <span className="text-rose-800 font-sans text-xs font-bold tracking-widest uppercase ml-1 px-2 py-0.5 rounded-full bg-rose-100 border border-rose-200/80">PRO</span>
                  </div>
                  <span className="text-[11px] uppercase tracking-widest text-stone-500 font-semibold block mt-1">
                    Cabinet & Institut d'Esthétique
                  </span>
                </div>
              </div>

              {/* Titre Principal */}
              <div className="space-y-3">
                <h1 className="font-serif font-bold text-3xl sm:text-4xl lg:text-5xl text-stone-950 leading-[1.15] tracking-tight">
                  La haute précision clinique au service de votre cabine.
                </h1>
                <p className="text-sm sm:text-base text-stone-700 leading-relaxed max-w-xl mx-auto lg:mx-0">
                  Diagnostic cutané biométrique, décryptage toxicologique INCI instantané et élaboration de protocoles de soins sur-mesure pour magnifier chaque peau.
                </p>
              </div>

              {/* Signature Officielle Mise en Valeur */}
              <div className="p-4 rounded-2xl bg-white/70 backdrop-blur-xs border border-[#E3D6C8] shadow-xs inline-block text-left max-w-md">
                <div className="flex items-center gap-2 mb-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-800"></span>
                  <span className="font-serif font-bold text-xs uppercase tracking-wider text-rose-950">
                    DERMESTHETIC PRO
                  </span>
                </div>
                <p className="font-serif italic text-stone-800 text-sm sm:text-base font-medium">
                  « La science de la peau, l'intelligence de la beauté. »
                </p>
              </div>

              {/* Bouton Élégant Principal : Commencer mon analyse */}
              <div className="pt-2 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3">
                <button
                  type="button"
                  onClick={onStartAnalysis}
                  className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-gradient-to-r from-rose-950 via-rose-900 to-stone-900 hover:from-rose-900 hover:to-stone-800 text-white font-semibold text-sm shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2.5 group cursor-pointer border border-rose-800/40"
                >
                  <Sparkles className="w-4 h-4 text-rose-300 group-hover:scale-110 transition-transform" />
                  <span>Commencer mon analyse</span>
                  <ArrowRight className="w-4 h-4 text-rose-300 group-hover:translate-x-1 transition-transform" />
                </button>

                <button
                  type="button"
                  onClick={() => onNavigateTab('scanner')}
                  className="w-full sm:w-auto px-5 py-3.5 rounded-2xl bg-white/80 hover:bg-white text-stone-800 font-semibold text-sm border border-stone-300/90 shadow-2xs hover:shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Scan className="w-4 h-4 text-rose-800" />
                  <span>Scanner un produit INCI</span>
                </button>
              </div>

              {/* Reassurance Tags */}
              <div className="pt-2 flex flex-wrap items-center justify-center lg:justify-start gap-y-2 gap-x-4 text-xs text-stone-600">
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                  <span>IA Dermo-analytique</span>
                </span>
                <span aria-hidden="true" className="text-stone-300">·</span>
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                  <span>Cartographie 5 zones</span>
                </span>
                <span aria-hidden="true" className="text-stone-300">·</span>
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                  <span>Conforme RGPD & Cabine</span>
                </span>
              </div>
            </div>

            {/* -------------------------------------------------------------
                AU CENTRE : LE MAGNIFIQUE PORTRAIT FÉMININ EN GROS PLAN
                Peau naturelle et lumineuse, voile beige champagne,
                et lignes fines de cartographie faciale
               ------------------------------------------------------------- */}
            <div className="lg:col-span-7 flex flex-col items-center">
              <div className="relative w-full max-w-xl mx-auto rounded-3xl overflow-hidden shadow-2xl border-2 border-white/80 bg-stone-100 group">
                {/* Image Portrait avec Voile Champagne & Cartographie Faciale */}
                <img
                  src="/hero-facial-mapping.jpg"
                  alt="Portrait Dermesthetic Pro avec cartographie faciale cutanée"
                  className="w-full h-auto max-h-[520px] object-cover object-center transition-transform duration-700 group-hover:scale-[1.01]"
                  loading="eager"
                />

                {/* Voile Champagne Délicat en Dégradé Subtil */}
                <div className="absolute inset-0 bg-gradient-to-t from-stone-950/60 via-transparent to-transparent pointer-events-none" />

                {/* Floating Aesthetic Overlay Badges */}
                <div className="absolute top-4 left-4 p-2.5 rounded-2xl bg-white/90 backdrop-blur-md border border-white/80 shadow-md flex items-center gap-2.5 text-xs">
                  <div className="w-7 h-7 rounded-xl bg-rose-950 text-rose-200 flex items-center justify-center shrink-0">
                    <Fingerprint className="w-4 h-4 text-rose-300" />
                  </div>
                  <div>
                    <span className="font-bold text-stone-900 block leading-tight">Cartographie Faciale 3D</span>
                    <span className="text-[10px] text-stone-600">Scan biométrique & hydratation</span>
                  </div>
                </div>

                <div className="absolute bottom-4 left-4 right-4 p-3 sm:p-4 rounded-2xl bg-white/90 backdrop-blur-md border border-white/80 shadow-lg flex items-center justify-between text-xs gap-3">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                      <span className="font-bold text-stone-900 text-xs">Glow Index : 94 / 100</span>
                    </div>
                    <p className="text-[11px] text-stone-600 hidden sm:block">
                      Film hydrolipidique préservé · 0 substance cytotoxique détectée
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={onStartAnalysis}
                    className="px-3.5 py-2 rounded-xl bg-rose-950 hover:bg-rose-900 text-white font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer shrink-0"
                  >
                    <span>Lancer le scan</span>
                    <ArrowRight className="w-3.5 h-3.5 text-rose-300" />
                  </button>
                </div>
              </div>

              {/* Ligne de Signature centrée sous l'image */}
              <div className="mt-4 text-center">
                <span className="text-[11px] tracking-widest uppercase font-serif font-semibold text-stone-600">
                  Dermesthetic Pro · La science de la peau, l'intelligence de la beauté.
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          MODULES CLINIQUES CABINE : LES 4 OUTILS PHARES
         ========================================================================= */}
      <section className="py-12 sm:py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-10 space-y-2">
          <span className="text-xs uppercase font-bold tracking-wider text-rose-800">
            Équipement Numérique Cabine
          </span>
          <h2 className="font-serif font-bold text-2xl sm:text-3xl text-stone-900">
            Une suite complète pour sublimer votre pratique esthétique
          </h2>
          <p className="text-xs sm:text-sm text-stone-600">
            Passez d'un simple soin à une consultation clinique valorisée avec des outils professionnels conçus pour vos clientes.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {/* Carte 1 : Diagnostic Peau */}
          <div
            onClick={() => onNavigateTab('diagnostic')}
            className="group p-6 rounded-3xl bg-white border border-stone-200 shadow-xs hover:shadow-md hover:border-rose-300 transition-all cursor-pointer flex flex-col justify-between"
          >
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-800 flex items-center justify-center group-hover:scale-105 transition-transform">
                <Activity className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-serif font-bold text-lg text-stone-900 group-hover:text-rose-950 transition-colors">
                  Diagnostic Clinique
                </h3>
                <p className="text-xs text-stone-600 mt-1 leading-relaxed">
                  Bilan approfondi visage et corps en 5 dimensions. Analyse de l'hydratation, phototype de Fitzpatrick, rougeurs et élasticité.
                </p>
              </div>
            </div>
            <div className="pt-4 mt-4 border-t border-stone-100 flex items-center justify-between text-xs font-semibold text-rose-900">
              <span>Créer un bilan</span>
              <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* Carte 2 : Scanner Cosmétique INCI */}
          <div
            onClick={() => onNavigateTab('scanner')}
            className="group p-6 rounded-3xl bg-white border border-stone-200 shadow-xs hover:shadow-md hover:border-rose-300 transition-all cursor-pointer flex flex-col justify-between"
          >
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-800 flex items-center justify-center group-hover:scale-105 transition-transform">
                <Scan className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-serif font-bold text-lg text-stone-900 group-hover:text-rose-950 transition-colors">
                  Scanner INCI & Code-barre
                </h3>
                <p className="text-xs text-stone-600 mt-1 leading-relaxed">
                  Caméra intégrée pour scanner les produits cabine et les routines clientes. Détection instantanée des perturbateurs endocriniens.
                </p>
              </div>
            </div>
            <div className="pt-4 mt-4 border-t border-stone-100 flex items-center justify-between text-xs font-semibold text-rose-900">
              <span>Ouvrir le scanner</span>
              <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* Carte 3 : Guide des Actifs & Substances */}
          <div
            onClick={() => onNavigateTab('actives')}
            className="group p-6 rounded-3xl bg-white border border-stone-200 shadow-xs hover:shadow-md hover:border-rose-300 transition-all cursor-pointer flex flex-col justify-between"
          >
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-800 flex items-center justify-center group-hover:scale-105 transition-transform">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-serif font-bold text-lg text-stone-900 group-hover:text-emerald-950 transition-colors">
                  Guide des Actifs & Toxiques
                </h3>
                <p className="text-xs text-stone-600 mt-1 leading-relaxed">
                  Encyclopédie toxicologique complète : bienfaits cutanés, contre-indications et liste des ingrédients classés à risque.
                </p>
              </div>
            </div>
            <div className="pt-4 mt-4 border-t border-stone-100 flex items-center justify-between text-xs font-semibold text-emerald-900">
              <span>Consulter l'encyclopédie</span>
              <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* Carte 4 : Gestion Clientes & Ordonnances */}
          <div
            onClick={() => onNavigateTab('clients')}
            className="group p-6 rounded-3xl bg-white border border-stone-200 shadow-xs hover:shadow-md hover:border-rose-300 transition-all cursor-pointer flex flex-col justify-between"
          >
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-stone-100 text-stone-800 flex items-center justify-center group-hover:scale-105 transition-transform">
                <Users className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-serif font-bold text-lg text-stone-900 group-hover:text-stone-950 transition-colors">
                  Dossiers Clientes & Soins
                </h3>
                <p className="text-xs text-stone-600 mt-1 leading-relaxed">
                  Suivi des bilans, historique des prescriptions à domicile, gestion des rendez-vous et impression d'ordonnances élégantes.
                </p>
              </div>
            </div>
            <div className="pt-4 mt-4 border-t border-stone-100 flex items-center justify-between text-xs font-semibold text-stone-900">
              <span>Voir les clientes</span>
              <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          BANNER INVITATION : TEST GOOGLE PLAY (ANDROID)
         ========================================================================= */}
      {onOpenGooglePlayModal && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
          <div className="bg-gradient-to-r from-stone-900 via-rose-950 to-stone-950 rounded-3xl p-6 sm:p-8 text-white flex flex-col sm:flex-row items-center justify-between gap-6 shadow-xl border border-rose-900/30">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center text-rose-300 shrink-0 shadow-inner">
                <Smartphone className="w-7 h-7" />
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h3 className="font-serif font-bold text-lg sm:text-xl text-white">
                    Disponible en avant-première sur Google Play
                  </h3>
                  <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-rose-500/25 text-rose-200 border border-rose-400/30">
                    Bêta Test
                  </span>
                </div>
                <p className="text-xs text-stone-300 max-w-xl">
                  Rejoignez notre programme de test officiel sur Android, installez l'application cabine sur votre tablette ou smartphone et participez aux prochaines évolutions.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={onOpenGooglePlayModal}
              className="px-5 py-3 rounded-2xl bg-white hover:bg-rose-50 text-rose-950 font-bold text-xs shadow-md transition-all cursor-pointer shrink-0 flex items-center gap-2"
            >
              <Smartphone className="w-4 h-4 text-rose-800" />
              <span>Accéder au programme Google Play</span>
            </button>
          </div>
        </section>
      )}
    </div>
  );
};
