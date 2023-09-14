/**
 * This module contains several functions to narrow down the {@type string}
 * type to the {@type LanguageCode} type.
 *
 * @license MIT
 */
import { languageCodes } from "./data.ts";
import { InvalidLanguageCodeError } from "./errors.ts";
import { LanguageCode } from "./types.ts";

/**
 * A predicate function to narrow down the {@type string} type to the
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
 * Parses the given string as a language code.  If the given string is not a
 * valid language code, `null` is returned.
 *
 * @param code The string expected to be a language code.  Case is ignored.
 *             If the given string is `null` or `undefined`, `null` is
 *             returned.
 * @returns The language code if the given string is a valid language code,
 *          `null` otherwise.
 */
export function parseLanguageCode(
  code: string | null | undefined,
): LanguageCode | null {
  if (code == null) return null;
  code = code.toLowerCase();
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
        (code.length != 2
          ? " (which is not a two-letter code)"
          : code.toLowerCase() != code
          ? " (which contains uppercase letters)"
          : ""),
    );
  }
}
