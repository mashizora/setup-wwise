import os from "node:os";
import path from "node:path";
import { rmSync } from "node:fs";
import { createHash } from "node:crypto";
import { addPath, exportVariable, setOutput } from "@actions/core";
import { restoreCache, saveCache } from "@actions/cache";
import { getProductData, getProductList } from "./api.ts";
import { EMAIL, PASSWORD, VERSION } from "./input.ts";
import { download, extract, shasum } from "./util.ts";
import { setupXcode } from "./toolchain/xcode.ts";

const supportedTargets = [];
switch (process.platform) {
  case "linux":
    supportedTargets.push("Linux");
    break;
  case "win32":
    supportedTargets.push("Windows_vc160", "Windows_vc170", "Android");
    break;
  case "darwin":
    supportedTargets.push("iOS", "Mac");
    break;
  default:
    throw new Error("Wwise SDK does not support current platform.");
}

console.info(`Set up Wwise SDK ${VERSION}.`);

const productList = await getProductList();
const matchedBundle = productList.bundles
  .filter((bundle) => bundle.versionTag.includes(VERSION))
  .sort((a, b) => b.version.minor - a.version.minor)[0];

if (!matchedBundle) {
  throw new Error(`No wwise bundle matches input version ${VERSION}.`);
}

console.info(`Wwise SDK ${matchedBundle.versionTag} will be installed.`);

// Android target needs NDKROOT variable.
if (supportedTargets.includes("Android")) {
  exportVariable("NDKROOT", process.env.ANDROID_NDK_HOME);
}

// Project directory and wwise sdk must under the same root directory
// due to the limitation of the wwise plugin build system (aka. wp.py).
// We choose home directory as install destination to ensure that.
const WWISEROOT = path.join(os.homedir(), "Wwise", matchedBundle.versionTag);
exportVariable("WWISEROOT", WWISEROOT);
exportVariable("WWISESDK", path.join(WWISEROOT, "SDK"));

const keyData = matchedBundle.versionTag + EMAIL + PASSWORD;
const keyHash = createHash("md5").update(keyData).digest("hex");
const cacheKey = `wwise-${process.platform}-${keyHash}`;

if (await restoreCache([WWISEROOT], cacheKey)) {
  console.info(`Hit cache: ${cacheKey}.`);
} else {
  const data = await getProductData(matchedBundle.id, EMAIL, PASSWORD);
  const list = ["SDK.tar.xz"] // base package, for all targets
    .concat(supportedTargets.map((target) => `SDK.${target}.tar.xz`));
  const pkgs = data.files.filter((file) => list.includes(file.id));

  for (const pkg of pkgs) {
    console.info(`Installing ${pkg.name}...`);
    const archive = path.join(os.tmpdir(), pkg.name);

    download(pkg.url, archive);
    if (shasum(archive) !== pkg.sha1) {
      throw new Error(`File validation failed: ${archive}.`);
    }

    extract(archive, WWISEROOT);
    rmSync(archive, { force: true });
  }

  saveCache([WWISEROOT], cacheKey);
}

if (process.platform === "darwin") {
  setupXcode(WWISEROOT);
} else if (process.platform === "win32") {
  exportVariable("NDKROOT", process.env.ANDROID_NDK_HOME);
  addPath(path.join(WWISEROOT, "Tools", "Win32", "bin"));
}

setOutput("wwise-version", matchedBundle.versionTag);
console.info(`Wwise SDK ${matchedBundle.versionTag} is installed.`);
