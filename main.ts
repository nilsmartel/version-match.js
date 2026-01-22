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
