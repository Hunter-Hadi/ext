import React, { FC } from 'react'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import Link from '@mui/material/Link'
import IconButton from '@mui/material/IconButton'
import { ContextMenuIcon } from '@/components/ContextMenuIcon'
import { useTranslation } from 'react-i18next'
import useActivity from '@/features/auth/hooks/useActivity'

const SidebarTopBar: FC = () => {
  const { t } = useTranslation(['client'])
  const {
    isShowBlackFridayBanner,
    isAbleToCloseBlackFridayBanner,
    handleCloseBlackFriday2023Banner,
  } = useActivity()
  return (
    <Stack>
      {/*黑五*/}
      {/*deprecated*/}
      {isShowBlackFridayBanner && false && (
        <Link
          href={`https://app.maxai.me/blackfriday2023`}
          target={'_blank'}
          underline={'none'}
        >
          <Stack
            py={1}
            alignItems={'center'}
            justifyContent={'center'}
            sx={{
              height: '48px',
              bgcolor: '#000',
              position: 'relative',
            }}
          >
            <Typography
              sx={{
                fontSize: '16px',
                background:
                  'linear-gradient(180deg, #FFF069 20.63%, #FFF1BF 49.34%, #FFA915 81.89%)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                fontWeight: 700,
                lineHeight: '24px',
              }}
            >
              {t('client:activity__black_friday_2023__title')}
            </Typography>
            {isAbleToCloseBlackFridayBanner && (
              <IconButton
                sx={{
                  position: 'absolute',
                  right: '8px',
                  top: '4px',
                }}
                onClick={async (event) => {
                  event.preventDefault()
                  event.stopPropagation()
                  await handleCloseBlackFriday2023Banner()
                }}
              >
                <ContextMenuIcon
                  icon={'Close'}
                  sx={{
                    color: '#FFFFFF99',
                    fontSize: '24px',
                  }}
                />
              </IconButton>
            )}
          </Stack>
        </Link>
      )}
    </Stack>
  )
}
export default SidebarTopBar