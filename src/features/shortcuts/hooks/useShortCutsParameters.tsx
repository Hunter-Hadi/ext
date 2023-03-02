import { useRecoilValue } from 'recoil'
import { AppState } from '@/pages/App'
import { useCallback } from 'react'
import { IShortcutEngineBuiltInVariableType } from '@/features/shortcuts'
import { InboxComposeViewState, useCurrentMessageView } from '@/features/gmail'
import { getEzMailAppRootElement } from '@/utils'

const useShortCutsParameters = () => {
  const appState = useRecoilValue(AppState)
  const composeView = useRecoilValue(InboxComposeViewState)
  const { messageViewText } = useCurrentMessageView()
  return useCallback(() => {
    const builtInParameters: {
      [keys in IShortcutEngineBuiltInVariableType]: any
    } = {
      GMAIL_MESSAGE_CONTEXT: messageViewText,
      GMAIL_DRAFT_CONTEXT: '',
      INPUT_VALUE:
        getEzMailAppRootElement()?.querySelector<HTMLTextAreaElement>(
          '#EzMailAppChatBoxInput',
        )?.value || '',
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
    return { builtInParameters, parameters }
  }, [appState.env, composeView, messageViewText])
}
export { useShortCutsParameters }
