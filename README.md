# Setup Wwise

Set up your GitHub Actions workflow with a specific version of Wwise SDK.

### Inputs

| Name            | Description                                                                                                                                       | Default    |
| --------------- | ------------------------------------------------------------------------------------------------------------------------------------------------- | ---------- |
| `wwise-version` | Wwise version to use, in `YEAR.MAJOR.MINOR` or `YEAR.MAJOR` format. <br/> Latest backward compatible minor version will be used if not specified. | `"2022.1"` |
| `email`         | Email of audiokinetic account.                                                                                                                    | `""`       |
| `password`      | Password of audiokinetic account.                                                                                                                 | `""`       |

### Outputs

| Name            | Description                  |
| --------------- | ---------------------------- |
| `wwise-version` | The installed wwise version. |

### Defined Variables

This action will export these environment variables to your workflow job.

| Name        | Value                                                                       |
| ----------- | --------------------------------------------------------------------------- |
| `WWISEROOT` | `<HOME>/Wwise/<VERSION>`                                                    |
| `WWISESDK`  | `<HOME>/Wwise/<VERSION>/SDK`                                                |
| `NDKROOT`\* | `ANDROID_NDK_HOME` if runner support `Android` target, otherwise undefined. |

### Supported Targets

| Runner Image | Targets                          |
| ------------ | -------------------------------- |
| `ubuntu`     | `Android`, `Linux`               |
| `windows`    | `Windows_vc160`, `Windows_vc170` |
| `macos`      | `iOS`, `tvOS`, `Mac`             |
