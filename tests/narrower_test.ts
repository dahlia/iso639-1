import {
  assert,
  assertEquals,
  assertFalse,
  assertThrows,
} from "std/assert/mod.ts";
import { isLanguageCode, parseLanguageCode } from "../src/narrowers.ts";
import { InvalidLanguageCodeError, validateLanguageCode } from "../mod.ts";

Deno.test("isLanguageCode()", () => {
  assert(isLanguageCode("en"));
  assert(isLanguageCode("fr"));
  assertFalse(isLanguageCode("EN"));
  assertFalse(isLanguageCode("Fr"));
  assertFalse(isLanguageCode("zz"));
  assertFalse(isLanguageCode("x"));
  assertFalse(isLanguageCode("foo"));
  assertFalse(isLanguageCode(null));
  assertFalse(isLanguageCode(undefined));
});

Deno.test("parseLanguageCode()", () => {
  assertEquals(parseLanguageCode("en"), "en");
  assertEquals(parseLanguageCode("en", { casing: "onlyUpperCase" }), null);
  assertEquals(parseLanguageCode("en", { casing: "onlyLowerCase" }), "en");
  assertEquals(parseLanguageCode("EN"), "en");
  assertEquals(parseLanguageCode("EN", { casing: "onlyLowerCase" }), null);
  assertEquals(parseLanguageCode("fr"), "fr");
  assertEquals(parseLanguageCode("Fr"), "fr");
  assertEquals(parseLanguageCode("Fr", { casing: "onlyLowerCase" }), null);
  assertEquals(parseLanguageCode("Fr", { casing: "onlyUpperCase" }), null);
  assertEquals(parseLanguageCode("ZZ"), null);
  assertEquals(parseLanguageCode(" zh ", { trimSpaces: true }), "zh");
  assertEquals(parseLanguageCode("x"), null);
  assertEquals(parseLanguageCode("foo"), null);
  assertEquals(parseLanguageCode(null), null);
  assertEquals(parseLanguageCode(undefined), null);
});

Deno.test("validateLanguageCode()", () => {
  validateLanguageCode("en");
  validateLanguageCode("fr");
  assertThrows(
    () => validateLanguageCode("EN"),
    InvalidLanguageCodeError,
    'Invalid language code: "EN" (which contains uppercase letters)',
  );
  assertThrows(
    () => validateLanguageCode("Fr"),
    InvalidLanguageCodeError,
    'Invalid language code: "Fr" (which contains uppercase letters)',
  );
  assertThrows(
    () => validateLanguageCode("zz"),
    InvalidLanguageCodeError,
    'Invalid language code: "zz"',
  );
  assertThrows(
    () => validateLanguageCode(" zh "),
    InvalidLanguageCodeError,
    'Invalid language code: " zh " (which contains spaces)',
  );
  assertThrows(
    () => validateLanguageCode("x"),
    InvalidLanguageCodeError,
    'Invalid language code: "x" (which is not a two-letter code)',
  );
  assertThrows(
    () => validateLanguageCode("foo"),
    InvalidLanguageCodeError,
    'Invalid language code: "foo" (which is not a two-letter code)',
  );
  assertThrows(
    () => validateLanguageCode(null),
    InvalidLanguageCodeError,
    "Language code is null",
  );
  assertThrows(
    () => validateLanguageCode(undefined),
    InvalidLanguageCodeError,
    "Language code is undefined",
  );
});
