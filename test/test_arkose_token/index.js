const postMessageToChildren = () => {
  const iframes = document.querySelectorAll('iframe')
  for (let i = 0; i < iframes.length; i++) {
    const frame = iframes[i]
    const data = {
      data: undefined,
      key: '35536E1E-65B4-4D96-9D97-6ADB7EFF8147',
      message: 'show enforcement',
      type: 'emit',
    }
    // post message
    if (frame.contentWindow && frame.contentWindow.postMessage) {
      frame.contentWindow.postMessage(JSON.stringify(data), '*')
    }
  }
}
