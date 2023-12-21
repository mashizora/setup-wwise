import { createHash } from "node:crypto";
import { getInput } from "@actions/core";

/** Wwise version, in `<year>.<major>.<minor>.<build>` format. */
export const VERSION = getInput("version");

/** Email of audiokinetic account. */
export const EMAIL = getInput("email");

/** Password of audiokinetic account. */
export const PASSWORD = getInput("password");

const REGEX_VERSION =
  /(?<year>\d{4})\.(?<major>\d+)\.(?<minor>\d+)\.(?<build>\d+)/;
const REGEX_EMAIL = /(?<username>.+)@(?<domain>.+)/;

if (VERSION && !REGEX_VERSION.test(VERSION)) {
  throw Error("Input version was not in the correct format.");
}

if (EMAIL && !REGEX_EMAIL.test(EMAIL)) {
  throw Error("Input email was not in the correct format.");
}

export const INPUT_HASH = createHash("md5")
  .update(VERSION + EMAIL + PASSWORD)
  .digest("hex");
