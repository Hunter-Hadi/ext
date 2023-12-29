import {
  getPossibleElementByQuerySelector,
  insertAfter,
} from '@/utils/elementHelper'

type ISearchPageKey =
  | 'google'
  | 'bing'
  | 'baidu'
  | 'duckduckgo'
  | 'yahoo'
  | 'naver'
  | 'yandex'
  | 'sogou'
  | 'brave'

interface ISearchPageAdapter {
  ref: string
  verifier: () => boolean
  inputQueryFinder: () => string
  sidebarContainerFinder: () => HTMLElement | undefined | null
  isDarkMode: () => boolean
  customStyle?: Record<string, string>
  watchRouteChange?: (callback: () => void) => void
}

const SearchPageAdapter: Record<ISearchPageKey, ISearchPageAdapter> = {
  // flag: verifier
  google: {
    ref: 'google',
    verifier: () => {
      return (
        location.hostname.startsWith('www.google') &&
        location.pathname.startsWith('/search')
      )
    },
    inputQueryFinder: () => {
      const searchInput = getPossibleElementByQuerySelector<HTMLInputElement>([
        "input[name='q']",
        "textarea[type='search']",
      ])

      return searchInput?.value || ''
    },
    sidebarContainerFinder: () => {
      const googleSidebarElement = document.querySelector<HTMLDivElement>(
        '#rcnt',
      )
      if (googleSidebarElement) {
        const complementaryBarOriginal = googleSidebarElement.querySelector<HTMLElement>(
          'div#rhs[role=complementary]',
        )
        if (complementaryBarOriginal) {
          return complementaryBarOriginal
        }

        // 兼容下 google for search 插件创建的 rhs
        const googleForSearchExtensionBar = googleSidebarElement.querySelector<HTMLElement>(
          'div#rhs',
        )
        if (googleForSearchExtensionBar) {
          return googleForSearchExtensionBar
        }

        // 兼容下 SEO Minion 插件创建的 siderbar
        // const SEOMinionExtensionBar = rcnt.querySelector<HTMLElement>(
        //   'div#smin-widgets-root',
        // )
        // if (SEOMinionExtensionBar) {
        //   return SEOMinionExtensionBar
        // }

        // not complementaryBar
        const mindComplementaryBar = createMindGoogleSidebar()

        const centerColBox = googleSidebarElement.querySelector('#center_col')
        if (centerColBox) {
          insertAfter(mindComplementaryBar, centerColBox)
        } else {
          googleSidebarElement.appendChild(mindComplementaryBar)
        }
        return mindComplementaryBar
      }
      return undefined
    },
    isDarkMode: () =>
      !!document.querySelector('meta[content=dark]') ||
      !!document.querySelector('*[data-darkmode=true]'),
  },
  bing: {
    ref: 'bing',
    verifier: () => {
      return (
        location.hostname.includes('.bing.') &&
        location.pathname.startsWith('/search')
      )
    },
    sidebarContainerFinder: () =>
      document.querySelector<HTMLElement>('aside > ol#b_context'),
    inputQueryFinder: () => {
      const searchInput = getPossibleElementByQuerySelector<HTMLInputElement>([
        '#sp_requery a',
        'input[name=q]',
        'input.b_searchbox',
        'textarea.b_searchbox',
      ])
      return searchInput?.value || searchInput?.textContent || ''
    },
    customStyle: {
      margin: '0 -20px 20px',
    },
    isDarkMode: () => false,
  },
  baidu: {
    ref: 'baidu',
    verifier: () => {
      return location.hostname.startsWith('www.baidu')
    },
    sidebarContainerFinder: () =>
      document.querySelector<HTMLElement>('div#content_right'),
    inputQueryFinder: () => {
      const bds = (window as any).bds
      if (bds?.comm?.query) {
        return bds.comm.query
      }

      const searchInput = getPossibleElementByQuerySelector<HTMLInputElement>([
        'input[name=wd]',
      ])
      return searchInput?.value || ''
    },
    watchRouteChange(callback) {
      const targetNode = document.getElementById('wrapper_wrapper')!
      const observer = new MutationObserver(function (records) {
        for (const record of records) {
          if (record.type === 'childList') {
            for (const node of record.addedNodes as any) {
              if ('id' in node && node.id === 'container') {
                callback()
                return
              }
            }
          }
        }
      })
      observer.observe(targetNode, { childList: true })
    },
    isDarkMode: () => false,
  },
  duckduckgo: {
    ref: 'duckduckgo',
    verifier: () => {
      return location.hostname === 'duckduckgo.com' && location.pathname === '/'
    },
    sidebarContainerFinder: () => {
      return document.querySelector<HTMLElement>(
        'section.js-react-sidebar[data-area=sidebar]',
      )
    },
    inputQueryFinder: () => {
      const searchInput = getPossibleElementByQuerySelector<HTMLInputElement>([
        'div[data-testid=spelling-message] p a',
        'input#search_form_input',
      ])
      return searchInput?.value || searchInput?.textContent || ''
    },
    isDarkMode: () => !!document.querySelector('html.dark-header'),
  },
  yahoo: {
    ref: 'yahoo',
    verifier: () => {
      return (
        location.hostname.includes('search.yahoo') &&
        location.pathname.startsWith('/search')
      )
    },
    sidebarContainerFinder: () => {
      return document.querySelector<HTMLElement>('div#results div#right')
    },
    inputQueryFinder: () => {
      const searchInput = getPossibleElementByQuerySelector<HTMLInputElement>([
        'input[name=p]',
      ])
      return searchInput?.value || ''
    },
    isDarkMode: () => false,
  },
  naver: {
    ref: 'naver',
    verifier: () => {
      return (
        location.hostname.includes('search.naver') &&
        location.pathname.startsWith('/search')
      )
    },
    sidebarContainerFinder: () => {
      return document.querySelector<HTMLElement>('div#sub_pack')
    },
    inputQueryFinder: () => {
      const searchInput = getPossibleElementByQuerySelector<HTMLInputElement>([
        'div.dsc_area strong.source',
        'input[name=query]',
      ])
      return searchInput?.value || searchInput?.textContent || ''
    },
    customStyle: {
      margin: '0 30px 20px 16px',
    },
    isDarkMode: () => false,
  },
  yandex: {
    ref: 'yandex',
    verifier: () => {
      return (
        location.host.includes('yandex') &&
        location.pathname.startsWith('/search')
      )
    },
    sidebarContainerFinder: () => {
      return document.querySelector<HTMLElement>(
        'div.main__content div#search-result-aside',
      )
    },
    inputQueryFinder: () => {
      const searchInput = getPossibleElementByQuerySelector<HTMLInputElement>([
        'input.HeaderDesktopForm-Input[name=text]',
      ])
      return searchInput?.value || ''
    },
    isDarkMode: () =>
      !!document.querySelector('meta[name=color-scheme][content=dark]'),
  },
  sogou: {
    ref: 'sogou',
    verifier: () => {
      return (
        location.host.includes('sogou') &&
        (location.pathname.startsWith('/web') ||
          location.pathname.startsWith('/sogou'))
      )
    },
    sidebarContainerFinder: () => {
      return document.querySelector<HTMLElement>('div#wrapper div#right')
    },
    inputQueryFinder: () => {
      const searchInput = getPossibleElementByQuerySelector<HTMLInputElement>([
        'input#upquery[name=query]',
      ])
      return searchInput?.value || ''
    },
    isDarkMode: () => false,
  },
  brave: {
    ref: 'brave',
    verifier: () => {
      return (
        location.host.includes('search.brave') &&
        location.pathname.startsWith('/search')
      )
    },
    sidebarContainerFinder: () => {
      return document.querySelector<HTMLElement>('aside.sidebar')
    },
    inputQueryFinder: () => {
      const searchInput = getPossibleElementByQuerySelector<HTMLInputElement>([
        'div.altered-query-text a',
        'input[id=searchbox]',
      ])
      return searchInput?.value || searchInput?.textContent || ''
    },
    isDarkMode: () => !!document.querySelector('img.theme--dark'),
  },
}

function matchSearchPageConfig() {
  let siteName: ISearchPageKey | null = null
  const pageKeys = Object.keys(SearchPageAdapter) as ISearchPageKey[]
  for (let i = 0; i < pageKeys.length; i++) {
    const key = pageKeys[i]
    const verifier = SearchPageAdapter[key].verifier
    if (verifier()) {
      siteName = key
      break
    }
  }

  return {
    siteName,
    config: siteName ? SearchPageAdapter[siteName] : null,
  }
}

// 创建 google 搜索页的边栏
function createMindGoogleSidebar() {
  const mindComplementaryBar = document.createElement('div')
  mindComplementaryBar.setAttribute('role', 'complementary')
  mindComplementaryBar.setAttribute('id', 'rhs')
  mindComplementaryBar.setAttribute('data-by', 'webchatgpt')

  const searchParams = new URLSearchParams(location.search)
  if (searchParams.get('tbm') === 'nws') {
    mindComplementaryBar.style.marginLeft = '30px'
  }
  // style
  // mindComplementaryBar.style.height = 'max-content'
  // mindComplementaryBar.style.marginLeft = 'var(--rhs-margin)'
  // mindComplementaryBar.style.width = 'var(--rhs-width)'
  // mindComplementaryBar.style.flex = '0 auto'
  // mindComplementaryBar.style.position = 'relative'
  // mindComplementaryBar.className = 'google-s-ad__wrapper'
  return mindComplementaryBar
}

export {
  createMindGoogleSidebar,
  ISearchPageAdapter,
  ISearchPageKey,
  matchSearchPageConfig,
  SearchPageAdapter,
}
