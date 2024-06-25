import RocketLaunchIcon from '@mui/icons-material/RocketLaunch'
import { SxProps } from '@mui/material'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import React, { FC, useMemo } from 'react'
import { useTranslation } from 'react-i18next'

import { PLAN_PRODUCTIVITY_VALUES } from '@/features/pricing/constants'
import { RENDER_PLAN_TYPE } from '@/features/pricing/type'

interface IProps {
  renderType: RENDER_PLAN_TYPE
  sx?: SxProps
}

const PlanProductivityValue: FC<IProps> = ({ renderType, sx }) => {
  const { t } = useTranslation(['client'])

  const productivityValue = useMemo(
    () => PLAN_PRODUCTIVITY_VALUES[renderType],
    [renderType],
  )

  const color = 'primary.main'

  return (
    <Stack direction={'row'} alignItems='center' spacing={0.5} sx={sx}>
      <Typography variant='custom' fontSize={16} lineHeight={1.5} color={color}>
        {t('client:pricing__plan_features__productivity__title')}
      </Typography>
      <Stack direction={'row'} alignItems='center' spacing={0.4}>
        {Array.from({ length: productivityValue }).map((_, index) => {
          return <RocketLaunchIcon key={index} sx={{ color, fontSize: 18 }} />
        })}
      </Stack>
    </Stack>
  )
}

export default PlanProductivityValue
