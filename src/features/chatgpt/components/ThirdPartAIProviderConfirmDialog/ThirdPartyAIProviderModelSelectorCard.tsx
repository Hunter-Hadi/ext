import Button from '@mui/material/Button'
import Stack from '@mui/material/Stack'
import { SxProps } from '@mui/material/styles'
import Tooltip from '@mui/material/Tooltip'
import Typography from '@mui/material/Typography'
import last from 'lodash-es/last'
import React, { FC, useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useRecoilValue } from 'recoil'

import { IAIProviderType } from '@/background/provider/chat'
import { AIChipIcon } from '@/components/CustomIcon'
import { BaseSelect } from '@/components/select'
import AIProviderModelSelectorDetail from '@/features/chatgpt/components/AIProviderModelSelectorCard/AIProviderModelSelectorDetail'
import AIProviderOptions, {
  AIProviderOptionType,
} from '@/features/chatgpt/components/AIProviderModelSelectorCard/AIProviderOptions'
import ThirdPartyAIProviderIcon from '@/features/chatgpt/components/icons/ThirdPartyAIProviderIcon'
import AIProviderAuthButton from '@/features/chatgpt/components/ThirdPartAIProviderConfirmDialog/AIProviderAuthButton'
import AIProviderInfoCard from '@/features/chatgpt/components/ThirdPartAIProviderConfirmDialog/AIProviderInfoCard'
import useThirdAIProviderModels from '@/features/chatgpt/hooks/useThirdAIProviderModels'
import { ChatGPTClientState } from '@/features/chatgpt/store'
import { IAIProviderModel } from '@/features/chatgpt/types'
import AppLoadingLayout from '@/features/common/components/AppLoadingLayout'
import { list2Options } from '@/utils/dataHelper/arrayHelper'

const ThirdPartyAIProvidersOptions = list2Options(
  AIProviderOptions.filter((AIProviderOption) => AIProviderOption.thirdParty),
  {
    labelKey: 'label',
    valueKey: 'value',
  },
)

const ThirdPartyAIProviderModelSelectorCard: FC<{
  sx?: SxProps
}> = (props) => {
  const { sx } = props
  const { t } = useTranslation(['client'])
  const chatGPTClientState = useRecoilValue(ChatGPTClientState)
  const [
    userSelectAIProvider,
    setUserSelectAIProvider,
  ] = useState<IAIProviderType | null>(null)
  const [useSelectAIProviderModel, setUserSelectAIProviderModel] = useState<
    string | null
  >(null)
  const [isContinue, setIsContinue] = useState(false)
  const {
    currentThirdAIProvider,
    currentThirdAIProviderModel,
    currentThirdAIProviderDetail,
    isSelectedThirdAIProvider,
    updateThirdAIProviderModel,
    AI_PROVIDER_MODEL_MAP,
    hideThirdPartyAIProviderConfirmDialog,
  } = useThirdAIProviderModels()
  const memoizedThirdAIProviderModelOptions = useMemo(() => {
    if (userSelectAIProvider) {
      return list2Options(AI_PROVIDER_MODEL_MAP[userSelectAIProvider], {
        labelKey: 'title',
        valueKey: 'value',
      })
    }
    if (currentThirdAIProvider) {
      return list2Options(AI_PROVIDER_MODEL_MAP[currentThirdAIProvider], {
        labelKey: 'title',
        valueKey: 'value',
      })
    }
    return []
  }, [userSelectAIProvider, currentThirdAIProvider, AI_PROVIDER_MODEL_MAP])
  // 当用户选择了AIProvider，但是没有选择AIProviderModel时，自动选择第一个AIProviderModel
  useEffect(() => {
    if (
      userSelectAIProvider &&
      !useSelectAIProviderModel &&
      memoizedThirdAIProviderModelOptions.length > 0
    ) {
      setUserSelectAIProviderModel(
        last(memoizedThirdAIProviderModelOptions)?.value,
      )
    }
  }, [
    userSelectAIProvider,
    useSelectAIProviderModel,
    memoizedThirdAIProviderModelOptions,
  ])
  useEffect(() => {
    if (isContinue && chatGPTClientState.status === 'success') {
      hideThirdPartyAIProviderConfirmDialog()
    }
  }, [chatGPTClientState.status, isContinue])
  return (
    <Stack
      sx={{
        position: 'absolute',
        width: '100%',
        left: 0,
        bottom: 0,
        gap: 3,
        px: 2,
        py: 1.5,
        bgcolor: (t) =>
          t.palette.mode === 'dark' ? 'rgb(75,77,77)' : 'rgb(246,243,249)',
        ...sx,
      }}
    >
      <Stack direction={'row'} spacing={1} alignItems="center">
        <AIChipIcon
          sx={{
            color: '#0FA47F',
            fontSize: '24px',
          }}
        />
        <Typography
          fontSize={16}
          fontWeight={500}
          color={'text.primary'}
          lineHeight={1.5}
        >
          {t(
            'client:provider__third_party_confirm_dialog__choose_third_party__title',
          )}
        </Typography>
      </Stack>
      <AppLoadingLayout loading={!currentThirdAIProviderModel}>
        <Stack direction={'row'} alignItems={'center'} gap={2}>
          <BaseSelect
            onChange={(value) => {
              setUserSelectAIProvider(value as IAIProviderType)
              setUserSelectAIProviderModel(null)
            }}
            sx={{
              width: '192px',
            }}
            MenuProps={{
              style: {
                zIndex: 2147483640,
              },
            }}
            defaultValue={currentThirdAIProvider}
            options={ThirdPartyAIProvidersOptions}
            label={t(
              'client:provider__third_party_confirm_dialog__choose_third_party__selector__ai_provider__title',
            )}
            renderValue={(value) => {
              const option = ThirdPartyAIProvidersOptions.find(
                (option) => option.value === value,
              )
              return (
                <Stack
                  width={'100%'}
                  direction={'row'}
                  alignItems={'center'}
                  spacing={1}
                >
                  <ThirdPartyAIProviderIcon />
                  <Typography
                    component={'span'}
                    fontSize={14}
                    color={'text.primary'}
                    textAlign={'left'}
                    noWrap
                  >
                    {option?.label}
                  </Typography>
                </Stack>
              )
            }}
            renderLabel={(value, option) => {
              const original = option.origin as AIProviderOptionType
              if (!original) {
                return null
              }
              return (
                <Tooltip
                  placement={'right'}
                  PopperProps={{
                    sx: {
                      zIndex: 2147483641,
                    },
                  }}
                  componentsProps={{
                    tooltip: {
                      sx: {
                        border: '1px solid rgb(224,224,224)',
                        bgcolor: 'background.paper',
                        p: 1,
                      },
                    },
                  }}
                  title={
                    <Stack spacing={1} width={'160px'}>
                      <AIProviderInfoCard aiProviderOption={original} />
                    </Stack>
                  }
                >
                  <Stack
                    width={'100%'}
                    direction={'row'}
                    alignItems={'center'}
                    spacing={1}
                  >
                    <ThirdPartyAIProviderIcon />
                    <Typography
                      component={'span'}
                      fontSize={14}
                      color={'text.primary'}
                      textAlign={'left'}
                      noWrap
                    >
                      {original.label}
                    </Typography>
                  </Stack>
                </Tooltip>
              )
            }}
          />
          {memoizedThirdAIProviderModelOptions.length > 0 && (
            <BaseSelect
              onChange={(value) => {
                setUserSelectAIProviderModel(value as string)
              }}
              sx={{
                width: '192px',
              }}
              MenuProps={{
                style: {
                  zIndex: 2147483640,
                },
              }}
              value={useSelectAIProviderModel || currentThirdAIProviderModel}
              options={memoizedThirdAIProviderModelOptions}
              label={t(
                'client:provider__third_party_confirm_dialog__choose_third_party__selector__ai_provider_model__title',
              )}
              renderValue={(value) => {
                const option = memoizedThirdAIProviderModelOptions.find(
                  (option) => option.value === value,
                )
                return (
                  <Stack
                    width={'100%'}
                    direction={'row'}
                    alignItems={'center'}
                    spacing={1}
                  >
                    <Typography
                      component={'span'}
                      fontSize={14}
                      color={'text.primary'}
                      textAlign={'left'}
                      noWrap
                    >
                      {option?.label}
                    </Typography>
                  </Stack>
                )
              }}
              renderLabel={(value, option) => {
                const original = option.origin as IAIProviderModel
                if (!original) {
                  return null
                }
                return (
                  <Tooltip
                    placement={'left'}
                    PopperProps={{
                      sx: {
                        zIndex: 2147483641,
                      },
                    }}
                    componentsProps={{
                      tooltip: {
                        sx: {
                          border: '1px solid rgb(224,224,224)',
                          bgcolor: 'background.paper',
                          p: 1,
                        },
                      },
                    }}
                    title={
                      <Stack spacing={1} width={'160px'}>
                        <AIProviderModelSelectorDetail
                          hideAIProviderIcon
                          AIProvider={
                            userSelectAIProvider ||
                            currentThirdAIProvider ||
                            'OPENAI'
                          }
                          AIProviderModel={original.value}
                        />
                      </Stack>
                    }
                  >
                    <Stack
                      width={'100%'}
                      direction={'row'}
                      alignItems={'center'}
                      spacing={1}
                    >
                      <Typography
                        component={'span'}
                        fontSize={14}
                        color={'text.primary'}
                        textAlign={'left'}
                        noWrap
                      >
                        {original.title}
                      </Typography>
                    </Stack>
                  </Tooltip>
                )
              }}
            />
          )}
        </Stack>
      </AppLoadingLayout>
      {!isContinue && (
        <Button
          variant={'contained'}
          sx={{
            borderRadius: '8px',
            fontSize: '14px',
            fontWeight: 400,
            width: '100%',
            px: '0',
            py: '6px',
            height: '40px',
          }}
          onClick={async () => {
            if (
              (currentThirdAIProvider || userSelectAIProvider) &&
              (currentThirdAIProviderModel || useSelectAIProviderModel)
            ) {
              await updateThirdAIProviderModel(
                userSelectAIProvider || currentThirdAIProvider!,
                useSelectAIProviderModel || currentThirdAIProviderModel!,
              )
              setIsContinue(true)
            }
          }}
        >
          {t('client:provider__third_party_confirm_dialog__continue__title')}
        </Button>
      )}
      {isContinue &&
        isSelectedThirdAIProvider &&
        currentThirdAIProviderDetail && (
          <AIProviderAuthButton
            aiProviderOption={currentThirdAIProviderDetail}
          />
        )}
    </Stack>
  )
}
export default ThirdPartyAIProviderModelSelectorCard
