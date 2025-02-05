import { parse } from "https://deno.land/std@0.201.0/flags/mod.ts";
import {
  format as formatSemVer,
  parse as parseSemVer,
  type SemVer,
} from "https://deno.land/std@0.201.0/semver/mod.ts";
import {
  build$,
  CommandBuilder,
  type CommandResult,
  PathRef,
} from "https://deno.land/x/dax@0.35.0/mod.ts";
import { updatedDate } from "../mod.ts";
import { basename } from "https://deno.land/std@0.201.0/path/mod.ts";
import { lte } from "https://deno.land/std@0.201.0/semver/lte.ts";

const projectRoot = new PathRef(import.meta.url).resolve("..", "..");
const gitDir = projectRoot.resolve(".git");

const $ = build$({ commandBuilder: new CommandBuilder().cwd(projectRoot) });

async function logCommandError(
  result: CommandResult | CommandBuilder,
  errorMessage: string,
  ...extraValues: unknown[]
): Promise<CommandResult> {
  if (result instanceof CommandBuilder) {
    result = await result.stderr("piped").noThrow();
  }
  if (result.code !== 0) {
    $.logError(`Error: ${errorMessage}`, ...extraValues);
    $.logGroup();
    $.logLight(result.stderr);
    $.logGroupEnd();
    Deno.exit(1);
  }

  return result;
}

async function isGitRepository(): Promise<boolean> {
  const stat = await gitDir.stat();
  return stat == null ? false : stat.isDirectory;
}

async function isStageClean(): Promise<boolean> {
  const status = await $`git status --porcelain`.text();
  return status.trim() === "";
}

async function getLatestTag(): Promise<SemVer> {
  try {
    await $.progress("Fetching tags from remote...").with(() =>
      $`git fetch --tags`
    );
  } catch (e) {
    $.logWarn("Warning: Failed to fetch tags from remote:", e.message);
  }
  const latestToOldest =
    (await $`git tag --sort=-version:refname --list "*.*.*"`
      .text())
      .split(/\r?\n/g);
  for (const v of latestToOldest) {
    try {
      return parseSemVer(v);
    } catch (_) {
      continue;
    }
  }
  throw new Error("Never released any version yet");
}

function getCurrentBranch(): Promise<string> {
  // cSpell:ignore lstrip
  return $`git branch --format="%(refname:lstrip=2)"`.text();
}

async function getCurrentBranchUpstream(): Promise<string | null> {
  const branch = await getCurrentBranch();
  let remote;
  try {
    remote = await $`git config branch.${branch}.remote`.text();
  } catch (_) {
    return null;
  }
  remote = remote.trim();
  return remote === "" ? null : remote;
}

async function addTag(
  version: SemVer,
  options: { sign?: "sign" | "noSign" | null } = {},
): Promise<void> {
  const tag = formatSemVer(version);
  $.logStep(`Adding tag ${tag}...`);
  await logCommandError(
    options.sign == null
      ? $`git tag ${tag}`
      : $`git tag ${options.sign == "sign" ? "--sign" : "--no-sign"} ${tag}`,
    "Failed to add tag:",
    tag,
  );
  const remote = await getCurrentBranchUpstream();
  if (remote == null) {
    $.logWarn("Warning: No upstream branch found; skipping push");
    $.logLight(
      "Hint: You can configure the upstream branch with:\n",
      "      git branch --set-upstream-to=<remote>/<branch>",
    );
    return;
  }
  const branch = await getCurrentBranch();
  logCommandError(
    $.progress(`Pushing branch ${branch} and tag ${tag} to the upstream...`)
      .with(() => $`git push ${remote} ${branch} ${tag}`.noThrow()),
    "Failed to push the tag to the upstream:",
    tag,
    "->",
    remote,
  );

  $.logStep("Pushed the tag to the upstream:", tag, "->", remote);
}

async function main() {
  const options = parse(Deno.args, {
    alias: { "base-version": "V", force: "f", help: "h", sign: "s" },
    boolean: ["force", "help", "sign", "no-sign"],
    string: ["base-version"],
  });
  if (options.help) {
    console.error(
      "Usage:",
      basename(Deno.mainModule),
      "[-f/--force]",
      "[-s/--sign/--no-sign]",
      "[-V/--base-version MAJOR.MINOR.PATCH]",
      "[-h/--help]",
    );
    Deno.exit(0);
  }

  if (options.sign && options["no-sign"]) {
    $.logError("Error: -s/--sign and --no-sign cannot be specified together");
    Deno.exit(1);
  }

  if (!await isGitRepository()) {
    $.logError("Error: Not a git repository");
    Deno.exit(1);
  }

  if (!await isStageClean()) {
    if (options.force) {
      $.logWarn(
        "Warning: There are uncommitted changes; continuing anyway\n" +
          "         It will tag the latest commit",
      );
    } else {
      $.logError("Error: There are uncommitted changes");
      $.logLight("Hint: Use -f/--force option to bypass this check");
      Deno.exit(1);
    }
  }

  let baseVersion: SemVer;
  if (options["base-version"] == null) {
    baseVersion = await getLatestTag();
  } else {
    try {
      baseVersion = parseSemVer(options["base-version"]);
    } catch (_) {
      $.logError("Error: Invalid base version:", options["base-version"]);
      Deno.exit(1);
    }
  }

  const newVersion = {
    ...baseVersion,
    patch: updatedDate.getFullYear() * 10000 +
      (updatedDate.getMonth() + 1) * 100 + updatedDate.getDate(),
  };

  if (lte(newVersion, baseVersion)) {
    $.logError(
      `Error: New version ${
        formatSemVer(newVersion)
      } is not greater than base version ${formatSemVer(baseVersion)}`,
    );
    $.logLight("Hint: Check if your working directory is outdated");
    Deno.exit(1);
  }

  $.logStep("New version:", formatSemVer(newVersion));
  await addTag(
    newVersion,
    { sign: options.sign ? "sign" : options["no-sign"] ? "noSign" : null },
  );
}

if (import.meta.main) {
  try {
    await main();
  } catch (e) {
    $.logError(`Error: An uncaught exception: ${e.message}`);
    Deno.exit(1);
  }
}
