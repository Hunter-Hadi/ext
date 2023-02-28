import * as fs from 'fs'
import * as path from 'path'
import { ZipFile } from 'yazl'

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
        outFile += '-' + packageVersion
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
      const sourcemapFile = this.cache.get('sourcemapFile' /* sourcemapFile */)
      const zipFile = new ZipFile()

      Object.entries(bundle).forEach(([, entry]) => {
        if (isAsset(entry)) {
          const { fileName, source } = entry
          const buffer = Buffer.from(source)
          zipFile.addBuffer(buffer, fileName)
        } else {
          const { fileName, map } = entry
          zipFile.addFile(path.resolve(distDir, fileName), fileName)
          if (map) {
            const mapFile = fileName + '.map'
            zipFile.addFile(path.resolve(distDir, mapFile), mapFile)
          }
        }
      })
      if (sourcemapFile) {
        zipFile.addFile(path.resolve(distDir, sourcemapFile), sourcemapFile)
      }
      zipFile.addFile(path.resolve(distDir, 'pageWorld.js'), 'pageWorld.js')
      const outFile = this.cache.get('outfile' /* outfile */)
      const writeStream = fs.createWriteStream(outFile)
      zipFile.outputStream.pipe(writeStream)
      zipFile.end()
      writeStream.on('close', resolve)
    })
  },
})

export { zip as default }
