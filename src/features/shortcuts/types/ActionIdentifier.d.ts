type ActionIdentifier =
  | WebGPTActionIdentifier
  // 渲染模板
  | 'RENDER_TEMPLATE'
  //youtube获取评论
  | 'YOUTUBE_GET_COMMENTS'
  //youtube获进度数据
  | 'YOUTUBE_GET_TRANSCRIPT'
  | 'YOUTUBE_GET_TRANSCRIPT_TIMESTAMPED'
  /**
   * @deprecated - 这个action已经被废弃了，使用RENDER_TEMPLATE代替
   * @description - 渲染AI Prompt
   */
  | 'RENDER_CHATGPT_PROMPT'
  // 提问ai provider
  | 'ASK_CHATGPT'
  // 插入用户输入框
  | 'INSERT_USER_INPUT'
  // 设置变量
  | 'SET_VARIABLE'
  // 设置变量映射
  | 'SET_VARIABLE_MAP'
  // 设置变量弹窗
  | 'SET_VARIABLES_MODAL'
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
  // 从插件获取PDF的内容
  | 'GET_PDF_PATH_OF_CRX'
  // 从插件上传PDF的内容
  | 'UPLOAD_PDF_OF_CRX'
  // 从插件获取PDF文件
  | 'GET_PDF_FILE_OF_CRX'
  // 从@mozilla/readability获取网页纯文本内容
  | 'GET_READABILITY_CONTENTS_OF_WEBPAGE'
  // 从@mozilla/readability获取网页markdown内容
  | 'GET_READABILITY_MARKDOWN_OF_WEBPAGE'
  // 从各大邮件网站获取内容
  | 'GET_EMAIL_CONTENTS_OF_WEBPAGE'
  // 从各大邮件网站获取草稿
  | 'GET_EMAIL_DRAFT_OF_WEBPAGE'
  // 从各大社交媒体网站获取内容
  | 'GET_SOCIAL_MEDIA_POST_CONTENT_OF_WEBPAGE'
  // 从各大社交媒体网站获取草稿
  | 'GET_SOCIAL_MEDIA_POST_DRAFT_OF_WEBPAGE'
  // 从各大聊天网站获取内容
  | 'GET_CHAT_MESSAGES_CONTENT_OF_WEBPAGE'
  // 从各大聊天网站获取草稿
  | 'GET_CHAT_MESSAGE_DRAFT_OF_WEBPAGE'
  // 打开网页
  | 'OPEN_URLS'
  //  关闭网页
  | 'CLOSE_URLS'
  // 操作页面元素
  | 'OPERATION_ELEMENT'
  // 聊天文件太长上传
  | 'ANALYZE_CHAT_FILE'
  // 创建网站内容
  | 'CREATE_WEBSITE_CONTEXT'
  // 处理文本
  | 'TEXT_HANDLER'
  // 聊天信息管理
  | 'CHAT_MESSAGE'
  // MaxAI 总结完成后记录数据的 action
  | 'MAXAI_SUMMARY_LOG'
  // MaxAI 处理内置的变量
  | 'MAXAI_PROCESS_BUILT_IN_PARAMETERS'
  // 获取消息
  | 'MAXAI_GET_CHAT_MESSAGES'
  // 获取AI Response后的消息
  | 'MAXAI_RESPONSE_RELATED'
  // MaxAI 上传document
  | 'MAXAI_UPLOAD_DOCUMENT'
  // 分配 System Prompt 应获取 (Email | Social Media | Chat App website) 页面上下文变量
  | 'ASSIGN_CUSTOM_PROMPT_WEB_PAGE_CONTENT_CONTEXT_VARIABLE'
  // =========[Scripts]=========
  // 传递指定的键值对列表到下一个动作作为字典
  | 'SCRIPTS_DICTIONARY'
  // 从传递给操作的字典中获取指定键的值。
  | 'SCRIPTS_GET_DICTIONARY_VALUE'
  // 在传递给操作的字典中设置值。
  | 'SCRIPTS_SET_DICTIONARY_VALUE'
  // 列表
  | 'SCRIPTS_LIST'
  // 从列表中获取指定索引的值。
  | 'SCRIPTS_GET_ITEM_FROM_LIST'
  // if条件
  | 'SCRIPTS_CONDITIONAL'
  // 重复
  | 'REPEAT'
  // 遍历
  | 'REPEAT_WITH_EACH'

// `1webgpt action identifiers
type WebGPTActionIdentifier = 'WEBGPT_SEARCH_RESULTS_EXPAND'

export default ActionIdentifier
