Type-safe [ISO 639-1] language code for TypeScript
==================================================

This library provides a set of functions to work with [ISO 639-1] language
codes, a.k.a. two-letter language codes, in very type-safe way.

Although it does not introduce any new runtime types, it provides
the `LanguageCode` type, which is a narrowed-down version of
the `string` type that contains only valid two-letter language codes
defined in the ISO 639-1.

[ISO 639-1]: https://id.loc.gov/vocabulary/iso639-1.html
