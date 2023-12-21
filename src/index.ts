import { join } from "node:path";
import { rmSync } from "node:fs";
import { exportVariable } from "@actions/core";
import { saveCache, restoreCache } from "@actions/cache";
import { getWwiseProductInfo } from "./api.ts";
import { HOME, TEMP, NDKROOT, PLATFORM, TARGETS } from "./env.ts";
import { VERSION, EMAIL, PASSWORD, INPUT_HASH } from "./input.ts";
import { download, validate, extract } from "./utils.ts";

console.log(`Set up Wwise SDK ${VERSION}.`);

// Android build script need NDKROOT.
if (TARGETS.includes("Android")) {
  exportVariable("NDKROOT", NDKROOT);
}

const WWISEROOT = join(HOME, "wwise", VERSION);
const WWISETEMP = join(TEMP, "wwise", VERSION);

exportVariable("WWISEROOT", WWISEROOT);
exportVariable("WWISESDK", join(WWISEROOT, "SDK"));

const cacheKey = `wwise-${PLATFORM}-${INPUT_HASH}`;

if (await restoreCache([WWISEROOT], cacheKey)) {
  console.log(`Hit cache: ${cacheKey}.`);
} else {
  const data = await getWwiseProductInfo(VERSION, EMAIL, PASSWORD);
  const nameList = ["SDK.tar.xz"].concat(
    TARGETS.map((target) => `SDK.${target}.tar.xz`)
  );
  const infoList = data.files.filter((file) => nameList.includes(file.name));

  for (const { url, name, sha1 } of infoList) {
    console.log(`Installing ${name}...`);
    const file = join(WWISETEMP, name);
    download(url, file);
    validate(file, sha1);
    extract(file, WWISEROOT);
  }

  rmSync(WWISETEMP, { recursive: true, force: true });
  saveCache([WWISEROOT], cacheKey);
}

console.log(`Wwise SDK ${VERSION} is installed.`);
