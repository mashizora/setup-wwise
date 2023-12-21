import { platform } from "node:process";
import { execSync } from "node:child_process";

/**
 * Download file with `curl`.
 * @param url URL of file to download.
 * @param output Output file path.
 */
export function download(url: string, output: string) {
  if (platform === "win32") {
    execSync(`curl.exe -sL "${url}" --create-dirs -o "${output}"`);
  } else {
    execSync(`curl -sL "${url}" --create-dirs -o "${output}"`);
  }
}

/**
 * Validate file hash use `certutil` on windows and `shasum` on unix.
 * @param file Path of file to validate.
 * @param sha1 SHA1 hash of original file.
 */
export function validate(file: string, sha1: string) {
  // Output contains additional info, match hash string with regex.
  const REGEX_SHA1 = /\b[0-9a-f]{40}\b/;

  let stdout: string;
  if (platform === "win32") {
    stdout = execSync(`certutil.exe -hashfile "${file}"`, { encoding: "utf8" });
  } else {
    stdout = execSync(`shasum "${file}"`, { encoding: "utf8" });
  }

  if (stdout.match(REGEX_SHA1)?.[0] !== sha1) {
    throw Error(`File ${file} validation failed.`);
  }
}

/**
 * Extract `tar.xz` archive with `7z` and set permisions on unix.
 * @param file Path of tar.gz archive file.
 * @param path Target path of output files.
 */
export function extract(file: string, path: string) {
  if (platform === "win32") {
    execSync(`7z.exe x "${file}" -so | 7z.exe x -aoa -si -ttar -o"${path}"`);
  } else {
    execSync(`7z x "${file}" -so | 7z x -aoa -si -ttar -o"${path}"`);
    execSync(`sudo chmod -R 777 "${path}"`);
  }
}
