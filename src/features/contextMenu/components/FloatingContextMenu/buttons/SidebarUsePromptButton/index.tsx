import {
  autoUpdate,
  flip,
  offset,
  shift,
  useClick,
  useFloating,
  useInteractions,
  useRole,
} from '@floating-ui/react'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import IconButton from '@mui/material/IconButton'
import { SxProps } from '@mui/material/styles'
import cloneDeep from 'lodash-es/cloneDeep'
import React, { FC, useEffect, useMemo, useRef } from 'react'
import { useTranslation } from 'react-i18next'

import { UseChatGptIcon } from '@/components/CustomIcon'
import TextOnlyTooltip from '@/components/TextOnlyTooltip'
import useClientChat from '@/features/chatgpt/hooks/useClientChat'
import useSmoothConversationLoading from '@/features/chatgpt/hooks/useSmoothConversationLoading'
import PromptsAutoComplete from '@/features/contextMenu/components/FloatingContextMenu/buttons/SidebarUsePromptButton/PromptsAutoComplete'
import { IChatMessage } from '@/features/indexed_db/conversations/models/Message'
import { ISetActionsType } from '@/features/shortcuts/types/Action'
import { formatChatMessageContent } from '@/features/sidebar/utils/chatMessagesHelper'
import { getMaxAISidebarRootElement } from '@/utils'
import { getCurrentDomainHost } from '@/utils/dataHelper/websiteHelper'

const NO_SUPPORT_HOST: string[] = []

/**
 * 输入框呼出按钮
 * @returns
 */
const SidebarUsePromptButton: FC<{
  message?: IChatMessage
  text?: string
  className?: string
  iconButton?: boolean
  sx?: SxProps
}> = (props) => {
  const { message, className, sx, iconButton, text } = props
  const { askAIWIthShortcuts } = useClientChat()
  const { smoothConversationLoading } = useSmoothConversationLoading()
  const testid = 'max-ai__actions__button--use-prompt'
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null)
  const { t } = useTranslation(['common', 'client'])
  const [root, setRoot] = React.useState<HTMLElement | null>(null)
  const [open, setOpen] = React.useState<boolean>(false)
  const currentContext = useMemo(() => {
    return text || (message && formatChatMessageContent(message, false)) || ''
  }, [message, text])
  const isRunningRef = useRef(false)
  const handleRunActions = async (actions: ISetActionsType) => {
    if (
      actions &&
      actions.length > 0 &&
      !smoothConversationLoading &&
      !isRunningRef.current
    ) {
      try {
        isRunningRef.current = true
        const runActions: ISetActionsType = cloneDeep(actions || []).map(
          (action) => {
            if (action.type === 'FETCH_ACTIONS') {
              // 本次不携带history，但是后续需要携带
              action.parameters.ActionFetchActionsWithHistory = true
            }
            return action
          },
        )
        // 最前面插入一个action
        runActions.unshift({
          type: 'SET_VARIABLE',
          parameters: {
            Variable: {
              key: 'SELECTED_TEXT',
              value: currentContext,
              label: 'Selected text',
              isBuiltIn: true,
              overwrite: true,
            },
          },
        })
        await askAIWIthShortcuts(runActions)
      } catch (error) {
        console.error(error)
      } finally {
        isRunningRef.current = false
      }
    }
  }
  useEffect(() => {
    setRoot(getMaxAISidebarRootElement() || document.body)
  }, [])
  // floating ui
  const { context, placement, floatingStyles, refs } = useFloating({
    open,
    strategy: 'fixed',
    onOpenChange(open: boolean) {
      setOpen(open)
    },
    placement: 'bottom-start',
    middleware: [
      offset(8),
      flip({
        fallbackPlacements: [
          'top-start',
          'top-end',
          'bottom-start',
          'bottom-end',
        ],
      }),
      shift(),
    ],
    whileElementsMounted: autoUpdate,
  })
  const click = useClick(context)
  const role = useRole(context)
  const { getReferenceProps, getFloatingProps } = useInteractions([click, role])
  if (NO_SUPPORT_HOST.includes(getCurrentDomainHost()) || !root) {
    return null
  }
  return (
    <>
      <Box component={'div'}>
        {iconButton ? (
          <IconButton
            id={`MaxAISidebarUsePromptButton`}
            sx={sx}
            data-testid={testid}
            className={className}
            disabled={smoothConversationLoading}
            onClick={(event) => {
              setAnchorEl(anchorEl ? null : event.currentTarget)
            }}
            ref={refs.setReference}
            {...getReferenceProps()}
          >
            <UseChatGptIcon
              sx={{
                color: (t: any) =>
                  t.palette.mode === 'dark'
                    ? 'rgba(255,255,255,.87)'
                    : 'rgba(0,0,0,.6)',
                fontSize: '18px',
              }}
            />
          </IconButton>
        ) : (
          <TextOnlyTooltip title={t('client:sidebar__button__use_prompt')}>
            <Button
              id={`MaxAISidebarUsePromptButton`}
              variant={'outlined'}
              sx={{
                p: '5px',
                minWidth: 'unset',
                ...sx,
              }}
              data-testid={testid}
              className={className}
              disabled={smoothConversationLoading}
              onClick={(event) => {
                setAnchorEl(anchorEl ? null : event.currentTarget)
              }}
              ref={refs.setReference}
              {...getReferenceProps()}
            >
              <UseChatGptIcon
                sx={{
                  color: (t: any) =>
                    t.palette.mode === 'dark'
                      ? 'rgba(255,255,255,.87)'
                      : 'rgba(0,0,0,.6)',
                  fontSize: '18px',
                }}
              />
            </Button>
          </TextOnlyTooltip>
        )}
      </Box>
      {open && (
        <Box
          ref={refs.setFloating}
          style={floatingStyles}
          {...getFloatingProps()}
          sx={{
            width: 300,
            height: 400,
            zIndex: 9999,
          }}
        >
          <PromptsAutoComplete
            placement={placement}
            root={root}
            buttonSettingsKey={'textSelectPopupButton'}
            onSelectActions={handleRunActions}
            onClose={() => {
              setOpen(false)
            }}
          />
        </Box>
      )}
    </>
  )
}

export default SidebarUsePromptButton
