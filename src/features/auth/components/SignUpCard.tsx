import EmailOutlinedIcon from '@mui/icons-material/EmailOutlined'
import HelpOutlineOutlinedIcon from '@mui/icons-material/HelpOutlineOutlined'
import Button from '@mui/material/Button'
import Divider from '@mui/material/Divider'
import Stack from '@mui/material/Stack'
import { styled, SxProps } from '@mui/material/styles'
import Tooltip, { tooltipClasses, TooltipProps } from '@mui/material/Tooltip'
import Typography from '@mui/material/Typography'
import React, { FC } from 'react'
import { useTranslation } from 'react-i18next'

import { UseChatGptIcon } from '@/components/CustomIcon'
import {
  APP_USE_CHAT_GPT_HOST,
  LOVED_BY_NUM,
  STAR_RATINGS_NUM,
  WWW_PROJECT_HOST,
} from '@/constants'
import GoogleLoginButton from '@/features/auth/components/GoogleLoginButton'
import ProLink from '@/features/common/components/ProLink'

const CustomTooltip = styled(({ className, ...props }: TooltipProps) => (
  <Tooltip {...props} classes={{ popper: className }} />
))(({ theme }) => ({
  [`& .${tooltipClasses.tooltip}`]: {
    backgroundColor: theme.palette.common.black,
    color: '#fff',
    maxWidth: '320px',
    // fontSize: theme.typography.pxToRem(12),
    // border: '1px solid #E0E0E0',
    padding: '12px',
    boxSizing: 'border-box',
    boxShadow: theme.shadows[5],
  },
  [`& .${tooltipClasses.arrow}`]: {
    color: theme.palette.common.black,
  },
}))

interface IProps {
  sx?: SxProps
}

const SignUpCard: FC<IProps> = (props) => {
  const { t } = useTranslation()
  const { sx } = props

  return (
    <Stack
      // alignItems={'center'}
      justifyContent={'center'}
      sx={{
        maxWidth: 450,
        minWidth: 450,
        width: '100%',
        boxSizing: 'border-box',
        boxShadow: '0px 2px 4px 0px #00000014',
        borderRadius: 4,
        p: '2px',
        bgcolor: 'background.paper',

        ...sx,
      }}
    >
      {/* card header */}
      <SignUpCardHeader />

      <Stack p={2.5} spacing={2.5}>
        <Typography
          variant='custom'
          fontSize={20}
          lineHeight={1.4}
          fontWeight={600}
          color='text.primary'
          textAlign='center'
        >
          {t('client:login_modal__title__part1')}
          {` `}
          <Typography
            variant='custom'
            fontSize={'inherit'}
            lineHeight={'inherit'}
            fontWeight={'inherit'}
            color='primary.main'
          >
            {t('client:login_modal__title__part2')}
          </Typography>
          {` `}
          {t('client:login_modal__title__part3')}
        </Typography>
        <GoogleLoginButton
          variant='contained'
          sx={{
            height: 56,
            borderRadius: 2,
          }}
        />
        <Divider sx={{ color: 'text.secondary' }}>OR</Divider>
        <Button
          component={'a'}
          href={`${APP_USE_CHAT_GPT_HOST}/login-email`}
          target='_target'
          fullWidth
          variant='normalOutlined'
          startIcon={<EmailOutlinedIcon />}
          sx={{
            height: 56,
            borderRadius: 2,
            fontSize: 16,
          }}
        >
          {t('common:continue_with_email')}
        </Button>
        {/* <SignUpWithEmailForm /> */}

        {/* login privacy tips */}
        <Stack direction={'row'} pt={3} justifyContent='left'>
          <Typography
            variant='custom'
            fontSize={14}
            lineHeight={1.5}
            color='text.secondary'
          >
            {t('client:login_modal__footer_text__part1')}
            {` `}
            <ProLink
              href={WWW_PROJECT_HOST + '/terms'}
              underline='always'
              sx={{ color: 'inherit', textDecorationColor: 'inherit' }}
            >
              {t('common:terms_of_service')}
            </ProLink>{' '}
            {t('client:login_modal__footer_text__part2')}
            {` `}
            <ProLink
              href={WWW_PROJECT_HOST + '/privacy'}
              underline='always'
              sx={{ color: 'inherit', textDecorationColor: 'inherit' }}
            >
              {t('common:privacy_policy')}
            </ProLink>
            <CustomTooltip
              PopperProps={{
                disablePortal: true,
              }}
              title={
                <Typography
                  variant='custom'
                  fontSize={14}
                  lineHeight={1.5}
                  textAlign='left'
                >
                  {t('client:login_modal__footer_text__tooltip')}
                </Typography>
              }
              placement='bottom'
              arrow
              sx={{
                ml: 1,
              }}
            >
              <HelpOutlineOutlinedIcon
                sx={{
                  fontSize: 20,
                  verticalAlign: 'middle',
                  ml: 1,
                  color: 'text.secondary',
                }}
              />
            </CustomTooltip>
          </Typography>
        </Stack>
      </Stack>
    </Stack>
  )
}

const SignUpCardHeader = () => {
  const { t } = useTranslation()
  return (
    <Stack
      p={3}
      pt={3}
      pb={2}
      spacing={2}
      justifyContent={'center'}
      sx={{
        borderRadius: '16px 16px 0 0',
        background: (t) =>
          t.palette.mode === 'dark' ? '#FFFFFF0A' : '#BA55F814',
      }}
    >
      <Stack
        direction={'row'}
        alignItems={'center'}
        justifyContent={'center'}
        width={'100%'}
        spacing={1}
      >
        <UseChatGptIcon sx={{ fontSize: '28px' }} />
        <Typography
          fontSize={'22px'}
          fontWeight={700}
          color={'text.primary'}
          textAlign={'center'}
        >
          MaxAI.me
        </Typography>
      </Stack>
      <Stack
        direction='row'
        alignItems={'center'}
        justifyContent={'space-between'}
        px={3}
        gap={{
          xs: 1,
          sm: 3,
        }}
        flexWrap={'wrap'}
      >
        <Stack
          justifyContent={'center'}
          alignItems='center'
          component={'a'}
          href='https://a16z.com/100-gen-ai-apps/'
          target={'_blank'}
          sx={{
            textDecorationLine: 'none',
            color: 'text.secondary',
            '&:hover': {
              color: 'primary.main',
              cursor: 'pointer',
              transition: 'color 0.3s ease',
            },
          }}
          spacing={0.5}
        >
          <Stack direction={'row'} alignItems='center' spacing={0.5}>
            <A16zIcon />
            <Typography
              variant='custom'
              fontSize={16}
              fontWeight={700}
              color='primary.main'
            >
              2024
            </Typography>
          </Stack>
          <Typography variant='custom' fontSize={12} color='inherit'>
            {t('client:login_modal__indicator1_label')}
          </Typography>
        </Stack>
        <Stack justifyContent={'center'} alignItems='center' spacing={0.5}>
          <Typography
            variant='custom'
            fontSize={16}
            fontWeight={700}
            color='primary.main'
          >
            {LOVED_BY_NUM}
          </Typography>
          <Typography variant='custom' fontSize={12} color='text.secondary'>
            {t('client:login_modal__indicator2_label')}
          </Typography>
        </Stack>
        <Stack justifyContent={'center'} alignItems='center' spacing={0.5}>
          <Typography
            variant='custom'
            fontSize={16}
            fontWeight={700}
            color='primary.main'
          >
            {STAR_RATINGS_NUM}
          </Typography>
          <Typography variant='custom' fontSize={12} color='text.secondary'>
            {t('client:login_modal__indicator3_label')}
          </Typography>
        </Stack>
      </Stack>
    </Stack>
  )
}

const A16zIcon = () => {
  return (
    <svg
      width='20'
      height='20'
      viewBox='0 0 20 20'
      fill='none'
      xmlns='http://www.w3.org/2000/svg'
    >
      <path
        d='M0.5 4.5C0.5 2.29086 2.29086 0.5 4.5 0.5H20.5V16.5C20.5 18.7091 18.7091 20.5 16.5 20.5H4.5C2.29086 20.5 0.5 18.7091 0.5 16.5V4.5Z'
        fill='#F79321'
      />
      <path
        fillRule='evenodd'
        clipRule='evenodd'
        d='M10.1915 9.87735L10.1921 9.87783C9.88276 10.2909 9.69953 10.8039 9.69953 11.3597C9.69953 12.7264 10.8074 13.8343 12.174 13.8343C13.5406 13.8343 14.6484 12.7264 14.6484 11.3597C14.6484 10.0075 13.5639 8.90864 12.2173 8.88554L13.5463 7.13281H12.2725L10.1915 9.87735ZM12.174 12.7991C12.9689 12.7991 13.6134 12.1547 13.6134 11.3597C13.6134 10.5648 12.9689 9.92032 12.174 9.92032C11.3791 9.92032 10.7347 10.5648 10.7347 11.3597C10.7347 12.1547 11.3791 12.7991 12.174 12.7991ZM8.1096 7.13321H7.42419V8.11647H8.1096V13.6884H9.19922V7.13321H8.1096ZM6.33009 9.14972V8.82752H7.43089V13.6874H6.35694V13.3115C5.87366 13.6606 5.25614 13.8485 4.58492 13.7948C3.40357 13.6606 2.43701 12.694 2.30277 11.5125C2.14168 9.98208 3.34987 8.66642 4.85341 8.66642C5.39038 8.66642 5.92736 8.85437 6.33009 9.14972ZM4.50437 12.694C5.47093 12.9088 6.33009 12.1838 6.33009 11.244C6.33009 10.3848 5.65887 9.71358 4.85341 9.71358C3.9137 9.71358 3.16193 10.5728 3.34987 11.5394C3.48412 12.1301 3.94055 12.5866 4.50437 12.694ZM18.7458 8.88517H15.0433V9.86843H17.4207L15.0431 12.7055V13.6887H18.7456V12.7055H16.3673L18.7449 9.86843H18.7458V8.88517Z'
        fill='white'
      />
    </svg>
  )
}

export default SignUpCard
