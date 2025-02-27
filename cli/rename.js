let { exists, findScript, scripts } = await cli("fns")

let script = await arg(
  {
    message: `Which script do you want to rename?`,
    validate: findScript,
  },
  scripts
)

let newScript = await arg({
  message: `Enter the new script name:`,
  validate: exists,
})

let oldFilePath = path.join(kenvPath("scripts"), script)

if (!(await isFile(oldFilePath))) {
  console.warn(`${oldFilePath} doesn't exist...`)
  exit()
}

let newFilePath = path.join(
  kenvPath("scripts"),
  newScript + ".js"
)

console.log({ oldFilePath, newFilePath })

mv(oldFilePath, newFilePath)
await cli("create-bin", "scripts", newScript)
trash(kenvPath("bin", script))
edit(newFilePath, kenvPath())
