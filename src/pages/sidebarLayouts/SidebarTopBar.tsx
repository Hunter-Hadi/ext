import React, { FC, useEffect, useMemo, useState } from 'react'
import { useUserInfo } from '@/features/auth/hooks/useUserInfo'
import Stack from '@mui/material/Stack'
import { APP_VERSION } from '@/constants'
import Typography from '@mui/material/Typography'
import Link from '@mui/material/Link'
import {
  getChromeExtensionOnBoardingData,
  setChromeExtensionOnBoardingData,
} from '@/background/utils'
import IconButton from '@mui/material/IconButton'
import { ContextMenuIcon } from '@/components/ContextMenuIcon'
import dayjs from 'dayjs'

const SidebarTopBar: FC = () => {
  const { currentUserPlan } = useUserInfo()
  const [showBlackFriday2023Banner, setShowBlackFriday2023Banner] = useState(
    false,
  )
  const isAbleToCloseBlackFridayBanner = useMemo(() => {
    return dayjs().utc().diff(dayjs('2023-11-30').utc()) > 0
  }, [])
  useEffect(() => {
    getChromeExtensionOnBoardingData().then((data) => {
      if (!data.ON_BOARDING_BLACK_FRIDAY_2023_BANNER) {
        setShowBlackFriday2023Banner(true)
      }
    })
  }, [])
  return (
    <Stack>
      {/*黑五*/}
      {showBlackFriday2023Banner &&
        APP_VERSION === '2.4.2' &&
        currentUserPlan.name !== 'elite' &&
        currentUserPlan.planName !== 'ELITE_YEARLY' && (
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
                Limited Black Friday Deals – Up to 50% Off!
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
                    await setChromeExtensionOnBoardingData(
                      'ON_BOARDING_BLACK_FRIDAY_2023_BANNER',
                      true,
                    )
                    setShowBlackFriday2023Banner(false)
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
