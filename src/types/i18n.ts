export type SupportedLanguage = 'fr' | 'en' | 'es' | 'it' | 'de' | 'pt';

export interface LanguageInfo {
  code: SupportedLanguage;
  name: string;
  nativeName: string;
  flag: string;
  countryCode: string;
}

export const SUPPORTED_LANGUAGES: LanguageInfo[] = [
  {
    code: 'fr',
    name: 'Français',
    nativeName: 'Français',
    flag: '🇫🇷',
    countryCode: 'FR',
  },
  {
    code: 'en',
    name: 'Anglais',
    nativeName: 'English',
    flag: '🇬🇧',
    countryCode: 'GB',
  },
  {
    code: 'es',
    name: 'Espagnol',
    nativeName: 'Español',
    flag: '🇪🇸',
    countryCode: 'ES',
  },
  {
    code: 'it',
    name: 'Italien',
    nativeName: 'Italiano',
    flag: '🇮🇹',
    countryCode: 'IT',
  },
  {
    code: 'de',
    name: 'Allemand',
    nativeName: 'Deutsch',
    flag: '🇩🇪',
    countryCode: 'DE',
  },
  {
    code: 'pt',
    name: 'Portugais',
    nativeName: 'Português',
    flag: '🇵🇹',
    countryCode: 'PT',
  },
];
