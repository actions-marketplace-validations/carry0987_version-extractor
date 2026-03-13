# Version Extractor

A GitHub Action that extracts and parses semantic versions from tags, refs, or manual input. Provides the full version string and individual semver components as action outputs.

## Usage

```yaml
- uses: carry0987/version-extractor@v1
  id: version
  with:
    tag: ${{ github.event.release.tag_name }}

- run: echo "Deploying version ${{ steps.version.outputs.version }}"
```

## Inputs

| Input | Required | Default | Description |
|-------|----------|---------|-------------|
| `tag` | No | `''` | Tag to extract version from (e.g. `v1.3.0`). Takes priority over `fallback-ref`. |
| `fallback-ref` | No | `${{ github.ref_name }}` | Fallback ref name when `tag` is empty |
| `prefix` | No | `v` | Version prefix to strip |
| `strict` | No | `false` | Whether to strictly validate semver format |
| `extract-pattern` | No | `''` | Regex to extract version from raw input (first capture group is used if present) |
| `fail-on-error` | No | `true` | Whether to fail the action when version extraction fails |

## Outputs

| Output | Description | Example |
|--------|-------------|---------|| `found` | Whether a valid version was found | `true` / `false` |
| `source` | The raw input string before any processing | `v1.3.0` || `version` | Full version string | `1.3.0` |
| `major` | Major version number | `1` |
| `minor` | Minor version number | `3` |
| `patch` | Patch version number | `0` |
| `prerelease` | Prerelease identifier (if any) | `beta.1` |
| `is-prerelease` | Whether the version is a prerelease | `true` / `false` |

## Examples

### Extract version from a release tag

```yaml
on:
  release:
    types: [published]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: carry0987/version-extractor@v1
        id: version
        with:
          tag: ${{ github.event.release.tag_name }}

      - run: |
          echo "Version: ${{ steps.version.outputs.version }}"
          echo "Major: ${{ steps.version.outputs.major }}"
```

### Extract version from a pushed tag

```yaml
on:
  push:
    tags: ['v*']

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: carry0987/version-extractor@v1
        id: version

      - run: echo "Building ${{ steps.version.outputs.version }}"
```

### Custom prefix

```yaml
- uses: carry0987/version-extractor@v1
  id: version
  with:
    tag: 'release-2.5.1'
    prefix: 'release-'
# outputs.version → 2.5.1
```

### Prerelease detection

```yaml
- uses: carry0987/version-extractor@v1
  id: version
  with:
    tag: 'v3.0.0-beta.1'

- if: steps.version.outputs.is-prerelease == 'true'
  run: echo "This is a prerelease!"
```

### Extract version from text with regex

Use `extract-pattern` to pull a version out of arbitrary text (e.g. commit messages):

```yaml
- uses: carry0987/version-extractor@v1
  id: version
  with:
    tag: 'chore: release v1.2.0'
    extract-pattern: 'v?(\d+\.\d+\.\d+)'
# outputs.version → 1.2.0
```

### Soft failure mode

Set `fail-on-error` to `false` to emit a warning instead of failing the action when no version is found:

```yaml
- uses: carry0987/version-extractor@v1
  id: version
  with:
    tag: 'not-a-version'
    fail-on-error: 'false'

- if: steps.version.outputs.found == 'true'
  run: echo "Version ${{ steps.version.outputs.version }}"
```

### Non-strict mode (default)

Non-strict mode uses `semver.coerce` as a fallback, accepting partial versions:

```yaml
- uses: carry0987/version-extractor@v1
  with:
    tag: '1.3'
# outputs.version → 1.3.0
```

### Strict mode

Strict mode only accepts valid semver strings:

```yaml
- uses: carry0987/version-extractor@v1
  with:
    tag: '1.3'
    strict: 'true'
# ❌ Fails — "1.3" is not valid semver
```

## License

[MIT](LICENSE)
