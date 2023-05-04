import mergeRollupConfig from './rollup.config.base'
import path from 'path'
import visualizer from 'rollup-plugin-visualizer'
import { chromeExtension, simpleReloader } from 'rollup-plugin-chrome-extension'
import { emptyDir } from 'rollup-plugin-empty-dir'
import copy from 'rollup-plugin-copy'
import modifyManifest from '../modifyManifest'
import localesCreator from '../localesCreator'
import { env } from './env'
const isProduction = String(process.env.NODE_ENV) === 'production'
export default mergeRollupConfig(isProduction, {
  input: `src/manifest.${env.APP_ENV}.json`,
  output: {
    dir: 'dist',
    format: 'esm',
    chunkFileNames: path.join('chunks', '[name]-[hash].js'),
  },
  plugins: [
    visualizer({
      emitFile: true,
      filename: 'crx.html',
    }),
    chromeExtension(),
    simpleReloader(),
    emptyDir(),
    env.APP_ENV === 'EZ_MAIL_AI' &&
      copy({
        targets: [
          { src: 'node_modules/@inboxsdk/core/pageWorld.js', dest: 'dist' },
        ],
        hook: 'generateBundle',
      }),
    env.APP_ENV === 'USE_CHAT_GPT_AI' &&
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
      env: env.APP_ENV,
      isProd: isProduction,
    }),
    localesCreator(),
  ],
})
