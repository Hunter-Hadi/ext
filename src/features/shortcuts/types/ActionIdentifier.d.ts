type ActionIdentifier =
  | WebGPTActionIdentifier
  // 渲染AI Prompt
  | 'RENDER_CHATGPT_PROMPT'
  // 提问ai provider
  | 'ASK_CHATGPT'
  // 插入GMAIL回复框
  | 'GMAIL_INSERT_REPLY_BOX'
  // 插入用户输入框
  | 'INSERT_USER_INPUT'
  // 获取网页内容
  | 'GET_CONTENTS_OF_WEBPAGE'
  // 设置变量
  | 'SET_VARIABLE'
  // 设置URL
  | 'URL'
  // 获取URL内容
  | 'GET_CONTENTS_OF_URL'
  // 获取搜索引擎的搜索结果
  | 'GET_CONTENTS_OF_SEARCH_ENGINE'
  // 获取日期
  | 'DATE'
  // 设置日期格式
  | 'DATE_FORMAT'
  // 总结文本
  | 'SUMMARIZE_OF_TEXT'
  // 切片文本
  | 'SLICE_OF_TEXT'
  // 获取动作
  | 'FETCH_ACTIONS'
  // 获取Youtube的字幕
  | 'GET_YOUTUBE_TRANSCRIPT_OF_URL'
  // 从插件获取PDF的内容
  | 'GET_PDF_CONTENTS_OF_CRX'
  // 打开网页
  | 'OPEN_URLS'
  //  关闭网页
  | 'CLOSE_URLS'
  // 操作页面元素
  | 'OPERATION_ELEMENT'
  // if条件
  | 'SCRIPTS_CONDITIONAL'

// webgpt action identifiers
type WebGPTActionIdentifier =
  | 'WEBGPT_SEARCH_RESULTS_EXPAND'
  | 'WEBGPT_ASK_CHATGPT'

export default ActionIdentifier
