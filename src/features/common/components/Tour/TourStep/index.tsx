import { CloseOutlined } from '@mui/icons-material'
import Box from '@mui/material/Box'
import Button, { buttonClasses } from '@mui/material/Button'
import IconButton from '@mui/material/IconButton'
import Paper from '@mui/material/Paper'
import Stack from '@mui/material/Stack'
import { SxProps } from '@mui/material/styles'
import Typography from '@mui/material/Typography'
import type { FC, ReactNode } from 'react'
import * as React from 'react'
import { useTranslation } from 'react-i18next'

import { Gap } from '@/features/common/components/Tour/hooks/useTarget'
import { TourPlacement } from '@/features/common/components/Tour/TourMask'
import TriangleArrow from '@/features/common/components/Tour/TourStep/TriangleArrow'
import { useCustomTheme } from '@/hooks/useCustomTheme'

type VirtualElement = {
  getBoundingClientRect: () => {
    width: number
    left: number
    top: number
    height: number
  }
}

export interface TourStepInfo {
  arrow?: boolean | { pointAtCenter: boolean }
  target?:
    | null
    | HTMLElement
    | ((rootContainer?: HTMLElement) => VirtualElement | null | HTMLElement)
  title: ReactNode
  description?: ReactNode
  imgCover?: string
  placement?: TourPlacement
  mask?:
    | boolean
    | {
        style?: React.CSSProperties
        // to fill mask color, e.g. rgba(80,0,0,0.5)
        color?: string
      }
  scrollIntoViewOptions?: boolean | ScrollIntoViewOptions
  closeIcon?: ReactNode
  sx?: SxProps
  renderPanel?: (step: TourStepProps, current: number) => ReactNode
  gap?: Gap
}

export interface TourStepProps extends TourStepInfo {
  total?: number
  current?: number
  onClose?: () => void
  onFinish?: () => void
  onPrev?: () => void
  onNext?: () => void
}

const DefaultPanel: FC<TourStepProps> = (props) => {
  const {
    title,
    description,
    imgCover,
    arrow,
    placement,
    onNext,
    onPrev,
    onFinish,
    onClose,
    closeIcon,
    current,
    total,
    sx,
  } = props
  const { t } = useTranslation(['maxai_tour'])
  const isFinish = current === total
  const isFirst = current === 1
  const theme = useCustomTheme()
  const borderColor = theme.customTheme.palette.background.paper
  return (
    <Paper
      elevation={1}
      sx={{
        position: 'relative',
        backgroundColor: 'background.paper',
        display: 'flex',
        flexDirection: 'column',
        ...sx,
      }}
    >
      {imgCover && (
        <Box
          sx={{
            borderRadius: '8px 8px 0 0',
            width: '100%',
            '& > img': {
              width: '100%',
              height: 'auto',
            },
          }}
        >
          <img src={imgCover} alt={`MaxAI tour step of ${current}`} />
        </Box>
      )}
      <Stack sx={{ p: 1.5 }}>
        {placement && arrow && (
          <TriangleArrow
            placement={placement}
            arrowSize={8}
            arrowColor={borderColor}
          />
        )}
        {closeIcon !== null && (
          <IconButton
            sx={{
              position: 'absolute',
              top: 12,
              right: 12,
            }}
            onClick={onClose}
          >
            {closeIcon ? (
              closeIcon
            ) : (
              <CloseOutlined
                sx={{ fontSize: '16px', color: 'text.secondary' }}
              />
            )}
          </IconButton>
        )}
        <Typography
          textAlign={'left'}
          component={'div'}
          fontSize={'20px'}
          color={'text.primary'}
          sx={{ mb: 1 }}
          noWrap
        >
          {title}
        </Typography>
        {description}
        <Stack
          mt={2}
          direction={'row'}
          alignItems={'center'}
          justifyContent={'space-between'}
        >
          <Stack direction={'row'} alignItems={'center'} width={0} flex={1}>
            <Typography
              fontSize={'12px'}
              textAlign={'left'}
              color={'text.primary'}
            >
              {current}
              {` ${t('maxai_tour:text_of')} `}
              {total}
            </Typography>
          </Stack>
          <Stack
            direction={'row'}
            alignItems={'center'}
            gap={1}
            flexShrink={0}
            sx={{
              [`.${buttonClasses.root}`]: {
                height: '40px',
                padding: '6px 8px',
                borderRadius: '8px',
              },
            }}
          >
            {!isFirst && (
              <Button variant={'outlined'} onClick={onPrev}>
                {t('maxai_tour:button__back__title')}
              </Button>
            )}
            {isFinish ? (
              <Button variant={'contained'} onClick={onFinish}>
                {t('maxai_tour:button__finish__title')}
              </Button>
            ) : (
              <Button variant={'contained'} onClick={onNext}>
                {t('maxai_tour:button__next__title')}
              </Button>
            )}
          </Stack>
        </Stack>
      </Stack>
    </Paper>
  )
}

const TourStep = (props: TourStepProps) => {
  const { current, renderPanel } = props

  return (
    <>
      {typeof renderPanel === 'function' ? (
        renderPanel(props, current!)
      ) : (
        <DefaultPanel {...props} />
      )}
    </>
  )
}

export default TourStep
