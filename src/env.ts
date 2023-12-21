import { homedir, tmpdir } from "node:os";
import { env, platform } from "node:process";

/** The home dir path on current runner. */
// When using wwise plugin build script (wp.py), project dir and wwise sdk
// must under the same root dir, we choose home dir as install destination.
export const HOME = homedir();

/** The temp dir path on current runner. */
export const TEMP = tmpdir();

/** Android ndk path on current runner platform. */
export const NDKROOT = env.ANDROID_NDK_HOME as string;

if (!NDKROOT) {
  throw Error("Environment variable `ANDROID_NDK_HOME` not found.");
}

/** The operating system of current runner. */
export const PLATFORM = platform as "linux" | "win32" | "darwin";

let targets: string[];

if (platform === "linux") {
  targets = ["Android", "Linux"];
} else if (platform === "win32") {
  targets = ["Windows_vc160", "Windows_vc170"];
} else if (platform === "darwin") {
  targets = ["iOS", "tvOS", "Mac"];
} else {
  throw Error("This action does not support current platform.");
}

/** List of supported build target on current runner platform. */
export const TARGETS = targets;
