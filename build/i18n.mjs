import { readdirSync, writeFileSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'
import { mkdirpSync } from 'mkdirp'

const __dirname = dirname(fileURLToPath(import.meta.url));
const i18nDir = join(__dirname, '../src/i18n/locales')
const outputDir = join(__dirname, '../dist/_locales/')

const localesCreator = async () => {
  const localesDir = outputDir
  try {
    mkdirpSync(localesDir)
    const files = readdirSync(i18nDir, { withFileTypes: true })
    const directories = files
      .filter((file) => file.isDirectory())
      .map((file) => file.name)
    for (let i = 0; i < directories.length; i++) {
      mkdirpSync(join(localesDir, directories[i]))
      const jsonPath = join(__dirname,
        `../src/i18n/locales/${directories[i]}/index.json`,
      )
      const {default: currentLang} = await import(jsonPath, {
        assert: {
          type: 'json'
        }
      })
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
      const filePath = join(
        localesDir,
        `${directories[i]}/messages.json`,
      )
      writeFileSync(filePath, JSON.stringify(messageJsonTemplate))
    }
    console.log('localesCreator success')
  } catch (e) {
    console.error('localesCreator error: \t', e)
  }
}

export default localesCreator
