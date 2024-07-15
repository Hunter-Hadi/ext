/**
 * 清洗document里的内容
 *
 * 和pageContentHelper不同，document可能是从html文本里解析的结果
 */

/**
 * 解析document，手动清洗掉无用元素
 * @param doc
 * @param needRemove 是否删除节点，为false会给对应节点加上hidden的样式
 */
export const parseReadabilityDocument = (doc: Document, needRemove = false) => {
  // 先清洗掉header和footer无用的标签
  const header = doc.querySelector('header')
  const footer = doc.querySelector('footer')
  // TODO 有其他需要清洗的标签可以在此处处理
  if (needRemove) {
    header?.remove()
    footer?.remove()
    // 移除style/script/noscript标签
    // 某些网站下p标签内嵌入style等标签会导致获取textContent内容有误
    // 会影响isProbablyReaderable方法的判断
    doc.querySelectorAll('script, style, noscript').forEach((item) => {
      item.remove()
    })
    // 大部分网站的cookie弹窗
    doc.querySelector('#onetrust-consent-sdk')?.remove()
  } else {
    header?.classList.add('maxai-reading-hidden')
    footer?.classList.add('maxai-reading-hidden')
  }

  const restore = () => {
    if (needRemove) return
    header?.classList.remove('maxai-reading-hidden')
    footer?.classList.remove('maxai-reading-hidden')
  }
  return restore
}
