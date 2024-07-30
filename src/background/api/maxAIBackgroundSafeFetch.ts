import { backgroundRequestHeadersGenerator } from '@/background/api/backgroundRequestHeadersGenerator'
import { getMaxAIChromeExtensionAccessToken } from '@/features/auth/utils'
import { securityHandleFetchErrorResponse } from '@/features/security'

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
    Authorization: `Bearer ${await getMaxAIChromeExtensionAccessToken()}`,
    ...(init?.body instanceof FormData
      ? {}
      : { 'Content-Type': 'application/json' }),
    ...init?.headers,
  })
  if (requestHeadersTaskId && typeof input === 'string' && init?.body) {
    // 获取加密的token
    const encryptedHeaders =
      await backgroundRequestHeadersGenerator.getTaskIdHeaders(
        requestHeadersTaskId,
        input,
        init.body,
      )
    // merge加密的token到headers中
    for (const [key, value] of Object.entries(encryptedHeaders)) {
      headers.set(key, value)
    }
  }

  // 创建一个新的RequestInit对象，并深拷贝init中的属性
  const modifiedInit: RequestInit = {
    ...init,
    headers, // 使用修改后的headers
  }

  // 拦截特定的状态码的response
  return fetch(input, modifiedInit).then(securityHandleFetchErrorResponse)
}

export default maxAIBackgroundSafeFetch
