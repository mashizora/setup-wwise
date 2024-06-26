import { execSync } from "node:child_process";

const isWindows = process.platform === "win32";

/**
 * Download file, use system `curl`.
 * @param url URL of file to download.
 * @param output Output file path.
 */
export function download(url: string, output: string): void {
  const curl = isWindows ? "curl.exe" : "curl";
  execSync(`${curl} -sL --retry 5 "${url}" --create-dirs -o "${output}"`);
}

/**
 * Extract `tar` archive and set permisions on unix, use system `7z`.
 * @param file Path of archive file to extract.
 * @param outdir Directory of output files.
 */
export function extract(file: string, outdir: string): void {
  if (isWindows) {
    execSync(`7z.exe x "${file}" -so | 7z.exe x -aoa -si -ttar -o"${outdir}"`);
  } else {
    execSync(`7z x "${file}" -so | 7z x -aoa -si -ttar -o"${outdir}"`);
    execSync(`sudo chmod -R 777 "${outdir}"`);
  }
}

/**
 * Get SHA1 checksum of a file, use `certutil` on windows and `shasum` on unix.
 * @param file Path of the file to check.
 * @returns SHA1 checksum of the file.
 */
export function shasum(file: string): string {
  const shasum = isWindows ? "certutil.exe -hashfile" : "shasum";
  const stdout = execSync(`${shasum} "${file}"`, { encoding: "utf8" });

  // Match sha1 string from output text.
  const REGEX_SHA1 = /\b[0-9a-f]{40}\b/;
  const matchResult = stdout.match(REGEX_SHA1)?.[0];

  if (!matchResult) {
    throw new Error(`Invalid shasum output: ${stdout}.`);
  }

  return matchResult;
}
