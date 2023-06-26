import fs from 'fs'
import esbuild from 'esbuild'
import postcssPlugin from 'esbuild-style-plugin'
import autoprefixer from 'autoprefixer'
import { lessLoader } from 'esbuild-plugin-less';
import graphqlLoaderPlugin from '@luckycatfactory/esbuild-graphql-loader';

import * as buildEnv from './build/env.mjs'
const replaceEnv = buildEnv.getReplaceEnv()
console.log(replaceEnv)
async function esbuildConfig() {
  await esbuild.build({
    entryPoints: [
      'src/content.tsx',
      'src/background.ts',
      'src/check_status.ts',
      'src/iframe.tsx',
      'src/pages/options/index.tsx'
    ],
    drop: [],
    bundle: true,
    minify: false,
    treeShaking: true,
    define: replaceEnv,
    loader:{},
    plugins: [
      lessLoader(),
      postcssPlugin({
        postcss: {
          plugins: [autoprefixer],
        }
      }),
      graphqlLoaderPlugin.default()
    ],
    outdir: 'dist'
  })
}

async function main() {
  await esbuildConfig()
}

main()
