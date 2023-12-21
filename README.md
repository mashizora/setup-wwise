# Setup Wwise

Set up your GitHub Actions workflow with a specific version of Wwise SDK.

## Inputs

This action will export these environment variables to your workflow job.

| Name       | Description                                                | Default           |
| ---------- | ---------------------------------------------------------- | ----------------- |
| `version`  | Wwise version, in `<year>.<major>.<minor>.<build>` format. | `"2023.1.0.8367"` |
| `email`    | Email of audiokinetic account.                             | `""`              |
| `password` | Password of audiokinetic account.                          | `""`              |

## Defined Variables

This action will export these environment variables to your workflow job.

| Name        | Value                                                                       |
| ----------- | --------------------------------------------------------------------------- |
| `NDKROOT`\* | `ANDROID_NDK_HOME` if runner support `Android` target, otherwise undefined. |
| `WWISEROOT` | `<HOMEDIR>/wwise/<VERSION>`                                                 |
| `WWISESDK`  | `<HOMEDIR>/wwise/<VERSION>/SDK`                                             |

## Supported Target

| Runner Image | Target                                        |
| ------------ | --------------------------------------------- |
| `ubuntu`     | `Android`, `Linux`                            |
| `windows`    | `Authoring`, `Windows_vc160`, `Windows_vc170` |
| `macos`      | `iOS`, `tvOS`, `Mac`                          |
