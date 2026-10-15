import React, { useState } from 'react';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { Download, Share2, PlusSquare, X } from 'lucide-react';

export const PWAInstallButton: React.FC = () => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);

  // If already running as an installed standalone PWA, hide the button
  if (isInstalled) {
    return null;
  }

  // Chromium / Android / Desktop flow
  if (isInstallable) {
    return (
      <button
        onClick={install}
        className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl bg-rose-900 hover:bg-rose-800 text-white shadow-2xs transition-colors"
        title="Installer l'application sur votre appareil"
      >
        <Download className="w-3.5 h-3.5" />
        <span className="hidden sm:inline">Installer l'App</span>
        <span className="sm:hidden">Installer</span>
      </button>
    );
  }

  // iOS Safari flow
  if (isIOS) {
    return (
      <>
        <button
          onClick={() => setShowIOSGuide(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl border border-rose-300 text-rose-900 bg-rose-50/60 hover:bg-rose-100 transition-colors"
          title="Installer sur iPhone / iPad"
        >
          <Download className="w-3.5 h-3.5 text-rose-700" />
          <span className="hidden sm:inline">Installer sur iOS</span>
          <span className="sm:hidden">iOS</span>
        </button>

        {showIOSGuide && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/60 backdrop-blur-xs p-4">
            <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl border border-stone-200 text-stone-900 space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-base font-serif font-bold text-stone-900">
                  Installer sur iPhone / iPad
                </h3>
                <button
                  onClick={() => setShowIOSGuide(false)}
                  className="text-stone-400 hover:text-stone-700 p-1"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-3 text-xs text-stone-600">
                <div className="flex items-start gap-2.5 p-2.5 bg-stone-50 rounded-xl border border-stone-200">
                  <Share2 className="w-4 h-4 text-rose-700 shrink-0 mt-0.5" />
                  <span>
                    1. Appuyez sur le bouton <strong>Partager</strong> dans la barre du bas de Safari.
                  </span>
                </div>
                <div className="flex items-start gap-2.5 p-2.5 bg-stone-50 rounded-xl border border-stone-200">
                  <PlusSquare className="w-4 h-4 text-rose-700 shrink-0 mt-0.5" />
                  <span>
                    2. Faites défiler et choisissez <strong>Sur l’écran d’accueil</strong>.
                  </span>
                </div>
              </div>

              <button
                onClick={() => setShowIOSGuide(false)}
                className="w-full rounded-xl bg-stone-900 py-2.5 text-xs font-semibold text-white hover:bg-stone-800 transition"
              >
                Compris
              </button>
            </div>
          </div>
        )}
      </>
    );
  }

  return null;
};
