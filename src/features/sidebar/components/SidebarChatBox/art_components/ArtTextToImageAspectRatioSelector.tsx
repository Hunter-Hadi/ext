import Crop32OutlinedIcon from '@mui/icons-material/Crop32Outlined'
import Crop54OutlinedIcon from '@mui/icons-material/Crop54Outlined'
import Crop75OutlinedIcon from '@mui/icons-material/Crop75Outlined'
import Crop169OutlinedIcon from '@mui/icons-material/Crop169Outlined'
import CropSquareOutlinedIcon from '@mui/icons-material/CropSquareOutlined'
import Stack from '@mui/material/Stack'
import Tooltip from '@mui/material/Tooltip'
import Typography from '@mui/material/Typography'
import React, { FC, useMemo } from 'react'
import { useTranslation } from 'react-i18next'

import { BaseSelect } from '@/components/select'
import { IOptionType } from '@/components/select/BaseSelect'
import { MAXAI_IMAGE_GENERATE_MODELS } from '@/features/art/constant'
import { useSingleThirdProviderSettings } from '@/features/chatgpt/hooks/useThirdProviderSettings'

const ArtTextToImageAspectRatioSelector: FC = () => {
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
      return settings.aspectRatios.map((aspectRatio) => {
        return {
          label: aspectRatio.label(t),
          value: aspectRatio.value,
          origin: aspectRatio,
        } as IOptionType
      })
    } else {
      return []
    }
  }, [maxAIArtProviderSettings, t])
  const RenderIcon = (aspectRatio: string, fontSize = 24) => {
    try {
      const [width, height] = aspectRatio.split(':').map(Number)
      let needRotate = false
      if (height > width) {
        aspectRatio = `${height}:${width}`
        needRotate = true
      }
      const Map = {
        '1:1': (
          <CropSquareOutlinedIcon
            sx={{
              fontSize,
              transform: needRotate ? 'rotate(90deg)' : 'none',
            }}
          />
        ),
        '3:2': (
          <Crop32OutlinedIcon
            sx={{
              fontSize,
              transform: needRotate ? 'rotate(90deg)' : 'none',
            }}
          />
        ),
        '5:4': (
          <Crop54OutlinedIcon
            sx={{
              fontSize,
              transform: needRotate ? 'rotate(90deg)' : 'none',
            }}
          />
        ),
        '7:5': (
          <Crop75OutlinedIcon
            sx={{
              fontSize,
              transform: needRotate ? 'rotate(90deg)' : 'none',
            }}
          />
        ),
        '16:9': (
          <Crop169OutlinedIcon
            sx={{
              fontSize,
              transform: needRotate ? 'rotate(90deg)' : 'none',
            }}
          />
        ),
      }
      return Map[aspectRatio as '1:1'] || Map['1:1']
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
      label={t('client:art__text_to_image__advanced__aspect_ratio__title')}
      labelSx={{
        fontSize: 16,
      }}
      options={currentOptions}
      value={maxAIArtProviderSettings?.aspectRatio || '1:1'}
      onChange={async (value, option) => {
        await updateMaxAIArtProviderSettings({
          aspectRatio: value as string,
          resolution: option.origin.resolution || [1024, 1024],
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
            {RenderIcon(option.value as string)}
            <Typography
              component={'span'}
              fontSize={14}
              color={'text.primary'}
              textAlign={'left'}
              noWrap
            >
              {option?.label}
              {` (${option.value as string})`}
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
              {RenderIcon(option.value as string)}
              <Typography
                component={'span'}
                fontSize={14}
                color={'text.primary'}
                textAlign={'left'}
                noWrap
              >
                {option.label}
                {` (${option.value})`}
              </Typography>
            </Stack>
          </Tooltip>
        )
      }}
    />
  )
}
export default ArtTextToImageAspectRatioSelector
