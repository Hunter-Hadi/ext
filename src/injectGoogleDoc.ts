import Browser from 'webextension-polyfill'

const script = document.createElement('script');
script.src = Browser.runtime.getURL('pages/googleDoc/enableCanvasAnnotations.js');
script.setAttribute('data-ext-id', Browser.runtime.id);
document.head.appendChild(script)
