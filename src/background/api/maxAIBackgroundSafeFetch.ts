import { backgroundRequestHeadersGenerator } from '@/background/api/backgroundRequestHeadersGenerator'
import { getMaxAIChromeExtensionAccessToken } from '@/features/auth/utils'

/**
 * 封装的安全的fetch函数，可以在此处添加一些全局的安全处理
 * @param input 请求的URL或Request对象
 * @param init 可选的请求配置参数
 * @param requestHeadersTaskId 请求头加密的taskId
 * @returns 返回一个Promise，解析为Response对象
 */
const maxAIBackgroundSafeFetch = async (
  input: RequestInfo,
  init?: RequestInit,
  requestHeadersTaskId?: string,
): Promise<Response> => {
  // 创建一个新的headers对象，并拷贝init中的headers
  const headers = new Headers({
    'Content-Type': 'application/json',
    Authorization: `Bearer ${await getMaxAIChromeExtensionAccessToken()}`,
    ...init?.headers,
  })
  if (requestHeadersTaskId && init?.body) {
    // 获取加密的token
    const encryptedHeaders = backgroundRequestHeadersGenerator.getTaskIdHeaders(
      requestHeadersTaskId,
      init.body,
    )
    // merge加密的token到headers中
    encryptedHeaders.forEach((value, key) => {
      headers.set(key, value)
    })
  }

  // 创建一个新的RequestInit对象，并深拷贝init中的属性
  const modifiedInit: RequestInit = {
    ...init,
    headers, // 使用修改后的headers
  }

  // 调用原生fetch，并传入修改后的RequestInfo和RequestInit
  return fetch(input, modifiedInit)
}

export default maxAIBackgroundSafeFetch
