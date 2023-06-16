import React, { FC, useEffect } from 'react'
import Button from '@mui/material/Button'
import CircularProgress from '@mui/material/CircularProgress'
import SendIcon from '@mui/icons-material/Send'
import { getAppRootElement } from '@/utils'
import { useShortCutsWithMessageChat } from '@/features/shortcuts/hooks/useShortCutsWithMessageChat'
import cloneDeep from 'lodash-es/cloneDeep'
import { ROOT_CHAT_BOX_INPUT_ID } from '@/constants'
import { getChromeExtensionButtonContextMenu } from '@/background/utils'
import { IContextMenuItem } from '@/features/contextMenu/types'

const TestAllActionsButton: FC = () => {
  const [loading, setLoading] = React.useState(false)
  const [allShortcuts, setAllShortcuts] = React.useState<IContextMenuItem[]>([])
  const isStopRef = React.useRef(false)
  const { setShortCuts, runShortCuts } = useShortCutsWithMessageChat('')
  useEffect(() => {
    getChromeExtensionButtonContextMenu('textSelectPopupButton').then(
      (shortcuts) => {
        setAllShortcuts(shortcuts.filter((s) => s?.data?.type === 'shortcuts'))
      },
    )
  }, [])
  return (
    <Button
      disableElevation
      variant={'outlined'}
      disabled={isStopRef.current}
      startIcon={loading ? <CircularProgress size={16} /> : <SendIcon />}
      onClick={async () => {
        if (!isStopRef.current && loading) {
          isStopRef.current = true
          return
        }
        const inputText =
          (
            getAppRootElement()?.querySelector(
              '#' + ROOT_CHAT_BOX_INPUT_ID,
            ) as HTMLInputElement
          )?.value || ''
        if (!inputText) return
        try {
          setLoading(true)
          for (const shortcut of allShortcuts) {
            if (isStopRef.current) {
              isStopRef.current = false
              return
            }
            const cloneShortcut: IContextMenuItem = cloneDeep(shortcut)
            if (
              cloneShortcut?.data?.actions &&
              cloneShortcut.data.actions.length > 0
            ) {
              const setActions = cloneShortcut.data.actions.map((action) => {
                if (action.type === 'RENDER_CHATGPT_PROMPT') {
                  return {
                    ...action,
                    parameters: {
                      ...action.parameters,
                      template: (action.parameters?.template || '').replace(
                        /\{\{SELECTED_TEXT\}\}/g,
                        inputText,
                      ),
                    },
                  }
                }
                return action
              })
              setShortCuts(setActions)
              await runShortCuts()
            }
          }
        } catch (e) {
          console.error(e)
        } finally {
          setLoading(false)
        }
      }}
    >
      {loading ? 'Stop' : 'All'}
    </Button>
  )
}
export { TestAllActionsButton }
