chrome.runtime.onMessage.addListener((message, sender) => {
  if (message.data) {
    chrome.tabs.query({
      pinned: true
    }, tabs => {
      chrome.tabs.sendMessage(tabs[0].id, message.data);
    })
  }
})
