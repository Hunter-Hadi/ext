// This file must be in the root of the src directory
// Popup action takes precedence over this listener..
// To make this function work, set "action" property to {} in manifest
import Browser from 'webextension-polyfill'
export type {
  IChromeExtensionClientSendEvent,
  IOpenAIChatSendEvent,
  IChromeExtensionClientListenEvent,
  IChromeExtensionListenEvent,
  IOpenAIChatListenTaskEvent,
} from './eventType'
import {
  CHAT_GPT_PROVIDER,
  CHROME_EXTENSION_DOC_URL,
  CHROME_EXTENSION_HOMEPAGE_URL,
  CHROME_EXTENSION_POST_MESSAGE_ID,
  isEzMailApp,
} from '@/types'
import {
  BardChat,
  BingChat,
  ChatSystem,
  OpenAiApiChat,
  OpenAIChat,
  PoeChat,
  UseChatGPTPlusChat,
} from '@/background/src/chat'
import {
  BardChatProvider,
  BingChatProvider,
  ChatAdapter,
  OpenAIApiChatProvider,
  OpenAIChatProvider,
  PoeChatProvider,
  UseChatGPTPlusChatProvider,
} from '@/background/provider/chat'
import { ClientMessageInit } from '@/background/src/client'
import {
  backgroundSendClientMessage,
  resetChromeExtensionOnBoardingData,
} from '@/background/utils'
import { pdfSnifferStartListener } from '@/background/src/pdf'
import { ShortcutMessageInit } from '@/features/shortcuts/background'

/**
 * background.js 入口
 *
 */
export const startChromeExtensionBackground = () => {
  // 获取必要的权限
  Browser.management.getAll()
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
  // feature
  // pdf feature
  pdfSnifferStartListener().then().catch()
}

/**
 * 插件安装初始化
 */
const initChromeExtensionInstalled = () => {
  // 插件安装初始化
  if (isEzMailApp) {
    Browser.runtime.onInstalled.addListener(async (object) => {
      if (object.reason === chrome.runtime.OnInstalledReason.INSTALL) {
        await Browser.tabs.create({
          url: CHROME_EXTENSION_DOC_URL + '#how-to-use',
        })
        // 重置插件引导数据
        await resetChromeExtensionOnBoardingData()
      }
    })
  } else {
    Browser.runtime.onInstalled.addListener(async (object) => {
      if (object.reason === chrome.runtime.OnInstalledReason.INSTALL) {
        await Browser.tabs.create({
          url: CHROME_EXTENSION_DOC_URL + '/get-started',
        })
      }
      try {
        await Browser.contextMenus.remove('use-chatgpt-ai-context-menu-button')
      } catch (e) {
        // ignore
      }
      await Browser.contextMenus.create({
        id: 'use-chatgpt-ai-context-menu-button',
        title: 'UseChatGPT.AI',
        contexts: ['all'],
      })
    })
  }
}

/**
 * 插件消息通信初始化
 */
const initChromeExtensionMessage = () => {
  ClientMessageInit()
  ShortcutMessageInit()
  if (isEzMailApp) {
    Browser.runtime.onMessage.addListener(
      (message, sender, sendResponse: any) => {
        if (message?.id && message.id !== CHROME_EXTENSION_POST_MESSAGE_ID) {
          return
        }
        if (message.type === 'inboxsdk__injectPageWorld' && sender.tab) {
          console.log('inboxsdk__injectPageWorld')
          if (Browser.scripting && sender.tab?.id) {
            console.log('inboxsdk__injectPageWorld 2')
            // MV3
            chrome.scripting.executeScript({
              target: { tabId: sender.tab.id },
              world: 'MAIN',
              files: ['pageWorld.js'],
            })
            sendResponse(true)
          }
        }
      },
    )
  } else {
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
    const bardChatAdapter = new ChatAdapter(
      new BardChatProvider(new BardChat()),
    )
    const bingChatAdapter = new ChatAdapter(
      new BingChatProvider(new BingChat()),
    )
    const poeChatAdapter = new ChatAdapter(new PoeChatProvider(new PoeChat()))
    chatSystem.addAdapter(CHAT_GPT_PROVIDER.OPENAI, openAIChatAdapter)
    chatSystem.addAdapter(CHAT_GPT_PROVIDER.OPENAI_API, newOpenAIApiChatAdapter)
    chatSystem.addAdapter(
      CHAT_GPT_PROVIDER.USE_CHAT_GPT_PLUS,
      useChatGPTPlusAdapter,
    )
    chatSystem.addAdapter(CHAT_GPT_PROVIDER.BING, bingChatAdapter)
    chatSystem.addAdapter(CHAT_GPT_PROVIDER.BARD, bardChatAdapter)
    chatSystem.addAdapter(CHAT_GPT_PROVIDER.CLAUDE, poeChatAdapter)
  }
}

/**
 * 插件卸载
 */
const initChromeExtensionUninstalled = () => {
  if (!isEzMailApp) {
    Browser.runtime.setUninstallURL(
      CHROME_EXTENSION_HOMEPAGE_URL + '/survey/uninstall',
    )
  }
}

/**
 * 插件快捷键初始化
 */
const initChromeExtensionCommands = () => {
  if (!isEzMailApp) {
    Browser.commands.onCommand.addListener(async (command) => {
      if (command == '_execute_action') {
        const currentTab = await Browser.tabs.query({
          active: true,
        })
        const tab = currentTab[0]
        if (tab && tab.id) {
          await backgroundSendClientMessage(
            tab.id,
            'Client_listenOpenChatMessageBox',
            {
              type: 'shortcut',
            },
          )
        }
      }
    })
  }
}

/**
 * 插件图标点击初始化
 */
const initChromeExtensionAction = () => {
  if (isEzMailApp) {
    Browser.action.onClicked.addListener(async (tab) => {
      if (tab && tab.id && tab.active) {
        await Browser.tabs.create({
          url: CHROME_EXTENSION_DOC_URL,
        })
      }
    })
  } else {
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
      await checkTabStatus(await Browser.tabs.get(tabId))
    })
    Browser.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
      // tab loaded
      if (changeInfo.status === 'complete') {
        if (tab.active) {
          await checkTabStatus(tab)
        }
      }
    })
    Browser.action.onClicked.addListener(async (tab) => {
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
}

const initChromeExtensionDisabled = () => {
  if (isEzMailApp) {
    // no popup
  } else {
    chrome.management.onDisabled.addListener(function (extensionInfo) {
      if (extensionInfo.id === chrome.runtime.id) {
        console.log('Extension disabled')
        Browser.action.setPopup({
          popup: 'pages/popup/index.html',
        })
      }
    })
  }
}

const initChromeExtensionContextMenu = () => {
  if (isEzMailApp) {
    // no context menu
  } else {
    Browser.contextMenus.onClicked.addListener(async (info, tab) => {
      if (
        info.menuItemId === 'use-chatgpt-ai-context-menu-button' &&
        tab &&
        tab.id
      ) {
        await Browser.tabs.sendMessage(tab.id, {
          id: CHROME_EXTENSION_POST_MESSAGE_ID,
          event: 'Client_listenOpenChatMessageBox',
          data: {},
        })
      }
    })
  }
}
