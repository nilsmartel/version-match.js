# version-match.js

Upgrade versions in a `package.json` by referencing dependencies from other projects.

## What it does

- Reads the `dependencies` and `devDependencies` fields from the list of input `package.json` files.
- Builds a map of the highest version string seen for each dependency using JavaScript's string comparison (lexicographic order), so `"9.0.0"` is considered higher than `"10.0.0"` and may not match semver expectations.
- Updates the target `package.json` in place for any matching dependencies/devDependencies.

## Usage

Provide one or more `package.json` files to read from and a `--target` file to update:

```bash
# Using bun (can run TypeScript directly)
bun main.ts ../project-a/package.json ../project-b/package.json --target ./package.json

# Using ts-node
npm install
npx ts-node main.ts ../project-a/package.json --target ./package.json
```

The target file is rewritten with updated version strings.

## Make it a local executable CLI

To install this as a local CLI command on your machine:

1. Build the TypeScript file to JavaScript:

   ```bash
   npx --yes typescript@5.3.3 tsc main.ts --outDir dist --module commonjs --target es2020
   ```

2. Add a Node shebang and make the output executable:

   ```bash
   printf '#!/usr/bin/env node\n' | cat - dist/main.js > dist/version-match
   chmod +x dist/version-match
   ```

3. Point a CLI name to the executable and link it locally:

   ```bash
   npm pkg set bin.version-match=dist/version-match
   npm link
   ```

After linking, you can run `version-match --target ./package.json <other package.json files>` from anywhere.
