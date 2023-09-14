<!-- deno-fmt-ignore-file -->

Type-safe [ISO 639-1] language code for TypeScript
==================================================

[![deno.land/x/iso639_1][Deno module badge]][Deno module]
[![MIT License][License badge]](./LICENSE)
[![GitHub Actions][GitHub Actions badge]][GitHub Actions]
[![Codecov][Codecov badge]][Codecov]

This library provides a set of functions to work with [ISO 639-1] language
codes, a.k.a. two-letter language codes, in very type-safe way.

Although it does not introduce any new runtime types, it provides
the [`LanguageCode`] type, which is a narrowed-down version of
the `string` type that contains only valid two-letter language codes
defined in the ISO 639-1.

There are three ways to narrow down the `string` type to the
[`LanguageCode`] type: [`isLanguageCode`], [`parseLanguageCode`],
and [`validateLanguageCode`].  The following example shows how to narrow
down a string value to the [`LanguageCode`] type:

~~~~ typescript
import {
  authoritativeLabels,
  isLanguageCode,
} from "https://deno.land/x/iso639_1/mod.ts";

const code: string | null = prompt("Enter a two-letter language code:");
if (isLanguageCode(code)) {
  // code is now narrowed down to LanguageCode
  console.log("The language you chose is", authoritativeLabels[code].en);
} else {
  console.error("Invalid language code:", code);
}
~~~~

For details, see the [API references].

[Deno module badge]: https://shield.deno.dev/x/iso639_1
[Deno module]: https://deno.land/x/iso639_1
[License badge]: https://img.shields.io/github/license/dahlia/iso639-1
[GitHub Actions badge]: https://github.com/dahlia/iso639-1/actions/workflows/test.yaml/badge.svg
[GitHub Actions]: https://github.com/dahlia/iso639-1/actions/workflows/test.yaml
[Codecov badge]: https://codecov.io/gh/dahlia/iso639-1/graph/badge.svg
[Codecov]: https://codecov.io/gh/dahlia/iso639-1
[ISO 639-1]: https://id.loc.gov/vocabulary/iso639-1.html
[`LanguageCode`]: https://deno.land/x/iso639_1/mod.ts?s=LanguageCode
[`isLanguageCode`]: https://deno.land/x/iso639_1/mod.ts?s=isLanguageCode
[`parseLanguageCode`]: https://deno.land/x/iso639_1/mod.ts?s=parseLanguageCode
[`validateLanguageCode`]: https://deno.land/x/iso639_1/mod.ts?s=validateLanguageCode
[API references]: https://deno.land/x/iso639_1/mod.ts
