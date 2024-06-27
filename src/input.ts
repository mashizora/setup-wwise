import { getInput } from "@actions/core";

/** Wwise version to use, in `YEAR.MAJOR.MINOR` or `YEAR.MAJOR` format. */
export const VERSION = getInput("wwise-version");

/** Email of audiokinetic account. */
export const EMAIL = getInput("email");

/** Password of audiokinetic account. */
export const PASSWORD = getInput("password");

if (!/^\d{4}\.\d+(\.\d+)?$/.test(VERSION)) {
  throw new Error("Input version was not in the correct format.");
}

if (EMAIL && !/^.+@.+$/.test(EMAIL)) {
  throw new Error("Input email was not in the correct format.");
}
