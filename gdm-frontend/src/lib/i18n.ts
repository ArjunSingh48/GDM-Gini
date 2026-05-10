import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";

import en from "../locales/en.json";
import de from "../locales/de.json";
import it from "../locales/it.json";
import fr from "../locales/fr.json";
import hi from "../locales/hi.json";
import zh from "../locales/zh.json";

const resources = {
  en: { translation: en },
  de: { translation: de },
  it: { translation: it },
  fr: { translation: fr },
  hi: { translation: hi },
  zh: { translation: zh },
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: "en",
    supportedLngs: ["en", "de", "it", "fr", "hi", "zh"],
    load: "languageOnly",
    nonExplicitSupportedLngs: true,
    interpolation: { escapeValue: false },
    detection: {
      order: ["localStorage", "navigator"],
      caches: ["localStorage"],
      lookupLocalStorage: "i18nextLng",
    },
  });

export default i18n;

// ---- Translation helpers for dynamic content ----
// Each helper looks up a key under a namespace; falls back to the English source.
export const tFocusTask = (id: number): string => {
  const key = `focus.tasks.${id}`;
  const v = i18n.t(key);
  return v === key ? "" : v;
};

export const tFocusCategoryLabel = (cat: string): string => {
  const key = `focus.category.${cat}`;
  const v = i18n.t(key);
  return v === key ? cat.replace("_", " ") : v;
};

export const tFocusCategoryDesc = (cat: string): string => {
  const key = `focus.desc.${cat}`;
  const v = i18n.t(key);
  return v === key ? "" : v;
};

export const tWellness = (kind: "do" | "eat" | "relax", englishText: string): string => {
  // map english text -> index via the English locale
  const enList = (en as any).wellnessItems?.[kind] || {};
  const idx = Object.entries(enList).find(([, val]) => val === englishText)?.[0];
  if (idx === undefined) return englishText;
  const key = `wellnessItems.${kind}.${idx}`;
  const v = i18n.t(key);
  return v === key ? englishText : v;
};

export const tMealName = (name: string): string => {
  const v = i18n.t(`mealNames.${name}`);
  return v === `mealNames.${name}` ? name : v;
};

export const LANGUAGES = [
  { code: "en", label: "English" },
  { code: "de", label: "Deutsch" },
  { code: "it", label: "Italiano" },
  { code: "fr", label: "Français" },
  { code: "hi", label: "हिन्दी" },
  { code: "zh", label: "中文" },
];
