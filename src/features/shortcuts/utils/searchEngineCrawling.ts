import cheerio from 'cheerio'

import URLSearchEngine from '@/features/shortcuts/types/IOS_WF/URLSearchEngine'
import {
  checkIsDomain,
  domain2HttpsDomain,
  string2DomainFaviconUrl,
} from '@/utils/dataHelper/stringHelper'

export interface ICrawlingSearchResult {
  title: string // 标题
  body: string // 内容
  url: string // 地址
  from?: string // 内容来源
  favicon?: string // 内容来源的品牌图片地址
  searchQuery?: string // 搜索的关键词
  // knowledgePanel?: string // 知识面板
}

const isFileUrl = (url: string) => {
  try {
    const parsedURL = new URL(url)

    const ext = parsedURL.pathname.split('.').pop() || ''

    if (['doc', 'xls', 'ppt', 'pdf', 'zip', 'rar', 'apk'].includes(ext)) {
      return true
    }
    return false
  } catch (error) {
    return false
  }
}
export function crawlingSearchResults({
  html,
  searchEngine,
  searchQuery,
}: {
  html: string
  searchEngine: URLSearchEngine | string
  searchQuery: string
}) {
  try {
    const results: ICrawlingSearchResult[] = CrawlingResultsWithEngine(
      html,
      searchEngine,
    ).map((result) => {
      if (!result.searchQuery) {
        result.searchQuery = searchQuery
      }
      return result
    })
    /**
     * Empty filter
     *
     * 1. 判定是否为 empty url不能为空，并且title和content必须有一项有值
     * 3. 再根据用户选择的 limit 切片
     */
    const filteredResult = results.filter((item) => {
      // 爬虫不支持爬取 file url
      if (isFileUrl(item.url)) {
        return false
      }

      return item.url && (item.body || item.title)
    })
    return filteredResult
  } catch (error) {
    return []
  }
}

function extractRealUrl(url: string) {
  const match = url.match(/RU=([^/]+)/)
  if (match && match[1]) {
    return decodeURIComponent(match[1])
  }

  return url
}

const CrawlingResultsWithEngine = (
  html: string,
  searchEngine: URLSearchEngine | string,
) => {
  try {
    console.log(`html12`, html)

    const $ = cheerio.load(html)
    let results: ICrawlingSearchResult[] = []

    switch (searchEngine) {
      case 'google': {
        // 20230919 更新 不获取 rightPanel 的内容
        const rightPanel = $('#rhs')

        const knowledgePanel = rightPanel.find('.osrp-blk')
        console.log(`rightPanel:`, rightPanel)
        console.log(`knowledgePanel:`, knowledgePanel)
        // .rVusze 每条可能有超链接的
        // 图片可以抓 .hUqmeb g-img[data-lpage]

        if (knowledgePanel && knowledgePanel.length) {
          const knowledgePanelTitleContent = knowledgePanel.find('.KsRP6')
          console.log(`knowledgePanelTitleContent:`, knowledgePanelTitleContent)

          const knowledgePanelTitleImgSrc = knowledgePanelTitleContent
            .find('.hUqmeb>g-img')
            .attr('data-lpage')
          console.log(`knowledgePanelTitleImgSrc:`, knowledgePanelTitleImgSrc)

          const knowledgePanelTitle = knowledgePanelTitleContent
            .find('[data-attrid^="title"]')
            .text()

          const knowledgePanelLink = knowledgePanel
            .find('.kno-rdesc')
            .text()
            .trim()
          // const knowledgePanelLink = knowledgePanel.find('.kno-rdesc a[href]')
          const knowledgePanelInfo = knowledgePanel
            .find('div.wp-ms')
            .text()
            .trim()

          // results.push({
          //   title: knowledgePanelTitle,
          //   body: knowledgePanelInfo,
          //   url: extractRealUrl(knowledgePanelLink.attr('href') ?? ''),
          // })
          console.log(`knowledgePanelInfo:`, knowledgePanelInfo)
          console.log(`knowledgePanelLink:`, knowledgePanelLink)
        }

        const searchItems = $('#search #rso > div')
        if (searchItems.length === 1) {
          // 兼容 kp-wp-tab-overview 类型
          const searchBox = $('#rso #kp-wp-tab-overview:not([style])')
          if (searchBox.length > 0) {
            $(
              '#rso #kp-wp-tab-overview:not([style]) div[class*="K7khPe"]',
            ).each((_, el) => {
              const element = $(el)
              const titleElement = element.find('a > h3')
              const aElement = titleElement.closest('a')
              let bodyText = element.find('div.MUxGbd').text()

              if (!bodyText) {
                const maybeBodyElement = element
                  .find('div[style]')
                  .filter((_, el) => {
                    return !!$(el)
                      ?.attr('style')
                      ?.includes('-webkit-line-clamp')
                  })
                bodyText = $(maybeBodyElement[0]).text().trim()
              }

              const metaInfoEl = titleElement.next()

              const url = extractRealUrl(aElement.attr('href') ?? '')

              const from = metaInfoEl
                ?.children()
                ?.last()
                ?.children()
                ?.first()
                ?.text()

              const titleText = titleElement.text()

              if (titleText) {
                results.push({
                  title: titleText,
                  // body 为空时，用 title 覆盖
                  body: bodyText ? bodyText : titleText,
                  url,
                  from: from,
                  favicon: metaInfoEl?.find('img')?.attr('src'),
                })
              }
            })
          }

          // is News tab (tbm=nws)
          $('#search #rso > div a[data-ved]')
            .filter((_, el) => !!$(el).find('div[role=heading]').text())
            .each((_, el) => {
              const element = $(el)
              const titleElement = element.find('div[role=heading]')
              const titleText = titleElement.text()
              const bodyText = titleElement.next().text()
              const metaInfoEl = titleElement.prev()
              const url = extractRealUrl(element.attr('href') ?? '')
              results.push({
                title: titleText,
                // body 为空时，用 title 覆盖
                body: bodyText ? bodyText : titleText,
                url: url,
                from: metaInfoEl.text(),
                favicon: metaInfoEl.find('img')?.attr('src'),
              })
            })
        } else {
          searchItems
            .filter((_, el) => !!$(el).find('a > h3').text())
            .each((_, el) => {
              const element = $(el)

              const titleElement = element.find('a > h3')
              const aElement = titleElement.closest('a')
              let bodyText = element.find('div.MUxGbd').text()
              if (!bodyText) {
                // 带视频的 search item
                bodyText = aElement
                  ?.parent()
                  ?.parent()
                  ?.parent()
                  .next()
                  .text()
                  .trim()
              }

              if (!bodyText) {
                // 带图片的 search item
                bodyText = aElement
                  ?.parent()
                  ?.parent()
                  ?.parent()
                  .next()
                  .next()
                  .text()
                  .trim()
              }

              if (!bodyText) {
                const maybeBodyElement = element
                  .find('div[style]')
                  .filter((_, el) => {
                    return !!$(el)
                      ?.attr('style')
                      ?.includes('-webkit-line-clamp')
                  })
                bodyText = $(maybeBodyElement[0]).text().trim()
              }

              const titleText = titleElement.text()

              const metaInfoEl = titleElement.next()

              const url = extractRealUrl(aElement.attr('href') ?? '')

              const from = metaInfoEl
                ?.children()
                ?.last()
                ?.children()
                ?.last()
                ?.children()
                ?.first()
                ?.text()

              results.push({
                title: titleText,
                // body 为空时，用 title 覆盖
                body: bodyText ? bodyText : titleText,
                url,
                from: from,
                favicon: metaInfoEl?.find('img')?.attr('src'),
              })
            })
        }

        break
      }
      case 'bing': {
        // 20230919 更新 不获取 rightPanel 的内容
        // const rightPanel = $('.utilAns')
        // if (rightPanel && rightPanel.length) {
        //   const rightPanelLink = rightPanel.find('a.l_ecrd_a1_seemorelink')
        //   const rightPanelTitle = rightPanel.find('.l_ecrd_hero_txt')
        //   const rightPanelInfo = rightPanel.find('.b_snippet')
        //   results.push({
        //     title: rightPanelTitle),
        //     body: rightPanelInfo),
        //     url: extractRealUrl(rightPanelLink.attr('href') ?? ''),
        //   })
        // }

        $('ol#b_results li.b_algo').each((_, el) => {
          const element = $(el)
          const titleElement = element.find('h2 > a')

          let bodyText = element.find('.b_algoSlug').text()
          if (!bodyText) {
            // wikipedia tab 类型
            bodyText = element
              .find('.b_wikiRichcard .tab-content')
              .text()
              .trim()
          }

          results.push({
            title: titleElement.text() ?? '',
            body: bodyText ?? '',
            url: extractRealUrl(titleElement.attr('href') ?? ''),
            from: element.find('a .tptt').text(),
            favicon: element.find('img.rms_img').attr('src'),
          })
        })
        break
      }
      case 'baidu': {
        $('div#content_left div[class^=result]').each((_, el) => {
          const element = $(el)
          const titleElement = element.find('h3')
          const linkElement = titleElement.find('a')

          let bodyText = element.find('div[class*=description_]').text()
          if (!bodyText) {
            // 兼容 翻译结果
            bodyText = element.find('.op_dict_content').text()
          }
          if (!bodyText) {
            // 兼容 视频百科
            bodyText = element.find('div[class*=basis-info_]').text()
          }
          if (!bodyText) {
            // 兼容 百度百科
            bodyText = element.find('.c-color-text').text()
          }
          if (!bodyText) {
            bodyText = titleElement.next().next().text()
          }

          const metaInfoEl = element.find('a[class^=siteLink]')

          results.push({
            title: titleElement.text(),
            body: bodyText ?? '',
            url: extractRealUrl(linkElement.attr('href') ?? ''),
            from: metaInfoEl.text(),
            favicon: metaInfoEl.find('img')?.attr('src'),
          })
        })
        break
      }
      case 'duckduckgo': {
        // 20230919 更新 不获取 rightPanel 的内容
        // const rightPanel = $('ol.react-results--sidebar > li')
        // if (rightPanel.length) {
        //   const rightPanelLink = rightPanel.find('.module__more-at')
        //   const rightPanelTitle = rightPanel.find('.module__title')
        //   const rightPanelBody = rightPanel.find('.module__text')

        //   results.push({
        //     title: rightPanelTitle),
        //     body: rightPanelBody),
        //     url: extractRealUrl(rightPanelLink.attr('href') ?? ''),
        //   })
        // }
        $('ol.react-results--main li[data-layout=organic]').each((_, el) => {
          const element = $(el)
          const titleElement = element.find('h2 > a')

          const extrasLink = element.find(
            'a[data-testid=result-extras-url-link]',
          )
          const fromImg = extrasLink.parent()

          const url = extractRealUrl(titleElement.attr('href') ?? '')

          results.push({
            title: titleElement.text(),
            body: element.find('div[data-result=snippet]').text(),
            url,
            // duckduckgo 的from 用url 来生成
            from: getNameByUrl(url) || extrasLink.children().first().text(),
            // from: extrasLink.children().first().text(),
            favicon: fromImg.find('a > img')?.attr('src'),
          })
        })
        break
      }
      case 'yahoo': {
        // 20230919 更新 不获取 rightPanel 的内容
        // const rightPanel = $('#right .searchRightTop')
        // if (rightPanel.length) {
        //   const rightPanelLink = rightPanel.find('.compText a').first()
        //   const rightPanelInfo = rightPanel.find('.compInfo li')
        //   const rightPanelInfoText = rightPanelInfo
        //     .map((_, el) => $(el)))
        //     .get()
        //     .join('\n')

        //   results.push({
        //     title: rightPanelLink),
        //     body: `${rightPanel.find('.compText'))}${
        //       rightPanelInfoText ? `\n\n${rightPanelInfoText}` : ''
        //     }`,
        //     url: extractRealUrl(rightPanelLink.attr('href') ?? ''),
        //   })
        // }
        $('.algo:not([class*="ad"])').each((_, el) => {
          const element = $(el)
          const titleElement = element.find('h3.title a')

          const url = extractRealUrl(titleElement.attr('href') ?? '')

          const originArr = titleElement.find('span').text().split(' › ')

          results.push({
            title: titleElement.attr('aria-label') ?? '',
            body: element.find('.compText').text(),
            url,
            from: getNameByUrl(url) || originArr[0],
          })
        })
        break
      }
      case 'naver': {
        $('ul.lst_total > li.bx').each((_, el) => {
          const element = $(el)
          let titleElement = element.find('a.link_tit')
          if (!titleElement || titleElement.length <= 0) {
            titleElement = element.find('a.total_tit')
          }
          const url = extractRealUrl(titleElement.attr('href') ?? '')
          const imgLink = element.find('a.thumb img').attr('src')

          results.push({
            title: titleElement.text(),
            body: element.find('.dsc_txt').text(),
            url,
            from: getNameByUrl(url),
            favicon: imgLink,
          })
        })
        break
      }
      case 'yandex': {
        // 20230919 更新 不获取 rightPanel 的内容
        // const rightPanel = $(
        //   'div[data-fast-name=entity_search] .composite__item',
        // )
        // if (rightPanel && rightPanel.length) {
        //   const rightPanelLink = rightPanel.find('.Link')
        //   const rightPanelTitle = rightPanel.find(
        //     '.entity-search__header-wrapper .serp-title',
        //   )
        //   const rightPanelBody = rightPanel.find('.Description')

        //   results.push({
        //     title: rightPanelTitle),
        //     body: rightPanelBody),
        //     url: extractRealUrl(rightPanelLink.attr('href') ?? ''),
        //   })
        // }
        $('.content__left ul.serp-list > li.serp-item').each((_, el) => {
          const element = $(el)
          const titleElement = element.find('a.organic__url')

          const url = extractRealUrl(titleElement.attr('href') ?? '')
          const favicon = element.find('.Favicon-Icon').css('background-image')
          const imgLink = favicon?.slice(5).slice(0, -2)

          results.push({
            title: titleElement.text(),
            body: element.find('.organic__content-wrapper').text(),
            url,
            favicon: imgLink,
            from: getNameByUrl(url),
          })
        })
        break
      }
      case 'sogou': {
        $('.results div.vrwrap').each((_, el) => {
          const element = $(el)
          const titleElement = element.find('h3.vr-title a')
          let bodyText = element.find('.text-layout').text()
          if (!bodyText) {
            // 兼容 翻译结果
            bodyText = element.find('.word-result').text()
          }
          if (!bodyText) {
            // 兼容 百科
            bodyText = element.find('.space-txt').text()
          }

          // sogou 特殊处理
          // 如果url是 / 开头，需要拼接 location.origin
          let url = extractRealUrl(titleElement.attr('href') ?? '')
          const baseDomain = 'https://www.sogou.com'
          url = url.startsWith('/') ? baseDomain + url : url

          const fromTextArr = element
            .find('.citeurl')
            .text()
            .replace(/\n\s*/g, '')
            .split('-')

          const fromText = fromTextArr.find((str) => {
            try {
              let text = str.trim().replace('...', '')
              if (text.includes('/')) {
                text = text.split('/')[0]
              }
              return checkIsDomain(text)
            } catch (error) {
              return false
            }
          })

          const from = getNameByUrl(fromText || '')

          results.push({
            title: titleElement.text(),
            body: bodyText,
            url,
            from,
            favicon: string2DomainFaviconUrl(from),
          })
        })
        break
      }
      case 'brave': {
        // 20230919 更新 不获取 rightPanel 的内容
        // const rightPanel = $('div#infobox')
        // if (rightPanel && rightPanel.length) {
        //   const rightPanelLink = rightPanel.find('a.infobox-title')
        //   const rightPanelBody = rightPanel.find('.body')

        //   results.push({
        //     title: rightPanelLink),
        //     body: rightPanelBody),
        //     url: extractRealUrl(rightPanelLink.attr('href') ?? ''),
        //   })
        // }
        $('#results > .snippet[data-type=web]').each((_, el) => {
          const element = $(el)
          let titleElement = element.find('.snippet-title')
          let title = titleElement.text()
          let linkElement = titleElement.closest('a')
          const imgLink = element.find('img.favicon').attr('src')

          if (!title) {
            titleElement = element.find('a > div.url')
            title = titleElement.text()
            linkElement = titleElement.closest('a')
          }

          let bodyText = element.find('.snippet-content').text()

          if (!bodyText) {
            // 兼容 视频图文
            bodyText = element.find('.snippet-description').text()
          }

          const metaInfoEl = element.find('.snippet-url')
          let from = metaInfoEl.children().first().text()

          if (element.attr('id') === 'discussions') {
            // 兼容 discussions 模块
            title = element.find('.question > p.title').text()
            bodyText = element.find('.faq-a').text()
            linkElement = element.find('a.source').first()
            from = element.find('img.forum-name').text()
          }

          const url = extractRealUrl(linkElement.attr('href') ?? '')

          results.push({
            title,
            body: bodyText,
            url,
            favicon: imgLink,
            from,
          })
        })
        break
      }
      default: {
        return []
      }
    }

    results = results.map((item) => {
      const newItem = {
        ...item,
      }

      // 如果没有 from 字段尝试从 url 中获取
      if (!newItem.from) {
        newItem.from = getNameByUrl(newItem.url)
      }

      // 删除 from 字段 . 之后的所有字符
      if (newItem.from) {
        // 正则去除 . 之后的所有字符
        newItem.from = newItem.from.replace(/\.[^.]*$/, '')
      }

      if (!newItem.favicon && newItem.url) {
        newItem.favicon = string2DomainFaviconUrl(newItem.url)
      }

      // cleanText
      newItem.from = cleanText(newItem.from)
      newItem.body = cleanText(newItem.body)
      newItem.title = cleanText(newItem.title)

      return newItem
    })

    return results
  } catch (error) {
    console.log(`CrawlingResultsWithEngine error`, searchEngine, error)
    return []
  }
}

function cleanText(text: string) {
  return text.trim().replace(/\n/g, '') || ''
}

function getNameByUrl(url: string) {
  try {
    const uri = domain2HttpsDomain(url.trim().replace(/.../g, ''))
    const urlObj = new URL(uri)
    const hostArr = urlObj.host.split('.')
    return hostArr.length >= 3 ? hostArr[1] : hostArr[0]
  } catch (error) {
    return url
  }
}
