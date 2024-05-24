import cloneDeep from 'lodash-es/cloneDeep'
import { useCallback } from 'react'
import { useRecoilValue } from 'recoil'

import {
  DEFAULT_AI_OUTPUT_LANGUAGE_ID,
  DEFAULT_AI_OUTPUT_LANGUAGE_VALUE,
} from '@/constants'
import { useClientConversation } from '@/features/chatgpt/hooks/useClientConversation'
import { MAXAI_SIDEBAR_CHAT_BOX_INPUT_ID } from '@/features/common/constants'
import useFloatingContextMenuDraft from '@/features/contextMenu/hooks/useFloatingContextMenuDraft'
import { useRangy } from '@/features/contextMenu/hooks/useRangy'
import { IShortcutEngineBuiltInVariableType } from '@/features/shortcuts/types'
import { AppDBStorageState, AppState } from '@/store'
import { getMaxAISidebarRootElement } from '@/utils'
import { listReverseFind } from '@/utils/dataHelper/arrayHelper'

export interface IShortCutsParameter {
  key: string
  value: any
  overwrite: boolean
  isBuiltIn?: boolean
  label?: string
}

const useShortCutsParameters = () => {
  const appState = useRecoilValue(AppState)
  const { currentSelection } = useRangy()
  const { clientConversationMessages } = useClientConversation()

  const { currentFloatingContextMenuDraft } = useFloatingContextMenuDraft()
  const appDBStorage = useRecoilValue(AppDBStorageState)
  return useCallback(() => {
    const GMAIL_DRAFT_CONTEXT =
      ''
        .replace(/<br\s*\/?>/gi, '\n')
        .replace(/<\/?div[^>]*>/g, '\n')
        .replace(/<[^>]+>/g, '')
        .replace(/\u00ad/g, '')
        .replace(/&nbsp;/g, ' ')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&amp;/g, '&')
        .replace(/&quot;/g, '"')
        .replace(/&apos;/g, "'")
        .replace(
          /data:image\/(png|jpeg|gif);base64,\s?[A-Za-z0-9+/]+={0,2}/g,
          '',
        )
        .replace(/\n{3,}/g, `\n`) || ''
    const SELECTED_HTML = currentSelection?.selectionHTML || ''
    const SELECTED_TEXT = currentSelection?.selectionText || ''
    let userSelectedLanguage =
      appDBStorage.userSettings?.language || DEFAULT_AI_OUTPUT_LANGUAGE_VALUE
    // NOTE: 历史遗留问题
    if (userSelectedLanguage === DEFAULT_AI_OUTPUT_LANGUAGE_ID) {
      userSelectedLanguage = DEFAULT_AI_OUTPUT_LANGUAGE_VALUE
    }
    const builtInParameters: {
      [keys in IShortcutEngineBuiltInVariableType]?: any
    } = {
      GMAIL_EMAIL_CONTEXT: '',
      GMAIL_DRAFT_CONTEXT,
      SELECTED_HTML,
      SELECTED_TEXT,
      USER_INPUT:
        getMaxAISidebarRootElement()?.querySelector<HTMLTextAreaElement>(
          `#${MAXAI_SIDEBAR_CHAT_BOX_INPUT_ID}`,
        )?.value || '',
      LAST_AI_OUTPUT:
        listReverseFind(
          clientConversationMessages,
          (item) => item.type === 'ai',
        )?.text || '',
      AI_RESPONSE_LANGUAGE: userSelectedLanguage,
      AI_OUTPUT_LANGUAGE: userSelectedLanguage,
      CURRENT_WEBSITE_DOMAIN:
        typeof window !== 'undefined' ? window.location.hostname : '',
      CURRENT_WEBPAGE_URL:
        typeof window !== 'undefined' ? window.location.href : '',
      CURRENT_WEBPAGE_TITLE:
        typeof window !== 'undefined' ? document.title : '',
      POPUP_DRAFT: currentFloatingContextMenuDraft || '',
    }
    const parameters: IShortCutsParameter[] = []
    Object.keys(builtInParameters).forEach((key) => {
      parameters.push({
        key,
        value: builtInParameters[key as IShortcutEngineBuiltInVariableType],
        overwrite: true,
        isBuiltIn: true,
      })
    })
    console.log(
      'ShortCutEngine.builtInParameters',
      Object.entries(builtInParameters),
    )
    return {
      builtInParameters: cloneDeep(builtInParameters),
      parameters: cloneDeep(parameters),
      shortCutsParameters: cloneDeep(parameters),
    }
  }, [
    appState.env,
    currentSelection,
    appDBStorage.userSettings,
    currentFloatingContextMenuDraft,
  ])
}
export { useShortCutsParameters }
