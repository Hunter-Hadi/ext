export type OperationElementActionType = 'click' | 'insertText'

export type OperationElementConfigType = {
  // 选择器
  // example: [`div[test-id="a"]`]
  elementSelectors: string[]
  // 操作类型
  // default: 'click'
  actionType: OperationElementActionType
  // 操作额外数据
  actionExtraData?: {
    clearBeforeInsertText?: boolean
    text?: string
    value?: any
  }
  // 根元素选择器
  // default: document
  rootElementSelector?: string
  // 是否是 shadow 元素
  // default: false
  isShadowElement?: boolean
  // 如果有多个元素，执行的元素数量
  // default: 1
  executeElementCount?: number
  // 延迟执行时间
  // default: 0
  beforeDelay?: number
  // 执行后等待时间
  // default: 0
  afterDelay?: number
  // 总共执行时间
  // default: 30 * 1000
  durationTimes?: number
  // 轮训元素存在时间
  // default: 3000
  rotationTimes?: number
  // 轮训元素存在时间间隔
  // default: 1000
  rotationInterval?: number
  // 执行成功发送消息
  successMessage?: string
  // 执行失败发送消息
  errorMessage?: string
}
