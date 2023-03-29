import { useRecoilValue } from 'recoil'
import { useCallback, useEffect, useState } from 'react'
import { IShortcutEngineBuiltInVariableType } from '@/features/shortcuts/types'
import {
  useCurrentMessageView,
  useInboxComposeViews,
} from '@/features/gmail/hooks'
import { deepCloneGmailMessageElement } from '@/features/gmail/utils'

import { ChatGPTMessageState } from '@/features/gmail/store'
import { getAppRootElement, getChromeExtensionSettings } from '@/utils'
import { useRangy } from '@/features/contextMenu/hooks/useRangy'
import {
  DEFAULT_AI_OUTPUT_LANGUAGE_VALUE,
  ROOT_CHAT_BOX_INPUT_ID,
} from '@/types'
import { AppState } from '@/store'

const useShortCutsParameters = () => {
  const appState = useRecoilValue(AppState)
  const { currentComposeView } = useInboxComposeViews()
  const { lastSelectionRanges, parseRangySelectRangeData, rangy } = useRangy()
  const { messageViewText, currentMessageId } = useCurrentMessageView()
  const chatBoxMessages = useRecoilValue(ChatGPTMessageState)
  const [userSettings, setUserSettings] = useState<any>({})
  useEffect(() => {
    getChromeExtensionSettings().then((res) => {
      setUserSettings(res.userSettings || {})
    })
  }, [])
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
            .replace(/\n{3,}/g, `\n`) || ''
      }
    }
    let HIGHLIGHTED_HTML = ''
    let HIGHLIGHTED_TEXT = ''
    const selectionData = parseRangySelectRangeData(
      lastSelectionRanges?.selectRange,
      'useShortCutsParameters',
    )
    if (selectionData) {
      HIGHLIGHTED_HTML = selectionData.html || ''
      HIGHLIGHTED_TEXT = selectionData.text || ''
    }
    const activeWriteAbleElement = rangy?.contextMenu?.getActiveElement()
    if (activeWriteAbleElement) {
      if (!HIGHLIGHTED_HTML) {
        HIGHLIGHTED_HTML =
          activeWriteAbleElement.html || activeWriteAbleElement.getHtml() || ''
      }
      if (!HIGHLIGHTED_TEXT) {
        HIGHLIGHTED_TEXT =
          activeWriteAbleElement.text || activeWriteAbleElement.getText() || ''
      }
    }
    const builtInParameters: {
      [keys in IShortcutEngineBuiltInVariableType]?: any
    } = {
      GMAIL_EMAIL_CONTEXT: messageViewText,
      GMAIL_DRAFT_CONTEXT,
      HIGHLIGHTED_HTML,
      HIGHLIGHTED_TEXT,
      USER_INPUT:
        getAppRootElement()?.querySelector<HTMLTextAreaElement>(
          `#${ROOT_CHAT_BOX_INPUT_ID}`,
        )?.value || '',
      LAST_MESSAGE_OUTPUT:
        chatBoxMessages?.[chatBoxMessages.length - 1]?.text || '',
      AI_OUTPUT_LANGUAGE:
        userSettings?.language || DEFAULT_AI_OUTPUT_LANGUAGE_VALUE,
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
    lastSelectionRanges,
    rangy,
    chatBoxMessages,
    userSettings,
  ])
}
export { useShortCutsParameters }
