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

const getTextTokens = (text) => {
  try {
    const tokens = encode(text)
    return tokens || []
  } catch (error) {
    console.error('getTextTokens encode error', error)
    return []
  }
}

const translateValue = async (translateJson, from, to) => {
  const runTranslate = async (prompt, times) => {
    const agent = new HttpsProxyAgent('http://127.0.0.1:7890')
    const api = new ChatGPTAPI({
      apiKey: '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',
      completionParams: {
        model: 'gpt-3.5-turbo',
        temperature: 0.2,
        top_p: 0.1,
      },
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
    debug && console.log(prompt)
    let res = null
    try {
      res = await api.sendMessage(prompt)
    } catch (e) {
      debug && console.error('api.sendMessage error', e)
    }
    let data = null
    if (res && res.text && res.detail) {
      const jsonText = res.text
      try {
        data = JSON.parse(jsonText.replace(/^\n?```\n?|\n?```\n?$/g, ''))
      } catch (e) {
        console.error('解析失败: \t', jsonText, '\n', res)
      }
    }
    if (data) {
      return {
        data,
        usage:
          (res.detail && res.detail.usage && res.detail.usage.total_tokens) ||
          0,
        success: true,
      }
    } else {
      if (times < 5) {
        console.log('第' + times + '次请求失败，重试')
        return await runTranslate(prompt, times + 1)
      } else {
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
  console.log('i18n count', i18nDirs.length)
  if (updateKeys.length > 0) {
    console.log('i18n updateKey count', sourceJsonKeyPaths.length)
  } else {
    console.log('i18n total keys count', sourceJsonKeyPaths.length)
  }
  let totalUsage = 0
  let finallyLogs = []
  let errorLanguages = []
  for (let i = 0; i < i18nDirs.length; i++) {
    if (
      updateLanguageCodes.length &&
      !updateLanguageCodes.includes(i18nDirs[i].name)
    ) {
      continue
    }
    const dirName = 'zh_CN' || i18nDirs[i].name
    const { en_label: languageName } = LANGUAGE_CODE_MAP[dirName]
    if (!languageName) {
      console.log(`[${dirName}]语言包不存在`)
      errorLanguages.push(dirName)
      continue
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
    // 因为gpt3翻译有长度限制，所以需要分批处理
    const needTranslateJsonList = []
    let partOfNeedTranslateJson = {}
    const partMaxToken = 500
    for (let updateKey of loopKeys) {
      debug && console.log(`开始处理: [${updateKey}]`)
      if (updateKeys.length && !updateKeys.includes(updateKey)) {
        debug && console.log(`跳过: [${updateKey}]`)
        continue
      }
      const sourceValue = _.get(sourceJson, updateKey)
      const currentValue = _.get(currentLanguageJson, updateKey)
      if (currentValue) {
        if (forceUpdate) {
          modifyKeyCount++
          _.set(partOfNeedTranslateJson, updateKey, sourceValue)
          debug && console.log(`强制更新: [${updateKey}]`)
        }
      } else {
        addKeyCount++
        _.set(partOfNeedTranslateJson, updateKey, sourceValue)
        debug && console.log(`新增: [${updateKey}]`)
      }
      if (
        getTextTokens(JSON.stringify(partOfNeedTranslateJson)).length >
        partMaxToken
      ) {
        needTranslateJsonList.push(partOfNeedTranslateJson)
        partOfNeedTranslateJson = {}
      }
    }
    if (Object.keys(partOfNeedTranslateJson).length > 0) {
      needTranslateJsonList.push(partOfNeedTranslateJson)
    }
    console.log('needTranslateJsonList count', needTranslateJsonList.length)
    let mergedJson = _.cloneDeep(currentLanguageJson)
    let translateHasError = false
    let percentRate = 0
    let successCount = 0
    // 翻译
    const translatedJsonData = await Promise.all(
      needTranslateJsonList.map(async (needTranslateJson, index) => {
        debug && console.log(needTranslateJson)
        const { data, success, usage } = await translateValue(
          needTranslateJson,
          'English',
          languageName,
        )
        // 只要有一段翻译失败，就不更新
        if (!success) {
          translateHasError = true
        }
        totalUsage += usage
        successCount++
        percentRate = Math.floor(
          (successCount / needTranslateJsonList.length) * 100,
        )
        console.log(
          `[${percentRate}%]: partOfResult [${index}] translate success`,
        )
        return data
      }),
    )
    if (translateHasError) {
      errorLanguages.push(dirName)
      continue
    }
    // merge
    translatedJsonData.forEach((data) => {
      mergedJson = _.merge(mergedJson, data)
    })
    // // 翻译
    // for (let needTranslateJson of needTranslateJsonList) {
    //   console.log(needTranslateJson)
    //   debug && console.log(needTranslateJson)
    //   const { data, success, usage } = await translateValue(
    //     needTranslateJson,
    //     'English',
    //     languageName,
    //   )
    //   // 只要有一段翻译失败，就不更新
    //   if (!success) {
    //     errorLanguages.push(dirName)
    //     continue
    //   }
    //   totalUsage += usage
    //   // merge
    //   mergedJson = _.merge(mergedJson, data)
    // }
    fs.writeFileSync(
      join(jsonDir, `/${dirName}/index.json`),
      JSON.stringify(mergedJson, null, 2),
    )
    const log = `[${languageName}]语言包处理完成, 新增${addKeyCount}个字段, 修改${modifyKeyCount}个字段, 移除${removeUnusedKeyCount}个字段`
    console.log(log)
    finallyLogs.push(log)
    break
  }
  console.log('==================================')
  finallyLogs.forEach((log) => console.log(log))
  console.log(
    '耗费的token数: \t',
    `${Number(totalUsage / 1000).toFixed(1)}K`,
    Number((totalUsage / 1000) * 0.02).toFixed(2),
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

/**
 * 强制更新所有语言包, 会覆盖所有语言包的字段, 慎用
 * @returns {Promise<void>}
 */
async function forceUpdateAll(retryLanguageCodes = []) {
  const sourceJson = JSON.parse(fs.readFileSync(sourceJsonPath, 'utf-8'))
  const sourceJsonKeyPaths = generateKeyPathFromObject(sourceJson).filter(
    (key) => !BLACK_LIST_KEYS.includes(key),
  )
  await updateI18nJson(sourceJsonKeyPaths, true, retryLanguageCodes)
}

/**
 * 增量更新所有语言包, 只会增量更新所有语言包的字段
 * @returns {Promise<void>}
 */
async function updateAll(retryLanguageCodes = []) {
  const sourceJson = JSON.parse(fs.readFileSync(sourceJsonPath, 'utf-8'))
  const sourceJsonKeyPaths = generateKeyPathFromObject(sourceJson).filter(
    (key) => !BLACK_LIST_KEYS.includes(key),
  )
  await updateI18nJson(sourceJsonKeyPaths, false, retryLanguageCodes)
}

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
  const keys = [
    'sidebar__button__my_plan',
    'permission__pricing_hook__preferred_language__title',
    'permission__pricing_hook__preferred_language__description',
  ]
  const retryLanguageCodes = []
  await updateKeys(keys, true, retryLanguageCodes)
}

main().then().catch()
