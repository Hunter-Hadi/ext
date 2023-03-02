import { IconButtonProps } from '@mui/material'
import React, { FC, useState } from 'react'
import TooltipIconButton from '@/components/TooltipIconButton'
import ContentCopyIcon from '@mui/icons-material/ContentCopy'
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import { CopyToClipboard } from 'react-copy-to-clipboard'
interface ITooltipIconButton extends IconButtonProps {
  copyText: string
  onCopy?: () => void
}
const CopyTooltipIconButton: FC<ITooltipIconButton> = (props) => {
  const { copyText, onCopy } = props
  const [title, setTitle] = useState('Copy to clipboard')
  return (
    <CopyToClipboard
      text={copyText}
      options={{
        message: 'Copied!',
        format: 'text/plain',
      }}
      onCopy={() => {
        onCopy?.()
        setTitle('Copied!')
        setTimeout(() => {
          setTitle('Copy to clipboard')
        }, 1000)
      }}
    >
      <TooltipIconButton title={title}>
        <ContentCopyIcon sx={{ fontSize: 16 }} />
      </TooltipIconButton>
    </CopyToClipboard>
  )
}
export default CopyTooltipIconButton
