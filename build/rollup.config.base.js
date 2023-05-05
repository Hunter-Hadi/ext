import alias from '@rollup/plugin-alias'
import path from 'path'
import postcss from 'rollup-plugin-postcss'
import resolve from '@rollup/plugin-node-resolve'
import commonjs from '@rollup/plugin-commonjs'
import typescript from 'rollup-plugin-ts'
import terser from '@rollup/plugin-terser'
import replace from '@rollup/plugin-replace'
import { env, getReplaceEnv } from './env'
export default function mergeRollupConfig(
  isProduction,
  { plugins = [], input, output },
) {
  const replaceEnv = getReplaceEnv()
  console.log(replaceEnv)
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
      postcss({
        plugins: [],
        extensions: ['.css', '.less'],
      }),
      resolve(),
      commonjs({
        sourceMap: false,
      }),
      typescript({
        transpiler: 'babel',
        exclude: isProduction ? [] : ['node_modules/**/*.*'],
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