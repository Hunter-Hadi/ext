import { mkdirpSync } from 'mkdirp'
import fs from 'fs'
import path from 'path'

const i18nDir = path.join(__dirname, '../src/i18n/')

const localesCreator = () => ({
  name: 'locales-creator',
  writeBundle: () => {
    console.log('localesCreator!!!!')
    const localesDir = path.join(__dirname, '../dist/_locales')
    mkdirpSync(localesDir)
    fs.readdir(i18nDir, { withFileTypes: true }, (err, files) => {
      if (err) {
        console.log('Error getting directory information.')
      } else {
        const directories = files
          .filter((file) => file.isDirectory())
          .map((file) => file.name)
        for (let i = 0; i < directories.length; i++) {
          mkdirpSync(path.join(localesDir, directories[i]))

          // eslint-disable-next-line @typescript-eslint/no-var-requires
          const currentLang = require(path.join(
            __dirname,
            `../src/i18n/${directories[i]}/index.json`,
          ))

          const messageJsonTemplate = {
            desc: {
              message: currentLang.description,
            },
            name: {
              message: currentLang.name,
            },
            // short_name
            sn: {
              message: currentLang.shortName,
            },
          }

          const filePath = path.join(
            localesDir,
            `${directories[i]}/messages.json`,
          )

          fs.writeFile(filePath, JSON.stringify(messageJsonTemplate), (err) => {
            if (err) throw err
            // console.log(`${filePath} has been saved.`)
          })
        }
      }
    })
  },
})
export default localesCreator
