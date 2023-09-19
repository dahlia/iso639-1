import { authoritativeLabels, isLanguageCode } from "../mod.ts";

const code: string | null = prompt("Enter a two-letter language code:");
if (isLanguageCode(code)) {
  // code is now narrowed down to LanguageCode
  console.log("The language you chose is", authoritativeLabels[code].en);
} else {
  console.error("Invalid language code:", code);
}
