const oldFetch = window.fetch
window.fetch = async function (url, options) {
  if (url.toString().includes('https://chat.openai.com')) {
    if (url === 'https://chat.openai.com/api/auth/session') {
      const response = await oldFetch(url, options)
      const body = await response.text() // 获取响应体
      const modifiedBody = body // 对响应体进行修改
      try {
        console.log('set session')
        window.sessionStorage.setItem(
          'openai_session',
          JSON.parse(modifiedBody).accessToken,
        )
      } catch (e) {
        console.log(e)
      }
      return new Response(modifiedBody, response) // 返回修改后的响应
    }
    if (url === 'https://chat.openai.com/backend-api/models') {
      const response = await oldFetch(url, options)
      const body = await response.text() // 获取响应体
      const modifiedBody = body // 对响应体进行修改
      try {
        console.log('set models')
        window.sessionStorage.setItem('openai_models', body)
      } catch (e) {
        console.log(e)
      }
      return new Response(modifiedBody, response) // 返回修改后的响应
    }
    return oldFetch(url, options) // 其他请求不进行修改
  } else {
    return oldFetch(url, options) // 其他请求不进行修改
  }
}
