import archiver from 'archiver'
import autoprefixer from 'autoprefixer'
import { spawn } from 'child_process'
import chokidar from 'chokidar'
import dayjs from 'dayjs'
import esbuild from 'esbuild'
import copyStaticFilesPlugin from 'esbuild-copy-files-plugin'
// import eslint from 'esbuild-plugin-eslint';;
import resolve from 'esbuild-plugin-resolve'
import postcssPlugin from 'esbuild-style-plugin'
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'fs'
import fs from 'fs-extra'
import path from 'path'

import * as buildEnv from './env.mjs'
import localesCreator from './i18n.mjs'

const replaceEnv = buildEnv.getReplaceEnv()
const isProduction = buildEnv.isProduction
const sourceDir = path.resolve('src')
const buildDir = path.resolve('dist')
const releasesDir = path.resolve('releases')

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
    platform: 'browser',
    entryPoints: ['src/worker.ts'],
    format: 'esm',
    drop: isProduction ? ['console', 'debugger'] : [],
    bundle: true,
    minify: isProduction,
    treeShaking: true,
    splitting: false,
    metafile: false,
    define: replaceEnv,
    loader: {
      '.woff': 'dataurl',
      '.woff2': 'dataurl',
      '.eot': 'dataurl',
      '.ttf': 'dataurl',
      '.graphql': 'text',
    },
    plugins: [],
    outdir: buildDir,
  })
  const result = await esbuild.build({
    platform: 'browser',
    entryPoints: [
      'src/contentArkoseTokenIframe.ts',
      'src/assets/openai/windowArkoseTokenIframe.ts',
      'src/content.tsx',
      'src/minimum.tsx',
      'src/content_style.ts',
      'src/background.ts',
      'src/check_status.ts',
      'src/iframeDocumentStart.ts',
      'src/iframeDocumentEnd.ts',
      'src/pages/settings/index.tsx',
      'src/pages/popup/index.tsx',
      'src/pages/chatgpt/fileUploadServer.ts',
      'src/pages/googleDoc/index.ts',
      'src/pages/googleDoc/enableCanvasAnnotations.ts',
      'src/searchWithAI.ts',
    ],
    format: 'esm',
    drop: isProduction ? ['console', 'debugger'] : [],
    // drop:  [],
    bundle: true,
    minify: isProduction,
    treeShaking: true,
    splitting: true,
    metafile: true,
    chunkNames: 'chunks/[hash]',
    define: replaceEnv,
    loader: {
      '.woff': 'dataurl',
      '.woff2': 'dataurl',
      '.eot': 'dataurl',
      '.ttf': 'dataurl',
      '.graphql': 'text',
    },
    plugins: [
      resolve({
        // 为了统一 close btn 都使用 CloseOutlined（自动化测试需求）
        '@mui/icons-material/Close': '@mui/icons-material/CloseOutlined',
        // '@postlight/parser':
        //   'node_modules/@postlight/parser/dist/mercury.web.js',
      }),
      // eslint({ /* config */ }),
      postcssPlugin({
        postcss: {
          plugins: [autoprefixer],
        },
      }),
      copyStaticFilesPlugin({
        source: ['src/manifest.json', 'src/content.css'],
        target: buildDir,
        copyWithFolder: false,
      }),
      copyStaticFilesPlugin({
        source: ['src/lib/openai'],
        target: `${buildDir}/assets`,
        copyWithFolder: true,
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
        source: ['src/rules'],
        target: `${buildDir}/rules`,
        copyWithFolder: false,
      }),
      copyStaticFilesPlugin({
        source: ['src/pages/popup/index.html'],
        target: `${buildDir}/pages/popup`,
        copyWithFolder: false,
      }),
      copyStaticFilesPlugin({
        source: ['src/i18n/locales'],
        target: `${buildDir}/i18n/locales`,
        copyWithFolder: false,
      }),
    ].concat(
      isProduction
        ? []
        : [
            copyStaticFilesPlugin({
              source: ['build/hot_reload/hot_reload.content.js'],
              target: `${buildDir}`,
              copyWithFolder: false,
            }),
            copyStaticFilesPlugin({
              source: ['src/lib/react-devtools.js'],
              target: `${buildDir}`,
              copyWithFolder: false,
            }),
          ],
    ),
    outdir: buildDir,
  })

  async function copyHTML() {
    const sources = [
      {
        source: '/pages/settings/index.html',
        target: `${buildDir}/pages/settings`,
      },
      {
        source: '/pages/chat/index.html',
        target: `${buildDir}/pages/chat`,
      },
    ]
    // 因为要替换html的内容，所以不使用copyStaticFilesPlugin
    for (const { source, target } of sources) {
      let html = readFileSync(`${sourceDir}/${source}`, 'utf-8')
      if (isProduction) {
        html = html.replace(`<script src='/react-devtools.js'></script>`, '')
      }
      if (!existsSync(target)) {
        mkdirSync(target, { recursive: true })
      }
      writeFileSync(`${target}/index.html`, html, 'utf-8')
    }
  }
  await copyHTML()
  try {
    fs.writeJsonSync(`${releasesDir}/meta.json`, result.metafile)
  } catch (e) {
    // console.error(e.message || e)
  }
}
async function updateManifest() {
  const manifest = await fs.readJson(`${buildDir}/manifest.json`)
  let addWebAccessibleResources = []
  manifest.content_scripts.map((contentScript) => {
    const contentScriptPath = contentScript.js[0]
    addWebAccessibleResources.push(contentScriptPath)
    contentScript.js[0] = `import_${contentScriptPath}`
    // write a new js file
    const jsContent = `(function() {
    const importPath = /*@__PURE__*/ JSON.parse('"${contentScriptPath}"');
    import(chrome.runtime.getURL(importPath));
})();`
    fs.writeFileSync(`${buildDir}/import_${contentScriptPath}`, jsContent)
    if (contentScriptPath === 'check_status.js' && isProduction) {
      // prod env check_status script matches
      contentScript.matches = ['https://app.maxai.me/*']
    }
  })

  addWebAccessibleResources.forEach((resource) => {
    manifest.web_accessible_resources[0].resources.push(resource)
  })
  fs.writeJsonSync(`${buildDir}/manifest.json`, manifest, { spaces: 2 })
}
async function buildFiles() {
  try {
    const startTimestamp = Date.now()
    console.log('env -> ', isProduction ? 'production' : 'development')
    await cleanBuildDir()
    await esbuildConfig()
    await updateManifest()
    // OPTIMIZE: 不参与每次构建，只有在需要时才构建
    await localesCreator()
    // computed time with seconds
    const time = ((Date.now() - startTimestamp) / 1000).toFixed(2)
    console.info(`Build finished in ${time}s`)
  } catch (e) {
    console.error(e.message || e)
  }
}

async function release() {
  const manifest = await fs.readJson(`${buildDir}/manifest.json`)
  const version = manifest.version
  let archiveName = `releases/MaxAI-${version}-${dayjs().format(
    'YYYY-MM-DD-HH-mm',
  )}.zip`
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

async function hotReload() {
  const child = spawn('node', ['build/hot_reload.mjs'], {
    stdio: 'inherit',
  })
  child.on('close', (code) => {
    console.log(`child process exited with code ${code}`)
  })
}

async function reactDevtools() {
  const child = spawn('react-devtools', [''], {
    stdio: 'inherit',
  })
  child.on('close', (code) => {
    console.log(`child process exited with code ${code}`)
  })
}

const throttleBuildFiles = (() => {
  let timer
  return async () => {
    if (timer) {
      clearTimeout(timer)
    }
    timer = setTimeout(async () => {
      await buildFiles()
    }, 1000)
  }
})()

async function main() {
  if (!existsSync(releasesDir)) {
    mkdirSync(releasesDir)
  }
  if (!isProduction) {
    await hotReload()
    await reactDevtools()
    await buildFiles()
    const watcher = chokidar.watch(sourceDir, {
      ignoreInitial: true,
    })
    watcher.on('change', async (path) => {
      console.log(`File change detected. Path: ${path}`)
      await throttleBuildFiles()
    })
  } else {
    await buildFiles()
    await release()
  }
}

main()
