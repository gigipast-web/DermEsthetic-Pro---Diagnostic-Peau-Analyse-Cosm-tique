import React, { useState } from 'react';
import { Smartphone, ExternalLink, X, Eye, ChevronDown, ChevronUp, Download, Sparkles } from 'lucide-react';
import { PLAY_STORE_TESTING_URL, PROMO_IMAGE_PATH } from './GooglePlayPromoModal';

interface Props {
  onOpenModal: () => void;
}

export const GooglePlayBanner: React.FC<Props> = ({ onOpenModal }) => {
  const [dismissed, setDismissed] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  if (dismissed) return null;

  return (
    <div className="no-print bg-gradient-to-r from-stone-900 via-rose-950 to-stone-900 text-white border-b border-rose-900/40 py-2.5 px-3 sm:px-6 relative shadow-md transition-all">
      <div className="max-w-7xl mx-auto flex flex-col gap-3">
        {/* Top bar row */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-2.5">
          {/* Left: Thumbnail poster + Text */}
          <div className="flex items-center gap-3 w-full sm:w-auto">
            {/* Hyperlinked Image Thumbnail */}
            <a
              href={PLAY_STORE_TESTING_URL}
              target="_blank"
              rel="noopener noreferrer"
              title="Cliquer pour tester sur Google Play"
              className="group relative block w-11 h-11 rounded-xl overflow-hidden border-2 border-rose-400/50 shrink-0 shadow-sm hover:scale-105 transition-transform"
            >
              <img
                src={PROMO_IMAGE_PATH}
                alt="Affiche Google Play Dermesthetic"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-stone-900/20 group-hover:bg-transparent transition-colors" />
            </a>

            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[10px] font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 px-2 py-0.5 rounded-full">
                  Google Play Bêta
                </span>
                <span className="text-xs sm:text-sm font-bold text-white tracking-tight truncate">
                  Affiche Officielle & Programme de Test Google Play
                </span>
              </div>
              <p className="text-[11px] text-rose-200/80">
                Cliquez sur l'affiche pour rejoindre le programme de testeurs officiels sur Android.
              </p>
            </div>
          </div>

          {/* Right: Quick actions */}
          <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
            {/* Toggle Inline Preview */}
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer border border-white/10"
              title={isExpanded ? "Replier l'affiche" : "Déplier et voir l'affiche complète"}
            >
              <Eye className="w-3.5 h-3.5 text-rose-300" />
              <span>{isExpanded ? "Masquer l'affiche" : "Voir l'affiche ici"}</span>
              {isExpanded ? (
                <ChevronUp className="w-3.5 h-3.5 text-rose-300" />
              ) : (
                <ChevronDown className="w-3.5 h-3.5 text-rose-300" />
              )}
            </button>

            {/* Direct Hyperlink to Google Play */}
            <a
              href={PLAY_STORE_TESTING_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3.5 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm hover:shadow-md transition-all cursor-pointer"
              title="Ouvrir le lien de test Google Play"
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span>Tester l'App</span>
              <ExternalLink className="w-3 h-3 text-rose-200" />
            </a>

            <button
              onClick={() => setDismissed(true)}
              className="p-1.5 text-rose-300/60 hover:text-white rounded-xl hover:bg-white/10 transition-colors cursor-pointer"
              title="Masquer ce bandeau"
              aria-label="Fermer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Inline Expandable Poster Display */}
        {isExpanded && (
          <div className="pt-3 pb-2 border-t border-rose-900/40 flex flex-col md:flex-row items-center gap-6 animate-fadeIn">
            {/* The Clickable Poster Image */}
            <div className="relative group max-w-sm sm:max-w-md w-full rounded-2xl overflow-hidden border-2 border-rose-400/40 shadow-2xl bg-stone-900 shrink-0">
              <a
                href={PLAY_STORE_TESTING_URL}
                target="_blank"
                rel="noopener noreferrer"
                title="Cliquez sur l'affiche pour ouvrir la page de test Google Play !"
                className="block relative cursor-pointer"
              >
                <img
                  src={PROMO_IMAGE_PATH}
                  alt="Affiche promotionnelle Dermesthetic - Disponible sur Google Play"
                  className="w-full h-auto object-cover transition-transform duration-300 group-hover:scale-[1.02]"
                />
                <div className="absolute inset-0 bg-stone-950/40 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex flex-col items-center justify-center gap-2 text-white p-4 backdrop-blur-[2px]">
                  <div className="px-4 py-2.5 rounded-xl bg-white text-stone-900 font-bold text-xs sm:text-sm flex items-center gap-2 shadow-xl">
                    <ExternalLink className="w-4 h-4 text-rose-800" />
                    <span>Cliquez pour Ouvrir Google Play</span>
                  </div>
                  <span className="text-[11px] text-rose-200 font-medium font-mono">
                    play.google.com/apps/testing/pro.dermesthetic.app
                  </span>
                </div>
              </a>
            </div>

            {/* Poster Details & Actions */}
            <div className="space-y-3 text-xs text-rose-100/90 flex-1">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-rose-400 shrink-0" />
                <h4 className="font-serif font-bold text-base text-white">
                  Affiche Promotionnelle Officielle Dermesthetic
                </h4>
              </div>

              <p className="text-stone-300 leading-relaxed text-xs">
                Cette affiche haute résolution (1254 × 1254) est active. En cliquant directement sur l'image ci-contre, vous êtes immédiatement redirigé vers la page officielle de test Google Play Store :
              </p>

              <div className="p-3 rounded-xl bg-white/10 border border-white/15 font-mono text-[11px] text-rose-200 break-all select-all">
                {PLAY_STORE_TESTING_URL}
              </div>

              <div className="flex flex-wrap gap-2 pt-1">
                <a
                  href={PLAY_STORE_TESTING_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs flex items-center gap-2 shadow-sm transition-colors cursor-pointer"
                >
                  <Smartphone className="w-4 h-4" />
                  <span>Rejoindre la phase de test</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>

                <a
                  href={PROMO_IMAGE_PATH}
                  download="Affiche-Dermesthetic-GooglePlay.png"
                  className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-xs flex items-center gap-2 border border-white/20 transition-colors cursor-pointer"
                  title="Télécharger le fichier PNG haute définition"
                >
                  <Download className="w-4 h-4 text-rose-300" />
                  <span>Télécharger l'affiche HD</span>
                </a>

                <button
                  onClick={onOpenModal}
                  className="px-3 py-2.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-rose-200 text-xs font-medium cursor-pointer"
                >
                  Plein écran
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
