import { readdirSync } from "fs";
import { exportVariable } from "@actions/core";
import semver, { SemVer } from "semver";

/** Setup xcode environment variables used by wwise plugin build script. */
export function exportXcodeVariables() {
  if (process.platform !== "darwin") {
    throw new Error("This function can only be called on darwin");
  }

  const appList = readdirSync("/Applications")
    .filter((name) => /^Xcode_[\d\.]+\.app$/.test(name))
    .map((name) => ({ name, version: semver.coerce(name) as SemVer }));

  for (const major of new Set(appList.map((app) => app.version.major))) {
    const latestApp = appList
      .filter((app) => app.version.major === major)
      .sort((a, b) => semver.rcompare(a.version, b.version))[0];

    // `AK_XCODE_DEVELOPER_DIR_*` variables are defined in wwise plugin build script,
    // it will be passed to setup `DEVELOPER_DIR` and used by xcodebuild and xcrun.
    // Reference: $WWISEROOT/Scripts/ToolchainSetup/Xcode/XcodeUtils.py
    const variable = `AK_XCODE_DEVELOPER_DIR_${major.toString()}00`;
    const value = `/Applications/${latestApp.name}/Contents/Developer`;
    exportVariable(variable, value);
  }
}
