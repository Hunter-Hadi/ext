import React, { FC } from 'react'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'
import { useCustomTheme } from '@/hooks/useCustomTheme'
import useMediaQuery from '@mui/material/useMediaQuery'

const PerkCard: FC<{
  title: string
  description: React.ReactNode
  imageLink: string
  buttonText: string
  buttonLink: string
}> = (props) => {
  const { title, description, imageLink, buttonText, buttonLink } = props
  const theme = useCustomTheme()
  const isUpSm = useMediaQuery(theme.customTheme.breakpoints.up('sm'))
  return (
    <Stack direction={isUpSm ? 'row' : 'column'} alignItems={'stretch'}>
      <Stack
        width={isUpSm ? '320px' : '100%'}
        alignItems={'center'}
        justifyContent={'center'}
        sx={{
          flexShrink: 0,
          '& > img': {
            width: '100%',
            height: 'auto',
          },
        }}
      >
        <img src={imageLink} alt={title} />
      </Stack>
      <Stack flex={1} p={2}>
        <Typography fontSize={'16px'} fontWeight={700} color={'text.primary'}>
          {title}
        </Typography>
        <Typography
          sx={{ pt: 0.5 }}
          fontSize={'14px'}
          fontWeight={400}
          color={'text.secondary'}
          component={'div'}
          display={'inline'}
        >
          {description}
        </Typography>
        <Button
          target={'_blank'}
          variant={'contained'}
          component={'a'}
          href={buttonLink}
          sx={{
            width: isUpSm ? 280 : '100%',
            mt: 2,
            fontSize: '16px',
            fontWeight: 600,
          }}
        >
          {buttonText}
        </Button>
      </Stack>
    </Stack>
  )
}
export default PerkCard
