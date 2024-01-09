import DragIndicatorIcon from '@mui/icons-material/DragIndicator'
import Button from '@mui/material/Button'
import Stack from '@mui/material/Stack'
import React, { FC, useState } from 'react'

import { UseChatGptIcon } from '@/components/CustomIcon'
import TextOnlyTooltip from '@/components/TextOnlyTooltip'
import useCommands from '@/hooks/useCommands'

const MaxAIMiniButton: FC<{
  isDragging?: boolean
  onClick?: (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void
  children?: React.ReactNode
  onMouseEnter?: (
    event: React.MouseEvent<HTMLButtonElement, MouseEvent>,
  ) => void
  onMouseLeave?: (
    event: React.MouseEvent<HTMLButtonElement, MouseEvent>,
  ) => void
}> = (props) => {
  const { isDragging, children, onClick } = props
  const { chatBoxShortCutKey } = useCommands()
  const [buttonHover, setButtonHover] = useState(false)

  return (
    <Stack
      direction={'row'}
      sx={{
        width: 42,
        height: 32,
        position: 'relative',
      }}
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
            width: 42,
            height: 32,
            borderRadius: '16px 0 0 16px',
            minWidth: 'unset',
            display: 'flex',
            p: '6px 18px 6px 8px',
            '&:hover': {
              bgcolor: 'rgba(118, 1, 211, 0.08)',
            },
          }}
          onMouseEnter={(event) => {
            setButtonHover(true)
            props.onMouseEnter?.(event)
          }}
          onMouseLeave={(event) => {
            setButtonHover(false)
            props.onMouseLeave?.(event)
          }}
          onMouseUp={(event) => {
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
          width: 42,
          bottom: 32,
        }}
      >
        {children as any}
      </Stack>
    </Stack>
  )
}
export default MaxAIMiniButton
