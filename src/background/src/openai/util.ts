import Browser from 'webextension-polyfill'

/**
 * 创建守护进程的tab
 */
export const createDaemonProcessTab = async () => {
  const pinedTabs = await Browser.tabs.query({
    pinned: true,
    url: 'https://chat.openai.com/*',
  })
  let tab: Browser.Tabs.Tab | null = null
  if (pinedTabs.length > 0 && pinedTabs[0].id) {
    tab = await Browser.tabs.update(pinedTabs[0].id, {
      active: true,
      url: 'https://chat.openai.com/chat',
    })
  } else {
    tab = await Browser.tabs.create({
      url: 'https://chat.openai.com/chat',
      pinned: true,
    })
  }
  return tab
}

/**
 * 确认守护进程是否存在
 * @param chatGPTProxyInstance
 */
export const checkChatGPTProxyInstance = async (
  chatGPTProxyInstance: Browser.Tabs.Tab,
) => {
  const chatGPTProxyTabId = chatGPTProxyInstance?.id
  if (!chatGPTProxyTabId) {
    return false
  }
  try {
    const chatGPTProxyTab = await Browser.tabs.get(chatGPTProxyTabId)
    if (!chatGPTProxyTab) {
      return false
    }
  } catch (e) {
    return false
  }
  return true
}
