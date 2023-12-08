import React, { FC, useEffect, useRef, useState } from 'react'
import { IAction } from '@/features/shortcuts/types/Action'
import { useShortCutsWithMessageChat } from '@/features/shortcuts/hooks/useShortCutsWithMessageChat'
import useEffectOnce from '@/hooks/useEffectOnce'
import Stack from '@mui/material/Stack'
import TextOnlyTooltip from '@/components/TextOnlyTooltip'
import CircularProgress from '@mui/material/CircularProgress'
import CopyTooltipIconButton from '@/components/CopyTooltipIconButton'
import Typography from '@mui/material/Typography'
import debounce from 'lodash-es/debounce'
import SouthIcon from '@mui/icons-material/South'
const DevShortcutsLog: FC = () => {
  const boxRef = useRef<HTMLDivElement>(null)
  const [runningActions, setRunningActions] = useState<IAction[]>([])
  const { shortCutsEngineRef } = useShortCutsWithMessageChat()
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
  useEffectOnce(() => {
    shortCutsEngineRef.current?.addListener(() => {
      if (shortCutsEngineRef.current?.actions) {
        setRunningActions(shortCutsEngineRef.current?.actions)
      }
      scrollToBottom()
    })
  })
  useEffect(() => {
    scrollToBottom()
  }, [runningActions])
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
      {runningActions.map((action, index) => {
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
        return (
          <Stack key={action.type + index} sx={{ px: 1, alignItems: 'center' }}>
            <TextOnlyTooltip
              placement={'right'}
              title={`[${action.type}]`}
              description={
                action.status === 'complete' ? action.output : action.error
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
            {index + 1 !== runningActions.length && (
              <SouthIcon
                sx={{
                  fontSize: '11px',
                  mt: 0.5,
                }}
              />
            )}
          </Stack>
        )
      })}
      <Stack width={'100%'} height={8} flexShrink={0}></Stack>
    </Stack>
  )
}
export default DevShortcutsLog
