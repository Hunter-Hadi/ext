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
import { nodeResolve } from '@rollup/plugin-node-resolve'
import html from '@rollup/plugin-html'
import modifyManifest from './modifyManifest'
import localesCreator from './localesCreator'

const isProduction = process.env.NODE_ENV === 'production'
function getArgs() {
  const args = {}
  process.argv.slice(2, process.argv.length).forEach((arg) => {
    // long arg
    if (arg.slice(0, 2) === '--') {
      const longArg = arg.split('=')
      const longArgFlag = longArg[0].slice(2, longArg[0].length)
      const longArgValue = longArg.length > 1 ? longArg[1] : true
      args[longArgFlag] = longArgValue
    }
    // flags
    else if (arg[0] === '-') {
      const flags = arg.slice(1, arg.length).split('')
      flags.forEach((flag) => {
        args[flag] = true
      })
    }
  })
  return args
}
const args = getArgs()

const APP_USE_CHAT_GPT_HOST = isProduction
  ? 'https://app.usechatgpt.ai'
  : 'https://usechatgpt-main.simplysourcing.net'
// : 'http://localhost:3000'

const APP_USE_CHAT_GPT_API_HOST = isProduction
  ? 'https://api.usechatgpt.ai'
  : 'https://dev.usechatgpt.ai'
const APP_NAME = args.app === 'ezmail' ? 'EzMail.AI' : 'UseChatGPT.AI'
const APP_ENV = args.app === 'ezmail' ? 'EZ_MAIL_AI' : 'USE_CHAT_GPT_AI'
const GLOBAL_LESS =
  args.app === 'ezmail' ? './app.EZ_MAIL_AI.less' : './app.USE_CHAT_GPT.less'
// eslint-disable-next-line @typescript-eslint/no-var-requires
const manifest = require(`./src/manifest.${APP_ENV}.json`)

let startOptionsPage = true
let startChromeExtension = true
if (args.only) {
  if (args.only === 'options') {
    startChromeExtension = false
  }
  if (args.only === 'extension') {
    startOptionsPage = false
  }
}

const optionsPageConfig = {
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
      'process.env.APP_ENV': JSON.stringify(APP_ENV),
      'process.env.APP_NAME': JSON.stringify(APP_NAME),
      'process.env.APP_USE_CHAT_GPT_HOST': JSON.stringify(
        APP_USE_CHAT_GPT_HOST,
      ),
      'process.env.APP_USE_CHAT_GPT_API_HOST': JSON.stringify(
        APP_USE_CHAT_GPT_API_HOST,
      ),
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
  <title>Settings | UseChatGPT.AI</title>
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
        file: `../releases/[${APP_NAME}]_v${manifest.version}_${dayjs().format(
          'YYYY_MM_DD_HH_mm',
        )}.zip`,
        isEzMail: APP_ENV === 'EZ_MAIL_AI',
      }),
  ],
}

const chromeExtensionConfig = {
  input: `src/manifest.${APP_ENV}.json`,
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
      'process.env.APP_ENV': JSON.stringify(APP_ENV),
      'process.env.APP_NAME': JSON.stringify(APP_NAME),
      'process.env.GLOBAL_LESS': JSON.stringify(GLOBAL_LESS),
      'process.env.APP_USE_CHAT_GPT_HOST': JSON.stringify(
        APP_USE_CHAT_GPT_HOST,
      ),
      'process.env.APP_USE_CHAT_GPT_API_HOST': JSON.stringify(
        APP_USE_CHAT_GPT_API_HOST,
      ),
      preventAssignment: true,
    }),
    chromeExtension(),
    // less({}),
    postcss({
      plugins: [],
      extensions: ['.css', '.less'],
    }),
    simpleReloader(),
    resolve(),
    commonjs(),
    typescript(),
    emptyDir(),
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
    APP_ENV === 'EZ_MAIL_AI' &&
      copy({
        targets: [
          { src: 'node_modules/@inboxsdk/core/pageWorld.js', dest: 'dist' },
        ],
        hook: 'generateBundle',
      }),
    nodeResolve(),
    APP_ENV === 'USE_CHAT_GPT_AI' &&
      copy({
        targets: [
          // { src: 'inject-fetch.js', dest: 'dist' }
          {
            src: 'src/assets/USE_CHAT_GPT_AI/icons/usechatGPT_16_grey_dark.png',
            dest: 'dist/assets/USE_CHAT_GPT_AI/icons',
          },
          {
            src: 'src/assets/USE_CHAT_GPT_AI/icons/usechatGPT_16_normal_dark.png',
            dest: 'dist/assets/USE_CHAT_GPT_AI/icons',
          },
          {
            src: 'src/assets/USE_CHAT_GPT_AI/icons/usechatGPT_32_grey_dark.png',
            dest: 'dist/assets/USE_CHAT_GPT_AI/icons',
          },
          {
            src: 'src/assets/USE_CHAT_GPT_AI/icons/usechatGPT_32_normal_dark.png',
            dest: 'dist/assets/USE_CHAT_GPT_AI/icons',
          },
          {
            src: 'src/assets/USE_CHAT_GPT_AI/icons/usechatGPT_48_grey_dark.png',
            dest: 'dist/assets/USE_CHAT_GPT_AI/icons',
          },
          {
            src: 'src/assets/USE_CHAT_GPT_AI/icons/usechatGPT_48_normal_dark.png',
            dest: 'dist/assets/USE_CHAT_GPT_AI/icons',
          },
          {
            src: 'src/assets/USE_CHAT_GPT_AI/icons/usechatGPT_128_grey_dark.png',
            dest: 'dist/assets/USE_CHAT_GPT_AI/icons',
          },
          {
            src: 'src/assets/USE_CHAT_GPT_AI/icons/usechatGPT_128_normal_dark.png',
            dest: 'dist/assets/USE_CHAT_GPT_AI/icons',
          },
        ],
        hook: 'generateBundle',
      }),
    modifyManifest({
      env: APP_ENV,
      isProd: isProduction,
    }),
    localesCreator(),
  ],
}

export default [
  startChromeExtension ? chromeExtensionConfig : null,
  startOptionsPage ? optionsPageConfig : null,
].filter(Boolean)
