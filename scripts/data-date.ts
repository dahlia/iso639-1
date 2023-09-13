/**
 * This script simply shows the date when the data.ts file was last updated.
 *
 * @license MIT
 */

import { format } from "std/datetime/format.ts";
import { parse } from "std/flags/mod.ts";
import { basename } from "std/path/mod.ts";
import { updatedDate } from "../mod.ts";

function main() {
  const options = parse(Deno.args, {
    alias: { format: "f", help: "h" },
    boolean: ["help"],
    string: ["format"],
  });
  if (options.help) {
    console.error(
      "Usage:",
      basename(Deno.mainModule),
      "[-f/--format FORMAT]",
    );
    console.error(
      "For -f/--format option, see <https://deno.land/std/datetime>.",
    );
    return;
  }
  console.log(
    options.format == null
      ? updatedDate.toISOString()
      : format(updatedDate, options.format),
  );
}

if (import.meta.main) main();
