const modifyManifest = ({ env, isProd }) => ({
  name: 'modify-manifest',
  generateBundle(_options, bundle) {
    console.log('modify-manifest!!!!', isProd)
    const manifest = bundle['manifest.json']
    const manifestContent = JSON.parse(manifest.source)
    // console.log(manifestContent)
    // TODO - this is a hack to inject the fetch polyfill into the manifest
    // 防止频繁429的保底方案
    // manifestContent.content_scripts.push({
    //   js: ['inject-fetch.min.js'],
    //   matches: ['https://chat.openai.com/*'],
    //   run_at: 'document_start',
    // })
    const formatUrl = (arr, editKey) => {
      return arr.map((item) => {
        if (item && item[editKey]) {
          item[editKey] = item[editKey].map((url) => {
            return url === 'https://*/*' ? '<all_urls>' : url
          })
        }
        return item
      })
    }
    manifestContent.content_scripts = formatUrl(
      manifestContent.content_scripts,
      'matches',
    )
    manifestContent.web_accessible_resources = formatUrl(
      manifestContent.web_accessible_resources,
      'matches',
    )
    if (isProd) {
      manifestContent.content_scripts = manifestContent.content_scripts.map(
        (contentScript) => {
          if (contentScript.js[0] === 'check_status.js') {
            contentScript.matches = ['https://app.usechatgpt.ai/*']
          }
          return contentScript
        },
      )
    }
    manifest.source = JSON.stringify(manifestContent, null, 2)
  },
})
export default modifyManifest
