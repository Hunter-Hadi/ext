import clipboardy from 'clipboardy'
import open from 'open'

/**
 * how to use
 * 如何更新 discover.json
 *
 * 1. 命令行跑 node update-discover.mjs，会自动打开 discover 页面和 discover.json 文件
 * 2. crawlingScript 会自动复制到粘贴板，直接粘贴到 console 里面运行
 * 3. 复制 console 里面的结果，粘贴到 src/features/onboarding/constants/discover.json 文件里面
 * 4. 保存文件，然后 commit 到 git 仓库
 *
 */

async function updateDiscover() {
  /* crawling script */
  const crawlingScript = `(function crawlingPerplexityDiscover() {
  const items = Array.from(document.querySelectorAll('div.mx-auto.h-full.w-full div.divide-y > div'));
  const data = items.map(item => {
    const title = item.querySelector('div[data-testid=thread-title]').innerText;
    return {
      title,
    };
  })
  // console.log(JSON.stringify(data, {}, 2));
  console.log("copy this:", data);
})()`

  // 将文本复制到剪贴板
  clipboardy.writeSync(crawlingScript)

  console.log(`The crawling script has been copied to your clipboard`)

  open('src/features/onboarding/constants/discover.json')
  open('https://www.perplexity.ai/discover')
}

updateDiscover()
