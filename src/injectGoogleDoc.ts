import Browser from 'webextension-polyfill'

const script = document.createElement('script');
script.src = Browser.runtime.getURL('pages/googleDoc/enableCanvasAnnotations.js');
// script.setAttribute('data-ext-id', Browser.runtime.id);
// 未申请白名单，此处伪造Wordtune的id
script.setAttribute('data-ext-id', 'nllcnknpjnininklegdoijpljgdjkijc');
document.head.appendChild(script)
