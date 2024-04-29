// 保存 由于网站本身设置 overflow: hidden，导致我们的 context menu 无法渲染的 网站host
import debounce from 'lodash-es/debounce'

import { CHROME_EXTENSION_USER_SETTINGS_DEFAULT_CHAT_BOX_WIDTH } from '@/constants'
import { MAXAI_SIDEBAR_ID } from '@/features/common/constants'
import { getCurrentDomainHost } from '@/utils/dataHelper/websiteHelper'

const BY_OVERFLOW_FLOW_BREAK_UI_HOST_LIST = [
  'greylock.com',
  'notion.so',
  'teams.live.com',
]
/**
 * 对于一些特殊的网站, 在聊天框显示的时候, 需要修改一些样式
 */
const modifyHTMLStyleForSpecialWebsiteOnChatBoxShow = () => {
  const htmlElement = document.body.parentElement
  const chatBoxElement = document.getElementById(MAXAI_SIDEBAR_ID)
  const host = getCurrentDomainHost()
  if (htmlElement && chatBoxElement) {
    const chatBoxElementWidth =
      chatBoxElement.offsetWidth ||
      CHROME_EXTENSION_USER_SETTINGS_DEFAULT_CHAT_BOX_WIDTH
    if (
      host === 'outlook.live.com' ||
      host === 'onedrive.live.com' ||
      host === 'outlook.office.com' ||
      host === 'outlook.office365.com'
    ) {
      htmlElement.style.minHeight = '100vh'
    }
    if (host === 'teams.live.com') {
      document.querySelectorAll('.overlay-hybrid').forEach((element: any) => {
        element.style.width = `calc(100% - ${chatBoxElementWidth}px)`
        element.childNodes.forEach((child: any) => {
          if (child.tagName === 'IFRAME') {
            child.style.width = '100%'
          }
        })
      })
    }
    if (host === 'studio.youtube.com') {
      const youTubeStudioContainer = document.querySelector(
        '#main-container',
      ) as HTMLDivElement
      youTubeStudioContainer.style.width = `calc(100% - ${chatBoxElementWidth}px)`
    }
    if (host === 'youtube.com') {
      document
        .querySelectorAll('.ytp-chrome-bottom')
        .forEach((element: any) => {
          element.style.maxWidth = '95%'
        })
    }

    if (host === 'mail.qq.com') {
      htmlElement.style.width = '100%'
    }

    if (host === 'gatesnotes.com') {
      htmlElement.style.height = '100%'
    }

    // google map
    if (host === 'google.com' && location.pathname.startsWith('/maps')) {
      htmlElement.style.height = '100%'
    }
    // facebook的post的Video Viewer，弹窗的dialog的comments区域是fixed的并且right:0，所以需要调整
    if (host === 'facebook.com') {
      const facebookVideoViewerCommentsRoot = document.querySelector(
        'div:has(div[role="main"]) div[role="complementary"] > div',
      ) as HTMLDivElement
      if (facebookVideoViewerCommentsRoot) {
        // 获取display
        const computedStyle = window.getComputedStyle(
          facebookVideoViewerCommentsRoot,
        )
        if (computedStyle.position === 'fixed') {
          facebookVideoViewerCommentsRoot.style.right = `${chatBoxElementWidth}px`
        }
      }
    }

    // 24.04.02: handle Discord client resize
    if (host === 'discord.com') {
      let discordSpecialStyle = document.querySelector(
        '#MAXAI__DISCORD_SPECIAL_STYLE',
      )
      if (!discordSpecialStyle) {
        discordSpecialStyle = document.createElement('style')
        discordSpecialStyle.id = 'MAXAI__DISCORD_SPECIAL_STYLE'
        document
          .getElementsByTagName('head')[0]
          .appendChild(discordSpecialStyle)
      }
      discordSpecialStyle.innerHTML = `html,#app-mount{width:calc(100vw - ${chatBoxElementWidth}px)!important;}`
    }

    // 24.04.10: handle Slack client width 100vw
    if (host === 'app.slack.com') {
      let slackSpecialStyle = document.querySelector(
        '#MAXAI__SLACK_SPECIAL_STYLE',
      )
      if (!slackSpecialStyle) {
        slackSpecialStyle = document.createElement('style')
        slackSpecialStyle.id = 'MAXAI__SLACK_SPECIAL_STYLE'
        document.getElementsByTagName('head')[0].appendChild(slackSpecialStyle)
      }
      slackSpecialStyle.innerHTML = `.p-client,.p-ia4_client,.p-ia4_client_container,.p-theme_background,.p-client_workspace_wrapper{width:100%!important;} .c-popover--z_above_fs{z-index:2147483502!important;}`
    }

    // twitter下html添加relative导致context window的Popper位置错误
    if (host === 'twitter.com') {
      document.body.style.position = 'relative'
    }
  }
  // 浏览器自带的pdf文件阅读器
  if (document.querySelector('embed[type="application/pdf"]')) {
    document.body.style.height = '100vh'
  }

  if (BY_OVERFLOW_FLOW_BREAK_UI_HOST_LIST.includes(host)) {
    // 打开 chat box 的时候，设置为 hidden
    // 为了解决 context menu 渲染在 body 宽度以外的地方时，样式错误的问题
    document.body.style.overflow = 'unset'
  }
}
/**
 * 对于一些特殊的网站，当聊天框隐藏的时候，需要修改一些样式
 */
const modifyHTMLStyleForSpecialWebsiteOnChatBoxHide = () => {
  const htmlElement = document.body.parentElement
  const host = getCurrentDomainHost()
  if (htmlElement) {
    if (
      host === 'outlook.live.com' ||
      host === 'onedrive.live.com' ||
      host === 'outlook.office.com'
    ) {
      htmlElement.style.minHeight = ''
    }
    if (host === 'teams.live.com') {
      document.querySelectorAll('.overlay-hybrid').forEach((element: any) => {
        element.style.width = `100%`
        element.childNodes.forEach((child: any) => {
          if (child.tagName === 'IFRAME') {
            child.style.width = '100vw'
          }
        })
      })
    }
    if (host === 'youtube.com') {
      document
        .querySelectorAll('.ytp-chrome-bottom')
        .forEach((element: any) => {
          element.style.maxWidth = ''
        })
    }
    if (host === 'studio.youtube.com') {
      const youTubeStudioContainer = document.querySelector(
        '#main-container',
      ) as HTMLDivElement
      youTubeStudioContainer.style.width = `100%`
    }

    if (host === 'mail.qq.com') {
      htmlElement.style.width = ''
    }

    if (host === 'gatesnotes.com') {
      htmlElement.style.height = ''
    }

    // google map
    if (host === 'google.com' && location.pathname.startsWith('/maps')) {
      htmlElement.style.height = ''
    }
    // facebook的post的Video Viewer，弹窗的dialog的comments区域是fixed的并且right:0，所以需要调整
    if (host === 'facebook.com') {
      const facebookVideoViewerCommentsRoot = document.querySelector(
        'div:has(div[role="main"]) div[role="complementary"] > div',
      ) as HTMLDivElement
      if (facebookVideoViewerCommentsRoot) {
        // 获取display
        const computedStyle = window.getComputedStyle(
          facebookVideoViewerCommentsRoot,
        )
        if (computedStyle.position === 'fixed') {
          facebookVideoViewerCommentsRoot.style.right = `0px`
        }
      }
    }

    // 24.04.02: handle Discord client resize
    if (host === 'discord.com') {
      const discordSpecialStyle = document.querySelector(
        '#MAXAI__DISCORD_SPECIAL_STYLE',
      )
      discordSpecialStyle?.remove()
    }
    // 24.04.10: handle Slack client width 100vw
    if (host === 'app.slack.com') {
      const slackSpecialStyle = document.querySelector(
        '#MAXAI__SLACK_SPECIAL_STYLE',
      )
      slackSpecialStyle?.remove()
    }

    if (host === 'twitter.com') {
      document.body.style.position = ''
    }
  }
  // 浏览器自带的pdf文件阅读器
  if (document.querySelector('embed[type="application/pdf"]')) {
    document.body.style.height = ''
  }

  if (BY_OVERFLOW_FLOW_BREAK_UI_HOST_LIST.includes(host)) {
    // 关闭 chat box 的时候 清楚设定的值
    document.body.style.overflow = ''
  }
}

export const showChatBox = () => {
  const htmlElement = document.body.parentElement
  const chatBoxElement = document.getElementById(MAXAI_SIDEBAR_ID)
  if (htmlElement && chatBoxElement) {
    const chatBoxElementWidth =
      chatBoxElement.offsetWidth ||
      CHROME_EXTENSION_USER_SETTINGS_DEFAULT_CHAT_BOX_WIDTH
    htmlElement.style.transition = 'width .1s ease-inout'
    htmlElement.style.width = `calc(100% - ${chatBoxElementWidth}px)`
    htmlElement.style.position = 'relative'
    modifyHTMLStyleForSpecialWebsiteOnChatBoxShow()
    if (!chatBoxElement.classList.contains('open')) {
      chatBoxElement.classList.remove('close')
      chatBoxElement.classList.add('open')
    }
    setTimeout(() => {
      window.dispatchEvent(new Event('resize'))
    }, 300)
    setTimeout(() => {
      window.dispatchEvent(new Event('resize'))
    }, 1000)
  }
}

export const hideChatBox = () => {
  const htmlElement = document.body.parentElement
  const chatBoxElement = document.getElementById(MAXAI_SIDEBAR_ID)
  if (htmlElement && chatBoxElement) {
    htmlElement.style.transition = 'width .1s ease-inout'
    htmlElement.style.width = '100%'
    htmlElement.style.position = ''
    modifyHTMLStyleForSpecialWebsiteOnChatBoxHide()
    chatBoxElement.classList.remove('open')
    chatBoxElement.classList.add('close')
    setTimeout(() => {
      window.dispatchEvent(new Event('resize'))
    }, 300)
  }
}

export const isShowChatBox = () => {
  const chatBoxElement = document.getElementById(MAXAI_SIDEBAR_ID)
  return chatBoxElement?.classList.contains('open') || false
}

/**
 * 更新sidebar chat box的样式
 */
export const debounceUpdateSidebarChatBoxStyle = debounce(() => {
  if (isShowChatBox()) {
    console.log('Client_updateSidebarChatBoxStyle open')
    showChatBox()
  } else {
    console.log('Client_updateSidebarChatBoxStyle close')
    hideChatBox()
  }
}, 100)
