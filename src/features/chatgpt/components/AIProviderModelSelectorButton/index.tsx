import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Grow from '@mui/material/Grow'
import Popper from '@mui/material/Popper'
import Stack from '@mui/material/Stack'
import { SxProps } from '@mui/material/styles'
import { TooltipProps } from '@mui/material/Tooltip'
import Typography from '@mui/material/Typography'
import React, { FC, useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { MAXAI_CHATGPT_MODEL_GPT_3_5_TURBO } from '@/background/src/chat/UseChatGPTChat/types'
import { ContextMenuIcon } from '@/components/ContextMenuIcon'
import TextOnlyTooltip from '@/components/TextOnlyTooltip'
import { isThirdPartyAIProvider } from '@/features/chatgpt'
import AIModelSelectorCard from '@/features/chatgpt/components/AIProviderModelSelectorCard'
import { ChatAIProviderModelSelectorOptions } from '@/features/chatgpt/components/AIProviderModelSelectorCard/AIProviderModelSelectorOptions'
import AIProviderIcon from '@/features/chatgpt/components/icons/AIProviderIcon'
import ThirdPartyAIProviderIcon from '@/features/chatgpt/components/icons/ThirdPartyAIProviderIcon'
import { useAIProviderModelsMap } from '@/features/chatgpt/hooks/useAIProviderModels'
import { SIDEBAR_CONVERSATION_TYPE_DEFAULT_CONFIG } from '@/features/chatgpt/hooks/useClientConversation'
import useSmoothConversationLoading from '@/features/chatgpt/hooks/useSmoothConversationLoading'
import { getMaxAISidebarRootElement } from '@/features/common/utils'
import useSidebarSettings from '@/features/sidebar/hooks/useSidebarSettings'
import { ISidebarConversationType } from '@/features/sidebar/types'
import { getAppContextMenuRootElement } from '@/utils'

const AIProviderModelSelectorButton: FC<{
  disabled?: boolean
  sidebarConversationType: ISidebarConversationType
  sx?: SxProps
  size?: 'normal' | 'small'
  placement?: TooltipProps['placement']
}> = (props) => {
  const { t } = useTranslation(['client'])
  const {
    sx,
    size = 'normal',
    placement,
    sidebarConversationType,
    disabled,
  } = props
  const { smoothConversationLoading } = useSmoothConversationLoading()
  const [isHoverButton, setIsHoverButton] = useState(false)
  const { sidebarConversationTypeofConversationMap } = useSidebarSettings()
  // 当前sidebarConversationType的AI provider
  const currentChatAIProvider =
    sidebarConversationTypeofConversationMap[sidebarConversationType]?.meta
      .AIProvider ||
    SIDEBAR_CONVERSATION_TYPE_DEFAULT_CONFIG[sidebarConversationType].AIProvider
  // 当前sidebarConversationType的AI model
  const currentChatModel =
    sidebarConversationTypeofConversationMap[sidebarConversationType]?.meta
      .AIModel ||
    SIDEBAR_CONVERSATION_TYPE_DEFAULT_CONFIG[sidebarConversationType].AIModel
  const { AI_PROVIDER_MODEL_MAP } = useAIProviderModelsMap()
  const currentModelDetail = useMemo(() => {
    const AIProviderSelectorModel = ChatAIProviderModelSelectorOptions.find(
      (option) => option.value === currentChatModel,
    )
    if (
      AIProviderSelectorModel &&
      AIProviderSelectorModel.AIProvider === currentChatAIProvider
    ) {
      // 说明是从AI Provider Selector选中的Model
      return {
        label: AIProviderSelectorModel.label,
        value: AIProviderSelectorModel.value,
        AIProvider: AIProviderSelectorModel.AIProvider,
      }
    }
    const models = AI_PROVIDER_MODEL_MAP[currentChatAIProvider]
    const currentModel =
      models.find((model) => model.value === currentChatModel) || models?.[0]
    if (!currentModel) {
      return {
        label: MAXAI_CHATGPT_MODEL_GPT_3_5_TURBO,
        value: MAXAI_CHATGPT_MODEL_GPT_3_5_TURBO,
        AIProvider: 'USE_CHAT_GPT_PLUS',
      }
    }
    return {
      label: currentModel?.title || '',
      value: currentModel?.value || '',
      AIProvider: currentChatAIProvider,
    }
  }, [AI_PROVIDER_MODEL_MAP, currentChatModel, currentChatAIProvider])
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
  useEffect(() => {
    if (prevOpen.current === true && open === false) {
      anchorRef.current!.focus()
    }
    prevOpen.current = open
  }, [open])
  useEffect(() => {
    const mouseEventHandler = (event: MouseEvent) => {
      const aiProviderCard =
        size === 'small'
          ? (getAppContextMenuRootElement()?.querySelector(
              '#MaxAIProviderSelectorCard',
            ) as HTMLElement)
          : (getMaxAISidebarRootElement()?.querySelector(
              '#MaxAIProviderSelectorCard',
            ) as HTMLElement)
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
    }
    document.addEventListener('mousedown', mouseEventHandler)
    return () => {
      document.removeEventListener('mousedown', mouseEventHandler)
    }
  }, [open])
  return (
    <Box>
      <Button
        disabled={disabled || smoothConversationLoading}
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
        <TextOnlyTooltip
          title={t(
            'client:sidebar__ai_provider__model_selector__button__tooltip',
          )}
          open={isHoverButton && !open}
          placement={placement}
        >
          <Stack
            direction={'row'}
            alignItems={'center'}
            onMouseEnter={() => {
              setIsHoverButton(true)
            }}
            onMouseLeave={() => {
              setIsHoverButton(false)
            }}
          >
            {isThirdPartyAIProvider(currentChatAIProvider) ? (
              <ThirdPartyAIProviderIcon
                sx={{
                  fontSize: '20px',
                }}
              />
            ) : (
              <AIProviderIcon aiProviderType={currentChatAIProvider} />
            )}
            {currentModelDetail?.label && (
              <Typography
                mx={0.5}
                fontSize={14}
                lineHeight={1.4}
                color="text.secondary"
                sx={{
                  userSelect: 'none',
                }}
              >
                {currentModelDetail.label}
              </Typography>
            )}
            {!disabled && (
              <ContextMenuIcon
                icon={'ExpandMore'}
                sx={{
                  color: 'text.secondary',
                  fontSize: '16px',
                }}
              />
            )}
          </Stack>
        </TextOnlyTooltip>
      </Button>
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
              <AIModelSelectorCard
                sidebarConversationType={sidebarConversationType}
                onClose={handleClose}
              />
            </Box>
          </Grow>
        )}
      </Popper>
    </Box>
  )
}
export default AIProviderModelSelectorButton
