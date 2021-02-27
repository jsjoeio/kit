let pattern = await arg(
  "Enter a pattern. You will be prompted to confirm:"
)

if (pattern.startsWith("*")) pattern = "." + pattern

let matchDirsInDir = async (dir, pattern) => {
  let files = await readdir(dir, {
    withFileTypes: true,
  })

  return files
    .filter(f => f.isDirectory())
    .map(({ name }) => name)
    .filter(name => name.match(pattern))
}

let promptToRemoveFiles = async (dir, pattern) => {
  console.log({ dir }, { pattern })
  let dirList = await readdir(dir, {
    withFileTypes: true,
  })

  let files = dirList
    .filter(f => f.isFile())
    .map(({ name }) => name)
    .filter(name => name.match(pattern))

  for await (let script of files) {
    let targetDir = dir.replace(simplePath("scripts"), "")
    let scriptName = script.replace(".js", "")

    const confirm =
      arg?.force ||
      (await prompt({
        type: "confirm",
        name: "value",
        message: chalk`Delete "{red.bold ${
          targetDir ? `${targetDir}/` : ``
        }${scriptName}}"?`,
      }))

    if (confirm) {
      let trashBin = simplePath(
        "bin",
        targetDir,
        scriptName
      )
      let trashScript = simplePath(
        "scripts",
        targetDir,
        script
      )

      await trash([trashBin, trashScript])
    } else {
      echo(`Skipping ` + scriptName)
    }
  }

  let dirs = dirList
    .filter(f => f.isDirectory())
    .map(({ name }) => name)
    .filter(name => name.match(pattern))

  for await (let dir of dirs) {
    await promptToRemoveFiles(
      simplePath("scripts", dir),
      ".*"
    )
  }
}

await promptToRemoveFiles(simplePath("scripts"), pattern)
