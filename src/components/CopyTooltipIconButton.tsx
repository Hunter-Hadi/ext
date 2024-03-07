import ContentCopyIcon from '@mui/icons-material/ContentCopy'
import { IconButtonProps } from '@mui/material/IconButton'
import { SxProps } from '@mui/material/styles'
import React, { FC, useMemo, useState } from 'react'
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import { CopyToClipboard } from 'react-copy-to-clipboard'
import { useTranslation } from 'react-i18next'

import { ContextMenuIcon } from '@/components/ContextMenuIcon'
import TooltipIconButton from '@/components/TooltipIconButton'
import { I18nextKeysType } from '@/i18next'


interface ITooltipIconButton extends IconButtonProps {
  copyText: string
  onCopy?: () => void
  children?: React.ReactNode
  sx?: SxProps
  icon?: React.ReactNode
  copyToClipboardTooltip?: I18nextKeysType
  copiedTooltip?: I18nextKeysType
  TooltipProps?: Parameters<typeof TooltipIconButton>[0]['TooltipProps']
}
const CopyTooltipIconButton: FC<ITooltipIconButton> = (props) => {
  const {
    copyText,
    onCopy,
    sx,
    icon,
    copyToClipboardTooltip,
    copiedTooltip,
    TooltipProps,
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
      <TooltipIconButton title={title} sx={sx} className={props.className} TooltipProps={TooltipProps}>
        {isCopied ? (
          <ContextMenuIcon icon={'Check'} />
        ) : (
          icon || <ContentCopyIcon sx={{ fontSize: 16 }} />
        )}
        {props.children}
      </TooltipIconButton>
    </CopyToClipboard>
  )
}
export default CopyTooltipIconButton
