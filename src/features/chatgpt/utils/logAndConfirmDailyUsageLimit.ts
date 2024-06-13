import AES from 'crypto-js/aes'
import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'

import { getAccessToken } from '@/background/api/backgroundFetch'
import { backgroundRequestHeadersGenerator } from '@/background/api/backgroundRequestHeadersGenerator'
import { IAIProviderType } from '@/background/provider/chat'
import ConversationManager from '@/background/src/chatConversations'
import { getChromeExtensionDBStorage } from '@/background/utils/chromeExtensionStorage/chromeExtensionDBStorage'
import {
  APP_USE_CHAT_GPT_API_HOST,
  APP_VERSION,
  DEFAULT_AI_OUTPUT_LANGUAGE_ID,
} from '@/constants'
import { getCurrentUserLogInfo } from '@/features/auth/utils'
import {
  contextMenuIsFavoriteContextMenu,
  FAVORITE_CONTEXT_MENU_GROUP_ID,
} from '@/features/contextMenu/hooks/useFavoriteContextMenuList'
import { LANGUAGE_CODE_MAP } from '@/i18n/types'
import { getFingerPrint } from '@/utils/fingerPrint'
import { backgroundGetBrowserUAInfo } from '@/utils/sendMaxAINotification/background'
dayjs.extend(utc)

/**
 * 在 background 中 记录用户发送chat的次数情况
 * @param requestId
 * @param promptDetail
 */
export const logAndConfirmDailyUsageLimit = async (
  requestId: string,
  promptDetail: {
    id: string
    name: string
    type: string
    host: string
    conversationId: string
    featureName: string
    url: string
    aiProvider?: IAIProviderType
    aiModel?: string
  },
): Promise<void> => {
  // 不再需要去判断 has_reached_limit，因为前端不再依赖call_api来触发paywall付费卡点 - 2024-04-17 - @huangsong
  console.log('[CALL_API] promptDetail', promptDetail)
  const logApiAndConfirmIsLimited = async () => {
    try {
      // 根据 conversationId 获取正确的 provider 和 model
      let aiProvider = promptDetail.aiProvider
      let aiModel = promptDetail.aiModel

      const conversation = await ConversationManager.getConversationById(
        promptDetail.conversationId,
      )
      if (conversation) {
        if (conversation.meta.AIProvider) {
          aiProvider = conversation.meta.AIProvider
        }
        if (conversation.meta.AIModel) {
          aiModel = conversation.meta.AIModel
        }
      }

      const beautyQueryMap: {
        [key in IAIProviderType]: string
      } = {
        USE_CHAT_GPT_PLUS: 'chatgpt',
        OPENAI: 'chatgpt_web_app',
        OPENAI_API: 'openai_api',
        BARD: 'bard_web_app',
        BING: 'bing_web_app',
        POE: 'poe',
        CLAUDE: 'claude_web_app',
        MAXAI_CLAUDE: 'claude',
        MAXAI_GEMINI: 'gemini',
        MAXAI_DALLE: 'dalle',
        MAXAI_FREE: 'free',
      }
      const UAInfo = await backgroundGetBrowserUAInfo()
      const { currentPlan, currentRole } = await getCurrentUserLogInfo()

      const settings = await getChromeExtensionDBStorage()

      const interfaceLanguageCode =
        settings?.userSettings?.preferredLanguage ?? 'en'
      let aiResponseLanguageCode = settings?.userSettings?.language ?? 'English'

      if (aiResponseLanguageCode === DEFAULT_AI_OUTPUT_LANGUAGE_ID) {
        aiResponseLanguageCode = 'Auto'
      }

      const info_object = {
        ai_provider:
          beautyQueryMap[aiProvider as IAIProviderType] || 'UNKNOWN_PROVIDER',
        ai_model: aiModel || 'UNKNOWN_MODEL',
        domain: promptDetail.host,
        prompt_id: promptDetail.id,
        prompt_name: promptDetail.name,
        prompt_type: promptDetail.type,
        browser: UAInfo.browser,
        app_version: APP_VERSION,
        feature_name: promptDetail.featureName,
        current_plan: currentPlan,
        current_role: currentRole,
        interface_language: LANGUAGE_CODE_MAP[interfaceLanguageCode]?.en_label,
        ai_response_language: aiResponseLanguageCode,
        url: promptDetail.url,
      }
      if (contextMenuIsFavoriteContextMenu(info_object.prompt_id)) {
        info_object.prompt_id =
          FAVORITE_CONTEXT_MENU_GROUP_ID +
          info_object.prompt_id.slice(FAVORITE_CONTEXT_MENU_GROUP_ID.length + 8)
        info_object.prompt_name = `[Suggested] ${info_object.prompt_name}`
      }
      console.log('[CALL_API] logApiAndConfirmIsLimited', info_object)
      const accessToken = await getAccessToken()
      const fingerprint = await getFingerPrint()
      const text = AES.encrypt(JSON.stringify(info_object), 'MaxAI').toString()
      if (!accessToken) {
        return false
      }
      const result = await fetch(`${APP_USE_CHAT_GPT_API_HOST}/user/call_api`, {
        method: 'POST',
        body: JSON.stringify({
          info_object: text,
        }),
        headers: backgroundRequestHeadersGenerator.getTaskIdHeaders(requestId, {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
          fp: `${fingerprint}`,
        }),
      })
      const body = await result.json()
      // has_reached_limit:false
      // next_reset_timestamp:1688515200
      if (body.data && body.status === 'OK') {
        console.log('logApiAndConfirmIsLimited api result', body.data)
        // 更新本地的缓存
        // // 更新用户的SubscriptionInfo
        // if (body.data.has_reached_limit) {
        //   getChromeExtensionUserInfo(true).then().catch()
        // }
        // 如果没有达到限制，就返回false
        return body?.data?.has_reached_limit
      }
      return false
    } catch (e) {
      console.log('logApiAndConfirmIsLimited error', e)
      return false
    }
  }
  logApiAndConfirmIsLimited().then().catch()
  // eslint-disable-next-line no-async-promise-executor
  // return new Promise(async (resolve) => {
  //   try {
  //     let cache = await getDailyUsageLimitData()
  //     if (cache) {
  //       // 说明没有达到限制，可以继续调用
  //       if (!cache.has_reached_limit) {
  //         logApiAndConfirmIsLimited().then().catch()
  //         resolve(false)
  //       } else {
  //         // 说明达到限制了
  //         // TODO 校验身份 pro不拦截，但是发larkbot
  //         const userInfo = await getChromeExtensionUserInfo(false)
  //         if (
  //           userInfo?.role?.name === 'pro' ||
  //           userInfo?.role?.name === 'elite'
  //         ) {
  //           // pro用户没过期, 不拦截
  //           if (
  //             userInfo.role.exp_time &&
  //             dayjs(userInfo.role.exp_time).diff(dayjs().utc()) > 0
  //           ) {
  //             backgroundSendMaxAINotification(
  //               'PRICING',
  //               `[Pricing] Pro [cache] has reached the limit`,
  //               `Pro user ${
  //                 userInfo?.email
  //               } use has reached the limit.\n${JSON.stringify({
  //                 role: userInfo?.role,
  //                 usage: cache.usage,
  //               })}`,
  //               {
  //                 uuid: '7a04bc02-6155-4253-bcdb-ade3db6de492',
  //               },
  //             )
  //             resolve(false)
  //             return
  //           } else {
  //             // pro 用户过期了，就拦截
  //             await fetchUserSubscriptionInfo()
  //             // 更新本地的缓存
  //             cache = await getDailyUsageLimitData()
  //             resolve(cache.has_reached_limit)
  //           }
  //         }
  //         // 已经到达了限制，但是普通用户刷新时间到了，就更新
  //         if (new Date() > new Date(cache.next_reset_timestamp * 1000)) {
  //           await fetchUserSubscriptionInfo()
  //           cache = await getDailyUsageLimitData()
  //           resolve(cache.has_reached_limit)
  //           return
  //         }
  //         // 普通用户，到达了限制，但是还没有到刷新时间，就不更新
  //         resolve(true)
  //       }
  //     } else {
  //       // 理论上不可能走到这里
  //       const result = await logApiAndConfirmIsLimited()
  //       resolve(result)
  //     }
  //   } catch (e) {
  //     // 其实不应该返回可以调用，但是接口应该可以正确的处理
  //     resolve(false)
  //   }
  // })
}
