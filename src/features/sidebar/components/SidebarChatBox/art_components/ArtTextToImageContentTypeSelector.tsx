import Stack from '@mui/material/Stack'
import Tooltip from '@mui/material/Tooltip'
import Typography from '@mui/material/Typography'
import React, { FC, useMemo } from 'react'
import { useTranslation } from 'react-i18next'

import { BaseSelect } from '@/components/select'
import { IOptionType } from '@/components/select/BaseSelect'
import { MAXAI_IMAGE_GENERATE_MODELS } from '@/features/art/constant'
import { useSingleThirdProviderSettings } from '@/features/chatgpt/hooks/useThirdProviderSettings'

const ArtTextToImageContentTypeSelector: FC = () => {
  const [
    maxAIArtProviderSettings,
    updateMaxAIArtProviderSettings,
  ] = useSingleThirdProviderSettings('MAXAI_ART')
  const { t } = useTranslation(['common', 'client'])
  const currentOptions = useMemo(() => {
    const currentModel = maxAIArtProviderSettings?.model
    const settings = MAXAI_IMAGE_GENERATE_MODELS.find(
      (model) => model.value === currentModel,
    )
    if (settings) {
      return settings.contentTypes.map((contentType) => {
        return {
          label: contentType.label(t),
          value: contentType.value,
          origin: contentType,
        } as IOptionType
      })
    } else {
      return []
    }
  }, [maxAIArtProviderSettings, t])
  const RenderIcon = (option: IOptionType, size = 24) => {
    const src = option?.origin?.exampleImage || ''
    if (!src) {
      return null
    }
    try {
      return (
        <img
          width={size}
          height={size}
          alt={`${option.value as string} example`}
          src={src}
        />
      )
    } catch (e) {
      return null
    }
  }
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
      sx={{ width: '100%' }}
      size={'small'}
      label={t('client:art__text_to_image__advanced__content_type__title')}
      labelSx={{
        fontSize: 16,
      }}
      options={currentOptions}
      value={maxAIArtProviderSettings?.contentType || '1:1'}
      onChange={async (value) => {
        await updateMaxAIArtProviderSettings({
          contentType: value as string,
        })
      }}
      labelProp={{
        p: 0,
        pointerEvents: 'auto!important',
      }}
      renderValue={(value) => {
        const option =
          currentOptions.find((item) => item.value === value) ||
          currentOptions[0]
        return (
          <Stack
            sx={{ padding: '6px 0' }}
            direction={'row'}
            alignItems={'center'}
            spacing={1}
          >
            {RenderIcon(option)}
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
            title={undefined}
          >
            <Stack
              sx={{ padding: '6px 16px' }}
              width={'100%'}
              direction={'row'}
              alignItems={'center'}
              spacing={1}
            >
              {RenderIcon(option)}
              <Typography
                component={'span'}
                fontSize={14}
                color={'text.primary'}
                textAlign={'left'}
                noWrap
              >
                {option.label}
              </Typography>
            </Stack>
          </Tooltip>
        )
      }}
    />
  )
}
export default ArtTextToImageContentTypeSelector
