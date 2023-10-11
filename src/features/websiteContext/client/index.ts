import { IWebsiteContext } from '@/features/websiteContext/background'
import { ContentScriptConnectionV2 } from '@/features/chatgpt'
import { getCurrentDomainHost } from '@/utils'

const port = new ContentScriptConnectionV2()

/**
 * 创建网站数据
 * @param websiteContext
 */
export const clientCreateWebsiteContext = async (
  websiteContext?: Partial<IWebsiteContext>,
) => {
  const result = await port.postMessage({
    event: 'WebsiteContext_createWebsiteContext',
    data: {
      websiteContext: {
        url: window.location.href || location.href || document.location.href,
        host: getCurrentDomainHost(),
        html: document.documentElement.outerHTML,
        ...websiteContext,
      },
    },
  })
  return result.data as IWebsiteContext | null
}

export const clientGetWebsiteContext = async (query: {
  id?: string
}): Promise<IWebsiteContext | null> => {
  const result = await port.postMessage({
    event: 'WebsiteContext_getWebsiteContext',
    data: {
      ...query,
    },
  })
  if (result.success) {
    return result.data
  } else {
    return null
  }
}
export const clientSearchWebsiteContext = async (
  query: Partial<IWebsiteContext>,
): Promise<IWebsiteContext[]> => {
  // TODO
  return Promise.resolve([])
}
export const clientDeleteWebsiteContext = async (
  id: string,
): Promise<boolean> => {
  const result = await port.postMessage({
    event: 'WebsiteContext_deleteWebsiteContext',
    data: {
      id,
    },
  })
  return result.success
}

export const clientClearAllWebsiteContext = async (): Promise<boolean> => {
  const result = await port.postMessage({
    event: 'WebsiteContext_clearAllWebsiteContext',
    data: {},
  })
  return result.success
}

export const clientUpdateWebsiteContext = async (
  query: {
    id?: string
  },
  websiteContext: Partial<IWebsiteContext>,
): Promise<boolean> => {
  if (!query.id) {
    return false
  }
  const result = await port.postMessage({
    event: 'WebsiteContext_updateWebsiteContext',
    data: {
      query,
      websiteContext,
    },
  })
  return result.success
}
