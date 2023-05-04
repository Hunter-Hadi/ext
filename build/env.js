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

const isProduction = String(process.env.NODE_ENV) === 'production'

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
const inboxSDK =
  args.app === 'ezmail'
    ? '../features/gmail/hooks/useInitInboxSdk.ts'
    : '../../src/empty.ts'
const NODE_ENV = isProduction ? 'production' : 'development'

const env = {
  NODE_ENV,
  APP_ENV,
  APP_USE_CHAT_GPT_HOST,
  APP_USE_CHAT_GPT_API_HOST,
  APP_NAME,
  GLOBAL_LESS,
  inboxSDK,
}
const getReplaceEnv = () => {
  const replaceEnv = {
    preventAssignment: true,
  }
  Object.keys(env).forEach((key) => {
    replaceEnv[`process.env.${key}`] = JSON.stringify(env[key])
  })
  return replaceEnv
}
export { getReplaceEnv, env }
