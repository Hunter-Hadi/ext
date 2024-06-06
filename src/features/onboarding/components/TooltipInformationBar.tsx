import { SxProps, Typography } from '@mui/material'
import Stack from '@mui/material/Stack'
import React, { FC, PropsWithChildren } from 'react'
import { useTranslation } from 'react-i18next'

import { UseChatGptIcon } from '@/components/CustomIcon'
import TextOnlyTooltip from '@/components/TextOnlyTooltip'

export interface ITooltipInformationBarProps {
  shortcut?: string | string[]

  learnMoreLink?: string

  sx?: SxProps
}

const TooltipInformationBar: FC<
  PropsWithChildren<ITooltipInformationBarProps>
> = (props) => {
  const { shortcut, learnMoreLink, sx } = props

  const { t } = useTranslation(['common', 'client'])

  return (
    <Stack sx={sx}>
      <Typography fontSize={14} lineHeight={1.5}>
        {props.children}
      </Typography>
      {shortcut || learnMoreLink ? (
        <Stack
          direction={'row'}
          alignItems="center"
          justifyContent={'space-between'}
          pt={1.5}
        >
          {/* render shortcut */}
          {shortcut && (
            <Stack direction={'row'} alignItems="center" spacing={0.5}>
              <Typography fontSize={12} color="#FFFFFF99">
                {t('common:shortcut')}:
              </Typography>

              {typeof shortcut === 'string' ? (
                <ShortcutKeyBox name={shortcut} />
              ) : null}
              {Array.isArray(shortcut) && shortcut.length > 1
                ? shortcut.map((item, index) => (
                    <ShortcutKeyBox key={index} name={item} />
                  ))
                : null}
            </Stack>
          )}
          {/* TODO: render learnMore Link */}
          {learnMoreLink && <></>}
        </Stack>
      ) : null}
      <Stack
        direction={'row'}
        justifyContent="flex-end"
        pt={shortcut || learnMoreLink ? 0.5 : 1.5}
      >
        {/* <Link
          sx={{
            textDecoration: 'none!important',
          }}
          href={APP_USE_CHAT_GPT_HOST}
          target={'_blank'}
        > */}
        <Stack
          direction={'row'}
          alignItems={'center'}
          gap={1}
          justifyContent={'center'}
        >
          <UseChatGptIcon
            sx={{
              fontSize: 18,
              color: 'primary.main',
            }}
          />
          <TextOnlyTooltip title={t('client:sidebar__button__my_plan')}>
            <Typography color="rgba(255, 255, 255, 0.7)" fontSize={12}>
              {String(process.env.APP_NAME)}
            </Typography>
          </TextOnlyTooltip>
        </Stack>
        {/* </Link> */}
      </Stack>
    </Stack>
  )
}

export default TooltipInformationBar

// TODO: refine
const ShortcutKeyBox: FC<{
  name: string
}> = ({ name }) => {
  return (
    <Stack
      direction={'row'}
      alignItems="center"
      justifyContent="center"
      sx={{
        bgcolor: '#FFFFFF33',
        border: '1px solid',
        borderColor: '#FFFFFF29',
        color: '#FFFFFF99',
        px: 0.5,
        fontSize: 12,
        lineHeight: 1.5,
        borderRadius: 1,
      }}
    >
      {name}
    </Stack>
  )
}
