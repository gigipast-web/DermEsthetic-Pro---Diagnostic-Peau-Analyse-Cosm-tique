import React, { useState, useRef, useEffect } from 'react';
import { Globe, ChevronDown, Check } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { SupportedLanguage } from '../types/i18n';

interface Props {
  variant?: 'navbar' | 'modal' | 'minimal' | 'full';
  className?: string;
  showLabel?: boolean;
}

export const LanguageSelector: React.FC<Props> = ({
  variant = 'navbar',
  className = '',
  showLabel = true,
}) => {
  const { currentLanguage, setLanguage, currentLanguageInfo, languages } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleEscape);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen]);

  const handleSelect = (code: SupportedLanguage) => {
    setLanguage(code);
    setIsOpen(false);
  };

  // Determine trigger styling based on variant
  const getTriggerClass = () => {
    switch (variant) {
      case 'modal':
        return 'flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-stone-100 hover:bg-stone-200/80 text-stone-800 text-xs font-medium border border-stone-200 transition-all cursor-pointer shadow-2xs';
      case 'minimal':
        return 'flex items-center gap-1.5 p-1.5 rounded-lg hover:bg-white/10 text-white/90 text-xs font-medium transition-all cursor-pointer';
      case 'full':
        return 'w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl bg-white hover:bg-rose-50/50 border border-stone-200 text-stone-800 text-xs font-medium transition-all cursor-pointer shadow-2xs';
      case 'navbar':
      default:
        return 'flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-xl bg-stone-100/90 hover:bg-rose-50/80 active:bg-stone-200/70 border border-stone-200/90 text-stone-800 text-xs font-semibold transition-all cursor-pointer group shadow-2xs';
    }
  };

  return (
    <div className={`relative inline-block text-left ${className}`} ref={dropdownRef}>
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className={getTriggerClass()}
        aria-haspopup="true"
        aria-expanded={isOpen}
        title={`Changer de langue (actuel : ${currentLanguageInfo.nativeName})`}
      >
        <span className="text-base leading-none select-none" aria-hidden="true">
          {currentLanguageInfo.flag}
        </span>

        {showLabel && (
          <span className="hidden sm:inline font-medium text-stone-700 group-hover:text-stone-900">
            {currentLanguageInfo.nativeName}
          </span>
        )}

        <span className="sm:hidden font-bold text-[11px] text-stone-700 uppercase">
          {currentLanguageInfo.code}
        </span>

        <ChevronDown
          className={`w-3.5 h-3.5 text-stone-500 group-hover:text-stone-800 transition-transform duration-200 ${
            isOpen ? 'rotate-180 text-rose-800' : ''
          }`}
        />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div
          role="menu"
          aria-orientation="vertical"
          className="absolute right-0 mt-1.5 w-56 sm:w-60 rounded-2xl bg-white shadow-xl border border-stone-200/90 py-1.5 z-50 animate-in fade-in zoom-in-95 duration-150 focus:outline-hidden"
        >
          {/* Header Title inside dropdown */}
          <div className="px-3.5 py-2 border-b border-stone-100 flex items-center justify-between text-[11px] font-semibold text-stone-500 uppercase tracking-wider">
            <span className="flex items-center gap-1.5">
              <Globe className="w-3.5 h-3.5 text-rose-700" />
              Langue / Language
            </span>
            <span className="text-[10px] lowercase text-stone-400 font-normal">
              {languages.length} disponibles
            </span>
          </div>

          <div className="p-1 space-y-0.5">
            {languages.map((lang) => {
              const isSelected = lang.code === currentLanguage;
              return (
                <button
                  key={lang.code}
                  type="button"
                  onClick={() => handleSelect(lang.code)}
                  role="menuitem"
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-left text-xs transition-colors cursor-pointer ${
                    isSelected
                      ? 'bg-rose-50 text-rose-950 font-bold border border-rose-200/80 shadow-2xs'
                      : 'text-stone-700 hover:bg-stone-50 hover:text-stone-900 font-medium'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <span className="text-lg leading-none select-none">{lang.flag}</span>
                    <div>
                      <div className="font-semibold text-stone-900 leading-tight">
                        {lang.nativeName}
                      </div>
                      <div className="text-[10px] text-stone-500 font-normal">
                        {lang.name} · {lang.countryCode}
                      </div>
                    </div>
                  </div>

                  {isSelected && (
                    <div className="w-5 h-5 rounded-full bg-rose-950 text-white flex items-center justify-center shrink-0">
                      <Check className="w-3 h-3 stroke-[3]" />
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
