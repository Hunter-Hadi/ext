/**
 * slice text 的方式
 *  - TOKENS: 基于 chatgpt tokenizer 计算来切割
 *  - LENGTH: 基于字符长度
 */
type SliceTextActionType = 'TOKENS' | 'LENGTH'

export default SliceTextActionType
