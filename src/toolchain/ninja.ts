import os from "node:os";
import path from "node:path";
import { execSync } from "node:child_process";

const NINJA_URL =
  "https://github.com/ninja-build/ninja/releases/latest/download/ninja-linux.zip";

/** Install ninja build system. */
export function installNinja() {
  if (process.platform !== "linux") {
    throw new Error("This function can only be called on linux");
  }

  try {
    execSync("ninja --version", { stdio: "ignore" });
  } catch {
    console.info("Installing ninja...");

    const output = path.join(os.tmpdir(), "ninja.zip");
    execSync(`curl -sL --retry 5 "${NINJA_URL}" -o "${output}"`);
    execSync(`unzip -q "${output}" -d /usr/local/bin/`);
    execSync("chmod +x /usr/local/bin/ninja");
  }
}
