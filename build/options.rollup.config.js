import mergeRollupConfig from './rollup.config.base'
import path from 'path'
import visualizer from 'rollup-plugin-visualizer'
import html from '@rollup/plugin-html'
import zip from '../zip.es'
import { env, isProduction } from './env'
import dayjs from 'dayjs'
// eslint-disable-next-line @typescript-eslint/no-var-requires
const { version } = require(`../src/manifest.${env.APP_ENV}.json`)
export default mergeRollupConfig(isProduction, {
  input: 'src/options.content.tsx',
  output: {
    dir: 'dist',
    format: 'esm',
    chunkFileNames: path.join('chunks', '[name]-[hash].js'),
  },
  plugins: [
    visualizer({
      emitFile: true,
      filename: 'opt.html',
    }),
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
        file: `../releases/[${env.APP_NAME}]_v${version}_${dayjs().format(
          'YYYY_MM_DD_HH_mm',
        )}.zip`,
        isEzMail: env.APP_ENV === 'EZ_MAIL_AI',
      }),
  ],
})
