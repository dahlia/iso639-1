/**
 * This script updates the data.ts file with the latest data from the
 * ISO 639-1 vocabulary at the Library of Congress of the U.S.
 *
 * We recommend running this script via `deno task update-data` command instead
 * of running it directly.
 *
 * @license MIT
 */
import { Feed, parseFeed } from "https://deno.land/x/rss@1.0.0/mod.ts";
import { updatedDate as existingUpdatedDate } from "../mod.ts";

const baseUrl = new URL("http://id.loc.gov/vocabulary/iso639-1/");
const feedUrl = new URL("https://id.loc.gov/vocabulary/iso639-1/feed/1");
const jsonUrl = new URL("https://id.loc.gov/vocabulary/iso639-1.json");

async function fetchFeed(): Promise<Feed> {
  const response = await fetch(feedUrl);
  return await parseFeed(await response.text());
}

async function getUpdatedDate(): Promise<Date> {
  const feed = await fetchFeed();
  if (feed.updateDate) return feed.updateDate;
  let updated = null;
  for (const entry of feed.entries) {
    if (entry.updated != null && (updated == null || entry.updated > updated)) {
      updated = entry.updated;
    }
  }
  if (updated == null) throw new Error("No updated date found");
  return updated;
}

interface AuthoritativeLabel {
  "@language": string;
  "@value": string;
}

interface Entry {
  "@id": string;
  "@type": string[] | string;
  "http://www.loc.gov/mads/rdf/v1#authoritativeLabel": AuthoritativeLabel[];
}

type EntrySet = Entry[];

async function fetchEntries(): Promise<EntrySet> {
  const response = await fetch(jsonUrl);
  const entries: EntrySet = await response.json();
  return entries.filter((e) =>
    e["@id"].startsWith(baseUrl.href) &&
    e["@id"].length === baseUrl.href.length + 2
  );
}

function getLanguageCodes(entries: EntrySet): string[] {
  return entries.map((e) => e["@id"].substring(baseUrl.href.length));
}

function getAuthoritativeLabels(
  entries: EntrySet,
): Record<string, Record<string, string>> {
  const languages: Record<string, Record<string, string>> = {};
  for (const e of entries) {
    const langCode = e["@id"].substring(baseUrl.href.length);
    languages[langCode] = Object.fromEntries(
      e["http://www.loc.gov/mads/rdf/v1#authoritativeLabel"]
        .map((l) => [l["@language"], l["@value"]]),
    );
  }
  return languages;
}

function getAuthoritativeLabelLanguages(
  labelSet: Record<string, Record<string, string>>,
): Set<string> {
  const languages = new Set<string>();
  for (const labels of Object.values(labelSet)) {
    for (const lang in labels) languages.add(lang);
  }
  return languages;
}

async function updateDataFile(
  filePath: string | URL,
  updatedDate: Date,
  languageCodes: string[],
  authoritativeLabelLanguages: string[],
  authoritativeLabels: Record<string, Record<string, string>>,
): Promise<void> {
  let content = await Deno.readTextFile(filePath);
  content = content
    .replace(
      /(\/\/\s+UPDATED\s+DATE\s+\/\/\r?\n)([^/]|.[^/])+(\/\/\s+END\s+UPDATED\s+DATE\s+\/\/\r?\n)/s,
      `// UPDATED DATE //\n${
        JSON.stringify(updatedDate.toISOString())
      }\n// END UPDATED DATE //\n`,
    )
    .replace(
      /(\/\/\s+CODES\s+\/\/\r?\n)([^/]|.[^/])+(\/\/\s+END\s+CODES\s+\/\/\r?\n)/s,
      `// CODES //\n${
        languageCodes.map((c) =>
          `${JSON.stringify(c)},` +
          (authoritativeLabels[c]?.en ? ` // ${authoritativeLabels[c].en}` : "")
        ).sort().join("\n")
      }\n// END CODES //\n`,
    )
    .replace(
      /(\/\/\s+LABEL\s+LANGUAGES\s+\/\/\r?\n)([^/]|.[^/])+(\/\/\s+END\s+LABEL\s+LANGUAGES\s+\/\/\r?\n)/s,
      `// LABEL LANGUAGES //\n${
        authoritativeLabelLanguages.map((c) => `${JSON.stringify(c)}`)
          .sort().join(",\n")
      }\n// END LABEL LANGUAGES //\n`,
    )
    .replace(
      /(\/\/\s+LABELS\s+\/\/\r?\n)([^/]|.[^/])+(\/\/\s+END\s+LABELS\s+\/\/\r?\n)/s,
      `// LABELS //\n${
        Object.entries(authoritativeLabels).map(([lang, labels]) =>
          `${JSON.stringify(lang)}: ${JSON.stringify(labels)}`
        ).sort().join(",\n")
      }\n// END LABELS //\n`,
    );
  await Deno.writeTextFile(filePath, content);
}

async function main(): Promise<number> {
  if (Deno.args.length < 1) {
    console.error(
      "Error: Too few arguments; expected a path to the data.ts file.",
    );
    return 1;
  }

  const dataFilePath = Deno.args[0];

  const newUpdatedDate = await getUpdatedDate();
  console.error("Existing updated date:", existingUpdatedDate);
  console.error("New updated date:", newUpdatedDate);

  if (newUpdatedDate <= existingUpdatedDate) {
    console.error("No update required as the data is up-to-date.");
    return 0;
  }

  try {
    const entries = await fetchEntries();
    const languageCodes = getLanguageCodes(entries);
    const authoritativeLabels = getAuthoritativeLabels(entries);
    const authoritativeLabelLanguages = getAuthoritativeLabelLanguages(
      authoritativeLabels,
    );
    await updateDataFile(dataFilePath, newUpdatedDate, languageCodes, [
      ...authoritativeLabelLanguages,
    ], authoritativeLabels);
  } catch (e) {
    console.error("Error:", e.message);
    return 1;
  }
  return 0;
}

if (import.meta.main) Deno.exit(await main());
