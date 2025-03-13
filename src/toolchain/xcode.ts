import { join } from "node:path";
import { readdirSync, writeFileSync } from "node:fs";
import semver, { SemVer } from "semver";
import { exportVariable } from "@actions/core";

/** Setup xcode for wwise plugin build system. */
export function setupXcode(root: string) {
  if (process.platform !== "darwin") {
    throw new Error("This function can only be called on darwin");
  }

  // Declare "ToolchainVers.txt" files which specify available xcode versions
  // for the wwise plugin build system. Each file contains version tags in
  // `XcodeXXYZ` format, one tag per line. e.g. `Xcode1400\nXcode1500`.
  const toolchainFiles = [
    join(root, "Scripts/ToolchainSetup/iOS/ToolchainVers.txt"),
    join(root, "Scripts/ToolchainSetup/Mac/ToolchainVers.txt"),
  ];

  // Collect the version tags for filling "ToolchainVers.txt" files.
  const versionTags = [] as string[];

  // Scan all installed xcode versions.
  const appList = readdirSync("/Applications")
    .filter((name) => /^Xcode_[\.\d]+\.app$/.test(name))
    .map((name) => ({ name, version: semver.coerce(name) as SemVer }));

  // For each major version installed, select the latest minor or patch
  // version and setup it for wwise plugin build system.
  // For example, if 16.1 and 16.2 are installed, 16.2 will be selected.
  for (const major of new Set(appList.map((app) => app.version.major))) {
    const latestApp = appList
      .filter((app) => app.version.major === major)
      .sort((a, b) => semver.rcompare(a.version, b.version))[0];

    const version = latestApp.version;
    const versionCode = `${version.major}${version.minor}${version.patch}`;

    // Export `AK_XCODE_DEVELOPER_DIR_XXYZ` variable.
    // The wwise plugin build system uses these to set `DEVELOPER_DIR`,
    // which will be passed to xcodebuild and xcrun commands.
    const varName = `AK_XCODE_DEVELOPER_DIR_${versionCode}`;
    const varValue = `/Applications/${latestApp.name}/Contents/Developer`;
    exportVariable(varName, varValue);

    versionTags.push(`Xcode${versionCode}`);
  }

  for (const file of toolchainFiles) {
    writeFileSync(file, versionTags.join("\n"), { encoding: "utf8" });
  }
}
