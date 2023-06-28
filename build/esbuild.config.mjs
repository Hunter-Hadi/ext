import fs from 'fs-extra'
import esbuild from 'esbuild'
import postcssPlugin from 'esbuild-style-plugin'
import autoprefixer from 'autoprefixer'
import graphqlLoaderPlugin from '@luckycatfactory/esbuild-graphql-loader';
import copyStaticFilesPlugin from 'esbuild-copy-files-plugin'
import * as buildEnv from './env.mjs'
import localesCreator from './i18n.mjs'
import {spawn} from 'child_process'
import chokidar from 'chokidar'
import path from 'path'
import archiver from 'archiver'
import dayjs from 'dayjs'

const replaceEnv = buildEnv.getReplaceEnv()
const isProduction = buildEnv.isProduction
const sourceDir = path.resolve('src')
const buildDir = path.resolve('dist')
const releaseDir = path.resolve('release')

async function cleanBuildDir() {
  try {
    const entries = fs.readdirSync(buildDir)
    for (const entry of entries) {
      const removePath = `${buildDir}/${entry}`
      const stats = fs.statSync(removePath)
      if (stats.isDirectory()) {
        fs.rmSync(removePath, { recursive: true })
      } else {
        fs.unlinkSync(removePath)
      }
    }
  } catch (err) {
    console.info('cleanBuildDir:', err.message)
  }
  return true
}

async function esbuildConfig() {
  await esbuild.build({
    entryPoints: [
      'src/content.tsx',
      'src/content_style.ts',
      'src/background.ts',
      'src/check_status.ts',
      'src/iframe.tsx',
      'src/pages/options/index.tsx',
      'src/pages/popup/index.tsx'
    ],
    format: 'esm',
    drop: isProduction ? ['console', 'debugger'] : [],
    bundle: true,
    minify: isProduction,
    treeShaking: true,
    splitting: true,
    chunkNames: 'chunks/[hash]',
    define: replaceEnv,
    loader:{
      '.woff': 'dataurl',
      '.woff2': 'dataurl',
      '.eot': 'dataurl',
      '.ttf': 'dataurl',
      '.graphql': 'text',
    },
    plugins: [
      postcssPlugin({
        postcss: {
          plugins: [autoprefixer],
        }
      }),
      copyStaticFilesPlugin({
        source: ['src/manifest.json', 'src/content.css'],
        target: buildDir,
        copyWithFolder: false,
      }),
      copyStaticFilesPlugin({
        source: ['src/assets/USE_CHAT_GPT_AI'],
        target: `${buildDir}/assets/USE_CHAT_GPT_AI`,
        copyWithFolder: false,
      }),
      copyStaticFilesPlugin({
        source: ['pdf/pdf_build'],
        target: `${buildDir}/pages/pdf`,
        copyWithFolder: false,
      }),
      copyStaticFilesPlugin({
        source: ['src/pages/options/index.html'],
        target: `${buildDir}/pages/options`,
        copyWithFolder: false,
      }),
      copyStaticFilesPlugin({
        source: ['src/pages/popup/index.html'],
        target: `${buildDir}/pages/popup`,
        copyWithFolder: false,
      }),
      copyStaticFilesPlugin({
        source: ['node_modules/@inboxsdk/core/pageWorld.js'],
        target: `${buildDir}`,
        copyWithFolder: false,
      }),
    ].concat(isProduction ? [] : [copyStaticFilesPlugin({
      source: ['build/hot_reload/hot_reload.content.js'],
      target: `${buildDir}`,
      copyWithFolder: false,
    })]),
    outdir: buildDir,
  })
}
async function updateManifest() {
  const manifest = await fs.readJson(`${buildDir}/manifest.json`)
  let addWebAccessibleResources = []
  manifest.content_scripts.map(contentScript => {
    const contentScriptPath = contentScript.js[0]
    if (!isProduction) {
      if (contentScriptPath === 'check_status.js') {
        // 修改登陆check_status的matches
        contentScript.matches.push('https://main.d3bohqvl407i44.amplifyapp.com/*')
      }
    }
    addWebAccessibleResources.push(contentScriptPath)
    contentScript.js[0] = `import_${contentScriptPath}`
    // write a new js file
    const jsContent = `(function() {
    const importPath = /*@__PURE__*/ JSON.parse('"${contentScriptPath}"');
    import(chrome.runtime.getURL(importPath));
})();`
    fs.writeFileSync(`${buildDir}/import_${contentScriptPath}`, jsContent)
  })
  addWebAccessibleResources.forEach(resource => {
    manifest.web_accessible_resources[0].resources.push(resource)
  })

  fs.writeJsonSync(`${buildDir}/manifest.json`, manifest, { spaces: 2 })
}
async function buildFiles () {
  const startTimestamp = Date.now()
  console.log('env -> ', isProduction ? 'production' : 'development')
  await cleanBuildDir()
  await esbuildConfig()
  await updateManifest()
  // TODO 不参与每次构建，只有在需要时才构建
  await localesCreator()
  // computed time with seconds
  const time = ((Date.now() - startTimestamp) / 1000).toFixed(2)
  console.info(`Build finished in ${time}s`)
}

async function release() {
  const manifest = await fs.readJson(`${buildDir}/manifest.json`)
  const version = manifest.version
  let archiveName = `releases/MaxAI-${version}-${dayjs().format('YYYY-MM-DD-HH-mm')}.zip`
  const archive = archiver('zip', { zlib: { level: 9 } })
  const stream = fs.createWriteStream(archiveName)
  archive.pipe(stream)
  const entries = fs.readdirSync(`${buildDir}`)
  for (const entry of entries) {
    const entryStat = fs.statSync(`${buildDir}/${entry}`)
    if (entryStat.isDirectory()) {
      archive.directory(`${buildDir}/${entry}`, entry)
    } else {
      archive.file(`${buildDir}/${entry}`, { name: entry })
    }
  }
  // if (browser === 'firefox') {
  //   archive.file('src/manifest.v2.json', { name: 'manifest.json' })
  // } else if (browser === 'chrome') {
  //   archive.file('build/manifest.json', { name: 'manifest.json' })
  // }
  console.info(`Creating ${archiveName}…`)
  await archive.finalize()
}

async function hotReload () {
  const child = spawn('node', ['build/hot_reload.mjs'], {
    stdio: 'inherit',
  })
  child.on('close', (code) => {
    console.log(`child process exited with code ${code}`)
  })
}

async function main() {
  if (!isProduction) {
    await hotReload()
    await buildFiles()
    const watcher = chokidar.watch(sourceDir, {
      ignoreInitial: true,
    })
    watcher.on('change', async (path) => {
      console.log(`File change detected. Path: ${path}`)
      await buildFiles()
    })
  } else {
    await buildFiles()
    await release()
  }
}

main()
