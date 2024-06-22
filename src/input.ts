import { getInput } from "@actions/core";

/** Wwise version to use, in `YEAR.MAJOR.MINOR` or `YEAR.MAJOR` format. */
export const VERSION = getInput("wwise-version");

/** Email of audiokinetic account. */
export const EMAIL = getInput("email");

/** Password of audiokinetic account. */
export const PASSWORD = getInput("password");

const REGEX_VERSION = /(?<YEAR>\d{4})\.(?<MAJOR>\d+)(\.(?<MINOR>\d+))?/;
if (!REGEX_VERSION.test(VERSION)) {
  throw new Error("Input version was not in the correct format.");
}

const REGEX_EMAIL = /(?<username>.+)@(?<domain>.+)/;
if (EMAIL && !REGEX_EMAIL.test(EMAIL)) {
  throw new Error("Input email was not in the correct format.");
}
