import mergeRollupConfig from './rollup.config.base'
import path from 'path'
import visualizer from 'rollup-plugin-visualizer'
import { chromeExtension, simpleReloader } from 'rollup-plugin-chrome-extension'
import { emptyDir } from 'rollup-plugin-empty-dir'
import copy from 'rollup-plugin-copy'
import modifyManifest from './plugins/modifyManifest'
import localesCreator from './plugins/localesCreator'
import { env, isProduction } from './env'
import zip from './plugins/zip.es'
import dayjs from 'dayjs'

// eslint-disable-next-line @typescript-eslint/no-var-requires
const { version } = require(`../src/manifest.${env.APP_ENV}.json`)

export default mergeRollupConfig(isProduction, {
  input: `src/manifest.${env.APP_ENV}.json`,
  output: {
    dir: 'dist',
    format: 'esm',
    chunkFileNames: path.join('chunks', '[hash].js'),
  },
  plugins: [
    !isProduction &&
      visualizer({
        emitFile: true,
        filename: 'crx.html',
      }),
    chromeExtension(),
    simpleReloader(),
    emptyDir(),
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
            src: 'src/assets/USE_CHAT_GPT_AI/*',
            dest: 'dist/assets/USE_CHAT_GPT_AI/',
          },
          { src: 'pdf/pdf_build/*', dest: 'dist/pages/pdf' },
        ],
        hook: 'generateBundle',
      }),
    modifyManifest({
      env: env.APP_ENV,
      isProd: isProduction,
    }),
    localesCreator(),
    isProduction &&
      zip({
        file: `../releases/[${env.APP_NAME}]_v${version}_${dayjs().format(
          'YYYY_MM_DD_HH_mm',
        )}.zip`,
        isEzMail: env.APP_ENV === 'EZ_MAIL_AI',
      }),
  ],
})
