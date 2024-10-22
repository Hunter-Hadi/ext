import { readFileSync } from 'fs'
import { dirname, join } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))

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
// const args = getArgs()

const node_env = String(process.env.NODE_ENV || 'development')
const api_env = String(process.env.API_ENV || 'development')

const isProduction = node_env === 'production'

const HostConfig = {
  development: {
    wwwProjectHost: 'https://main.d35dysdwr52gaf.amplifyapp.com',
    appProjectHost: 'https://main.d3kf9o74pc4m0c.amplifyapp.com',
    appProjectAPIHost: 'https://dev.maxai.me',
  },
  test: {
    wwwProjectHost: 'https://test.d35dysdwr52gaf.amplifyapp.com',
    appProjectHost: 'https://test.d3kf9o74pc4m0c.amplifyapp.com',
    appProjectAPIHost: 'https://test.maxai.me',
  },
  test1: {
    wwwProjectHost: 'https://test.d35dysdwr52gaf.amplifyapp.com',
    appProjectHost: 'https://test.d3kf9o74pc4m0c.amplifyapp.com',
    appProjectAPIHost: 'https://test1.maxai.me',
  },
  production: {
    wwwProjectHost: 'https://www.maxai.me',
    appProjectHost: 'https://app.maxai.me',
    appProjectAPIHost: 'https://api.maxai.me',
  },
}

const MixPanelProjectIdConfig = {
  development: 'dc4e4b13d1d423a76e0e10ea377e2949', // zhouru1bin's project id
  test: 'dc4e4b13d1d423a76e0e10ea377e2949', // zhouru1bin's project id
  test1: 'dc4e4b13d1d423a76e0e10ea377e2949', // zhouru1bin's project id
  production: '56ac2c299c42140f6d81dec2a4ea9a3c',
}

const MIXPANEL_PROJECT_ID = MixPanelProjectIdConfig[api_env]

console.log(`Running in ${node_env} mode, api_env: ${api_env}`)
console.log(`config:\n`, HostConfig[api_env])

const WWW_PROJECT_HOST = HostConfig[api_env].wwwProjectHost

const APP_USE_CHAT_GPT_HOST = HostConfig[api_env].appProjectHost

const APP_USE_CHAT_GPT_API_HOST = HostConfig[api_env].appProjectAPIHost

const APP_NAME = 'MaxAI.me'
const NODE_ENV = isProduction ? 'production' : 'development'
const API_ENV = api_env

const env = {
  NODE_ENV,
  API_ENV,
  WWW_PROJECT_HOST,
  APP_USE_CHAT_GPT_HOST,
  APP_USE_CHAT_GPT_API_HOST,
  APP_NAME,
  MIXPANEL_PROJECT_ID,
}
const getReplaceEnv = () => {
  const pkg = JSON.parse(
    readFileSync(join(__dirname, '../src/', `manifest.json`), 'utf8'),
  )
  const replaceEnv = {
    [`process.env.APP_VERSION`]: JSON.stringify(pkg.version),
  }
  Object.keys(env).forEach((key) => {
    replaceEnv[`process.env.${key}`] = JSON.stringify(env[key])
  })
  return replaceEnv
}
export { api_env, env, getReplaceEnv, isProduction }
