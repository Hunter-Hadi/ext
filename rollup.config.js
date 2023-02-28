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

const isProduction = process.env.NODE_ENV === 'production'

export default {
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
    emptyDir(),

    chromeExtension(),
    postcss({
      plugins: [],
    }),
    simpleReloader(),
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
    copy({
      targets: [
        { src: 'node_modules/@inboxsdk/core/pageWorld.js', dest: 'dist' },
      ],
      hook: 'generateBundle',
    }),
    isProduction &&
      zip({
        file: `../releases/${app.name}_${app.version}_${dayjs().format(
          'YYYY_MM_DD_HH_mm_ss',
        )}.zip`,
      }),
  ],
}
