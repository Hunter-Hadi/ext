import React, { FC, useRef, useState } from 'react'
import TextOnlyTooltip from '@/components/TextOnlyTooltip'
import Button from '@mui/material/Button'
import useCommands from '@/hooks/useCommands'
import { UseChatGptIcon } from '@/components/CustomIcon'
import DragIndicatorIcon from '@mui/icons-material/DragIndicator'
import Stack from '@mui/material/Stack'
import { Fade } from '@mui/material'

const MaxAIMiniButton: FC<{
  isDragging?: boolean
  onClick?: (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void
  actions?: React.ReactNode[]
}> = (props) => {
  const { isDragging, actions, onClick } = props
  const { chatBoxShortCutKey } = useCommands()
  const [hover, setHover] = useState(false)
  const [buttonHover, setButtonHover] = useState(false)
  const timerRef = useRef(0)
  const clearTimer = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current)
    }
  }
  const waitAnimationOpen = () => {
    clearTimer()
    timerRef.current = setTimeout(() => {
      setHover(true)
      setButtonHover(true)
    }, 300) as any
  }
  const waitAnimationClose = () => {
    clearTimer()
    setHover(false)
    setButtonHover(false)
  }
  return (
    <Stack
      direction={'row'}
      sx={{
        width: 52,
        height: 32,
        position: 'relative',
      }}
      onMouseLeave={waitAnimationClose}
    >
      <TextOnlyTooltip
        open={buttonHover && !isDragging}
        arrow
        minimumTooltip
        title={chatBoxShortCutKey}
        placement={'left'}
      >
        <Button
          sx={{
            width: 32,
            height: 32,
            borderRadius: '50%',
            minWidth: 'unset',
            display: 'flex',
          }}
          onMouseEnter={waitAnimationOpen}
          onMouseLeave={() => {
            setButtonHover(false)
          }}
          onMouseUp={(event) => {
            if (!hover) {
              event.stopPropagation()
              event.preventDefault()
            }
            onClick?.(event)
          }}
        >
          <UseChatGptIcon
            sx={{
              fontSize: '20px',
              // color: 'inherit',
            }}
          />
        </Button>
      </TextOnlyTooltip>
      <Stack
        width={12}
        borderRadius={'4px'}
        justifyContent={'center'}
        alignItems={'center'}
        sx={{
          marginLeft: '4px',
          '&:hover': {
            height: 32,
            bgcolor: (t) =>
              t.palette.mode === 'dark'
                ? 'rgba(178, 115, 255, 0.08)'
                : 'rgb(235,235,235)',
          },
        }}
      >
        <DragIndicatorIcon
          sx={{
            fontSize: 20,
            color: 'rgb(146,146,146)',
          }}
        />
      </Stack>
      <Stack
        sx={{
          position: 'absolute',
          left: 0,
          width: 32,
          bottom: 32,
        }}
      >
        <Fade in={hover && !isDragging} timeout={300}>
          <Stack mb={'6px'} spacing={'6px'}>
            {actions as any}
          </Stack>
        </Fade>
      </Stack>
    </Stack>
  )
}
export default MaxAIMiniButton
