import { assertEquals } from "@std/assert/equals";
import { InvalidLanguageCodeError } from "../src/errors.ts";

Deno.test("new InvalidLanguageCodeError()", () => {
  const e = new InvalidLanguageCodeError("foo", "A message");
  assertEquals(e.code, "foo");
  assertEquals(e.message, "A message");
  assertEquals(e.name, "InvalidLanguageCodeError");
});
