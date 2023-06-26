import { readFileSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url));

const getArgs = () => {
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

const isProduction = args.production ? true : false

const APP_USE_CHAT_GPT_HOST = isProduction
  ? 'https://app.maxai.me'
  : 'https://app.maxai.me'
// TODO maxai.app 暂时还没有main环境先用正式环境
// : 'https://maxai-main.simplysourcing.net'
// : 'http://localhost:3000'

const APP_USE_CHAT_GPT_API_HOST = isProduction
  ? 'https://api.maxai.me'
  : // TODO maxai.app 暂时还没有main环境先用正式环境
    // : 'https://dev.maxai.me'
    'https://api.maxai.me'
const APP_NAME = 'MaxAI.me'
const APP_ENV = 'USE_CHAT_GPT_AI'
const NODE_ENV = isProduction ? 'production' : 'development'

const env = {
  NODE_ENV,
  APP_ENV,
  APP_USE_CHAT_GPT_HOST,
  APP_USE_CHAT_GPT_API_HOST,
  APP_NAME,
}
const getReplaceEnv = () => {
  const pkg = JSON.parse(
    readFileSync(
      join(__dirname, '../src/', `manifest.json`),
      'utf8',
    ),
  )
  const replaceEnv = {
    [`process.env.APP_VERSION`]: JSON.stringify(pkg.version),
    preventAssignment: true,
  }
  Object.keys(env).forEach((key) => {
    replaceEnv[`process.env.${key}`] = JSON.stringify(env[key])
  })
  return replaceEnv
}
export { getReplaceEnv, env, isProduction }
