import fs from "fs"

function printHelpAndExit(): never {
  console.log(`
Usage: version-match [OPTIONS] <files...>

Synchronize package.json dependencies with the latest versions found in other package.json files.

Options:
  --target <file>    Target package.json file to update (required)
  -h, --help         Show this help message and exit

Arguments:
  <files...>         One or more package.json files to scan for dependencies

Example:
  version-match --target ./package.json ./services/*/package.json
  `)
  process.exit(0)
}

function parseArgs(argv: string[]) {
  argv = argv.splice(2)
  // Check for help flag
  if (argv.includes("-h") || argv.includes("--help")) {
    printHelpAndExit()
  }

  let targetFlag = false
  let target: string | undefined = undefined
  const files: string[] = []

  for (let a of argv) {
    if (a == "--target") {
      targetFlag = true
      continue
    }

    if (targetFlag === true) {
      target = a
      targetFlag = false
      continue
    }

    files.push(a)
  }

  if (!target) {
    console.error("Error: --target flag is required")
    console.error("Use --help for usage information")
    process.exit(1)
  }

  if (files.length === 0) {
    console.error("Error: At least one package.json file must be specified")
    console.error("Use --help for usage information")
    process.exit(1)
  }

  return { files, target }
}

function getDependencies(files: string[]) {
  console.log("(info)", `reading ${files.length} files`)

  let depss: Record<string, string>[] = files
    .map((s) => String(fs.readFileSync(s)))
    .map((s) => JSON.parse(s))
    .map(
      (pkg) =>
        ({ ...pkg.dependencies, ...pkg.devDependencies }) as Record<
          string,
          string
        >,
    )

  let depMap: Record<string, string> = {}

  for (let dep of depss) {
    for (let [key, value] of Object.entries(dep)) {
      let cur = depMap[key]
      if (cur > value) continue

      depMap[key] = value
    }
  }

  console.log(
    "(info)",
    `found info on ${Object.keys(depMap).length} dependencies`,
  )

  return depMap
}

let { files, target } = parseArgs(process.argv)
let deps = getDependencies(files)

console.log("(info)", "reading " + target)
let pkgJsonContent = String(fs.readFileSync(target!))
let pkgJson = JSON.parse(pkgJsonContent)

// For all kinds of dependencies, look up of we have information about a newer version we can use instead
for (let d of [pkgJson.dependencies, pkgJson.devDependencies]) {
  for (let key in d) {
    // version of dependency in keys
    let dv = deps[key]
    let v = d[key]

    if (dv > v) {
      console.log("(info)", `${key}: ${v} => ${dv}`)
      d[key] = dv
    }
  }
}

let output = JSON.stringify(pkgJson, null, 2)

console.log("(info)", "writing " + target)

fs.writeFileSync(target, output)
