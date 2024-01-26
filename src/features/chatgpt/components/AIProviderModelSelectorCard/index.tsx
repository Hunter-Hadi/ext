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
import AIProviderModelSelectorOptions, {
  AIProviderModelSelectorOption,
} from '@/features/chatgpt/components/AIProviderModelSelectorCard/AIProviderModelSelectorOptions'
import ThirdPartyAIProviderModelSelectorDetail from '@/features/chatgpt/components/AIProviderModelSelectorCard/ThirdPartyAIProviderModelSelectorDetail'
import AIProviderIcon from '@/features/chatgpt/components/icons/AIProviderIcon'
import AIProviderMainPartIcon from '@/features/chatgpt/components/icons/AIProviderMainPartIcon'
import useAIProviderModels from '@/features/chatgpt/hooks/useAIProviderModels'
import useThirdAIProviderModels from '@/features/chatgpt/hooks/useThirdAIProviderModels'
const BetaIcon: FC = () => {
  const { t } = useTranslation(['common', 'client'])
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
      {t('client:provider__label__beta')}
    </Typography>
  )
}

interface AIModelSelectorCardProps {
  sx?: SxProps
  onClose?: (event: React.MouseEvent<HTMLDivElement>) => void
}
const AIModelSelectorCard: FC<AIModelSelectorCardProps> = (props) => {
  const { sx, onClose } = props
  const { t } = useTranslation(['common', 'client'])
  const [
    hoverModel,
    setHoverModel,
  ] = useState<AIProviderModelSelectorOption | null>(null)
  const [isHoverThirdPartyModel, setIsHoverThirdPartyModel] = useState(false)
  const {
    showThirdPartyAIProviderConfirmDialog,
    isSelectedThirdAIProvider,
  } = useThirdAIProviderModels()
  const {
    currentAIProviderModelDetail,
    updateAIProviderModel,
  } = useAIProviderModels()
  const isSelectedMaxAIMainPartModel = useMemo(() => {
    // hover的优先级最高
    if (hoverModel) {
      return hoverModel
    }
    // 选择了AI模型时，显示AI模型详情
    if (currentAIProviderModelDetail?.value) {
      return (
        AIProviderModelSelectorOptions.find(
          (option) => option.value === currentAIProviderModelDetail.value,
        ) || null
      )
    }
    return null
  }, [currentAIProviderModelDetail?.value, hoverModel])
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
        onKeyDown={(event) => {}}
        sx={{
          width: 188,
          flexShrink: 0,
          borderRight: '1px solid',
          borderColor: '#ebebeb',
          py: 0,
          maxHeight: 210,
          overflow: 'auto',
          [`.${menuItemClasses.root}`]: {
            px: 1,
            borderRight: '2px solid',
            borderColor: 'transparent',
            '&.Mui-selected': {
              borderColor: 'primary.main',
            },
          },
        }}
      >
        {AIProviderModelSelectorOptions.map((AIModelOption) => {
          return (
            <MenuItem
              onMouseEnter={() => {
                setIsHoverThirdPartyModel(false)
                setHoverModel(AIModelOption)
              }}
              key={AIModelOption.value}
              selected={
                !isSelectedThirdAIProvider &&
                AIModelOption.value === currentAIProviderModelDetail?.value
              }
              onClick={async () => {
                await updateAIProviderModel(
                  AIModelOption.AIProvider,
                  AIModelOption.value,
                )
              }}
            >
              <Stack alignItems={'center'} direction={'row'}>
                <AIProviderIcon aiProviderType={AIModelOption.AIProvider} />
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
                  {AIModelOption.beta && <BetaIcon />}
                </Stack>
              </Stack>
            </MenuItem>
          )
        })}
        <Divider sx={{ px: 1 }} />
        <MenuItem
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
            <Typography
              fontSize={'14px'}
              lineHeight={'20px'}
              color={'text.primary'}
            >
              {t(
                'client:sidebar__ai_provider__model_selector__third_party_ai_provider__title',
              )}
            </Typography>
            <KeyboardArrowRightOutlinedIcon
              sx={{
                fontSize: '20px',
              }}
            />
          </Stack>
        </MenuItem>
      </MenuList>
      <Stack width={0} flex={1}>
        {isSelectedMaxAIMainPartModel && !isHoverThirdPartyModel ? (
          <AIProviderModelSelectorDetail
            AIProvider={isSelectedMaxAIMainPartModel.AIProvider}
            AIProviderModel={isSelectedMaxAIMainPartModel.value}
          />
        ) : (
          <ThirdPartyAIProviderModelSelectorDetail />
        )}
      </Stack>
    </Box>
  )
}

export default AIModelSelectorCard
