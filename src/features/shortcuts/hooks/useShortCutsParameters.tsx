import { useRecoilValue } from 'recoil'
import { useCallback } from 'react'
import { IShortcutEngineBuiltInVariableType } from '@/features/shortcuts/types'
import {
  useCurrentMessageView,
  useInboxComposeViews,
} from '@/features/gmail/hooks'
import { deepCloneGmailMessageElement } from '@/features/gmail/utils'

import { ChatGPTMessageState } from '@/features/gmail/store'
import { getAppRootElement } from '@/utils'
import { useRangy } from '@/features/contextMenu/hooks/useRangy'
import {
  DEFAULT_AI_OUTPUT_LANGUAGE_VALUE,
  ROOT_CHAT_BOX_INPUT_ID,
} from '@/types'
import { AppSettingsState, AppState } from '@/store'

const useShortCutsParameters = () => {
  const appState = useRecoilValue(AppState)
  const { currentComposeView } = useInboxComposeViews()
  const { currentSelection } = useRangy()
  const { messageViewText, currentMessageId } = useCurrentMessageView()
  const chatBoxMessages = useRecoilValue(ChatGPTMessageState)
  const appSettings = useRecoilValue(AppSettingsState)
  return useCallback(() => {
    console.log(
      'init default input value useShortCutsParameters messageViewText',
      messageViewText,
    )
    let GMAIL_DRAFT_CONTEXT = ''
    if (appState.env === 'gmail') {
      if (currentComposeView) {
        const bodyElement = currentComposeView.getInstance?.()?.getBodyElement()
        const draftHTMLElement: any = bodyElement
          ? deepCloneGmailMessageElement(bodyElement)
          : undefined
        GMAIL_DRAFT_CONTEXT =
          draftHTMLElement?.cloneElement?.innerHTML
            ?.replace(/<br\s*\/?>/gi, '\n')
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
      }
    }
    const SELECTED_HTML = currentSelection?.selectionHTML || ''
    const SELECTED_TEXT = currentSelection?.selectionText || ''
    const builtInParameters: {
      [keys in IShortcutEngineBuiltInVariableType]?: any
    } = {
      GMAIL_EMAIL_CONTEXT: messageViewText,
      GMAIL_DRAFT_CONTEXT,
      SELECTED_HTML,
      SELECTED_TEXT,
      USER_INPUT:
        getAppRootElement()?.querySelector<HTMLTextAreaElement>(
          `#${ROOT_CHAT_BOX_INPUT_ID}`,
        )?.value || '',
      LAST_AI_OUTPUT: chatBoxMessages?.[chatBoxMessages.length - 1]?.text || '',
      AI_OUTPUT_LANGUAGE:
        appSettings.userSettings?.language || DEFAULT_AI_OUTPUT_LANGUAGE_VALUE,
      CURRENT_WEBSITE_DOMAIN:
        typeof window !== 'undefined' ? window.location.hostname : '',
    }
    const parameters: Array<{
      key: string
      value: any
      overwrite: boolean
    }> = []
    Object.keys(builtInParameters).forEach((key) => {
      parameters.push({
        key,
        value: builtInParameters[key as IShortcutEngineBuiltInVariableType],
        overwrite: true,
      })
    })
    console.log(
      'ShortCutEngine.builtInParameters',
      Object.entries(builtInParameters),
    )
    return {
      builtInParameters,
      parameters,
      shortCutsParameters: Object.values(parameters),
    }
  }, [
    appState.env,
    currentComposeView,
    messageViewText,
    currentMessageId,
    currentSelection,
    chatBoxMessages,
    appSettings.userSettings,
  ])
}
export { useShortCutsParameters }
