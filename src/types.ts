import type { authoritativeLabelLanguages, languageCodes } from "./data.ts";

/**
 * The string literal type of all valid language codes.  This type contains
 * only the two-letter language codes defined in ISO 3166-1 with lower case.
 *
 * You can narrow down the string type to this type using the following
 * functions: {@link isLanguageCode}, {@link parseLanguageCode}, and
 * {@link validateLanguageCode}.
 */
export type LanguageCode = typeof languageCodes[number];

/**
 * The string literal type of all valid authoritative label language codes.
 * This type is a subset of {@link LanguageCode} type.
 */
export type AuthoritativeLabelLanguageCode =
  typeof authoritativeLabelLanguages[number];
