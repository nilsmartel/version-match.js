// main.ts
var { default: fs} = (() => ({}));
function parseArgs() {
  const argv = process.argv.slice(2);
  let targetFlag = false;
  let target = undefined;
  const files = [];
  for (let a of argv) {
    if (a == "--target") {
      targetFlag = true;
      continue;
    }
    if (targetFlag === true) {
      target = a;
      continue;
    }
    files.push(a);
  }
  if (!target)
    throw "expect file passed after --target flag. I.e. --target package.json";
  return { files, target };
}
function getDependencies(files) {
  console.log("(info)", `reading ${files.length} files`);
  let depss = files.map((s) => String(fs.readFileSync(s))).map((s) => JSON.parse(s)).map((pkg) => ({ ...pkg.dependencies, ...pkg.devDependencies }));
  let depMap = {};
  for (let dep of depss) {
    for (let [key, value] of Object.entries(dep)) {
      let cur = depMap[key];
      if (cur > value)
        continue;
      depMap[key] = value;
    }
  }
  console.log("(info)", `found info on ${Object.keys(depMap).length} dependencies`);
  return depMap;
}
var { files, target } = parseArgs();
var deps = getDependencies(files);
console.log("(info)", "reading " + target);
var pkgJsonContent = String(fs.readFileSync(target));
var pkgJson = JSON.parse(pkgJsonContent);
for (let d of [pkgJson.dependencies, pkgJson.devDependencies]) {
  for (let key in d) {
    let dv = deps[key];
    let v = d[key];
    if (dv > v) {
      console.log("(info)", `${key}: ${v} => ${dv}`);
      d[key] = dv;
    }
  }
}
var output = JSON.stringify(pkgJson, null, 2);
console.log("(info)", "writing " + target);
fs.writeFileSync(target, output);
