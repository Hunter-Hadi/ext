import ContentCopyIcon from '@mui/icons-material/ContentCopy'
import { Fade, ListItem, Typography } from '@mui/material'
import Button from '@mui/material/Button'
import List from '@mui/material/List'
import Paper from '@mui/material/Paper'
import Popper from '@mui/material/Popper'
import Stack from '@mui/material/Stack'
import React, { FC, useMemo, useRef, useState } from 'react'
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import { CopyToClipboard } from 'react-copy-to-clipboard'
import { useTranslation } from 'react-i18next'

import { ContextMenuIcon } from '@/components/ContextMenuIcon'
import TooltipIconButton from '@/components/TooltipIconButton'
import { IAIResponseMessage } from '@/features/chatgpt/types'
import { findSelectorParent } from '@/features/shortcuts/utils/socialMedia/platforms/utils'
import {
  formatAIMessageContent,
  formatAIMessageContentForClipboard,
} from '@/features/sidebar/utils/chatMessagesHelper'
import { hideChatBox } from '@/utils'
const AFTER_COPIED_CLOSE_HOSTS = ['www.linkedin.com']

const SidebarCopyButton: FC<{
  message: IAIResponseMessage
  onCopy?: () => void
}> = (props) => {
  const { message, onCopy } = props
  const { t } = useTranslation(['common'])
  const memoCopyText = useMemo(() => {
    return formatAIMessageContent(message)
  }, [message])
  const copyButtonRef = useRef<HTMLButtonElement>(null)
  const [disableTooltip, setDisableTooltip] = useState(false)
  const [isHover, setIsHover] = useState(false)
  const [isCopied, setIsCopied] = useState(false)
  const [anchorEl, setAnchorEl] = React.useState<HTMLButtonElement | null>(null)
  // 复制成功的提示
  const copyTooltipTitle = useMemo(() => {
    if (isCopied) {
      return t('common:copied')
    }
    return t('common:copy_to_clipboard')
  }, [t, isCopied])
  // 复制文本
  const copyTextWithStyles = async (): Promise<void> => {
    const button = copyButtonRef.current as HTMLButtonElement
    if (!button) {
      return
    }
    const rootElement = findSelectorParent('.markdown-body', button)
    if (!rootElement) {
      return
    }
    setDisableTooltip(true)
    setIsHover(false)
    formatAIMessageContentForClipboard(message, rootElement)
    setTimeout(() => {
      setDisableTooltip(false)
    }, 1000)
  }

  return (
    <React.Fragment>
      <Button
        ref={copyButtonRef}
        sx={{
          minWidth: 'unset',
          p: '5px',
          color: 'text.secondary',
        }}
        onMouseEnter={(event) => {
          setIsHover(true)
          setAnchorEl(event.currentTarget)
        }}
        onMouseLeave={() => {
          setIsHover(false)
        }}
        onClick={copyTextWithStyles}
      >
        <Stack direction={'row'} alignItems={'center'}>
          <ContentCopyIcon sx={{ fontSize: '16px' }} />
          <ContextMenuIcon
            icon={'ExpandMore'}
            sx={{
              fontSize: '12px',
              transition: 'all 0.2s ease-in-out',
              transform: isHover ? 'rotate(180deg)' : 'rotate(0deg)',
            }}
          />
        </Stack>
      </Button>
      <Popper
        className="popper"
        // Note: The following zIndex style is specifically for documentation purposes and may not be necessary in your application.
        open={isHover && !disableTooltip}
        anchorEl={anchorEl}
        placement={'top-start'}
        transition
        onMouseEnter={() => {
          setIsHover(true)
        }}
        onMouseLeave={() => {
          setIsHover(false)
        }}
        sx={{
          zIndex: 1200,
        }}
      >
        {({ TransitionProps }) => (
          <Fade {...TransitionProps} timeout={200}>
            <Paper>
              <List>
                <ListItem
                  disablePadding
                  sx={{
                    '& > div': {
                      width: '100%',
                    },
                  }}
                >
                  <CopyToClipboard
                    text={memoCopyText}
                    options={{
                      message: 'Copied!',
                      format: 'text/plain',
                    }}
                    onCopy={() => {
                      if (
                        AFTER_COPIED_CLOSE_HOSTS.includes(window.location.host)
                      ) {
                        setTimeout(hideChatBox, 1)
                      }
                      onCopy?.()
                      setIsHover(false)
                      setIsCopied(true)
                      setTimeout(() => {
                        setIsCopied(false)
                      }, 1000)
                    }}
                  >
                    <TooltipIconButton
                      TooltipProps={{
                        placement: 'top',
                        arrow: true,
                        disableInteractive: true,
                      }}
                      title={copyTooltipTitle}
                      sx={{
                        width: '100%',
                        color: 'text.primary',
                        borderRadius: '4px',
                      }}
                    >
                      <Stack
                        direction={'row'}
                        alignItems={'center'}
                        gap={1}
                        sx={{
                          width: '100%',
                        }}
                      >
                        <ContextMenuIcon
                          icon={'CopyTextOnly'}
                          sx={{ fontSize: '16px' }}
                        />
                        <Typography fontSize={'16px'}>
                          {'Copy Text Only'}
                        </Typography>
                      </Stack>
                    </TooltipIconButton>
                  </CopyToClipboard>
                </ListItem>
                <ListItem
                  disablePadding
                  sx={{
                    '& > div': {
                      width: '100%',
                    },
                  }}
                >
                  <TooltipIconButton
                    onClick={copyTextWithStyles}
                    TooltipProps={{
                      placement: 'top',
                      disableInteractive: true,
                      arrow: true,
                    }}
                    title={copyTooltipTitle}
                    sx={{
                      width: '100%',
                      color: 'text.primary',
                      borderRadius: '4px',
                    }}
                  >
                    <Stack
                      direction={'row'}
                      alignItems={'center'}
                      gap={1}
                      sx={{
                        width: '100%',
                      }}
                    >
                      <ContextMenuIcon
                        icon={'Copy'}
                        sx={{ fontSize: '16px' }}
                      />
                      <Typography fontSize={'16px'}>{'Copy'}</Typography>
                    </Stack>
                  </TooltipIconButton>
                </ListItem>
              </List>
            </Paper>
          </Fade>
        )}
      </Popper>
    </React.Fragment>
  )
}
export default SidebarCopyButton