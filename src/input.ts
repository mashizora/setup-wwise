import { getInput } from "@actions/core";

export const VERSION = getInput("wwise-version");
export const EMAIL = getInput("email");
export const PASSWORD = getInput("password");

if (!/^\d{4}\.\d+(\.\d+)?$/.test(VERSION)) {
  throw new Error("Input version was not in the correct format.");
}

if (EMAIL && !/^.+@.+$/.test(EMAIL)) {
  throw new Error("Input email was not in the correct format.");
}
