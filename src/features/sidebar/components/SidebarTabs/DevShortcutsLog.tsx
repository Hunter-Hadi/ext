import React, { FC, useEffect, useRef, useState } from 'react'
import { IAction } from '@/features/shortcuts/types/Action'
import { useShortCutsWithMessageChat } from '@/features/shortcuts/hooks/useShortCutsWithMessageChat'
import useEffectOnce from '@/hooks/useEffectOnce'
import Stack from '@mui/material/Stack'
import TextOnlyTooltip from '@/components/TextOnlyTooltip'

const DevShortcutsLog: FC = () => {
  const boxRef = useRef<HTMLDivElement>(null)
  const [runningActions, setRunningActions] = useState<IAction[]>([])
  const { shortCutsEngineRef } = useShortCutsWithMessageChat()
  useEffectOnce(() => {
    shortCutsEngineRef.current?.addListener(() => {
      if (shortCutsEngineRef.current?.actions) {
        setRunningActions(shortCutsEngineRef.current?.actions)
      }
    })
  })
  useEffect(() => {
    if (boxRef.current) {
      setTimeout(() => {
        boxRef.current.scrollTop = boxRef.current.scrollHeight
      }, 0)
    }
  }, [runningActions])
  return (
    <Stack
      width={'100%'}
      sx={{
        flexShrink: 0,
        p: 1,
        gap: 1,
        overflowY: 'auto',
        height: 0,
        flex: 1,
      }}
      ref={boxRef}
    >
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
          <React.Fragment key={action.type + index}>
            <TextOnlyTooltip
              placement={'right'}
              title={action.output}
              description={action.status}
            >
              <Stack
                sx={{
                  border: '1px solid',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderColor,
                  color,
                  fontSize: '10px',
                  borderRadius: '4px',
                }}
              >
                {action.type}
              </Stack>
            </TextOnlyTooltip>
          </React.Fragment>
        )
      })}
    </Stack>
  )
}
export default DevShortcutsLog
