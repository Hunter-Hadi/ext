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
import {
  BardChatProvider,
  BingChatProvider,
  ChatAdapter,
  ClaudeChatProvider,
  MaxAIClaudeChatProvider,
  MaxAIDALLEChatProvider,
  MaxAIFreeChatProvider,
  OpenAIApiChatProvider,
  OpenAIChatProvider,
  PoeChatProvider,
  UseChatGPTPlusChatProvider,
} from '@/background/provider/chat'
import { MaxAIGeminiChatProvider } from '@/background/provider/chat/MaxAIGeminiChatProvider'
import {
  BardChat,
  BingChat,
  ChatSystem,
  ClaudeWebappChat,
  MaxAIClaudeChat,
  MaxAIDALLEChat,
  MaxAIFreeChat,
  MaxAIGeminiChat,
  OpenAiApiChat,
  OpenAIChat,
  PoeChat,
  UseChatGPTPlusChat,
} from '@/background/src/chat'
import { updateRemoteAIProviderConfigAsync } from '@/background/src/chat/OpenAIChat/utils'
import ConversationManager from '@/background/src/chatConversations'
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
import {
  checkSettingsSync,
  isSettingsLastModifiedEqual,
  syncLocalSettingsToServerSettings,
} from '@/background/utils/syncSettings'
import {
  AI_PROVIDER_MAP,
  APP_VERSION,
  isProduction,
  MAXAI_CHROME_EXTENSION_POST_MESSAGE_ID,
} from '@/constants'
import { getChromeExtensionUserInfo } from '@/features/auth/utils'
import {
  MAXAI_CHROME_EXTENSION_APP_HOMEPAGE_URL,
  MAXAI_CHROME_EXTENSION_WWW_HOMEPAGE_URL,
} from '@/features/common/constants'
import { SearchWithAIMessageInit } from '@/features/searchWithAI/background'
import { ShortcutMessageBackgroundInit } from '@/features/shortcuts/messageChannel/background'
import WebsiteContextManager from '@/features/websiteContext/background'
import { updateContextMenuSearchTextStore } from '@/pages/settings/utils'
import { sendLarkBotMessage } from '@/utils/larkBot'

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
    initExternalMessageListener()
    // feature
    // hot reload
    developmentHotReload()
  } catch (e) {
    //
  }
}

/**
 * 插件安装初始化
 */
const initChromeExtensionInstalled = () => {
  // 插件安装初始化
  Browser.runtime.onInstalled.addListener(async (object) => {
    if (object.reason === (Browser as any).runtime.OnInstalledReason.INSTALL) {
      // 重置插件引导数据
      await resetChromeExtensionOnBoardingData()
      await Browser.tabs.create({
        url: MAXAI_CHROME_EXTENSION_APP_HOMEPAGE_URL + '/get-started',
      })
    } else {
      await initChromeExtensionUpdated()
      // 保存本地快照
      await setChromeExtensionDBStorageSnapshot()
      // 更新插件
      if (!(await isSettingsLastModifiedEqual())) {
        await checkSettingsSync()
      }
      await syncLocalSettingsToServerSettings()
      // 更新i18n
      await updateContextMenuSearchTextStore('textSelectPopupButton')
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
        result.roles.find((role) => role.name === 'elite') ||
        result.roles.find((role) => role.name === 'pro') || {
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
        result.roles.find((role) => role.name === 'elite') ||
        result.roles.find((role) => role.name === 'pro') || {
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
        result.roles.find((role) => role.name === 'elite') ||
        result.roles.find((role) => role.name === 'pro') || {
          name: 'free',
        }
      ).name
      /**
       * 只收集pro和elite的用户
       */
      if (role === 'pro' || role === 'elite') {
        WebsiteContextManager.computeWebsiteContextStorageSize()
          .then((size) => {
            if (size > 0) {
              setTimeout(() => {
                // 发送到larkbot
                sendLarkBotMessage(
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
  const executeMaxAIOneYearPromotion = async () => {
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
  if (APP_VERSION === '2.5.2') {
    setTimeout(
      executeMaxAIOneYearPromotion,
      (1 + Math.floor(Math.random() * 9)) * 1000,
    )
  }
  // TODO: 预计2024-01移除这段逻辑, 更新老用户的conversation的authorId字段
  await ConversationManager.getAllConversation()
  // NOTE: 远程更新AI配置
  setTimeout(() => {
    updateRemoteAIProviderConfigAsync().then().catch()
  }, (1 + Math.floor(Math.random() * 9)) * 1000)
}

/**
 * 插件消息通信初始化
 */
const initChromeExtensionMessage = () => {
  ClientMessageInit()
  ShortcutMessageBackgroundInit()
  Browser.runtime.onMessage.addListener(
    (message, sender, sendResponse: any) => {
      if (
        message?.id &&
        message.id !== MAXAI_CHROME_EXTENSION_POST_MESSAGE_ID
      ) {
        return
      }
      if (message.type === 'inboxsdk__injectPageWorld' && sender.tab) {
        console.log('inboxsdk__injectPageWorld')
        if (Browser.scripting && sender.tab?.id) {
          console.log('inboxsdk__injectPageWorld 2')
          // MV3
          Browser.scripting.executeScript({
            target: { tabId: sender.tab.id },
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            world: 'MAIN',
            files: ['pageWorld.js'],
          })
          sendResponse(true)
        }
      }
    },
  )
  const chatSystem = new ChatSystem()
  const openAIChatAdapter = new ChatAdapter(
    new OpenAIChatProvider(new OpenAIChat()),
  )
  const useChatGPTPlusAdapter = new ChatAdapter(
    new UseChatGPTPlusChatProvider(new UseChatGPTPlusChat()),
  )
  const newOpenAIApiChatAdapter = new ChatAdapter(
    new OpenAIApiChatProvider(new OpenAiApiChat()),
  )
  const bardChatAdapter = new ChatAdapter(new BardChatProvider(new BardChat()))
  const bingChatAdapter = new ChatAdapter(new BingChatProvider(new BingChat()))
  const poeChatAdapter = new ChatAdapter(new PoeChatProvider(new PoeChat()))
  const claudeChatAdapter = new ChatAdapter(
    new ClaudeChatProvider(new ClaudeWebappChat()),
  )
  const maxAIClaudeAdapter = new ChatAdapter(
    new MaxAIClaudeChatProvider(new MaxAIClaudeChat()),
  )
  const maxAIGeminiAdapter = new ChatAdapter(
    new MaxAIGeminiChatProvider(new MaxAIGeminiChat()),
  )
  const maxAIArtAdapter = new ChatAdapter(
    new MaxAIDALLEChatProvider(new MaxAIDALLEChat()),
  )
  const maxAiFreeAdapter = new ChatAdapter(
    new MaxAIFreeChatProvider(new MaxAIFreeChat()),
  )
  chatSystem.addAdapter(AI_PROVIDER_MAP.OPENAI, openAIChatAdapter)
  chatSystem.addAdapter(AI_PROVIDER_MAP.OPENAI_API, newOpenAIApiChatAdapter)
  chatSystem.addAdapter(
    AI_PROVIDER_MAP.USE_CHAT_GPT_PLUS,
    useChatGPTPlusAdapter,
  )
  chatSystem.addAdapter(AI_PROVIDER_MAP.BING, bingChatAdapter)
  chatSystem.addAdapter(AI_PROVIDER_MAP.BARD, bardChatAdapter)
  chatSystem.addAdapter(AI_PROVIDER_MAP.POE, poeChatAdapter)
  chatSystem.addAdapter(AI_PROVIDER_MAP.CLAUDE, claudeChatAdapter)
  chatSystem.addAdapter(AI_PROVIDER_MAP.MAXAI_CLAUDE, maxAIClaudeAdapter)
  chatSystem.addAdapter(AI_PROVIDER_MAP.MAXAI_FREE, maxAiFreeAdapter)
  chatSystem.addAdapter(AI_PROVIDER_MAP.MAXAI_GEMINI, maxAIGeminiAdapter)
  chatSystem.addAdapter(AI_PROVIDER_MAP.MAXAI_DALLE, maxAIArtAdapter)
  // search with AI
  SearchWithAIMessageInit()
}

/**
 * 插件卸载
 */
const initChromeExtensionUninstalled = () => {
  Browser.runtime.setUninstallURL(
    `${MAXAI_CHROME_EXTENSION_WWW_HOMEPAGE_URL}/survey/uninstall?version=${APP_VERSION}`,
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
        currentTab?.url?.startsWith('https://chat.openai.com')
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
          //     url: `chrome-extension://${Browser.runtime.id}/pages/settings/index.html`,
          //     active: true,
          //   })
          // }, 1000)
        })
      }
    })
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
  ]

  Browser.runtime.onMessageExternal.addListener(async function (
    message,
    sender,
  ) {
    // 测试环境跳过 插件白名单 检测
    if (!isProduction || extensionWhiteList.includes(sender.id ?? '')) {
      if (message.event === 'GET_MAXAI_USERINFO') {
        const userinfo = await getChromeExtensionUserInfo(false)
        return {
          isLogin: !!userinfo,
          success: true,
        }
      }
    }
    return undefined
  })
}

const initChromeExtensionTabUrlChangeListener = () => {
  Browser.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    pdfSnifferStartListener(tabId, changeInfo, tab)
    // 页面的url变化后，要触发页面的特殊网页的element更新
    if (tab.active && tab.id && tab.url) {
      backgroundSendClientMessage(
        tab.id,
        'Client_updateSidebarChatBoxStyle',
        {},
      )
        .then()
        .catch()
      backgroundSendClientMessage(tab.id, 'Client_listenTabUrlUpdate', {})
        .then()
        .catch()
    }
  })
}
