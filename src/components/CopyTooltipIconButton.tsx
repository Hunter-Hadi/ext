import { IconButtonProps } from '@mui/material/IconButton'
import React, { FC, useMemo, useState } from 'react'
import TooltipIconButton from '@/components/TooltipIconButton'
import ContentCopyIcon from '@mui/icons-material/ContentCopy'
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import { CopyToClipboard } from 'react-copy-to-clipboard'
import { SxProps } from '@mui/material/styles'
import { useTranslation } from 'react-i18next'

interface ITooltipIconButton extends IconButtonProps {
  copyText: string
  onCopy?: () => void
  children?: React.ReactNode
  sx?: SxProps
}
const CopyTooltipIconButton: FC<ITooltipIconButton> = (props) => {
  const { copyText, onCopy, sx } = props
  const { t } = useTranslation(['common'])
  const [isCopied, setIsCopied] = useState(false)
  const title = useMemo(() => {
    if (isCopied) {
      return t('common:copied')
    }
    return t('common:copy_to_clipboard')
  }, [t, isCopied])
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
      <TooltipIconButton title={title} sx={sx}>
        <ContentCopyIcon sx={{ fontSize: 16 }} />
        {props.children}
      </TooltipIconButton>
    </CopyToClipboard>
  )
}
export default CopyTooltipIconButton
