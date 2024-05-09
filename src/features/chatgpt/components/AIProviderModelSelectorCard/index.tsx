import KeyboardArrowRightOutlinedIcon from '@mui/icons-material/KeyboardArrowRightOutlined'
import Box from '@mui/material/Box'
import Divider from '@mui/material/Divider'
import MenuItem, { menuItemClasses } from '@mui/material/MenuItem'
import MenuList from '@mui/material/MenuList'
import Stack from '@mui/material/Stack'
import { SxProps } from '@mui/material/styles'
import Typography from '@mui/material/Typography'
import React, { FC, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'

import AIProviderModelSelectorDetail from '@/features/chatgpt/components/AIProviderModelSelectorCard/AIProviderModelSelectorDetail'
import {
  AIProviderModelSelectorOption,
  getModelOptionsForConversationType,
} from '@/features/chatgpt/components/AIProviderModelSelectorCard/AIProviderModelSelectorOptions'
import ThirdPartyAIProviderModelSelectorDetail from '@/features/chatgpt/components/AIProviderModelSelectorCard/ThirdPartyAIProviderModelSelectorDetail'
import AIModelIcons from '@/features/chatgpt/components/icons/AIModelIcons'
import AIProviderMainPartIcon from '@/features/chatgpt/components/icons/AIProviderMainPartIcon'
import ThirdPartyAIProviderIcon from '@/features/chatgpt/components/icons/ThirdPartyAIProviderIcon'
import useAIProviderModels, {
  useAIProviderModelsMap,
} from '@/features/chatgpt/hooks/useAIProviderModels'
import {
  useClientConversation,
} from '@/features/chatgpt/hooks/useClientConversation'
import useRemoteAIProviderConfig from '@/features/chatgpt/hooks/useRemoteAIProviderConfig'
import useThirdAIProviderModels from '@/features/chatgpt/hooks/useThirdAIProviderModels'
import { ISidebarConversationType } from '@/features/sidebar/types'
const AIProviderModelTagIcon: FC<{
  tag: string
}> = (props) => {
  const { tag } = props
  return (
    <Typography
      component={'span'}
      fontSize={'8px'}
      fontWeight={500}
      textAlign={'left'}
      letterSpacing={'-0.16px'}
      px={0.25}
      borderRadius={1}
      lineHeight={1.4}
      ml={'4px !important'}
      bgcolor={(t) =>
        t.palette.mode === 'dark'
          ? 'rgba(255, 255, 255, 0.08)'
          : 'rgba(0, 0, 0, 0.08)'
      }
      whiteSpace={'nowrap'}
      sx={{
        borderRadius: '4px',
        border: '1px solid',
        borderColor: 'primary.main',
        color: 'primary.main',
      }}
    >
      {tag}
    </Typography>
  )
}

interface AIModelSelectorCardProps {
  sidebarConversationType: ISidebarConversationType
  currentModelDetail: any
  sx?: SxProps
  onClose?: (event: React.MouseEvent<HTMLDivElement>) => void
}
const AIModelSelectorCard: FC<AIModelSelectorCardProps> = (props) => {
  const { sidebarConversationType, sx, currentModelDetail, onClose } = props
  const { t } = useTranslation(['common', 'client'])
  const [hoverModel, setHoverModel] =
    useState<AIProviderModelSelectorOption | null>(null)
  const [isHoverThirdPartyModel, setIsHoverThirdPartyModel] = useState(false)
  const { showThirdPartyAIProviderConfirmDialog, isSelectedThirdAIProvider } =
    useThirdAIProviderModels()
  const { updateAIProviderModel } = useAIProviderModels()
  const { createConversation } = useClientConversation()
  const { remoteAIProviderConfig } = useRemoteAIProviderConfig()
  const { getAIProviderModelDetail } =
    useAIProviderModelsMap()

  const currentSidebarConversationTypeModels = useMemo(() => {
    return getModelOptionsForConversationType(sidebarConversationType)
      .filter((model) => {
        // 过滤掉被隐藏的AI模型
        return !remoteAIProviderConfig.hiddenAIProviders.includes(
          model.AIProvider,
        )
      })
      .filter((model) => !model.hidden)
      .map((model) => {
        if (model.disabled !== true) {
          model.disabled = remoteAIProviderConfig.disabledAIProviders.includes(
            model.AIProvider,
          )
        }
        return model
      })
  }, [sidebarConversationType, remoteAIProviderConfig.hiddenAIProviders])

  const isSelectedMaxAIModel = useMemo(() => {
    // hover的优先级最高
    if (hoverModel) {
      return hoverModel
    }
    // 选择了AI模型时，显示AI模型详情
    if (currentModelDetail?.value) {
      return (
        currentSidebarConversationTypeModels.find((option) => {
          return (
            option.value === currentModelDetail.value &&
            currentModelDetail.AIProvider === option.AIProvider
          )
        }) || null
      )
    }
    return null
  }, [currentModelDetail?.value, sidebarConversationType, hoverModel])

  return (
    <Box
      onClick={(event: React.MouseEvent<HTMLDivElement>) => {
        event.stopPropagation()
        onClose?.(event)
      }}
      id={'MaxAIProviderSelectorCard'}
      component={'div'}
      sx={{
        borderRadius: '4px',
        border: '1px solid #EBEBEB',
        boxShadow: '0px 4px 8px 0px rgba(0, 0, 0, 0.16)',
        width: 388,
        display: 'flex',
        alignItems: 'stretch',
        justifyContent: 'center',
        flexDirection: 'row',
        bgcolor: 'background.paper',
        ...sx,
      }}
      onMouseLeave={() => {
        setHoverModel(null)
        setIsHoverThirdPartyModel(false)
      }}
    >
      <MenuList
        autoFocusItem
        id={'maxai-ai-model-selector-menu'}
        aria-labelledby="maxai-ai-model-selector-menu"
        sx={{
          overflowY: 'auto',
          overflowX: 'hidden',
          width: 198,
          flexShrink: 0,
          borderRight: '1px solid',
          borderColor: '#ebebeb',
          py: 0,
          maxHeight: 210,
          [`.${menuItemClasses.root}`]: {
            px: 1,
            borderRight: '2px solid',
            borderColor: 'transparent',
            minHeight: 'auto',
            '&.Mui-selected': {
              borderColor: 'primary.main',
            },
          },
        }}
      >
        {currentSidebarConversationTypeModels.map((AIModelOption) => {
          const providerModelDetail = getAIProviderModelDetail(
            AIModelOption.AIProvider,
            AIModelOption.value,
          )
          return (
            <MenuItem
              data-testid={`maxai--ai-model-selector--menu-item--${AIModelOption.value}`}
              data-model-max-tokens={providerModelDetail?.maxTokens || 0}
              disabled={AIModelOption.disabled}
              onMouseEnter={() => {
                setIsHoverThirdPartyModel(false)
                setHoverModel(AIModelOption)
              }}
              key={AIModelOption.value}
              selected={
                !isSelectedThirdAIProvider &&
                AIModelOption.value === currentModelDetail?.value
              }
              onClick={async () => {
                if (isHoverThirdPartyModel || AIModelOption.value === currentModelDetail?.value) {
                  return
                }
                await updateAIProviderModel(
                  AIModelOption.AIProvider,
                  AIModelOption.value,
                )
                await createConversation(
                  sidebarConversationType,
                  AIModelOption.AIProvider,
                  AIModelOption.value,
                )
              }}
            >
              <Stack alignItems={'center'} direction={'row'}>
                <AIModelIcons aiModelValue={AIModelOption.value} />
                <Typography
                  fontSize={'14px'}
                  lineHeight={'20px'}
                  color={'text.primary'}
                  sx={{
                    ml: 1,
                    mr: 0.5,
                  }}
                >
                  {AIModelOption.label}
                </Typography>
                <Stack direction={'row'} alignItems={'center'} gap={0.5}>
                  {AIModelOption.mainPart && <AIProviderMainPartIcon />}
                  {AIModelOption.tag && (
                    <AIProviderModelTagIcon tag={AIModelOption.tag} />
                  )}
                </Stack>
              </Stack>
            </MenuItem>
          )
        })}
        {/*// 占位*/}
        <Box height={'4px'} width={'100%'}></Box>
        {/* NOTE: 只有Chat板块有第三方的*/}
        {sidebarConversationType === 'Chat' && <Divider sx={{ px: 1 }} />}
        {sidebarConversationType === 'Chat' && (
          <MenuItem
            data-testid={`maxai--ai-model-selector--menu-item--third-ai-provider`}
            onMouseEnter={() => {
              setHoverModel(null)
              setIsHoverThirdPartyModel(true)
            }}
            selected={isSelectedThirdAIProvider}
            onClick={() => {
              showThirdPartyAIProviderConfirmDialog()
            }}
          >
            <Stack alignItems={'center'} direction={'row'}>
              <ThirdPartyAIProviderIcon sx={{ fontSize: '20px' }} />
              <Typography
                fontSize={'14px'}
                lineHeight={'20px'}
                color={'text.primary'}
                sx={{
                  ml: 1,
                  mr: 0.5,
                }}
              >
                {t(
                  'client:sidebar__ai_provider__model_selector__third_party_ai_provider__title',
                )}
              </Typography>
              <KeyboardArrowRightOutlinedIcon
                sx={{
                  fontSize: '20px',
                  color: (t) => t.palette.mode === 'dark' ? '#FFF' : 'inherit'
                }}
              />
            </Stack>
          </MenuItem>
        )}
      </MenuList>
      <Stack width={0} flex={1}>
        {isSelectedMaxAIModel && !isHoverThirdPartyModel ? (
          <AIProviderModelSelectorDetail
            AIProvider={isSelectedMaxAIModel.AIProvider}
            AIProviderModel={isSelectedMaxAIModel.value}
          />
        ) : (
          <ThirdPartyAIProviderModelSelectorDetail />
        )}
      </Stack>
    </Box>
  )
}

export default AIModelSelectorCard
