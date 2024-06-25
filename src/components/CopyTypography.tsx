import ContentCopyIcon from '@mui/icons-material/ContentCopy'
import { Button, Stack, SxProps, Typography } from '@mui/material'
import { styled } from '@mui/material/styles'
import Tooltip, { tooltipClasses, TooltipProps } from '@mui/material/Tooltip'
import { TypographyProps } from '@mui/material/Typography'
import React, { FC, useCallback, useState } from 'react'
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-expect-error
import { CopyToClipboard } from 'react-copy-to-clipboard'

export interface ICopyTypographyProps extends TypographyProps {
  text: string
  onCopy?: () => void
  sx?: SxProps
  justifyContent?: 'center' | 'space-between'
}

const BootstrapTooltip = styled(({ className, ...props }: TooltipProps) => (
  <Tooltip {...props} arrow classes={{ popper: className }} />
))(({ theme }) => ({
  [`& .${tooltipClasses.arrow}`]: {
    color: theme.palette.common.black,
  },
  [`& .${tooltipClasses.tooltip}`]: {
    backgroundColor: theme.palette.common.black,
  },
}))

const CopyTypography: FC<
  ICopyTypographyProps & {
    buttonText?: string
    wrapperMode?: boolean
    TooltipSxProps?: SxProps
  }
> = ({
  text,
  onCopy,
  buttonText,
  children,
  sx,
  justifyContent = 'center',
  wrapperMode = false,
  TooltipSxProps,
  ...props
}) => {
  const [openTooltip, setOpenTooltip] = useState(false)

  const handleOpenTooltip = () => {
    setOpenTooltip(true)
    setTimeout(() => {
      setOpenTooltip(false)
    }, 2500)
  }

  const handleOnCopy = useCallback(() => {
    onCopy && onCopy()
    handleOpenTooltip()
  }, [onCopy, text])

  return (
    <CopyToClipboard
      text={text}
      onCopy={handleOnCopy}
      options={{ debug: false, message: '', format: 'text/plain' }}
    >
      <BootstrapTooltip
        PopperProps={{
          sx: {
            zIndex: 2147483621,
          },
        }}
        title={<Typography fontSize={16}>Copied!</Typography>}
        placement={'top'}
        open={openTooltip}
        sx={TooltipSxProps}
      >
        <Button variant={'text'} sx={{ py: 0, px: 1, ...sx }}>
          <Typography component={'div'} {...(props as any)}>
            <Stack direction={'row'} gap={1} alignItems={'center'}>
              {children}
              {buttonText ? (
                <Button variant={'contained'} disableElevation sx={{ px: 4 }}>
                  <span>{buttonText}</span>
                </Button>
              ) : (
                <ContentCopyIcon fontSize={'inherit'} />
              )}
            </Stack>
          </Typography>
        </Button>
      </BootstrapTooltip>
    </CopyToClipboard>
  )
}
export default CopyTypography
