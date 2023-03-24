import { ZipFile } from 'yazl'
import fs from 'fs'
import path from 'path'

function walk(dir) {
  let files = fs.readdirSync(dir)
  files = files.map((file) => {
    const filePath = path.join(dir, file)
    const stats = fs.statSync(filePath)
    if (stats.isDirectory()) return walk(filePath)
    else if (stats.isFile()) return filePath
  })
  return files.reduce((all, folderContents) => all.concat(folderContents), [])
}

const isAsset = (entry) => entry.type === 'asset'
const zip = (options) => ({
  name: 'zip',
  generateBundle({ dir, sourcemap, sourcemapFile }) {
    // Save the output directory path
    let distDir = process.cwd()
    if (dir) {
      distDir = path.resolve(distDir, dir)
    }
    this.cache.set('distdir' /* distdir */, distDir)
    if (sourcemap) {
      this.cache.set('sourcemapFile' /* sourcemapFile */, sourcemapFile)
    }
    // Get options
    let outFile = options?.file
    const outDir = options?.dir
    if (outFile) {
      if (outDir) {
        this.warn(
          'Both the `file` and `dir` options are set - `dir` has no effect',
        )
      }
      if (!path.isAbsolute(outFile)) {
        outFile = path.resolve(distDir, outFile)
      }
    } else {
      const {
        npm_package_name: packageName = 'bundle',
        npm_package_version: packageVersion,
      } = process.env
      outFile = packageName
      if (packageVersion) {
        outFile += packageVersion
      }
      if (
        outDir &&
        !(fs.existsSync(outDir) && fs.statSync(outDir).isDirectory())
      ) {
        fs.mkdirSync(outDir, { recursive: true })
      }
      outFile = path.resolve(outDir || distDir, outFile + '.zip')
    }
    // Save the output file path
    this.cache.set('outfile' /* outfile */, outFile)
  },
  writeBundle(_options, bundle) {
    return new Promise((resolve) => {
      const distDir = this.cache.get('distdir' /* distdir */)
      const zipFile = new ZipFile()
      const files = walk(distDir)
      files.forEach((filePath) => {
        const fileName = filePath.replace(/^.*[\\/]/, '')
        const filters = ['.DS_Store']
        if (!filters.includes(fileName)) {
          zipFile.addFile(filePath, filePath.replace(distDir + '/', ''))
        }
      })
      const outFile = this.cache.get('outfile' /* outfile */)
      const writeStream = fs.createWriteStream(outFile)
      zipFile.outputStream.pipe(writeStream)
      zipFile.end()
      writeStream.on('close', resolve)
    })
  },
})

export { zip as default }
