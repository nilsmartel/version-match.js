import fs from "fs"


function parseArgs() {
    const argv = process.argv.slice(2)

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
            continue
        }

        files.push(a)
    }

    if (!target) throw "expect file passed after --target flag. I.e. --target package.json"

    return { files, target }
}


function getDependencies(files: string[]) {
    console.log("(info)", `reading ${files.length} files`)

    let depss: Record<string, string>[] = files
        .map(s => String(fs.readFileSync(s)))
        .map(s => JSON.parse(s)).map(pkg => ({ ...pkg.dependencies, ...pkg.devDependencies } as Record<string, string>))

    let depMap: Record<string, string> = {}

    for (let dep of depss) {
        for (let [key, value] of Object.entries(dep)) {
            let cur = depMap[key]
            if (cur > value) continue

            depMap[key] = value
        }
    }

    console.log("(info)", `found info on ${Object.keys(depMap).length} dependencies`)

    return depMap
}


let { files, target } = parseArgs()
let deps = getDependencies(files)


console.log("(info)", "reading " + target)
let pkgJsonContent = String(fs.readFileSync(target!))
let pkgJson = JSON.parse(pkgJsonContent)

// For all kinds of dependencies, look up of we have information about a newer version we can use instead
for (let d of [pkgJson.dependencies, pkgJson.devDependencies]) {
    for (let key in d) {
        // version of dependency in keys
        let dv = deps[key]
        let v = pkgJson[key]
        if (dv >= v) {
            console.log("(info)", `${key}: ${v} => ${dv}`)
            pkgJson[key] = dv
        }
    }
}


let output = JSON.stringify(pkgJson, null, 2)

console.log("(info)", "writing " + target)

fs.writeFileSync(target, output)

