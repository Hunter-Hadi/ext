import SouthIcon from '@mui/icons-material/South'
import CircularProgress from '@mui/material/CircularProgress'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import debounce from 'lodash-es/debounce'
import React, { FC, useEffect, useRef, useState } from 'react'

import CopyTooltipIconButton from '@/components/CopyTooltipIconButton'
import TextOnlyTooltip from '@/components/TextOnlyTooltip'
import useClientChat from '@/features/chatgpt/hooks/useClientChat'
import { IAction } from '@/features/shortcuts/types/Action'
const DevShortcutsLog: FC<{ isSidebar?: boolean }> = ({ isSidebar }) => {
  const boxRef = useRef<HTMLDivElement>(null)
  const [runningActions, setRunningActions] = useState<IAction[]>([])
  const { shortCutsEngine } = useClientChat()
  const scrollToBottom = debounce(() => {
    if (boxRef.current) {
      const loadingAction = boxRef.current?.querySelector(
        '.max-ai__action_status__loading',
      ) as HTMLDivElement
      if (loadingAction) {
        // scroll to center
        boxRef.current?.scrollTo({
          top:
            loadingAction.offsetTop -
            loadingAction.offsetHeight / 2 -
            boxRef.current.offsetHeight / 2,
          behavior: 'smooth',
        })
      } else {
        boxRef.current?.scrollTo({
          top: boxRef.current?.scrollHeight,
          behavior: 'smooth',
        })
      }
    }
  }, 200)
  useEffect(() => {
    shortCutsEngine?.addListener(() => {
      if (shortCutsEngine?.actions) {
        setRunningActions(shortCutsEngine?.actions)
      }
      scrollToBottom()
    })
  }, [shortCutsEngine])
  useEffect(() => {
    scrollToBottom()
  }, [runningActions])
  const RenderActions = (actions: IAction[], deep = 0) => {
    return actions.map((action, index) => {
      let borderColor = '#ebebeb'
      let color = 'text.primary'
      if (action.status === 'running') {
        borderColor = 'primary.main'
        color = 'primary.main'
      } else if (action.status === 'error') {
        borderColor = 'error.main'
        color = 'error.main'
      } else if (action.status === 'complete') {
        borderColor = 'success.main'
        color = 'success.main'
      }
      const isAskChatGPT = action.type === 'ASK_CHATGPT'
      let AskChatGPTQuestion = isAskChatGPT ? (action as any).question : ''
      const isSuccess = action.status === 'complete'
      let output = isSuccess ? action.output : action.error
      if (typeof AskChatGPTQuestion === 'object') {
        AskChatGPTQuestion = JSON.stringify(AskChatGPTQuestion, null, 2)
      }
      if (action.type === 'SET_VARIABLES_MODAL') {
        output = JSON.stringify(
          action.parameters.SetVariablesModalConfig,
          null,
          2,
        )
      } else if (typeof output === 'object') {
        output = JSON.stringify(output, null, 2)
      }
      return (
        <Stack
          key={action.type + index + deep}
          sx={{ px: 1, alignItems: 'center' }}
        >
          <TextOnlyTooltip
            floatingMenuTooltip={!isSidebar}
            placement={'right'}
            title={`[${action.type}]`}
            description={
              <Stack
                sx={{
                  maxHeight: 500,
                  overflowY: 'auto',
                  gap: 1,
                }}
              >
                {isAskChatGPT && (
                  <Stack>
                    <Typography
                      fontSize={'12px'}
                      display={'flex'}
                      alignItems={'center'}
                      gap={1}
                    >
                      [Question]
                      <CopyTooltipIconButton
                        copyText={AskChatGPTQuestion}
                        sx={{
                          color: 'text.primary',
                          height: '12px',
                        }}
                      />
                    </Typography>
                    <Typography
                      sx={{
                        whiteSpace: 'pre-wrap',
                      }}
                      fontSize={'12px'}
                    >
                      {AskChatGPTQuestion}
                    </Typography>
                  </Stack>
                )}
                <Typography
                  fontSize={'12px'}
                  display={'flex'}
                  alignItems={'center'}
                  gap={1}
                >
                  {isSuccess ? `[Answer]` : `[Error]`}
                  <CopyTooltipIconButton
                    copyText={output}
                    sx={{
                      color: 'text.primary',
                      height: '12px',
                    }}
                  />
                </Typography>
                <Typography
                  sx={{
                    whiteSpace: 'pre-wrap',
                  }}
                  fontSize={'12px'}
                >
                  {output}
                </Typography>
              </Stack>
            }
          >
            <Stack
              className={
                action.status === 'running'
                  ? 'max-ai__action_status__loading'
                  : ''
              }
              sx={{
                width: '100%',
                border: '1px solid',
                alignItems: 'center',
                justifyContent: 'center',
                borderColor,
                color,
                fontSize: '12px',
                borderRadius: '4px',
                position: 'relative',
                padding: '8px 4px',
              }}
            >
              {action.status === 'running' && (
                <Stack
                  sx={{
                    position: 'absolute',
                    right: 1,
                    top: 1,
                  }}
                >
                  <CircularProgress
                    size={16}
                    thickness={4}
                    color={'inherit'}
                    variant={'indeterminate'}
                    sx={{
                      color,
                    }}
                  />
                </Stack>
              )}
              <Stack
                direction={'row'}
                alignItems={'center'}
                gap={1}
                height={16}
                width={'100%'}
              >
                {action.status !== 'idle' && action.status !== 'running' && (
                  <CopyTooltipIconButton
                    sx={{ flexShrink: 0 }}
                    size={'small'}
                    copyText={JSON.stringify(action)}
                  />
                )}
                <Typography noWrap fontSize={'12px'}>
                  {action.type}
                </Typography>
              </Stack>
            </Stack>
          </TextOnlyTooltip>
          {action.type === 'SCRIPTS_CONDITIONAL' &&
            action.status === 'complete' && (
              <Stack direction={'row'} gap={1} mt={1}>
                <Stack>
                  {action.output === 'true' ? (
                    <SouthIcon
                      sx={{
                        fontSize: '11px',
                        mt: 0.5,
                        transform: 'rotate(45deg)',
                        marginLeft: 'auto',
                      }}
                    />
                  ) : (
                    <Stack height={16}></Stack>
                  )}

                  <Stack
                    sx={{
                      p: 0.5,
                      borderRadius: '4px',
                      border: '1px solid',
                      borderColor:
                        action.output === 'true'
                          ? 'success.main'
                          : 'error.main',
                    }}
                  >
                    {RenderActions(
                      (action.parameters.WFConditionalIfTrueActions as any) ||
                        [],
                      deep + 1,
                    )}
                  </Stack>
                  {action.output === 'true' ? (
                    <SouthIcon
                      sx={{
                        fontSize: '11px',
                        mt: 0.5,
                        transform: 'rotate(-45deg)',
                        marginLeft: 'auto',
                      }}
                    />
                  ) : (
                    <Stack height={16}></Stack>
                  )}
                </Stack>
                <Stack>
                  {action.output === 'false' ? (
                    <SouthIcon
                      sx={{
                        fontSize: '11px',
                        mt: 0.5,
                        transform: 'rotate(-45deg)',
                      }}
                    />
                  ) : (
                    <Stack height={16}></Stack>
                  )}
                  <Stack
                    sx={{
                      p: 0.5,
                      borderRadius: '4px',
                      border: '1px solid',
                      borderColor:
                        action.output === 'false'
                          ? 'success.main'
                          : 'error.main',
                    }}
                  >
                    {RenderActions(
                      (action.parameters.WFConditionalIfFalseActions as any) ||
                        [],
                      deep + 1,
                    )}
                  </Stack>
                  {action.output === 'false' ? (
                    <SouthIcon
                      sx={{
                        fontSize: '11px',
                        mt: 0.5,
                        transform: 'rotate(45deg)',
                      }}
                    />
                  ) : (
                    <Stack height={16}></Stack>
                  )}
                </Stack>
              </Stack>
            )}
          {action.type !== 'SCRIPTS_CONDITIONAL' &&
            index + 1 !== actions.length && (
              <SouthIcon
                sx={{
                  fontSize: '11px',
                  mt: 0.5,
                }}
              />
            )}
        </Stack>
      )
    })
  }
  return (
    <Stack
      width={'100%'}
      sx={{
        flexShrink: 0,
        gap: 1,
        overflowY: 'auto',
        maxHeight: 500,
      }}
      ref={boxRef}
    >
      <Stack
        sx={{
          position: 'sticky',
          top: 0,
          p: 1,
          bgcolor: 'background.paper',
          zIndex: 1,
        }}
      >
        Actions
      </Stack>
      {RenderActions(runningActions)}
      <Stack width={'100%'} height={8} flexShrink={0}></Stack>
    </Stack>
  )
}
export default DevShortcutsLog
