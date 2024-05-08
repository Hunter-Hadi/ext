import { useMemo } from 'react'
import { useRecoilState } from 'recoil'

import { type IChromeExtensionButtonSettingKey } from '@/background/utils/chromeExtensionStorage/type'
import { ShortcutActionEditorState } from '@/features/shortcuts/components/ShortcutsActionsEditor/store'
import { IActionSetVariable } from '@/features/shortcuts/components/ShortcutsActionsEditor/types'
import { updateHtmlWithVariables } from '@/features/shortcuts/components/ShortcutsActionsEditor/utils'
import { useCustomTheme } from '@/hooks/useCustomTheme'
import { I18nextKeysType } from '@/i18next'

export type IPresetVariableName =
  | 'LIVE_CRAWLING_TARGET_URL'
  | 'LIVE_CRAWLING_CRAWLED_TEXT'
  | 'WEB_SEARCH_QUERY'
  | 'WEB_SEARCH_RESULTS'
  | 'SELECTED_TEXT'
  | 'CURRENT_WEBSITE_DOMAIN'
  | 'SYSTEM_CURRENT_DATE'
  | 'AI_RESPONSE_LANGUAGE'
  | 'AI_RESPONSE_TONE'
  | 'AI_RESPONSE_WRITING_STYLE'
  // Instant reply
  | 'FULL_CONTEXT'
  | 'TARGET_CONTEXT'
  | 'DRAFT_CONTEXT'
  // Summary
  | 'SUMMARY_PAGE_CONTENT_REPRESENTATION'

export interface IPresetActionSetVariable extends IActionSetVariable {
  VariableName: IPresetVariableName
}
export type IPresetVariablesGroupItem = {
  // ActionParameters中的string类型的key
  variable: IPresetActionSetVariable
  description?: I18nextKeysType
  examples: I18nextKeysType[]
  // 限制 System variables 在哪些场景下可用
  permissionKeys?: IChromeExtensionButtonSettingKey[]
}

export const PRESET_VARIABLE_MAP: {
  [key in IPresetVariableName]: IPresetActionSetVariable
} = {
  LIVE_CRAWLING_TARGET_URL: {
    VariableName: 'LIVE_CRAWLING_TARGET_URL',
    label: 'LIVE_CRAWLING_TARGET_URL',
    placeholder: 'Enter the URL you wish to extract text from',
    valueType: 'Text',
    systemVariable: true,
    defaultValue: '{{SELECTED_TEXT}}',
    validates: [
      {
        required: true,
      },
      {
        pattern:
          '(https:\\/\\/www\\.|http:\\/\\/www\\.|https:\\/\\/|http:\\/\\/)?[a-zA-Z0-9]{2,}(\\.[a-zA-Z0-9]{2,})(\\.[a-zA-Z0-9]{2,})?',
        message: 'Please enter a valid URL',
      },
    ],
  },
  LIVE_CRAWLING_CRAWLED_TEXT: {
    VariableName: 'LIVE_CRAWLING_CRAWLED_TEXT',
    label: 'LIVE_CRAWLING_CRAWLED_TEXT',
    placeholder:
      'This variable will be automatically updated with text extracted from the target URL',
    valueType: 'Text',
    systemVariable: true,
    defaultValue: '{{SELECTED_TEXT}}',
  },
  WEB_SEARCH_QUERY: {
    VariableName: 'WEB_SEARCH_QUERY',
    label: 'WEB_SEARCH_QUERY',
    placeholder: 'Enter your search term',
    valueType: 'Text',
    systemVariable: true,
    defaultValue: '{{SELECTED_TEXT}}',
    validates: [
      {
        required: true,
      },
    ],
  },
  WEB_SEARCH_RESULTS: {
    VariableName: 'WEB_SEARCH_RESULTS',
    label: 'WEB_SEARCH_RESULTS',
    placeholder:
      'This variable will be automatically updated with the search results',
    valueType: 'Text',
    systemVariable: true,
  },
  SELECTED_TEXT: {
    VariableName: 'SELECTED_TEXT',
    label: 'SELECTED_TEXT',
    defaultValue: '{{SELECTED_TEXT}}',
    valueType: 'Text',
    systemVariable: true,
  },
  CURRENT_WEBSITE_DOMAIN: {
    VariableName: 'CURRENT_WEBSITE_DOMAIN',
    label: 'CURRENT_WEBSITE_DOMAIN',
    valueType: 'Text',
    systemVariable: true,
  },
  SYSTEM_CURRENT_DATE: {
    VariableName: 'SYSTEM_CURRENT_DATE',
    label: 'SYSTEM_CURRENT_DATE',
    valueType: 'Text',
    systemVariable: true,
  },
  AI_RESPONSE_LANGUAGE: {
    VariableName: 'AI_RESPONSE_LANGUAGE',
    defaultValue: 'English',
    systemVariable: true,
    valueType: 'Select',
    label: 'AI Response language',
  },
  AI_RESPONSE_TONE: {
    VariableName: 'AI_RESPONSE_TONE',
    defaultValue: 'Default',
    systemVariable: true,
    valueType: 'Select',
    label: 'Tone',
  },
  AI_RESPONSE_WRITING_STYLE: {
    VariableName: 'AI_RESPONSE_WRITING_STYLE',
    defaultValue: 'Default',
    systemVariable: true,
    valueType: 'Select',
    label: 'Writing style',
  },
  FULL_CONTEXT: {
    VariableName: 'FULL_CONTEXT',
    defaultValue: '{{FULL_CONTEXT}}',
    systemVariable: true,
    valueType: 'Text',
    label: 'FULL_CONTEXT',
  },
  TARGET_CONTEXT: {
    VariableName: 'TARGET_CONTEXT',
    defaultValue: '{{TARGET_CONTEXT}}',
    systemVariable: true,
    valueType: 'Text',
    label: 'TARGET_CONTEXT',
  },
  DRAFT_CONTEXT: {
    VariableName: 'DRAFT_CONTEXT',
    defaultValue: '{{DRAFT_CONTEXT}}',
    systemVariable: true,
    valueType: 'Text',
    label: 'DRAFT_CONTEXT',
  },
  SUMMARY_PAGE_CONTENT_REPRESENTATION: {
    VariableName: 'SUMMARY_PAGE_CONTENT_REPRESENTATION',
    defaultValue: 'context text',
    systemVariable: true,
    valueType: 'Text',
    label: 'PAGE_CONTENT',
  },
}

export const PRESET_VARIABLES_GROUP_MAP: {
  [key in string]: IPresetVariablesGroupItem[]
} = {
  'prompt_editor:preset_variables__system__title': [
    {
      variable: PRESET_VARIABLE_MAP.SELECTED_TEXT,
      description:
        'prompt_editor:preset_variables__system__selected_text__description',
      examples: [
        'prompt_editor:preset_variables__system__selected_text__description__example1',
        'prompt_editor:preset_variables__system__selected_text__description__example2',
      ],
      permissionKeys: ['textSelectPopupButton'],
    },
    {
      variable: PRESET_VARIABLE_MAP.CURRENT_WEBSITE_DOMAIN,
      description:
        'prompt_editor:preset_variables__system__current_website_domain__description',
      examples: [
        'prompt_editor:preset_variables__system__current_website_domain__example1',
        'prompt_editor:preset_variables__system__current_website_domain__example2',
      ],
    },
    {
      variable: PRESET_VARIABLE_MAP.SYSTEM_CURRENT_DATE,
      description:
        'prompt_editor:preset_variables__system__system_current_date__description',
      examples: [],
    },
    {
      variable: PRESET_VARIABLE_MAP.FULL_CONTEXT,
      description:
        'prompt_editor:preset_variables__system__full_context__description',
      examples: [],
      permissionKeys: ['inputAssistantComposeReplyButton'],
    },
    {
      variable: PRESET_VARIABLE_MAP.TARGET_CONTEXT,
      description:
        'prompt_editor:preset_variables__system__target_context__description',
      examples: [],
      permissionKeys: ['inputAssistantComposeReplyButton'],
    },
    {
      variable: PRESET_VARIABLE_MAP.DRAFT_CONTEXT,
      description:
        'prompt_editor:preset_variables__system__draft_context__description',
      examples: [],
      permissionKeys: ['inputAssistantRefineDraftButton'],
    },
    {
      variable: PRESET_VARIABLE_MAP.SUMMARY_PAGE_CONTENT_REPRESENTATION,
      description:
        'prompt_editor:preset_variables__system__summary_page_content_representation__description',
      examples: [
        'prompt_editor:preset_variables__system__summary_page_content_representation__description__example1',
      ],
      permissionKeys: ['sidebarSummaryButton'],
    },
  ],
  // 'prompt_editor:preset_variables__web_search__title': [
  //   {
  //     variable: PRESET_VARIABLE_MAP.WEB_SEARCH_QUERY,
  //     description:
  //       'prompt_editor:preset_variables__web_search__web_search_query__description',
  //     examples: [],
  //   },
  //   {
  //     variable: PRESET_VARIABLE_MAP.WEB_SEARCH_RESULTS,
  //     description:
  //       'prompt_editor:preset_variables__web_search__web_search_results__description',
  //     examples: [],
  //   },
  // ],
  // 'prompt_editor:preset_variables__live_crawling__title': [
  //   {
  //     variable: PRESET_VARIABLE_MAP.LIVE_CRAWLING_TARGET_URL,
  //     description:
  //       'prompt_editor:preset_variables__live_crawling__live_crawling_target_url__description',
  //     examples: [],
  //   },
  //   {
  //     variable: PRESET_VARIABLE_MAP.LIVE_CRAWLING_CRAWLED_TEXT,
  //     description:
  //       'prompt_editor:preset_variables__live_crawling__live_crawling_crawled_text__description',
  //     examples: [],
  //   },
  // ],
}

const variablesToMap = (variables: IActionSetVariable[]) => {
  const map = new Map<string, IActionSetVariable>()
  variables.forEach((item) => {
    map.set(item.VariableName, item)
  })
  return map
}

const useShortcutEditorActionsVariables = (filterValue?: string) => {
  const { isDarkMode } = useCustomTheme()
  const [shortcutActionEditor, setShortcutActionEditor] = useRecoilState(
    ShortcutActionEditorState,
  )
  const variableMap = useMemo(() => {
    return variablesToMap(shortcutActionEditor.variables)
  }, [shortcutActionEditor.variables])

  const setVariables = (newVariables: IActionSetVariable[]) => {
    setShortcutActionEditor((prev) => {
      return {
        ...prev,
        editHTML: updateHtmlWithVariables(
          prev.editHTML,
          // 因为VariableName是唯一的，所以可以直接用VariableName作为key
          variablesToMap(newVariables),
          isDarkMode,
        ),
        variables: newVariables,
      }
    })
  }

  const addVariable = (variable: IActionSetVariable) => {
    // 防止重复
    if (variableMap.get(variable.VariableName)) {
      return
    }
    setVariables([variable, ...shortcutActionEditor.variables])
  }
  const updateVariable = (variable: IActionSetVariable) => {
    setVariables(
      shortcutActionEditor.variables.map((item) => {
        if (item.VariableName === variable.VariableName) {
          return variable
        }
        return item
      }),
    )
  }
  const filterVariables = useMemo(() => {
    // 能模糊搜索的是label和VariableName和placeholder
    const searchText = filterValue?.toLowerCase()
    if (!searchText) {
      return shortcutActionEditor.variables.filter(
        (variable) => !variable.systemVariable,
      )
    }
    return shortcutActionEditor.variables.filter((variable) => {
      const variableName = variable.VariableName.toLowerCase()
      const label = (variable?.label || '').toLowerCase()
      const placeholder = variable.placeholder?.toLowerCase()
      return (
        !variable.systemVariable &&
        (variableName.includes(searchText) ||
          label.includes(searchText) ||
          placeholder?.includes(searchText))
      )
    })
  }, [shortcutActionEditor.variables, filterValue])
  const systemSelectVisible = useMemo(() => {
    return (
      shortcutActionEditor.variables.filter(
        (variable) => variable.systemVariable,
      ).length >= 3
    )
  }, [shortcutActionEditor.variables])
  const toggleSystemSelectVisible = () => {
    if (systemSelectVisible) {
      // 过滤掉系统变量
      setVariables(
        shortcutActionEditor.variables.filter(
          (variable) => !variable.systemVariable,
        ),
      )
    } else {
      // 添加系统变量
      const systemSelect: IActionSetVariable[] = [
        PRESET_VARIABLE_MAP.AI_RESPONSE_LANGUAGE,
        PRESET_VARIABLE_MAP.AI_RESPONSE_TONE,
        PRESET_VARIABLE_MAP.AI_RESPONSE_WRITING_STYLE,
      ]
      setVariables(shortcutActionEditor.variables.concat(systemSelect))
    }
  }
  return {
    addVariable,
    updateVariable,
    filterVariables,
    setVariables,
    variableMap,
    variables: shortcutActionEditor.variables,
    systemSelectVisible,
    toggleSystemSelectVisible,
  }
}

export default useShortcutEditorActionsVariables
