// 保存原始的 fetch 方法的引用
const maxAIInjectOriginFetch = window.fetch
console.log('监听到 fetch 请求1注入')
const isNextTask = false
window.addEventListener('message', (event) => {})
// 定义你的新的 fetch 方法
function maxAIInjectFetch(url: string, options: any) {
  // 在这里添加你的监听逻辑
  console.log('监听到 fetch 请求1:', url, options)
  // 调用原始的 fetch 方法
  return maxAIInjectOriginFetch(url, options).then(function (response) {
    return new Promise((resolve) => {
      // 打印响应的状态码
      console.log('Response status:', response.status)
      // 克隆响应
      if (
        [
          'https://chat.openai.com/backend-api/files',
          'https://chat.openai.com/backend-api/conversation/interpreter/process_upload',
        ].includes(url)
      ) {
        const cloneResponse = response.clone()
        // https://chat.openai.com/backend-api/files // 第一次上传
        // https://chat.openai.com/backend-api/conversation/interpreter/process_upload // 第二次上传
        const step = url === 'https://chat.openai.com/backend-api/files' ? 1 : 2
        cloneResponse
          .json()
          .then((result) => {
            console.log('克隆的响应:', result)
            window.postMessage({
              type: 'fetch_api_response',
              data: {
                status: response.status,
                url: url,
                result,
                progress: step === 2 ? 100 : 80,
                done: step === 2,
              },
            })
            if (step === 2) {
              result.status = 'error'
              // 将对象转换为字符串，并创建新的响应对象
              const modifiedResponse = new Response(JSON.stringify(result), {
                status: response.status,
                statusText: response.statusText,
                headers: response.headers,
              })
              resolve(modifiedResponse)
            }
            resolve(response)
          })
          .catch((e) => {
            resolve(response)
          })
      } else {
        resolve(response)
      }
    })
  })
}

// 将你的新的 fetch 方法赋值给 window.fetch
;(window as any).fetch = maxAIInjectFetch
