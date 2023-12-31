/**
 * This library provides a set of functions to work with ISO 639-1 language
 * codes, a.k.a. two-letter language codes.
 *
 * Although it does not introduce any new runtime types, it provides
 * the {@link LanguageCode} type, which is a narrowed-down version of the
 * string type that contains only valid two-letter language codes
 * defined in ISO 639-1.
 *
 * There are three ways to narrow down the string type to the
 * {@link LanguageCode} type: {@link isLanguageCode}, {@link parseLanguageCode},
 * and {@link validateLanguageCode}.  The following example shows how to narrow
 * down a string value to the {@link LanguageCode} type:
 *
 * ```
 * import {
 *   authoritativeLabels,
 *   isLanguageCode,
 * } from "https://deno.land/x/iso639_1/mod.ts";
 *
 * const code: string | null = prompt("Enter a two-letter language code:");
 * if (isLanguageCode(code)) {
 *   // code is now narrowed down to LanguageCode
 *   console.log("The language you chose is", authoritativeLabels[code].en);
 * } else {
 *   console.error("Invalid language code:", code);
 * }
 * ```
 *
 * @license MIT
 * @packageDocumentation
 */
export * from "./src/mod.ts";
