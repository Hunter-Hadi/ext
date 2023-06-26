import fs from 'fs-extra'
import esbuild from 'esbuild'
import postcssPlugin from 'esbuild-style-plugin'
import autoprefixer from 'autoprefixer'
import graphqlLoaderPlugin from '@luckycatfactory/esbuild-graphql-loader';
import copyStaticFilesPlugin from 'esbuild-copy-files-plugin'

import * as buildEnv from './build/env.mjs'
import localesCreator from './build/i18n.mjs'
const replaceEnv = buildEnv.getReplaceEnv()
const isProduction = buildEnv.isProduction
const buildDir = 'dist'
const releaseDir = 'release'

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
    drop: isProduction ? ['console', 'debugger'] : [],
    bundle: true,
    minify: isProduction,
    treeShaking: true,
    define: replaceEnv,
    loader:{},
    plugins: [
      postcssPlugin({
        postcss: {
          plugins: [autoprefixer],
        }
      }),
      graphqlLoaderPlugin.default(),
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
      !isProduction && copyStaticFilesPlugin({
        source: ['build/hot_reload/hot_reload.content.js'],
        target: `${buildDir}`,
        copyWithFolder: false,
      })
    ],
    outdir: buildDir,
  })
}
async function injectHotReload () {
  const manifest = fs.readJsonSync(`${buildDir}/manifest.json`)
  manifest.content_scripts.push({
    matches: ['<all_urls>'],
    js: ['hot_reload.content.js'],
    run_at: 'document_start'
  })
  console.log(manifest.content_scripts)
  fs.writeJsonSync(`${buildDir}/manifest.json`, manifest , { spaces: 2 })
}

async function main() {
  const startTimestamp = Date.now()
  console.log('env -> ', isProduction ? 'production' : 'development')
  await cleanBuildDir()
  await esbuildConfig()
  // if (!isProduction) {
    // await injectHotReload()
  // }
  await localesCreator()
  // computed time with seconds
  const time = ((Date.now() - startTimestamp) / 1000).toFixed(2)
  console.info(`Build finished in ${time}s`)
}

main()
