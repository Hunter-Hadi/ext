import path from 'path'

import resolve from '@rollup/plugin-node-resolve'
import commonjs from '@rollup/plugin-commonjs'
import typescript from '@rollup/plugin-typescript'
import postcss from 'rollup-plugin-postcss'
import { chromeExtension, simpleReloader } from 'rollup-plugin-chrome-extension'
import terser from '@rollup/plugin-terser'
import { emptyDir } from 'rollup-plugin-empty-dir'
import zip from './zip.es'
import replace from '@rollup/plugin-replace'
import copy from 'rollup-plugin-copy'
import alias from '@rollup/plugin-alias'
import dayjs from 'dayjs'
import app from './package.json'
import { nodeResolve } from '@rollup/plugin-node-resolve'
import html from '@rollup/plugin-html'

const isProduction = process.env.NODE_ENV === 'production'

export default [
  {
    input: 'src/manifest.json',
    output: {
      dir: 'dist',
      format: 'esm',
      chunkFileNames: path.join('chunks', '[name]-[hash].js'),
    },
    plugins: [
      alias({
        entries: [{ find: '@', replacement: path.resolve(__dirname, 'src') }],
      }),
      replace({
        'process.env.NODE_ENV': isProduction
          ? JSON.stringify('production')
          : JSON.stringify('development'),
        preventAssignment: true,
      }),
      chromeExtension(),
      postcss({
        plugins: [],
      }),
      simpleReloader(),
      resolve(),
      commonjs(),
      typescript(),
      isProduction && emptyDir(),
      isProduction &&
        terser({
          compress: {
            drop_console: true,
            drop_debugger: true,
          },
          output: {
            comments: false,
          },
        }),
      copy({
        targets: [
          { src: 'node_modules/@inboxsdk/core/pageWorld.js', dest: 'dist' },
        ],
        hook: 'generateBundle',
      }),
      nodeResolve(),
    ],
  },
  {
    input: 'src/options.content.tsx',
    output: {
      dir: 'dist',
      format: 'esm',
      chunkFileNames: path.join('chunks', '[name]-[hash].js'),
    },
    plugins: [
      alias({
        entries: [{ find: '@', replacement: path.resolve(__dirname, 'src') }],
      }),
      replace({
        'process.env.NODE_ENV': isProduction
          ? JSON.stringify('production')
          : JSON.stringify('development'),
        preventAssignment: true,
      }),
      postcss({
        plugins: [],
      }),
      resolve(),
      commonjs(),
      typescript(),
      isProduction &&
        terser({
          compress: {
            drop_console: true,
            drop_debugger: true,
          },
          output: {
            comments: false,
          },
        }),
      nodeResolve(),
      html({
        fileName: 'options.html',
        template: () => {
          return `<!DOCTYPE html><html lang="en"><head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, user-scalable=no, initial-scale=1.0, maximum-scale=1.0, minimum-scale=1.0">
<meta http-equiv="X-UA-Compatible" content="ie=edge">
<title>Document</title>
<link rel="stylesheet" href="https://fonts.googleapis.com/css?family=Roboto:300,400,500,700&amp;display=swap">
</head>
<body>
<div id="Root"></div>
<script src='options.content.js' type='module'></script>
</body></html>
`
        },
      }),
      isProduction &&
        zip({
          file: `../releases/${app.name}_${app.version}_${dayjs().format(
            'YYYY_MM_DD_HH_mm_ss',
          )}.zip`,
        }),
    ],
  },
]
