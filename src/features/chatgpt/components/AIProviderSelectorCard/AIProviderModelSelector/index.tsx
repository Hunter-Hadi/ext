import React, { FC, useEffect, useMemo } from 'react'
import { BaseSelect } from '@/components/select'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import Tooltip from '@mui/material/Tooltip'
import useAIProviderModels from '@/features/chatgpt/hooks/useAIProviderModels'
import { list2Options } from '@/utils/dataHelper/arrayHelper'
import { IAIProviderModel } from '@/features/chatgpt/types'
import Chip from '@mui/material/Chip'
import { useTranslation } from 'react-i18next'
import { USE_CHAT_GPT_PLUS_MODELS } from '@/background/src/chat/UseChatGPTChat/types'

const AIProviderModelSelector: FC = () => {
  const { t } = useTranslation(['common', 'client'])
  const {
    aiProviderModel,
    aiProviderModels,
    loading,
    updateAIProviderModel,
    aiProvider,
  } = useAIProviderModels()
  const aiProviderModelsOptions = useMemo(
    () =>
      list2Options(aiProviderModels, {
        labelKey: 'title',
        valueKey: 'value',
      }),
    [aiProviderModels],
  )
  useEffect(() => {
    if (aiProviderModel && aiProviderModels.length > 0) {
      const modelIsNotFind = aiProviderModels.every(
        (item) => item.value !== aiProviderModel,
      )
      const modelIsDisabled = aiProviderModels.find(
        (model) => model.value === aiProviderModel,
      )?.disabled
      // 如果当前选中的model不在列表中或者被禁用了，就选中第一个，但是因为我们的列表是从下往上排的，所以要选最后一个不是禁用的
      if (modelIsNotFind || modelIsDisabled) {
        for (let i = aiProviderModels.length - 1; i >= 0; i--) {
          if (!aiProviderModels[i].disabled) {
            updateAIProviderModel(aiProviderModels[i].value).then().catch()
            break
          }
        }
      }
    }
  }, [aiProviderModels, aiProviderModel])
  return (
    <BaseSelect
      displayLoading={false}
      MenuProps={{
        elevation: 0,
        anchorOrigin: {
          vertical: 'top',
          horizontal: 'left',
        },
        transformOrigin: {
          vertical: 'bottom',
          horizontal: 'left',
        },
        MenuListProps: {
          sx: {
            border: `1px solid`,
            borderColor: 'customColor.borderColor',
          },
        },
      }}
      onPermission={async () => {
        if (aiProvider === 'USE_CHAT_GPT_PLUS') {
          // 恢复为gpt3.5 turbo, 这里不用ai provider models是因为已经倒序了
          await updateAIProviderModel(USE_CHAT_GPT_PLUS_MODELS[0].value)
        }
        return {
          success: false,
        }
      }}
      sx={{ width: '100%' }}
      size={'small'}
      loading={loading}
      label={t('common:model')}
      labelSx={{
        fontSize: 16,
      }}
      options={aiProviderModelsOptions}
      value={aiProviderModel}
      onChange={async (value) => {
        await updateAIProviderModel(value as string)
      }}
      labelProp={{
        p: 0,
        pointerEvents: 'auto!important',
      }}
      renderValue={(value) => {
        const option = aiProviderModelsOptions.find(
          (item) => item.value === value,
        )
        return (
          <Stack
            sx={{ padding: '6px 0' }}
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
              {t(
                option?.label ||
                  'client:provider__model__selector__placeholder',
              )}
            </Typography>
          </Stack>
        )
      }}
      renderLabel={(value, option) => {
        const original = option.origin as IAIProviderModel
        return (
          <Tooltip
            placement={'left'}
            PopperProps={{
              sx: {
                zIndex: 2147483620,
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
                <Stack textAlign={'left'} width={'100%'} spacing={2}>
                  {original.disabled && (
                    <Typography
                      fontSize={'14px'}
                      color={'text.primary'}
                      textAlign={'left'}
                      fontWeight={700}
                    >
                      {t(
                        'client:provider__model__selector__disabled__description',
                      )}
                    </Typography>
                  )}
                  <Typography
                    fontSize={'14px'}
                    color={'text.primary'}
                    textAlign={'left'}
                    fontWeight={'bold'}
                  >
                    {original?.title}
                  </Typography>
                </Stack>
                {original.tags.length > 0 && (
                  <Stack direction={'row'} flexWrap={'wrap'} gap={'4px'}>
                    {original.tags.map((tag) => {
                      return (
                        <Chip
                          sx={{
                            fontSize: '12px',
                            height: '18px',
                            textTransform: 'capitalize',
                            flexShrink: 0,
                            '& > span': {
                              px: '6px',
                            },
                          }}
                          key={tag}
                          label={tag}
                          color="primary"
                          size={'small'}
                          variant={'outlined'}
                        />
                      )
                    })}
                  </Stack>
                )}
                {original.descriptions.map((item, index) => {
                  return (
                    <Stack spacing={0.5} key={index}>
                      <Typography
                        fontSize={'12px'}
                        color={'text.secondary'}
                        textAlign={'left'}
                      >
                        {item.label(t)}:
                      </Typography>
                      <Typography
                        fontSize={'12px'}
                        color={'text.primary'}
                        textAlign={'left'}
                      >
                        {item.value(t)}
                      </Typography>
                    </Stack>
                  )
                })}
              </Stack>
            }
          >
            <Stack
              sx={{ padding: '6px 16px' }}
              width={'100%'}
              direction={'row'}
              alignItems={'center'}
              spacing={1}
              onClick={(event) => {
                if (original.disabled) {
                  event.stopPropagation()
                  event.preventDefault()
                }
              }}
            >
              <Typography
                component={'span'}
                fontSize={14}
                color={'text.primary'}
                textAlign={'left'}
                noWrap
              >
                {t(
                  (original.title as any) ||
                    'client:provider__model__selector__placeholder',
                )}
              </Typography>
              {original.titleTag && (
                <Chip
                  sx={{
                    ml: 1,
                    textTransform: 'capitalize',
                    fontSize: '14px',
                    flexShrink: 0,
                  }}
                  label={original.titleTag}
                  color="primary"
                  size={'small'}
                  variant={'outlined'}
                />
              )}
            </Stack>
          </Tooltip>
        )
      }}
    />
  )
}
export default AIProviderModelSelector
