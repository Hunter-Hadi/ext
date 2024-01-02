import { DEFAULT_AI_OUTPUT_LANGUAGE_VALUE } from '@/constants'
import { textGetLanguageName } from '@/features/common/utils/nlp'
import { shortcutsRenderTemplate } from '@/features/shortcuts'
import ActionParameters from '@/features/shortcuts/types/ActionParameters'

const generatePromptAdditionalText = async (
  params: ActionParameters & {
    AI_RESPONSE_TONE?: string
    AI_RESPONSE_WRITING_STYLE?: string
    // web search的上下文
    WEB_SEARCH_RESULTS?: string
    PAGE_CONTENT?: string
    // summary的上下文
    READABILITY_CONTENTS?: string
    // quick reply的上下文
    SOCIAL_MEDIA_TARGET_POST_OR_COMMENT?: string
    SOCIAL_MEDIA_TARGET_POST_OR_COMMENT_CONTEXT?: string
    EMAIL_DRAFT?: string
    POST_DRAFT?: string
  },
) => {
  const addPosition = 'end'
  let systemVariablesTemplate = ''
  // 根据CONTEXT和 是否为Auto会有四个场景:
  //  - Auto, 有CONTEXT -> 回复和CONTEXT相同的语言加在最后面
  //  - Auto, 没有CONTEXT -> 不处理
  //  - 非Auto, 有CONTEXT -> Respond in "用户选择的"
  //  - 非Auto,没有CONTEXT -> 不处理
  const isAuto =
    params.AI_RESPONSE_LANGUAGE === DEFAULT_AI_OUTPUT_LANGUAGE_VALUE
  const CONTEXT =
    params.READABILITY_CONTENTS || //总结的上下文
    params.WEB_SEARCH_RESULTS || // 搜索的上下文
    params.PAGE_CONTENT || // 搜索的上下文
    params.SOCIAL_MEDIA_TARGET_POST_OR_COMMENT_CONTEXT || // quick reply的上下文
    params.SOCIAL_MEDIA_TARGET_POST_OR_COMMENT || // quick reply的上下文
    params.EMAIL_DRAFT || // quick reply的上下文
    params.POST_DRAFT || // quick reply的上下文
    params.SELECTED_TEXT || // 选中的内容
    ''
  // 如果是Auto，且有CONTEXT，那么就回复和CONTEXT相同的语言
  if (isAuto) {
    if (CONTEXT) {
      const language = textGetLanguageName(CONTEXT)
      systemVariablesTemplate = `Please write in ${language}`
    }
    // 没有SELECTED_TEXT, 不处理
  } else {
    if (
      params.AI_RESPONSE_WRITING_STYLE &&
      params.AI_RESPONSE_TONE &&
      params.AI_RESPONSE_TONE !== 'Default' &&
      params.AI_RESPONSE_WRITING_STYLE !== 'Default'
    ) {
      systemVariablesTemplate =
        'Please write in {{AI_RESPONSE_TONE}} tone, {{AI_RESPONSE_WRITING_STYLE}} writing style, using {{AI_RESPONSE_LANGUAGE}}.'
    } else if (
      params.AI_RESPONSE_TONE &&
      params.AI_RESPONSE_TONE !== 'Default'
    ) {
      systemVariablesTemplate =
        'Please write in {{AI_RESPONSE_TONE}} tone, using {{AI_RESPONSE_LANGUAGE}}.'
    } else if (
      params.AI_RESPONSE_WRITING_STYLE &&
      params.AI_RESPONSE_WRITING_STYLE !== 'Default'
    ) {
      systemVariablesTemplate =
        'Please write in {{AI_RESPONSE_WRITING_STYLE}} writing style, using {{AI_RESPONSE_LANGUAGE}}.'
    } else {
      systemVariablesTemplate = `Please write in {{AI_RESPONSE_LANGUAGE}}`
    }
  }
  const result = shortcutsRenderTemplate(systemVariablesTemplate, params)
  if (result.error || !systemVariablesTemplate) {
    return {
      data: '',
      addPosition,
    }
  }
  return {
    data: result.data,
    addPosition,
  }
}
export default generatePromptAdditionalText
