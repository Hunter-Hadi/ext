import { dirname, join } from 'path'
import { fileURLToPath } from 'url'
import fs from 'fs'
import * as _ from 'lodash-es'
import { ChatGPTAPI } from 'chatgpt'
import { HttpsProxyAgent } from 'https-proxy-agent'
import nodeFetch from 'node-fetch'
import pkg from 'gpt-3-encoder'
const { encode } = pkg
const debug = false

const maxModelTokens = 16000 // 16k
const maxResponseTokens = 12000 // 10k

const getTextTokens = (text) => {
  try {
    const tokens = encode(text)
    return tokens || []
  } catch (error) {
    console.error('getTextTokens encode error', error)
    return []
  }
}

const translateValue = async (translateJson, from, to, logPrefix) => {
  const runTranslate = async (prompt, times) => {
    const agent = new HttpsProxyAgent('http://127.0.0.1:7890')
    const api = new ChatGPTAPI({
      apiKey: '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',
      completionParams: {
        model: 'gpt-3.5-turbo-16k',
        temperature: 0.2,
        top_p: 0.1,
      },
      timeoutMs: 2 * 60 * 1000,
      systemMessage: 'You are a helpful assistant.',
      maxResponseTokens,
      maxModelTokens,
      fetch: (url, options = {}) => {
        const defaultOptions = {
          agent,
        }
        const mergedOptions = {
          ...defaultOptions,
          ...options,
        }
        return nodeFetch(url, mergedOptions)
      },
    })
    debug && console.log(logPrefix + prompt)
    let res = null
    try {
      res = await api.sendMessage(prompt)
    } catch (e) {
      debug && console.error(logPrefix + 'api.sendMessage error', e)
    }
    let data = null
    if (res && res.text && res.detail) {
      const jsonText = res.text
      try {
        try {
          console.log('1111')
          data = JSON.parse(jsonText.replace(/^\n?```\n?|\n?```\n?$/g, ''))
        } catch (e) {
          try {
            // 第二次尝试, 去掉最后一个逗号
            console.log('2222')
            const jsonText2 = jsonText.replace(/,(?=[^,]*$)/, '')
            data = JSON.parse(jsonText2.replace(/^\n?```\n?|\n?```\n?$/g, ''))
          } catch (e) {
            console.log('33333')
            // 第三次尝试,替换文本中错误的冒号
            const errorColon = JSON.stringify(jsonText).match(/"(?<colon>.)\s?{/)?.groups?.colon
            if (errorColon) {
              const jsonText3 = jsonText.replaceAll(errorColon, ':')
              data = JSON.parse(jsonText3.replace(/^\n?```\n?|\n?```\n?$/g, ''))
            } else {

              throw e('没的救了')
            }
          }
        }
      } catch (e) {
        // 写入本地日志
        const errorLogFilePath = join(__dirname, 'error.update_i18n.log')
        // 如果文件不存在，创建文件
        if (!fs.existsSync(errorLogFilePath)) {
          fs.writeFileSync(errorLogFilePath, '')
        }
        fs.appendFileSync(
          errorLogFilePath,
          `${logPrefix} ${new Date().toISOString()} start ======\n 
${logPrefix} 解析失败 prompt: \n ${prompt} \n
${logPrefix} 解析失败 json: \n ${jsonText} \n 
解析失败: \n ${JSON.stringify(res)} \n
${logPrefix} ${new Date().toISOString()} end ======\n`,
        )
        debug && console.error(logPrefix + '解析失败 prompt: \t', prompt)
        debug && console.error(logPrefix + '解析失败: \t', jsonText, '\n', res)
      }
    }
    if (data) {
      // prompt_tokens: promptTokens,
      //   completion_tokens: completionTokens,
      //   total_tokens: promptTokens + completionTokens,
      return {
        data,
        usage:
          (res.detail && res.detail.usage && res.detail.usage.prompt_tokens) ||
          0,
        success: true,
      }
    } else {
      if (times < 3) {
        console.log(logPrefix + '第' + times + '次请求失败，重试')
        // 随机等待10s-20s
        const waitTime = Math.floor(Math.random() * 10) + 10
        await new Promise((resolve) => setTimeout(resolve, waitTime * 1000))
        return await runTranslate(prompt, times + 1)
      } else {
        console.log(logPrefix + '第' + times + '次请求失败，结束请求')
        return {
          data: null,
          usage: 0,
          success: false,
        }
      }
    }
  }
  const jsonTranslatePrompt = `
Your task is to translate each string value in the given JSON object, which is delimited by triple backticks, from [${from}] to [${to}].
Requirements when translating:
Keep the JSON structure and keys unchanged
Translate each string value as UX copy, and make each of the translation results suitable to be used as UX copy and looks concise, easy to understand, and professional
Keep all of these characters unchanged in each of the string values (I'll give you these characters in the following list, each delimited by a single backtick): 
\`\\n\`
\`\\t\`
\`\\s\`
\`" "\`
\`' '\`
Strictly provide a concise answer without additional context, explanation, or extra wording.
Do not explain what you will output in your response. 
Do not include any extra words that's not part of the JSON result in your answer, just directly output the JSON only in your answer, and nothing else.
Do not add any markdown to indicate that the JSON is a "json code". Just output the JSON itself.
JSON object:
\`\`\`
${JSON.stringify(translateJson, null, 2)}
\`\`\`
`
  // max 5 times
  return await runTranslate(jsonTranslatePrompt, 0)
}

const __dirname = dirname(fileURLToPath(import.meta.url))
const jsonDir = join(__dirname, 'src/i18n/locales')
const sourceJsonPath = join(jsonDir, '/en/index.json')
const BLACK_LIST_KEYS = ['description', 'name', 'shortName']
// 从src/i18n/types/index.ts复制的
export const LANGUAGE_CODE_MAP = {
  am: { label: 'አማርኛ', en_label: 'Amharic' },
  ar: { label: 'العربية', en_label: 'Arabic' },
  bg: { label: 'Български', en_label: 'Bulgarian' },
  bn: { label: 'বাংলা', en_label: 'Bengali' },
  ca: { label: 'Català', en_label: 'Catalan' },
  cs: { label: 'Čeština', en_label: 'Czech' },
  da: { label: 'Dansk', en_label: 'Danish' },
  de: { label: 'Deutsch', en_label: 'German' },
  el: { label: 'Ελληνικά', en_label: 'Greek' },
  en: { label: 'English', en_label: 'English' },
  en_GB: { label: 'English (UK)', en_label: 'English (UK)' },
  en_US: { label: 'English (US)', en_label: 'English (US)' },
  es: { label: 'Español', en_label: 'Spanish' },
  es_419: {
    label: 'Español (Latinoamérica)',
    en_label: 'Spanish (Latin America)',
  },
  et: { label: 'Eesti', en_label: 'Estonian' },
  fa: { label: 'فارسی', en_label: 'Persian' },
  fi: { label: 'Suomi', en_label: 'Finnish' },
  fil: { label: 'Filipino', en_label: 'Filipino' },
  fr: { label: 'Français', en_label: 'French' },
  gu: { label: 'ગુજરાતી', en_label: 'Gujarati' },
  he: { label: 'עברית', en_label: 'Hebrew' },
  he_IL: { label: 'עברית (ישראל)', en_label: 'Hebrew (Israel)' },
  hi: { label: 'हिन्दी', en_label: 'Hindi' },
  hr: { label: 'Hrvatski', en_label: 'Croatian' },
  hu: { label: 'Magyar', en_label: 'Hungarian' },
  in: { label: 'Bahasa Indonesia', en_label: 'Indonesian' },
  id: { label: 'Indonesia', en_label: 'Indonesian' },
  it: { label: 'Italiano', en_label: 'Italian' },
  ja: { label: '日本語', en_label: 'Japanese' },
  kn: { label: 'ಕನ್ನಡ', en_label: 'Kannada' },
  ko: { label: '한국어', en_label: 'Korean' },
  lt: { label: 'Lietuvių', en_label: 'Lithuanian' },
  lv: { label: 'Latviešu', en_label: 'Latvian' },
  ml: { label: 'മലയാളം', en_label: 'Malayalam' },
  mr: { label: 'मराठी', en_label: 'Marathi' },
  ms: { label: 'Melayu', en_label: 'Malay' },
  nl: { label: 'Nederlands', en_label: 'Dutch' },
  no: { label: 'Norsk', en_label: 'Norwegian' },
  pl: { label: 'Polski', en_label: 'Polish' },
  pt_BR: { label: 'Português (Brasil)', en_label: 'Portuguese (Brazil)' },
  pt_PT: { label: 'Português (Portugal)', en_label: 'Portuguese (Portugal)' },
  ro: { label: 'Română', en_label: 'Romanian' },
  ru: { label: 'Русский', en_label: 'Russian' },
  sk: { label: 'Slovenčina', en_label: 'Slovak' },
  sl: { label: 'Slovenščina', en_label: 'Slovenian' },
  sr: { label: 'Српски', en_label: 'Serbian' },
  sv: { label: 'Svenska', en_label: 'Swedish' },
  sw: { label: 'Kiswahili', en_label: 'Swahili' },
  ta: { label: 'தமிழ்', en_label: 'Tamil' },
  te: { label: 'తెలుగు', en_label: 'Telugu' },
  th: { label: 'ไทย', en_label: 'Thai' },
  tr: { label: 'Türkçe', en_label: 'Turkish' },
  ua: { label: 'Українська', en_label: 'Ukrainian' },
  uk: { label: 'اردو', en_label: 'Urdu' },
  vi: { label: 'Tiếng Việt', en_label: 'Vietnamese' },
  zh_CN: { label: '简体中文', en_label: 'SimplifiedChinese' },
  zh_TW: { label: '繁体中文', en_label: 'TraditionalChinese' },
}

const generateKeyPathFromObject = (object) => {
  return _.flatMapDepth(
    object,
    (val, key) => {
      if (_.isObject(val)) {
        const childPaths = generateKeyPathFromObject(val)
        return childPaths.map((childPath) => `${key}.${childPath}`)
      }
      return key
    },
    1,
  )
}

// 1. 按需强制更新字段
// 2. 增量更新字段
// 3. 覆盖更新字段
/**
 * 更新i18n json文件
 * @param originUpdateKeys 需要更新的key - 默认更新所有key
 * @param forceUpdate 是否强制更新 - 默认不强制更新
 * @param updateLanguageCodes 需要更新的语言 - 默认不需要，一般用来更新某个语言失败的情况
 * @returns {Promise<void>}
 */
const updateI18nJson = async (
  originUpdateKeys,
  forceUpdate,
  updateLanguageCodes,
) => {
  const i18nDirs = fs.readdirSync(jsonDir, { withFileTypes: true })
  const sourceJson = JSON.parse(fs.readFileSync(sourceJsonPath, 'utf-8'))
  const sourceJsonKeyPaths = generateKeyPathFromObject(sourceJson).filter(
    (key) => !BLACK_LIST_KEYS.includes(key),
  )
  // 添加common, settings, client前缀
  const updateKeys = originUpdateKeys.map((key) => {
    if (_.get(sourceJson, `common.${key}`)) {
      return `common.${key}`
    }
    if (_.get(sourceJson, `settings.${key}`)) {
      return `settings.${key}`
    }
    if (_.get(sourceJson, `client.${key}`)) {
      return `client.${key}`
    }
    return key
  })
  let needUpdateLanguages = i18nDirs
  if (updateLanguageCodes.length) {
    needUpdateLanguages = i18nDirs.filter((dir) =>
      updateLanguageCodes.includes(dir.name),
    )
  }
  console.log('i18n 需要更新的语言包总数: ', needUpdateLanguages.length)
  if (updateKeys.length > 0) {
    console.log('i18n 本次需要更新的key总数:', updateKeys.length)
  } else {
    console.log('i18n key总数:', sourceJsonKeyPaths.length)
  }
  let totalUsage = 0
  let finallyLogs = []
  let errorLanguages = []
  await Promise.all(
    needUpdateLanguages.map(async ({ name }) => {
      const dirName = name
      const { en_label: languageName } = LANGUAGE_CODE_MAP[dirName]
      if (!languageName) {
        console.log(`[${dirName}]语言包不存在`)
        errorLanguages.push(dirName)
        return
      }
      let removeUnusedKeyCount = 0
      let modifyKeyCount = 0
      let addKeyCount = 0
      console.log(
        `开始处理[${languageName}]语言包, ${
          forceUpdate ? '[强制更新]' : '[增量更新]'
        }`,
      )
      // 查找diff keys
      const currentLanguageJson = JSON.parse(
        fs.readFileSync(join(jsonDir, `/${dirName}/index.json`), 'utf-8'),
      )
      const currentLanguageKeyPaths = generateKeyPathFromObject(
        currentLanguageJson,
      ).filter((key) => !BLACK_LIST_KEYS.includes(key))
      // remove unused keys
      currentLanguageKeyPaths.forEach((keyPath) => {
        if (!sourceJsonKeyPaths.includes(keyPath)) {
          removeUnusedKeyCount++
          _.unset(currentLanguageJson, keyPath)
        }
      })
      const loopKeys = updateKeys.length ? updateKeys : sourceJsonKeyPaths
      const needTranslateJsonList = []
      let partOfNeedTranslateJson = {}
      // 因为gpt3翻译有长度限制，所以需要分批处理
      // 所以需要控制prompt的长度为ai回复的1/5比较稳定 => maxResponseTokens/5
      // system prompt差不多300
      const partMaxToken = maxResponseTokens / 5 - 300
      for (let updateKey of loopKeys) {
        debug && console.log(`开始处理: [${updateKey}]`)
        if (updateKeys.length && !updateKeys.includes(updateKey)) {
          debug && console.log(`跳过: [${updateKey}]`)
          continue
        }
        const sourceValue = _.get(sourceJson, updateKey)
        const currentValue = _.get(currentLanguageJson, updateKey)
        let needTranslate = false
        if (currentValue) {
          if (forceUpdate) {
            modifyKeyCount++
            needTranslate = true
            debug && console.log(`强制更新: [${updateKey}]`)
          }
        } else {
          addKeyCount++
          needTranslate = true
          debug && console.log(`新增: [${updateKey}]`)
        }
        if (needTranslate) {
          // 到目前为止，需要翻译的内容的token数量
          const partOfNeedTranslateJsonTokens = getTextTokens(
            JSON.stringify(partOfNeedTranslateJson, null, 2),
          ).length
          // 新增需要翻译的内容的token数量
          const currentValueTokens = getTextTokens(
            JSON.stringify(
              {
                [updateKey]: sourceValue,
              },
              null,
              2,
            ),
          ).length
          // 如果当前需要翻译的内容的token数量 + 新增需要翻译的内容的token数量 > partMaxToken， 则需要分批处理
          if (
            partOfNeedTranslateJsonTokens + currentValueTokens >
            partMaxToken
          ) {
            needTranslateJsonList.push(partOfNeedTranslateJson)
            partOfNeedTranslateJson = {}
          }
          _.set(partOfNeedTranslateJson, updateKey, sourceValue)
        }
      }
      if (Object.keys(partOfNeedTranslateJson).length > 0) {
        needTranslateJsonList.push(partOfNeedTranslateJson)
      }
      console.log('需要翻译的i18n片段数量: ', needTranslateJsonList.length)
      let mergedJson = _.cloneDeep(currentLanguageJson)
      let translateHasError = false
      let percentRate = 0
      let successCount = 0
      // 翻译, 每次并发10个
      const maxConcurrency = 10
      const translatedJsonData = []
      for (let i = 0; i < needTranslateJsonList.length; i += maxConcurrency) {
        const partNeedTranslateJsonList = needTranslateJsonList.slice(
          i,
          i + maxConcurrency,
        )
        translatedJsonData.push(
          ...(await Promise.all(
            partNeedTranslateJsonList.map(async (needTranslateJson, index) => {
              debug && console.log(needTranslateJson)
              const { data, success, usage } = await translateValue(
                needTranslateJson,
                'English',
                languageName,
                `i18n-${languageName}-part-${index} => `,
              )
              // 只要有一段翻译失败，就不更新
              if (!success) {
                translateHasError = true
                return null
              }
              totalUsage += usage
              successCount++
              percentRate = Math.floor(
                (successCount / needTranslateJsonList.length) * 100,
              )
              console.log(
                `i18n-${languageName}-part-${index} => [${percentRate}%]: 片段 [${
                  index + i
                }] 翻译成功`,
              )
              return data
            }),
          )),
        )
        if (translateHasError) {
          errorLanguages.push(dirName)
          return
        }
      }
      // merge
      translatedJsonData.forEach((data) => {
        mergedJson = _.merge(mergedJson, data)
      })
      fs.writeFileSync(
        join(jsonDir, `/${dirName}/index.json`),
        JSON.stringify(mergedJson, null, 2),
      )
      const log = `[${languageName}]语言包处理完成, 新增${addKeyCount}个字段, 修改${modifyKeyCount}个字段, 移除${removeUnusedKeyCount}个字段`
      console.log(log)
      finallyLogs.push(log)
    }),
  )
  console.log('==================================')
  finallyLogs.forEach((log) => console.log(log))
  console.log(
    '耗费的token数: \t',
    `${Number(totalUsage / 1000).toFixed(1)}K`,
    Number((totalUsage / 1000) * 0.004).toFixed(2),
    '美元',
  )
  console.log(`翻译失败的语言包: \t[${errorLanguages.join('')}]`)
  errorLanguages.length > 0 &&
    console.log('请手动处理翻译失败的语言包, 并重新执行脚本')
  errorLanguages.length > 0 &&
    console.log('下次执行参数建议: \t', updateKeys, forceUpdate, errorLanguages)
  console.log('==================================')
}

import esbuild from 'esbuild'
import postcssPlugin from 'esbuild-style-plugin'
import autoprefixer from 'autoprefixer'
import * as buildEnv from './build/env.mjs'

/**
 * 更新system prompt的i18n key
 * @param forceUpdate
 * @returns {Promise<void>}
 */
async function updateDefaultJson(forceUpdate = false) {
  return new Promise(async (resolve) => {
    const sourceJson = JSON.parse(fs.readFileSync(sourceJsonPath, 'utf-8'))
    const replaceEnv = buildEnv.getReplaceEnv()
    const systemPromptsDir = join(__dirname, './temp_system_prompts')
    const systemPromptsFile = join(
      systemPromptsDir,
      './allSystemPromptJson.mjs',
    )
    async function esbuildConfig() {
      await esbuild.build({
        entryPoints: [join(__dirname, './allSystemPromptJson.ts')],
        format: 'esm',
        drop: ['console', 'debugger'],
        bundle: true,
        minify: true,
        treeShaking: true,
        splitting: false,
        platform: 'node',
        outfile: systemPromptsFile,
        chunkNames: 'chunks/[hash]',
        define: replaceEnv,
        loader: {
          '.woff': 'dataurl',
          '.woff2': 'dataurl',
          '.eot': 'dataurl',
          '.ttf': 'dataurl',
          '.graphql': 'text',
        },
        plugins: [
          // eslint({ /* config */ }),
          postcssPlugin({
            postcss: {
              plugins: [autoprefixer],
            },
          }),
        ],
      })
    }
    await esbuildConfig()
    import(systemPromptsFile)
      .then(({ default: systemPromptList }) => {
        console.log(
          '系统prompt总数: ',
          systemPromptList.length,
          ', ',
          forceUpdate ? '[强制更新]' : '[增量更新]',
        )
        systemPromptList.forEach((systemPrompt) => {
          //   { '80e6d17b-2cf5-456b-944b-5f645f0e12de': 'Generate from selection' }
          const key = `prompt.${Object.keys(systemPrompt)[0]}`
          const value = Object.values(systemPrompt)[0]
          _.set(sourceJson, key, value)
        })
        // write default.json
        fs.writeFileSync(sourceJsonPath, JSON.stringify(sourceJson, null, 2))
        // remove temp dir
        fs.rmSync(systemPromptsDir, { recursive: true })
        resolve()
      })
      .catch((err) => {
        console.log(err)
        resolve()
      })
  })
}
//
// /**
//  * 强制更新所有语言包, 会覆盖所有语言包的字段, 慎用
//  * @returns {Promise<void>}
//  */
// async function forceUpdateAll(retryLanguageCodes = []) {
//   const sourceJson = JSON.parse(fs.readFileSync(sourceJsonPath, 'utf-8'))
//   const sourceJsonKeyPaths = generateKeyPathFromObject(sourceJson).filter(
//     (key) => !BLACK_LIST_KEYS.includes(key),
//   )
//   await updateI18nJson(sourceJsonKeyPaths, true, retryLanguageCodes)
// }
//
// /**
//  * 增量更新所有语言包, 只会增量更新所有语言包的字段
//  * @returns {Promise<void>}
//  */
// async function updateAll(retryLanguageCodes = []) {
//   const sourceJson = JSON.parse(fs.readFileSync(sourceJsonPath, 'utf-8'))
//   const sourceJsonKeyPaths = generateKeyPathFromObject(sourceJson).filter(
//     (key) => !BLACK_LIST_KEYS.includes(key),
//   )
//   await updateI18nJson(sourceJsonKeyPaths, false, retryLanguageCodes)
// }

/**
 * 增量更新指定字段
 * @param keys 需要更新的字段
 * @param forceUpdate 是否强制更新
 * @param retryLanguageCodes 重试的语言包
 * @returns {Promise<void>}
 */
async function updateKeys(keys, forceUpdate, retryLanguageCodes = []) {
  await updateI18nJson(keys, forceUpdate, retryLanguageCodes)
}

async function main() {
  await updateDefaultJson(true)
  const keys = []
  const retryLanguageCodes = [
    // 'ms',
  ]
  await updateKeys(keys, false, retryLanguageCodes)
}

main().then().catch()
