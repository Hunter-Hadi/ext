// This file must be in the root of the src directory
// Popup action takes precedence over this listener..
// To make this function work, set "action" property to {} in manifest
import Browser from 'webextension-polyfill'
export type {
  IChromeExtensionClientListenEvent,
  IChromeExtensionClientSendEvent,
  IChromeExtensionListenEvent,
  IOpenAIChatListenTaskEvent,
  IOpenAIChatSendEvent,
} from './eventType'
import cloneDeep from 'lodash-es/cloneDeep'
import { v4 as uuidV4 } from 'uuid'

import ChatSystemFactory from '@/background/src/chat/ChatSystemFactory'
import { updateRemoteAIProviderConfigAsync } from '@/background/src/chat/OpenAIChat/utils'
import ConversationManager, {
  getAllOldVersionConversationIds,
} from '@/background/src/chatConversations'
import { ClientMessageInit } from '@/background/src/client'
import { pdfSnifferStartListener } from '@/background/src/pdf'
import {
  backgroundRestartChromeExtension,
  backgroundSendClientMessage,
  chromeExtensionOpenImmersiveChat,
  getChromeExtensionOnBoardingData,
  resetChromeExtensionOnBoardingData,
  safeGetBrowserTab,
  setChromeExtensionOnBoardingData,
} from '@/background/utils'
import { setChromeExtensionDBStorageSnapshot } from '@/background/utils/chromeExtensionStorage/chromeExtensionDBStorageSnapshot'
import { getMaxAIChromeExtensionInstalledDeviceId } from '@/background/utils/getMaxAIChromeExtensionInstalledDeviceId'
import {
  checkSettingsSync,
  isSettingsLastModifiedEqual,
} from '@/background/utils/syncSettings'
import {
  APP_USE_CHAT_GPT_HOST,
  APP_VERSION,
  CHATGPT_WEBAPP_HOST,
  DEFAULT_AI_OUTPUT_LANGUAGE_VALUE,
  isProduction,
  MAXAI_CHROME_EXTENSION_POST_MESSAGE_ID,
} from '@/constants'
import { ON_BOARDING_1ST_ANNIVERSARY_2024_SIDEBAR_DIALOG_CACHE_KEY } from '@/features/activity/constants'
import {
  checkIsPayingUser,
  checkIsSubscriptionPaymentFailed,
  getChromeExtensionUserInfo,
  getMaxAIChromeExtensionUserId,
} from '@/features/auth/utils'
import { MAXAI_CHROME_EXTENSION_APP_HOMEPAGE_URL } from '@/features/common/constants'
import { devResetAllOnboardingTooltipOpenedCache } from '@/features/onboarding/utils'
import paymentManager from '@/features/payment/background/PaymentManager'
import { SearchWithAIMessageInit } from '@/features/searchWithAI/background'
import { ShortcutMessageBackgroundInit } from '@/features/shortcuts/messageChannel/background'
import WebsiteContextManager from '@/features/websiteContext/background'
import { updateContextMenuSearchTextStore } from '@/pages/settings/utils'
import { backgroundSendMaxAINotification } from '@/utils/sendMaxAINotification/background'

/**
 * background.js 入口
 *
 */
export const startChromeExtensionBackground = () => {
  try {
    // 获取必要的权限
    Browser.management?.getAll?.()
    Browser.storage.onChanged.addListener(() => {
      console.log('storage changed')
    })
    Browser.scripting.getRegisteredContentScripts()
    // lifecycle
    initChromeExtensionInstalled()
    initChromeExtensionMessage()
    initChromeExtensionCommands()
    initChromeExtensionAction()
    initChromeExtensionContextMenu()
    initChromeExtensionDisabled()
    initChromeExtensionUninstalled()
    initChromeExtensionTabUrlChangeListener()
    initChromeExtensionCreatePaymentListener()
    initExternalMessageListener()
    // feature
    // hot reload
    developmentHotReload()
  } catch (e) {
    // NOTE: 这个debugger是为了方便调试告诉开发者，如果有问题，可以在这里打断点
    // eslint-disable-next-line no-debugger
    debugger
  }
}

/**
 * 插件安装初始化
 */
const initChromeExtensionInstalled = () => {
  // 插件安装初始化
  Browser.runtime.onInstalled.addListener(async (object) => {
    await getMaxAIChromeExtensionInstalledDeviceId() // 生成插件ID
    if (object.reason === (Browser as any).runtime.OnInstalledReason.INSTALL) {
      // 重置插件引导数据
      await resetChromeExtensionOnBoardingData()
      await Browser.tabs.create({
        url: MAXAI_CHROME_EXTENSION_APP_HOMEPAGE_URL + '/extension/installed',
      })
    } else {
      await initChromeExtensionUpdated()
      devMockConversation()
    }
    try {
      await Browser.contextMenus.remove('use-chatgpt-ai-context-menu-button')
    } catch (e) {
      // ignore
    }
    await Browser.contextMenus.create({
      id: 'use-chatgpt-ai-context-menu-button',
      title: 'MaxAI.me',
      contexts: ['all'],
    })
  })
}

/**
 * 更新时触发的行为
 */
const initChromeExtensionUpdated = async () => {
  // 更新图标
  Browser.action.setBadgeBackgroundColor({
    color: '#FF0000',
  })
  Browser.action.setBadgeText({
    text: 'NEW',
  })
  Browser.action.setBadgeTextColor({
    color: '#FFFFFF',
  })

  // 2024-07-24 ph
  // WARNING: 去除本地的Leet Speak语言设置，
  // 会触发后续的云同步修改
  const localSettings = await getChromeExtensionDBStorage()
  if (localSettings.userSettings?.language === 'Leet Speak') {
    await setChromeExtensionDBStorage({
      ...localSettings,
      userSettings: {
        ...localSettings.userSettings,
        language: DEFAULT_AI_OUTPUT_LANGUAGE_VALUE,
      },
    })
  }

  // 保存本地快照
  await setChromeExtensionDBStorageSnapshot()
  // 更新插件
  if (!(await isSettingsLastModifiedEqual())) {
    await checkSettingsSync()
  }
  // 更新i18n
  await updateContextMenuSearchTextStore('textSelectPopupButton')

  // @since - 2023-11-20
  // @description 黑五
  const executeBlackFridayPromotion = async () => {
    const onBoardingData = await getChromeExtensionOnBoardingData()
    // 如果已经弹窗过了，就不再弹窗
    if (onBoardingData.ON_BOARDING_BLACK_FRIDAY_2023_OPEN_LINK) {
      return
    }
    const result = await getChromeExtensionUserInfo(true)
    await setChromeExtensionOnBoardingData(
      'ON_BOARDING_BLACK_FRIDAY_2023_OPEN_LINK',
      true,
    )
    if (result?.roles && result?.subscription_plan_name) {
      const role = (
        result.roles.find((role) => checkIsPayingUser(role.name)) || {
          name: 'free',
        }
      ).name
      const planName = result.subscription_plan_name
      if (role === 'elite' && planName === 'ELITE_YEARLY') {
        // 不弹窗
      } else {
        // 弹窗
        // 跳转去https://app.maxai.me/blackfriday2023
        await Browser.tabs.create({
          url: `https://app.maxai.me/blackfriday2023`,
        })
      }
    } else {
      // 没登录也跳转
      await Browser.tabs.create({
        url: `https://app.maxai.me/blackfriday2023`,
      })
    }
  }
  /**
   * @since 2023-12-06
   * @description 2023圣诞节
   */
  const executeChristmasPromotion = async () => {
    const onBoardingData = await getChromeExtensionOnBoardingData()
    // 如果已经弹窗过了，就不再弹窗
    if (onBoardingData.ON_BOARDING_CHRISTMAS_2023_OPEN_LINK) {
      return
    }
    const result = await getChromeExtensionUserInfo(true)
    await setChromeExtensionOnBoardingData(
      'ON_BOARDING_CHRISTMAS_2023_OPEN_LINK',
      true,
    )
    if (result?.roles && result?.subscription_plan_name) {
      const role = (
        result.roles.find((role) => checkIsPayingUser(role.name)) || {
          name: 'free',
        }
      ).name
      if (role === 'free') {
        // 弹窗
        // 跳转去https://app.maxai.me/holiday2023
        await Browser.tabs.create({
          url: `https://app.maxai.me/holiday2023`,
        })
      }
    } else {
      // 没登录也跳转
      await Browser.tabs.create({
        url: `https://app.maxai.me/holiday2023`,
      })
    }
  }
  /**
   * @since 2023-12-25
   * @description 分析一下indexDB的内存占用
   */
  const analyzeIndexDBMemory = async () => {
    const result = await getChromeExtensionUserInfo(false)
    if (result?.roles && result?.subscription_plan_name) {
      const role = (
        result.roles.find((role) => checkIsPayingUser(role.name)) || {
          name: 'free',
        }
      ).name
      /**
       * 只收集付费用户的数据
       */
      if (checkIsPayingUser(role)) {
        WebsiteContextManager.computeWebsiteContextStorageSize()
          .then((size) => {
            if (size > 0) {
              setTimeout(() => {
                // 发送到larkbot
                backgroundSendMaxAINotification(
                  'MEMORY',
                  '[Memory] storage size',
                  JSON.stringify(
                    {
                      size,
                      version: APP_VERSION,
                    },
                    null,
                    4,
                  ),
                  {
                    uuid: '247cb207-4b00-4cd3-be74-bdb9ade6f8f4',
                  },
                )
                  .then()
                  .catch()
              }, (1 + Math.floor(Math.random() * 9)) * 1000) // 延迟1-10s发送,降低发送频率
            }
          })
          .catch()
      }
    }
  }
  /**
   * @since 2024-01-15
   * @description 2024插件1周年
   */
  const executeMaxAIOneYearPromotion = async (onlyFreeUser = false) => {
    const onBoardingData = await getChromeExtensionOnBoardingData()
    // 如果已经弹窗过了，就不再弹窗
    if (onBoardingData.ON_BOARDING_1ST_ANNIVERSARY_2024_OPEN_LINK) {
      return
    }
    const result = await getChromeExtensionUserInfo(true)
    await setChromeExtensionOnBoardingData(
      'ON_BOARDING_1ST_ANNIVERSARY_2024_OPEN_LINK',
      true,
    )
    if (result?.role) {
      if (onlyFreeUser && result.role.name === 'free') {
        await Browser.tabs.create({
          url: `https://app.maxai.me/anniversary2024`,
        })
        return
      }

      if (
        result.role.is_one_times_pay_user ||
        (result.role.name === 'elite' &&
          result.role.subscription_plan_name === 'ELITE_YEARLY')
      ) {
        // nothing
      } else {
        // 弹窗
        // 跳转去`https://app.maxai.me/anniversary2024`
        await Browser.tabs.create({
          url: `https://app.maxai.me/anniversary2024`,
        })
      }
    } else {
      // 没登录也跳转
      await Browser.tabs.create({
        url: `https://app.maxai.me/anniversary2024`,
      })
    }
  }
  /**
   * @since 2024-04-23
   * @description 4.1.0版本插件升级的时候针对free users弹出updated页面
   */
  const executeMaxAIUpdatedPromotion = async () => {
    const onBoardingData = await getChromeExtensionOnBoardingData()
    // 如果已经弹窗过了，就不再弹窗
    if (onBoardingData.ON_BOARDING_EXTENSION_VERSION_4_1_0_UPDATE_OPEN_LINK) {
      return
    }
    const result = await getChromeExtensionUserInfo(true)
    await setChromeExtensionOnBoardingData(
      'ON_BOARDING_EXTENSION_VERSION_4_1_0_UPDATE_OPEN_LINK',
      true,
    )
    const url = 'https://app.maxai.me/updated'
    if (result?.role) {
      // 只针对免费用户
      if (result.role.name === 'free') {
        await Browser.tabs.create({ url })
      }
    } else {
      // 没登录也跳转
      await Browser.tabs.create({ url })
    }
  }
  /**
   * @since 2024-05-31
   * @description 4.2.13版本插件升级的时候对满足显示续费失败提醒条件的用户弹出/my-plan 页面
   */
  const executeUpdatedCheckSubscription = async () => {
    const result = await getChromeExtensionUserInfo(true)
    const url = `${APP_USE_CHAT_GPT_HOST}/my-plan`
    if (
      result &&
      checkIsSubscriptionPaymentFailed(result.subscription_payment_failed_at)
    ) {
      await Browser.tabs.create({ url })
    }
  }

  if (APP_VERSION === '2.4.3') {
    setTimeout(
      executeBlackFridayPromotion,
      (1 + Math.floor(Math.random() * 9)) * 1000,
    )
  }
  if (APP_VERSION === '2.4.7') {
    setTimeout(
      executeChristmasPromotion,
      (1 + Math.floor(Math.random() * 9)) * 1000,
    )
  }
  // NOTE: 更新的时候统计一下当前占用的内存
  if (APP_VERSION === '2.4.8') {
    analyzeIndexDBMemory()
  }

  // 3.0.6这一版，大促页面针对所有free users都弹出（包括Chrome和Edge） - @huangsong
  if (APP_VERSION === '3.0.6') {
    setTimeout(
      () => executeMaxAIOneYearPromotion(true),
      (1 + Math.floor(Math.random() * 9)) * 1000,
    )
  }
  // 因为没有折扣了，不弹了 - 2024-04-23
  // 4.1.0这一版，对于free users弹出促销页面
  if (APP_VERSION === '4.0.0') {
    setTimeout(
      () => executeMaxAIUpdatedPromotion(),
      (1 + Math.floor(Math.random() * 9)) * 1000,
    )
  }

  // 每次更新都重置一下 sidebar anniversary dialog
  await setChromeExtensionOnBoardingData(
    ON_BOARDING_1ST_ANNIVERSARY_2024_SIDEBAR_DIALOG_CACHE_KEY,
    false,
  )
  // NOTE: 远程更新AI配置
  setTimeout(() => {
    updateRemoteAIProviderConfigAsync().then().catch()
  }, (1 + Math.floor(Math.random() * 9)) * 1000)

  // 本地开发环境下，刷新插件更新 survey dialog 的弹窗标记
  if (!isProduction) {
    await setChromeExtensionOnBoardingData(
      'ON_BOARDING_EXTENSION_SURVEY_DIALOG_ALERT',
      false,
    )
  }

  // 测试环境 刷新插件时，重置所有的onboarding tooltip opened cache
  if (!isProduction) {
    await devResetAllOnboardingTooltipOpenedCache()
  }

  // 每次升级都检测一遍是否是续费失败了
  setTimeout(
    () => executeUpdatedCheckSubscription(),
    (1 + Math.floor(Math.random() * 9)) * 1000,
  )
}

/**
 * 插件消息通信初始化
 */
const initChromeExtensionMessage = () => {
  new ChatSystemFactory()
  ClientMessageInit()
  ShortcutMessageBackgroundInit()
  // Browser.runtime.onMessage.addListener(
  //   (message, sender, sendResponse: any) => {
  //     if (
  //       message?.id &&
  //       message.id !== MAXAI_CHROME_EXTENSION_POST_MESSAGE_ID
  //     ) {
  //       return
  //     }
  //     if (message.type === 'inboxsdk__injectPageWorld' && sender.tab) {
  //       console.log('inboxsdk__injectPageWorld')
  //       if (Browser.scripting && sender.tab?.id) {
  //         console.log('inboxsdk__injectPageWorld 2')
  //         // MV3
  //         Browser.scripting.executeScript({
  //           target: { tabId: sender.tab.id },
  //           // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  //           // @ts-ignore
  //           world: 'MAIN',
  //           files: ['pageWorld.js'],
  //         })
  //         sendResponse(true)
  //       }
  //     }
  //   },
  // )
  // search with AI
  SearchWithAIMessageInit()
}

/**
 * 插件卸载
 */
const initChromeExtensionUninstalled = () => {
  Browser.runtime.setUninstallURL(
    `${MAXAI_CHROME_EXTENSION_APP_HOMEPAGE_URL}/survey/uninstall?version=${APP_VERSION}`,
  )
}

/**
 * 插件快捷键初始化
 */
const initChromeExtensionCommands = () => {
  Browser.commands.onCommand.addListener(async (command) => {
    if (command == '_execute_action') {
      const currentTab = await Browser.tabs.query({
        active: true,
        currentWindow: true,
      })
      const tab = currentTab[0]
      if (tab && tab.id) {
        await backgroundSendClientMessage(
          tab.id,
          'Client_listenOpenChatMessageBox',
          {
            type: 'shortcut',
            command,
          },
        )
      }
    } else if (command === 'show-floating-menu') {
      const currentTab = await Browser.tabs.query({
        active: true,
        currentWindow: true,
      })
      const tab = currentTab[0]
      if (tab && tab.id) {
        await backgroundSendClientMessage(
          tab.id,
          'Client_listenOpenChatMessageBox',
          {
            type: 'shortcut',
            command,
          },
        )
      }
    } else if (command === 'open-immersive-chat') {
      await chromeExtensionOpenImmersiveChat('', true)
    }
  })
}

/**
 * 插件图标点击初始化
 */
const initChromeExtensionAction = () => {
  // HACK: 在任何页面onActivated的时候都会试图通信，如果通信成功触发关闭Popup，强制进入onClicked事件，monica应该也是这种写法，我看交互一模一样
  // NOTE: 之所以这么写是因为当popup.html存在的时候，是无法进入action.onClicked的监听事件
  const checkTabStatus = async (tab: Browser.Tabs.Tab) => {
    try {
      const currentTab = tab
      const currentTabUrl = currentTab?.url || ''
      let popup = ''
      // chrome相关的页面展示popup
      if (
        currentTab?.url?.startsWith('chrome') ||
        currentTab?.url?.startsWith('https://chrome.google.com/webstore') ||
        currentTab?.url?.startsWith('https://chromewebstore.google.com') ||
        currentTab?.url?.startsWith(`https://${CHATGPT_WEBAPP_HOST}`)
      ) {
        // NOTE: extensions shortcuts的设置页面不应该弹出来阻止用户设置快捷键
        if (!currentTabUrl.startsWith('chrome://extensions/shortcuts')) {
          popup = 'pages/popup/index.html'
        }
      } else if (currentTab && currentTab.id) {
        await Browser.tabs.sendMessage(currentTab.id, {})
        // 能和网页通信, 阻止默认的popup
        popup = ''
      }
      await Browser.action.setPopup({
        popup,
      })
    } catch (e) {
      console.error(e)
      await Browser.action.setPopup({
        popup: 'pages/popup/index.html',
      })
    }
  }
  Browser.tabs.onActivated.addListener(async ({ tabId }) => {
    const tab = await safeGetBrowserTab(tabId)
    tab && (await checkTabStatus(tab))
  })
  Browser.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
    // tab loaded
    if (changeInfo.status === 'complete') {
      if (tab.active) {
        // TODO: check is new tab， theme的需求，暂时不做
        // if (tab.url === 'chrome://newtab/' || tab.url === 'edge://newtab/') {
        //   // redirect to /pages/chat/index.html
        //   await Browser.tabs.update(tabId, {
        //     url: Browser.runtime.getURL('/pages/chat/index.html'),
        //   })
        // }
        await checkTabStatus(tab)
      }
    }
  })
  Browser.action.onClicked.addListener(async (tab) => {
    Browser.action.setBadgeText({
      text: '',
    })
    if (tab && tab.id && tab.active) {
      if (tab.url === 'chrome://extensions/shortcuts') {
        return
      }
      const result = await backgroundSendClientMessage(
        tab.id,
        'Client_listenOpenChatMessageBox',
        {
          type: 'shortcut',
        },
      )
      if (!result) {
        await Browser.action.setPopup({
          popup: 'pages/popup/index.html',
        })
      }
    }
  })
}

const initChromeExtensionDisabled = () => {
  Browser.management?.onDisabled?.addListener(function (extensionInfo) {
    if (extensionInfo.id === Browser.runtime.id) {
      console.log('Extension disabled')
      Browser.action.setPopup({
        popup: 'pages/popup/index.html',
      })
    }
  })
}

const initChromeExtensionContextMenu = () => {
  Browser.contextMenus.onClicked.addListener(async (info, tab) => {
    if (
      info.menuItemId === 'use-chatgpt-ai-context-menu-button' &&
      tab &&
      tab.id
    ) {
      await Browser.tabs.sendMessage(tab.id, {
        id: MAXAI_CHROME_EXTENSION_POST_MESSAGE_ID,
        event: 'Client_listenOpenChatMessageBox',
        data: {},
      })
    }
  })
}

const developmentHotReload = () => {
  if (!isProduction) {
    const ws = new WebSocket('ws://localhost:8181')
    ws.addEventListener('message', (event) => {
      if (event.data === 'hot_reload_message') {
        backgroundRestartChromeExtension().then(() => {
          // setTimeout(async () => {
          //   await Browser.tabs.create({
          //     url: `chrome-extension://${Browser.runtime.id}/pages/settings/index.html#/my-own-prompts`,
          //     active: true,
          //   })
          //
          // }, 1000)
        })
      }
    })
    // Browser.tabs.create({
    //   url: `chrome-extension://${Browser.runtime.id}/pages/settings/index.html#/my-own-prompts`,
    //   active: true,
    // })
    // createChromeExtensionOptionsPage('#/my-own-prompts')
    // createChromeExtensionImmersiveChatPage('')
  }
}

const initExternalMessageListener = () => {
  // 可接收外部消息的插件id
  const extensionWhiteList = [
    // webchatgpt
    'lpfemeioodjbpieminkklglpmhlngfcn',
    // modHeader
    'idgpnmonknjnojddfkpgkljpfnnfcklj',
    //simplytends
    'kajbojdeijchbhbodifhaigbnbodjahj',
    // opgbiafapkbbnbnjcdomjaghbckfkglc modeheader-edge
    'opgbiafapkbbnbnjcdomjaghbckfkglc',
    // flahobhjikkpnpohomeckhdjjkkkkmoc webchatgpt-edge
    'flahobhjikkpnpohomeckhdjjkkkkmoc',
  ]

  Browser.runtime.onMessageExternal.addListener(async function (
    message,
    sender,
  ) {
    // 外部插件获取 maxai 插件中的用户信息
    if (message.event === 'GET_MAXAI_USERINFO') {
      // 测试环境跳过 插件白名单 检测
      if (!isProduction || extensionWhiteList.includes(sender.id ?? '')) {
        const userinfo = await getChromeExtensionUserInfo(false)
        return {
          isLogin: !!userinfo,
          success: true,
        }
      }
    }
  })
}

const initChromeExtensionTabUrlChangeListener = () => {
  let lastTabUrl = ''
  Browser.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    pdfSnifferStartListener(tabId, changeInfo, tab)
    // 页面的url变化后，要触发页面的特殊网页的element更新
    if (tab.active && tab.id && tab.url) {
      console.log(`initChromeExtensionTabUrlChangeListener [${tab.url}]`, tab)
      if (lastTabUrl !== tab.url) {
        lastTabUrl = tab.url
        backgroundSendClientMessage(
          tab.id,
          'Client_updateSidebarChatBoxStyle',
          {},
        )
          .then()
          .catch()
      }
      backgroundSendClientMessage(tab.id, 'Client_listenTabUrlUpdate', {})
        .then()
        .catch()
    }
  })
}

/**
 * 插件payment支付监听初始化
 */
const initChromeExtensionCreatePaymentListener = () => {
  const tabUrls: Record<number, string> = {}

  Browser.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (tab.url && tabUrls[tabId] && tab.url !== tabUrls[tabId]) {
      // url变化
      paymentManager.changePage(tabId, tabUrls[tabId], tab.url)
    }
    if (tab.url) {
      tabUrls[tabId] = tab.url
    }
  })

  Browser.tabs.onRemoved.addListener((tabId) => {
    paymentManager.closePage(tabId, tabUrls[tabId])
    delete tabUrls[tabId]
  })
}

import {
  isAIMessage,
  isUserMessage,
} from '@/features/chatgpt/utils/chatMessageUtils'
import { IConversation } from '@/features/indexed_db/conversations/models/Conversation'
import { IChatMessage } from '@/features/indexed_db/conversations/models/Message'

import {
  getChromeExtensionDBStorage,
  setChromeExtensionDBStorage,
} from './utils/chromeExtensionStorage/chromeExtensionDBStorage'

const devMockConversation = async () => {
  const isProduction = String(process.env.NODE_ENV) === 'production'
  if (isProduction) {
    return
  }
  // 保证不运行
  const totalConversationIds = await getAllOldVersionConversationIds()
  const totalConversation: IConversation[] = []
  for (let i = 0; i < totalConversationIds.length; i++) {
    const conversation =
      await ConversationManager.oldVersionConversationDB.getConversationById(
        totalConversationIds[i],
      )
    if (conversation) {
      totalConversation.push(conversation)
    }
  }
  if (totalConversation.length < 5 || totalConversation.length > 50) {
    return
  }
  const mergeMessages: IChatMessage[] = []
  totalConversation.forEach((conversation) => {
    mergeMessages.push(...conversation.messages)
  })
  const getMergeMessages = (count: number, conversationId: string) => {
    const newMessages = Array(count)
      .fill(0)
      .map((value, index) => {
        const randomIndex = Math.floor(Math.random() * mergeMessages.length)
        const mockMessage = cloneDeep(mergeMessages[randomIndex])
        mockMessage.messageId = uuidV4()

        const day3 = 3 * 24 * 60 * 60 * 1000
        mockMessage.created_at = new Date(
          new Date().getTime() - day3 + index * 1000 * 60,
        ).toISOString()
        mockMessage.updated_at = new Date(
          new Date().getTime() - day3 + index * 1000 * 60,
        ).toISOString()
        ;(mockMessage as any).conversationId = conversationId
        if (isAIMessage(mockMessage)) {
          if (mockMessage.originalMessage?.metadata?.attachments) {
            mockMessage.originalMessage.metadata.attachments =
              mockMessage.originalMessage.metadata.attachments.map(
                (attachment: any) => {
                  attachment.id = uuidV4()
                  return attachment
                },
              )
          }
        }
        if (isUserMessage(mockMessage)) {
          if (mockMessage.meta?.attachments) {
            mockMessage.meta.attachments = mockMessage.meta.attachments.map(
              (attachment: any) => {
                attachment.id = uuidV4()
                return attachment
              },
            )
          }
        }
        return mockMessage
      })
    // 重新整理parentMessageId
    newMessages.forEach((message, index) => {
      const parentMessageId = newMessages[index - 1]?.messageId
      if (parentMessageId) {
        message.parentMessageId = parentMessageId
      }
    })
    return newMessages
  }
  const authorId = await getMaxAIChromeExtensionUserId()
  console.log('totalConversation', totalConversation)
  const randomConversationCount = 200
  const randomConversations = new Array(randomConversationCount)
    .fill(0)
    .map(() => {
      const randomIndex = Math.floor(Math.random() * totalConversation.length)
      const conversation = cloneDeep(totalConversation[randomIndex])
      conversation.id = uuidV4()
      conversation.authorId = authorId
      conversation.messages = getMergeMessages(100, conversation.id)
      return conversation
    })
  let index = 0
  for (const conversation of randomConversations) {
    index++
    console.log(
      `Mock [${index}]`,
      conversation.id,
      conversation.messages.length,
    )
    await ConversationManager.oldVersionConversationDB.addOrUpdateConversation(
      conversation,
    )
  }
}
