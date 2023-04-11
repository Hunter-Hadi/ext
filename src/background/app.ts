// This file must be in the root of the src directory
// Popup action takes precedence over this listener..
// To make this function work, set "action" property to {} in manifest
import Browser from 'webextension-polyfill'
export type {
  IChromeExtensionClientSendEvent,
  IChromeExtensionChatGPTDaemonProcessSendEvent,
  IChromeExtensionClientListenEvent,
  IChromeExtensionListenEvent,
  IChromeExtensionChatGPTDaemonProcessListenEvent,
  IChromeExtensionChatGPTDaemonProcessListenTaskEvent,
} from './eventType'
import {
  CHAT_GPT_PROVIDER,
  CHROME_EXTENSION_DOC_URL,
  CHROME_EXTENSION_HOMEPAGE_URL,
  CHROME_EXTENSION_POST_MESSAGE_ID,
  DEFAULT_AI_OUTPUT_LANGUAGE_VALUE,
} from '@/types'
import { ChatSystem, OpenAIChat } from '@/background/src/openai'
import { ChatAdapter, OpenAIChatProvider } from '@/background/provider/chat'
import { ClientMessageInit } from '@/background/src/client'
import { backgroundSendClientMessage } from '@/background/utils'

const isEzMailApp = process.env.APP_ENV === 'EZ_MAIL_AI'

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
  initChromeExtensionInstalled()
  initChromeExtensionMessage()
  initChromeExtensionCommands()
  initChromeExtensionAction()
  initChromeExtensionUninstalled()
}

/**
 * 插件安装初始化
 */
const initChromeExtensionInstalled = () => {
  // 插件安装初始化
  Browser.runtime.onInstalled.addListener(async (object) => {
    if (object.reason === chrome.runtime.OnInstalledReason.INSTALL) {
      const config = {
        userSettings: {
          language: DEFAULT_AI_OUTPUT_LANGUAGE_VALUE,
          selectionButtonVisible: true,
        },
      }
      console.log('onInstalled config', config)
      await Browser.storage.local.set({
        CLIENT_SETTINGS: JSON.stringify(config),
      })
      if (isEzMailApp) {
        await Browser.tabs.create({
          url: CHROME_EXTENSION_DOC_URL + '#how-to-use',
        })
      } else {
        Browser.contextMenus.create({
          id: 'use-chatgpt-ai-context-menu-button',
          title: 'Use ChatGPT',
          contexts: ['all'],
        })
        await Browser.tabs.create({
          url: CHROME_EXTENSION_DOC_URL + '/extension-installed',
        })
      }
    }
  })
}

/**
 * 插件消息通信初始化
 */
const initChromeExtensionMessage = () => {
  ClientMessageInit()
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
    chatSystem.addAdapter(CHAT_GPT_PROVIDER.OPENAI, openAIChatAdapter)
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
            'Client_ListenOpenChatMessageBox',
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
    Browser.action.onClicked.addListener(async (tab) => {
      if (tab && tab.id && tab.active) {
        await backgroundSendClientMessage(
          tab.id,
          'Client_ListenOpenChatMessageBox',
          {
            type: 'shortcut',
          },
        )
      }
    })
  }
}
