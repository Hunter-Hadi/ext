import CloseOutlinedIcon from '@mui/icons-material/CloseOutlined'
import FavoriteIcon from '@mui/icons-material/Favorite'
import Button from '@mui/material/Button'
import IconButton from '@mui/material/IconButton'
import Stack from '@mui/material/Stack'
import { SxProps } from '@mui/material/styles'
import Typography from '@mui/material/Typography'
import React, { FC } from 'react'
import { useTranslation } from 'react-i18next'

import { APP_USE_CHAT_GPT_HOST } from '@/constants'
import ProLink from '@/features/common/components/ProLink'
import ResponsiveImage from '@/features/common/components/ResponsiveImage'
import { mixpanelTrack } from '@/features/mixpanel/utils'
import { ISurveyKeyType } from '@/features/survey/types'
import { getChromeExtensionAssetsURL } from '@/utils/imageHelper'

interface IProps {
  surveyKey: ISurveyKeyType
  handleCloseClick?: () => void
  sx?: SxProps
}

const CTA_BUTTON_LINK = `${APP_USE_CHAT_GPT_HOST}/survey/feedback`

const SidebarSurveyContent: FC<IProps> = ({
  surveyKey,
  handleCloseClick,
  sx,
}) => {
  const { t } = useTranslation(['client'])

  const routerToPage = () => {
    window.open(CTA_BUTTON_LINK)
    // handleCloseClick && handleCloseClick()
  }

  return (
    <Stack
      sx={{
        textAlign: 'left',
        ...sx,
      }}
    >
      {/* title */}
      <Stack
        direction={'row'}
        spacing={1}
        alignItems="center"
        flexShrink={0}
        py={2.5}
        px={2}
      >
        <Typography
          fontSize={20}
          color="text.primary"
          flex={1}
          fontWeight={700}
        >
          {t('client:sidebar__survey_dialog__title')}
        </Typography>

        <IconButton onClick={handleCloseClick}>
          <CloseOutlinedIcon sx={{ fontSize: 24, color: 'text.primary' }} />
        </IconButton>
      </Stack>
      {/* content */}
      <Stack
        px={2}
        height={0}
        flex={1}
        sx={{
          overflowY: 'auto',
        }}
      >
        <ResponsiveImage
          src={getChromeExtensionAssetsURL('/images/survey/dialog-banner.png')}
          width={832}
          height={468}
          onClick={routerToPage}
          sx={{
            cursor: 'pointer',
          }}
        />

        <Stack py={2} spacing={2}>
          <Typography fontSize={16} lineHeight={1.5}>
            {t('client:sidebar__survey_dialog__description__item1__part1')}{' '}
            <ProLink href={CTA_BUTTON_LINK} underline="always">
              {t('client:sidebar__survey_dialog__description__item1__part2')}
            </ProLink>
            ?
          </Typography>
          <Typography fontSize={16} lineHeight={1.5}>
            {t('client:sidebar__survey_dialog__description__item2')}
          </Typography>
          <Typography fontSize={16} lineHeight={1.5}>
            {t('client:sidebar__survey_dialog__thanks')}
            {`,`}
            <br />
            {t('client:sidebar__survey_dialog__by_who')}
          </Typography>
        </Stack>
      </Stack>
      {/* cta button */}
      <Stack flexShrink={0} spacing={1} p={2}>
        <Button
          variant="contained"
          fullWidth
          href={CTA_BUTTON_LINK}
          target={'_blank'}
          startIcon={<FavoriteIcon sx={{ color: '#F36666' }} />}
          sx={{
            borderRadius: 2,
            fontSize: 16,
            px: 2,
            py: 1.5,
            color: '#fff',
            bgcolor: (t) =>
              t.palette.mode === 'dark' ? 'primary.main' : '#000',
            '&:hover': {
              bgcolor: (t) =>
                t.palette.mode === 'dark' ? 'customColor.hoverColor' : '#333',
            },
          }}
          onClick={() => {
            mixpanelTrack('survey_card_clicked', {
              surveyType: surveyKey,
            })
            // handleCloseClick && handleCloseClick()
          }}
        >
          {t('client:sidebar__survey_dialog__cta_button_text')}
        </Button>
      </Stack>
    </Stack>
  )
}

export default SidebarSurveyContent
