import alias from '@rollup/plugin-alias'
import path from 'path'
import postcss from 'rollup-plugin-postcss'
import { nodeResolve } from '@rollup/plugin-node-resolve'
import commonjs from '@rollup/plugin-commonjs'
import typescript from 'rollup-plugin-ts'
import terser from '@rollup/plugin-terser'
import replace from '@rollup/plugin-replace'

import { getReplaceEnv } from './env'
import { string } from 'rollup-plugin-string'
export default function mergeRollupConfig(
  isProduction,
  { plugins = [], input, output },
) {
  const replaceEnv = getReplaceEnv()
  console.log(replaceEnv, isProduction)
  return {
    input,
    output,
    plugins: [
      alias({
        entries: [
          { find: '@', replacement: path.resolve(__dirname, '../src') },
        ],
      }),
      replace(replaceEnv),
      nodeResolve({
        browser: true,
      }),
      string({
        // Required to be specified
        include: '**/*.graphql',
      }),
      postcss({
        plugins: [],
        extensions: ['.css', '.less'],
      }),
      commonjs({
        sourceMap: false,
      }),
      typescript({
        transpiler: 'swc',
        swcConfig: {
          jsc: {
            parser: {
              decorators: true,
            },
          },
        },
        exclude: isProduction
          ? ['src/chat/PoeChat/poe/graphql/**']
          : ['src/chat/PoeChat/poe/graphql/**', 'node_modules/**'],
      }),
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
      ...plugins,
    ],
    treeshake: isProduction,
    cache: !isProduction,
  }
}
