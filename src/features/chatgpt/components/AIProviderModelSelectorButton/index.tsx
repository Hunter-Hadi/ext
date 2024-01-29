import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import ClickAwayListener from '@mui/material/ClickAwayListener'
import Grow from '@mui/material/Grow'
import Popper from '@mui/material/Popper'
import { SxProps } from '@mui/material/styles'
import { TooltipProps } from '@mui/material/Tooltip'
import Typography from '@mui/material/Typography'
import React, { FC } from 'react'

import AIModelSelectorCard from '@/features/chatgpt/components/AIProviderModelSelectorCard'
import AIProviderIcon from '@/features/chatgpt/components/icons/AIProviderIcon'
import ThirdPartyAIProviderIcon from '@/features/chatgpt/components/icons/ThirdPartyAIProviderIcon'
import useAIProviderModels from '@/features/chatgpt/hooks/useAIProviderModels'
import useThirdAIProviderModels from '@/features/chatgpt/hooks/useThirdAIProviderModels'
import { getMaxAISidebarRootElement } from '@/features/common/utils'
import { getAppContextMenuRootElement } from '@/utils'

const AIProviderModelSelectorButton: FC<{
  sx?: SxProps
  size?: 'normal' | 'small'
  placement?: TooltipProps['placement']
}> = (props) => {
  const { sx, size = 'normal', placement } = props
  const {
    currentAIProvider = 'USE_CHAT_GPT_PLUS',
    currentAIProviderModelDetail,
  } = useAIProviderModels()
  const { isSelectedThirdAIProvider } = useThirdAIProviderModels()
  const [open, setOpen] = React.useState(false)
  const anchorRef = React.useRef<HTMLButtonElement>(null)

  const handleToggle = () => {
    setOpen((prevOpen) => !prevOpen)
  }

  const handleClose = (event: Event | React.SyntheticEvent) => {
    if (
      anchorRef.current &&
      anchorRef.current.contains(event.target as HTMLElement)
    ) {
      return
    }
    setOpen(false)
  }

  // return focus to the button when we transitioned from !open -> open
  const prevOpen = React.useRef(open)
  React.useEffect(() => {
    if (prevOpen.current === true && open === false) {
      anchorRef.current!.focus()
    }
    prevOpen.current = open
  }, [open])

  return (
    <Box>
      <Button
        disableRipple
        id={'max-ai__ai-provider-floating-button'}
        ref={anchorRef}
        sx={{
          position: 'relative',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          borderRadius: 2,
          cursor: 'pointer',
          bgcolor: (t) => (t.palette.mode === 'dark' ? '#3B3D3E' : '#E9E9EB'),
          // boxShadow:
          //   '0px 0px 0.5px 0px rgba(0, 0, 0, 0.40), 0px 1px 3px 0px rgba(0, 0, 0, 0.09), 0px 4px 8px 0px rgba(0, 0, 0, 0.09);',
          p: 0.5,
          ...sx,
        }}
        aria-controls={open ? 'composition-menu' : undefined}
        aria-expanded={open ? 'true' : undefined}
        aria-haspopup="true"
        onClick={handleToggle}
      >
        {isSelectedThirdAIProvider ? (
          <ThirdPartyAIProviderIcon
            sx={{
              fontSize: '20px',
            }}
          />
        ) : (
          <AIProviderIcon aiProviderType={currentAIProvider} />
        )}
        {currentAIProviderModelDetail?.title && (
          <Typography
            ml={0.5}
            fontSize={14}
            lineHeight={1.4}
            color="text.secondary"
            sx={{
              userSelect: 'none',
            }}
          >
            {currentAIProviderModelDetail.title}
          </Typography>
        )}
        <Popper
          open={open}
          anchorEl={anchorRef.current}
          role={undefined}
          placement={placement || 'top-start'}
          transition
          modifiers={[
            {
              name: 'offset',
              options: {
                offset: [0, 8],
              },
            },
          ]}
          container={
            size === 'small'
              ? getAppContextMenuRootElement()
              : getMaxAISidebarRootElement()
          }
        >
          {({ TransitionProps, placement }) => (
            <Grow
              {...TransitionProps}
              style={{
                transformOrigin:
                  placement === 'bottom-start' ? 'left top' : 'left bottom',
              }}
            >
              <Box>
                <ClickAwayListener
                  onClickAway={(event) => {
                    const aiProviderCard = getMaxAISidebarRootElement()?.querySelector(
                      '#MaxAIProviderSelectorCard',
                    ) as HTMLElement
                    if (aiProviderCard) {
                      const rect = aiProviderCard.getBoundingClientRect()
                      const x = (event as MouseEvent).clientX
                      const y = (event as MouseEvent).clientY
                      if (
                        x > rect.left &&
                        x < rect.right &&
                        y > rect.top &&
                        y < rect.bottom
                      ) {
                        // 点击在卡片内部
                        return
                      }
                      handleClose(event)
                      event.stopPropagation()
                    }
                  }}
                >
                  <Box>
                    <AIModelSelectorCard onClose={handleClose} />
                  </Box>
                </ClickAwayListener>
              </Box>
            </Grow>
          )}
        </Popper>
      </Button>
    </Box>
  )
}
export default AIProviderModelSelectorButton