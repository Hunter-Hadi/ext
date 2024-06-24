import ContentCopyIcon from '@mui/icons-material/ContentCopy'
import { IconButtonProps } from '@mui/material/IconButton'
import { SxProps } from '@mui/material/styles'
import React, { type FC, type ReactNode, useMemo, useState } from 'react'
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import { CopyToClipboard } from 'react-copy-to-clipboard'
import { useTranslation } from 'react-i18next'

import { ContextMenuIcon } from '@/components/ContextMenuIcon'
import TooltipIconButton, {
  type ITooltipIconButton,
} from '@/components/TooltipIconButton'
import { I18nextKeysType } from '@/i18next'

interface ICopyTooltipIconButton extends IconButtonProps {
  copyText: string
  onCopy?: () => void
  children?: ReactNode
  sx?: SxProps
  icon?: ReactNode
  copyToClipboardTooltip?: I18nextKeysType
  copiedTooltip?: I18nextKeysType
  TooltipProps?: ITooltipIconButton['TooltipProps']
  PopperProps?: ITooltipIconButton['PopperProps']
}
const CopyTooltipIconButton: FC<ICopyTooltipIconButton> = (props) => {
  const {
    copyText,
    onCopy,
    sx,
    icon,
    copyToClipboardTooltip,
    copiedTooltip,
    TooltipProps,
    PopperProps,
    ...buttonProps
  } = props
  const { t } = useTranslation(['common'])
  const [isCopied, setIsCopied] = useState(false)
  const title = useMemo(() => {
    if (isCopied) {
      return t((copiedTooltip as any) || 'common:copied')
    }
    return t((copyToClipboardTooltip as any) || 'common:copy_to_clipboard')
  }, [t, isCopied, copyToClipboardTooltip, copiedTooltip])
  return (
    <CopyToClipboard
      text={copyText}
      options={{
        message: 'Copied!',
        format: 'text/plain',
      }}
      onCopy={() => {
        onCopy?.()
        setIsCopied(true)
        setTimeout(() => {
          setIsCopied(false)
        }, 1000)
      }}
    >
      <TooltipIconButton
        title={title}
        sx={sx}
        className={props.className}
        TooltipProps={TooltipProps}
        PopperProps={PopperProps}
        {...buttonProps}
      >
        {isCopied ? (
          <ContextMenuIcon
            icon={'Check'}
            sx={{
              fontSize: '20px',
            }}
          />
        ) : (
          icon || <ContentCopyIcon sx={{ fontSize: '20px' }} />
        )}
        {props.children}
      </TooltipIconButton>
    </CopyToClipboard>
  )
}
export default CopyTooltipIconButton
