import { createContext, useContext } from 'react';
import type { Language } from '../types';
import { translations } from '../data/translations';
import type { TranslationKey } from '../data/translations';

export interface LanguageContextType {
  lang: Language;
  setLang: (l: Language) => void;
  t: (key: TranslationKey) => string;
}

export const LanguageContext = createContext<LanguageContextType>({
  lang: 'en',
  setLang: () => {},
  t: (key) => translations.en[key] || key,
});

export const useLanguage = () => useContext(LanguageContext);
