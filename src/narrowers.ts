/**
 * This module contains several functions to narrow down the string
 * type to the {@link LanguageCode} type.
 *
 * @license MIT
 */
import { languageCodes } from "./data.ts";
import { InvalidLanguageCodeError } from "./errors.ts";
import type { LanguageCode } from "./types.ts";

/**
 * A predicate function to narrow down the string type to the
 * {@link LanguageCode} type if the given string is a valid language code.
 *
 * ```
 * const code: string | null = prompt("Enter a two-letter language code:");
 * if (isLanguageCode(code)) {
 *   // code is now narrowed down to LanguageCode
 *   console.log("The language you chose is", authoritativeLabels[code].en);
 * }
 * ```
 *
 * @param code The string expected to be a language code.
 * @returns `true` if the given string is a valid language code, `false`.
 */
export function isLanguageCode(
  code: string | null | undefined,
): code is LanguageCode {
  if (code == null || code.length != 2) return false;
  return languageCodes.includes(code as unknown as LanguageCode);
}

/**
 * Options to control the parsing behavior of {@link parseLanguageCode}.
 */
interface ParseLanguageCodeOptions {
  /**
   * If `"onlyLowercase"`, the given string is expected to be a language code
   * in lowercase letters.
   *
   * If `"onlyUpperCase"`, the given string is expected to be a language code
   * in uppercase letters.
   *
   * If `"ignoreCase"`, the case of the given string is ignored and even can
   * contain a mix of uppercase and lowercase letters.
   */
  casing: "onlyLowerCase" | "onlyUpperCase" | "ignoreCase";

  /**
   * If `true`, the given string is allowed to contain spaces at the beginning
   * and the end.
   */
  trimSpaces: boolean;
}

/**
 * Parses the given string as a language code.  If the given string is not a
 * valid language code, `null` is returned.
 *
 * @param code The string expected to be a language code.  Case is ignored.
 *             If the given string is `null` or `undefined`, `null` is
 *             returned.
 * @param options Options to control the parsing behavior.  See also the
 *                {@link ParseLanguageCodeOptions} type.
 * @returns The language code if the given string is a valid language code,
 *          `null` otherwise.
 */
export function parseLanguageCode(
  code: string | null | undefined,
  options?: Partial<ParseLanguageCodeOptions>,
): LanguageCode | null {
  if (code == null) return null;
  if (options?.trimSpaces) code = code.trim();
  if (options?.casing === "onlyUpperCase" && code.toUpperCase() !== code) {
    return null;
  }
  if (options?.casing !== "onlyLowerCase") code = code.toLowerCase();
  if (code.length != 2) return null;
  const idx = languageCodes.indexOf(code as unknown as LanguageCode);
  if (idx === -1) return null;
  return languageCodes[idx];
}

/**
 * Asserts that the given string is a valid language code.  If the given
 * string is not a valid language code, an {@link InvalidLanguageCodeError}
 * is thrown.
 *
 * @param code The string expected to be a language code.
 * @throws {@link InvalidLanguageCodeError} if the given string is not a
 *         valid language code.
 */
export function validateLanguageCode(
  code: string | null | undefined,
): asserts code is LanguageCode {
  if (code === null) {
    throw new InvalidLanguageCodeError(code, "Language code is null");
  } else if (code === undefined) {
    throw new InvalidLanguageCodeError(code, "Language code is undefined");
  } else if (!isLanguageCode(code)) {
    throw new InvalidLanguageCodeError(
      code,
      `Invalid language code: ${JSON.stringify(code)}` +
        (code.trim() != code
          ? " (which contains spaces)"
          : code.length != 2
          ? " (which is not a two-letter code)"
          : code.toLowerCase() != code
          ? " (which contains uppercase letters)"
          : ""),
    );
  }
}
