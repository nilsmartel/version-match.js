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
    console.log("info", `reading ${files.length} files`)

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

    return depMap
}
