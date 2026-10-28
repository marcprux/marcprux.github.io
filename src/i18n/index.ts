import type { UIStrings } from "./types";
import { translations } from "../resources/generated";

export { tplStr } from "./format";

/** Returns generated UI translations for a supported locale. */
export function useTranslations(locale: string = "en"): UIStrings {
  if (!Object.prototype.hasOwnProperty.call(translations, locale)) {
    throw new Error(`Unsupported UI locale: ${locale}`);
  }
  return translations[locale as keyof typeof translations];
}
