import fs from 'fs-extra'
import esbuild from 'esbuild'
import postcssPlugin from 'esbuild-style-plugin'
import autoprefixer from 'autoprefixer'
import * as buildEnv from '../build/env.mjs'
import chokidar from 'chokidar'
import path from 'path'
import copyStaticFilesPlugin from 'esbuild-copy-files-plugin'

const replaceEnv = buildEnv.getReplaceEnv()
const isProduction = buildEnv.isProduction
const sourceDir = path.resolve('SystemPromptEditor/src')
const buildDir = path.resolve('SystemPromptEditor/dist')

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
  const ctx = await esbuild.context({
    platform: 'browser',
    entryPoints: [
      'SystemPromptEditor/src/app.tsx',
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
      // resolve({
      //   '@postlight/parser':
      //     'node_modules/@postlight/parser/dist/mercury.web.js',
      // }),
      // eslint({ /* config */ }),
      postcssPlugin({
        postcss: {
          plugins: [autoprefixer],
        },
      }),
      copyStaticFilesPlugin({
        source: ['SystemPromptEditor/src/index.html'],
        target: `${buildDir}`,
        copyWithFolder: false,
      }),
    ],
    outdir: buildDir,
  })
  await ctx.watch()
  let { host, port } = await ctx.serve({
    servedir: 'SystemPromptEditor/dist',
  })
  console.log(`Serving on http://localhost:${port}`)
  console.log(`Serving on http://${host}:${port}`)
}
async function buildFiles() {
  try {
    const startTimestamp = Date.now()
    console.log('env -> ', isProduction ? 'production' : 'development')
    await cleanBuildDir()
    await esbuildConfig()
    // computed time with seconds
    const time = ((Date.now() - startTimestamp) / 1000).toFixed(2)
    console.info(`Build finished in ${time}s`)
  } catch (e) {
    console.error(e.message || e)
  }
}


buildFiles()
