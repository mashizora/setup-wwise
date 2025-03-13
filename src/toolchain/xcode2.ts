import { join } from "node:path";
import { readdirSync, writeFileSync } from "node:fs";
import semver, { SemVer } from "semver";

/** Setup xcode for wwise plugin build system. */
export function setupXcode(root: string) {
  if (process.platform !== "darwin") {
    throw new Error("This function can only be called on darwin");
  }

  // These files specifing which xcode versions are available,
  // and will be read by the wwise plugin build system.
  const toolchainFiles = [
    join(root, "Scripts/ToolchainSetup/iOS/ToolchainVers.txt"),
    join(root, "Scripts/ToolchainSetup/Mac/ToolchainVers.txt"),
  ];

  // Scan installed Xcode versions and convert to `XcodeXXYZ` tags,
  // which is the format used in "ToolchainVers.txt" files.
  const tags = readdirSync("/Applications")
    .filter((name) => /^Xcode_[\.\d]+\.app$/.test(name))
    .map((name) => semver.coerce(name) as SemVer)
    .map((v) => `Xcode${v.major}${v.minor}${v.patch}`);

  for (const file of toolchainFiles) {
    writeFileSync(file, tags.join("\n"), { encoding: "utf8" });
  }
}
