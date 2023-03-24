const modifyManifest = ({ env, isProd }) => ({
  name: 'modify-manifest',
  generateBundle(_options, bundle) {
    console.log('modify-manifest')
    const manifest = bundle['manifest.json']
    const manifestContent = JSON.parse(manifest.source)
    // TODO - this is a hack to inject the fetch polyfill into the manifest
    // 防止频繁429的保底方案
    // manifestContent.content_scripts.push({
    //   js: ['inject-fetch.min.js'],
    //   matches: ['https://chat.openai.com/*'],
    //   run_at: 'document_start',
    // })
    // TODO - options页面还没暴露给用户
    if (isProd) {
      manifestContent.content_scripts[0].matches = ['<all_urls>']
      if (env === 'USE_CHAT_GPT_AI') {
        delete manifestContent['options_ui']
      }
    }
    manifest.source = JSON.stringify(manifestContent, null, 2)
  },
})
export default modifyManifest
