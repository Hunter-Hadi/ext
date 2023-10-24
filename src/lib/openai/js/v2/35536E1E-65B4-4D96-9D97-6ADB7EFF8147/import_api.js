class OpenAIChatGPT4ArkoseGenerator {
  constructor() {
    ;(this.enforcement = void 0),
      (this.pendingPromises = []),
      (this.isReady = !1),
      (window.useArkoseSetupEnforcement = this.useArkoseSetupEnforcement.bind(
        this,
      )),
      this.injectScript()
  }
  useArkoseSetupEnforcement(e) {
    ;(this.enforcement = e),
      e.setConfig({
        onCompleted: (e) => {
          console.debug('enforcement.onCompleted', e),
            this.pendingPromises.forEach((t) => {
              t.resolve(e.token)
            }),
            (this.pendingPromises = [])
        },
        onReady: () => {
          ;(this.isReady = !0), console.debug('enforcement.onReady')
        },
        onError(e) {
          console.debug('enforcement.onError', e)
        },
        onFailed: (e) => {
          console.debug('enforcement.onFailed', e),
            this.pendingPromises.forEach((e) => {
              e.reject(Error('Failed to generate arkose token'))
            })
        },
      })
  }
  injectScript() {
    let e = document.createElement('script')
    ;(e.src = document
      .querySelector('script[search-with-ai]')
      .getAttribute('search-with-ai')),
      (e.async = !0),
      (e.defer = !0),
      e.setAttribute('data-callback', 'useArkoseSetupEnforcement'),
      document.body.appendChild(e)
  }
  async generate() {
    if (this.enforcement)
      return new Promise((e, t) => {
        ;(this.pendingPromises = [{ resolve: e, reject: t }]),
          this.enforcement.run()
      })
  }
}
const arkoseGenerator = new OpenAIChatGPT4ArkoseGenerator()
window.addEventListener('max-ai-search-with-ai-arkose-generator', async (e) => {
  let t = 10
  for (; !arkoseGenerator.isReady && !(t-- <= 0); )
    await new Promise((e) => setTimeout(e, 1e3))
  let n = await arkoseGenerator.generate(),
    r = new CustomEvent('max-ai-search-with-ai-arkose-token', {
      detail: { token: n },
    })
  window.dispatchEvent(r)
})
