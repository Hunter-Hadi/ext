const modifyManifest = ({ env, isProd }) => ({
  name: 'modify-manifest',
  generateBundle(_options, bundle) {
    console.log('modify-manifest!!!!', isProd)
    const manifest = bundle['manifest.json']
    const manifestContent = JSON.parse(manifest.source)
    // console.log(manifestContent)
    // HACK: this is a hack to inject the fetch polyfill into the manifest
    // 防止频繁429的保底方案
    // manifestContent.content_scripts.push({
    //   js: ['inject-fetch.min.js'],
    //   matches: ['https://chat.openai.com/*'],
    //   run_at: 'document_start',
    // })
    const formatUrl = (arr, editKey) => {
      return arr.map((item) => {
        if (item && item[editKey]) {
          if (isProd) {
            item[editKey] = ['<all_urls>']
          } else {
            item[editKey] = item[editKey].map((url) => {
              return url === 'https://*/*' ? '<all_urls>' : url
            })
          }
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
    manifestContent.host_permissions[0] = '<all_urls>'
    manifestContent.web_accessible_resources[0] = {
      resources: [
        ...manifestContent.web_accessible_resources[0].resources,
        'chunks/content.js',
        'pageWorld.js',
        'pages/pdf/*',
        'assets/*',
      ],
      matches: manifestContent.web_accessible_resources[0].matches,
    }
    if (isProd) {
      manifestContent.content_scripts = manifestContent.content_scripts.map(
        (contentScript) => {
          if (contentScript.js[0].includes('check_status.js')) {
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
