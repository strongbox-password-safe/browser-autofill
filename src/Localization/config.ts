import { SettingsStore } from '../Settings/SettingsStore';

import global_en from './Languages/en.json';
import global_de from './Languages/de.json';
import global_fr from './Languages/fr.json';
import global_sv from './Languages/sv.json';
import global_es from './Languages/es.json';
import global_tr from './Languages/tr.json';
import global_hu from './Languages/hu.json';
import global_uk from './Languages/uk.json';
import global_zhHans from './Languages/zh-Hans.json';
import global_it from './Languages/it.json';
import global_ru from './Languages/ru.json';
import global_ptbr from './Languages/pt-BR.json';
import global_engb from './Languages/en-GB.json';
import global_nl from './Languages/nl.json';
import global_pl from './Languages/pl.json';

const resources = {
  en: { global: global_en },
  'en-GB': { global: global_engb },
  de: { global: global_de },
  fr: { global: global_fr },
  es: { global: global_es },
  it: { global: global_it },
  'pt-BR': { global: global_ptbr },
  sv: { global: global_sv },
  hu: { global: global_hu },
  tr: { global: global_tr },
  'zh-Hans': { global: global_zhHans },
  ru: { global: global_ru },
  uk: { global: global_uk },
  nl: { global: global_nl },
  pl: { global: global_pl },
};

export const languages = Object.keys(resources ?? []) as [string];

export const getSelectedlanguage = async () => {
  const stored = await SettingsStore.getSettings();

  
  if (stored.lng) {
    return stored.lng;
  }

  
  if (languages.includes(navigator.language)) {
    return navigator.language;
  }

  
  if (languages.includes(navigator.language.split('-')[0])) {
    return navigator.language.split('-')[0];
  }

  
  return languages[0];
};

export const isAutoDetected = (lng: string) => {
  if (isKnownLanguage()) {
    return [navigator.language].includes(lng);
  }

  return [navigator.language, navigator.language.split('-')[0]].includes(lng);
};

const isKnownLanguage = () => {
  return Object.keys(resources).reduce((exists, key) => (exists = !exists ? key === navigator.language : exists), false);
};

export const config = {
  lng: await getSelectedlanguage(),
  resources,
  interpolation: { escapeValue: false },
};
