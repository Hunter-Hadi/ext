/**
 * youtube studio下对应按钮的跳转链接在dom节点的data属性上
 * content scripts里获取不到，这里以这种方式设置在节点attr上再获取
 */
setInterval(() => {
  Array.from(document?.querySelectorAll('ytcp-comment-button')).forEach(
    (item: Element) => {
      const data = (item as any).data
      if (data) {
        item.setAttribute(
          'data-ytb-url',
          data.navigationEndpoint?.urlEndpoint?.url,
        )
      }
    },
  )
}, 2000)
