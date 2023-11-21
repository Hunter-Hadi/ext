import AppThemeProvider from '@/components/AppTheme'
import { createShadowRoot } from '@/utils/elementHelper'
import createCache from '@emotion/cache'
import { CacheProvider } from '@emotion/react'
import React from 'react'
import { createRoot } from 'react-dom/client'
import { RecoilRoot } from 'recoil'
import Browser from 'webextension-polyfill'
import SearchWithAIContainer from './components/SearchWithAIContainer'
import {
  SEARCH_WITH_AI_ROOT_ID,
  SEARCH_WITH_AI_SHADOW_CONTAINER_ID,
} from './constants'
import {
  ISearchPageAdapter,
  matchSearchPageConfig,
  ISearchPageKey,
  searchWithAIStyleReset,
  createMindGoogleSidebar,
} from './utils'
import { getSearchWithAISettings } from './utils/searchWithAISettings'
import { preCheckCanRender, preInjectFlag } from './utils/preCheckRender'

const mount = async (
  question: string,
  siteConfig: ISearchPageAdapter,
  siteName: ISearchPageKey,
) => {
  // 检查是否已经挂载
  if (document.getElementById(SEARCH_WITH_AI_ROOT_ID)) {
    return
  }

  const settings = await getSearchWithAISettings()
  if (!settings.enable) {
    return
  }

  const sidebarContainer = siteConfig.sidebarContainerFinder()

  if (sidebarContainer) {
    // change sidebarContainer style
    searchWithAIStyleReset(siteName, sidebarContainer)

    const isDarkMode = siteConfig.isDarkMode()

    const { shadowRoot, emotionRoot, container } = createShadowRoot({
      shadowRootId: SEARCH_WITH_AI_ROOT_ID,
      presetShadowRootElement(shadowRoot) {
        shadowRoot.style.order = '-1'
      },
      containerId: SEARCH_WITH_AI_SHADOW_CONTAINER_ID,
      presetContainerElement(container) {
        container.style.maxWidth = '370px'
        container.style.marginBottom = '20px'
        container.style.fontFamily =
          'Roboto,RobotoDraft,Helvetica,Arial,sans-serif!important'

        isDarkMode && container.classList.add('dark')

        // set custom style
        const customStyle = siteConfig.customStyle
        if (customStyle) {
          // 遍历 customStyle
          Object.keys(customStyle).forEach((key) => {
            container.style.setProperty(key, customStyle[key])
          })
        }
      },
    })

    if (siteName === 'baidu') {
      // 修复百度热搜滚动到底部时与 searchWithAI 的样式冲突
      const searchWithAIInjectStyle = document.createElement('style')
      searchWithAIInjectStyle.textContent = `
        #container.sam_newgrid div[class^="right-ceiling"] {
          position: static !important;
        }
      `
      document.body.append(searchWithAIInjectStyle)
    }
    try {
      const styleResponse = await fetch(
        Browser.runtime.getURL('searchWithAI.css'),
      )
      const styleContent = await styleResponse.text()
      const style = document.createElement('style')
      style.textContent = styleContent
      emotionRoot.append(style)
    } catch (error) {
      console.error('fetch searchWithAI.css error', error)
    }

    // 二次检查是否已经挂载
    if (document.getElementById(SEARCH_WITH_AI_ROOT_ID)) {
      return
    }

    // 再添加前重新获取 sidebarContainer，避免其他插件做的 DOM 操作导致的问题
    const sidebarContainerCover = siteConfig.sidebarContainerFinder()
    if (sidebarContainerCover) {
      sidebarContainerCover.prepend(shadowRoot)
    } else {
      sidebarContainer.prepend(shadowRoot)
    }

    const cache = createCache({
      key: `maxai-search-with-ai-emotion-cache`,
      prepend: true,
      container: emotionRoot,
      speedy: false,
    })

    createRoot(container).render(
      <React.StrictMode>
        <RecoilRoot>
          <CacheProvider value={cache}>
            <AppThemeProvider>
              <SearchWithAIContainer
                question={question}
                siteName={siteName}
                isDarkMode={siteConfig.isDarkMode()}
                rootElement={container}
              />
            </AppThemeProvider>
          </CacheProvider>
        </RecoilRoot>
      </React.StrictMode>,
    )
  } else {
    console.warn('searchWithAI mount failed, siderbarContainer not found')
  }
}

// 判断 sidebar 是否存在，不存在则创建一个
function guardianOfComplementaryBar() {
  const rcnt = document.querySelector<HTMLDivElement>('#rcnt')
  if (rcnt) {
    const complementaryBar = rcnt.querySelector('div[id=rhs]')
    if (!complementaryBar) {
      const newComplementaryBar = createMindGoogleSidebar()
      rcnt.appendChild(newComplementaryBar)
    }
  }
}

type IRunParams = {
  siteConfig: ISearchPageAdapter
  siteName: ISearchPageKey
}

let runLoading = false
let mutationObserver: MutationObserver | null = null
export const run = (runParams: IRunParams) => {
  // console.log(`我执行了 run`)
  const { siteConfig, siteName } = runParams
  if (!siteConfig || runLoading) {
    return
  }

  runLoading = true

  const queryValue = siteConfig.inputQueryFinder()

  console.debug('run searchWithAI on searchInput', queryValue)
  if (queryValue) {
    console.debug('Mount searchWithAI on', siteName)
    mount(queryValue, siteConfig, siteName)
  }
  runLoading = false
}

// let reRenderCount = 0
// const maxRerenderCount = 3
export const initSearchWithAI = () => {
  const { siteName, config: siteConfig } = matchSearchPageConfig()

  if (!siteName || !siteConfig) {
    return
  }

  preInjectFlag()

  if (!preCheckCanRender()) {
    return
  }

  if (siteName === 'google') {
    guardianOfComplementaryBar()
  }

  if (siteConfig.watchRouteChange) {
    siteConfig.watchRouteChange(() => {
      preInjectFlag()

      preCheckCanRender() &&
        run({
          siteConfig,
          siteName,
        })
    })
  }

  run({
    siteConfig,
    siteName,
  })

  if (siteName === 'google') {
    const rcnt = document.querySelector<HTMLDivElement>('div#rcnt')
    if (rcnt) {
      mutationObserver = new MutationObserver(async (mutations) => {
        /**
         * 监听 rcnt 子元素的变化
         * 如果变化中包含 rhs 元素的变化，就去页面上找是否存在两个 sideBar (id === rhs 的元素)
         * 存在的话（有两个 sideBar 说明已经存在页面样式错乱）
         * remove 掉带有（data-by === webchatgpt）的元素，然后重新执行 一次 run
         */
        mutations.forEach((mutation) => {
          if (
            mutation.addedNodes.length > 0 ||
            (mutation.target as HTMLElement).id === 'rhs'
          ) {
            const rhsEls = document.querySelectorAll<HTMLElement>('div#rhs')
            if (rhsEls.length > 1) {
              rhsEls.forEach((item) => {
                if (item.dataset.by === 'webchatgpt') {
                  item.remove()
                  run({
                    siteConfig,
                    siteName,
                  })
                }
              })
            }
          }
        })
      })
      mutationObserver.observe(rcnt, { childList: true, subtree: true })
    }
  }

  document.addEventListener('readystatechange', () => {
    run({
      siteConfig,
      siteName,
    })

    if (document.readyState === 'complete') {
      setTimeout(() => {
        mutationObserver && mutationObserver.disconnect()
      }, 1000)
    }
  })
}
