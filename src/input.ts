import { getInput } from "@actions/core";

/** Wwise version to use, in `YEAR.MAJOR.MINOR` or `YEAR.MAJOR` format. */
export const IN_VERSION = getInput("wwise-version");

/** Email of audiokinetic account. */
export const IN_EMAIL = getInput("email");

/** Password of audiokinetic account. */
export const IN_PASSWORD = getInput("password");

if (!/^\d{4}\.\d+(\.\d+)?$/.test(IN_VERSION)) {
  throw new Error("Input version was not in the correct format.");
}

if (IN_EMAIL && !/^.+@.+$/.test(IN_EMAIL)) {
  throw new Error("Input email was not in the correct format.");
}
