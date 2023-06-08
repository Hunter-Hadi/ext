import React, { FC } from 'react'

import Button from '@mui/material/Button'
import { UseChatGptIcon } from '@/components/CustomIcon'
import TooltipIconButton from '@/components/TooltipIconButton'
import { useFloatingContextMenu } from '@/features/contextMenu'
import { getCurrentDomainHost } from '@/utils'

const NO_SUPPORT_HOST = ['teams.live.com']

/**
 * 输入框呼出按钮
 * @param buttonText
 * @param templateText
 * @param onBeforeShowContextMenu
 * @param iconButton
 * @constructor
 */
const FloatingInputButton: FC<{
  buttonText?: string
  iconButton?: boolean
  templateText?: string
  onBeforeShowContextMenu?: (
    preSendText: string,
    preTarget: HTMLElement,
  ) => {
    template: string
    target: HTMLElement
  }
}> = ({ buttonText, templateText, onBeforeShowContextMenu, iconButton }) => {
  const { showFloatingContextMenuWithVirtualSelection } =
    useFloatingContextMenu()
  const handleClick = (event: any) => {
    if (event.currentTarget) {
      let target = event.currentTarget
      let template = templateText || target.innerText || ''
      if (onBeforeShowContextMenu) {
        const result = onBeforeShowContextMenu(template, target)
        target = result.target || target
        template = result.template || template
      }
      showFloatingContextMenuWithVirtualSelection(target, template)
    }
  }
  if (NO_SUPPORT_HOST.includes(getCurrentDomainHost())) {
    return null
  }
  if (iconButton) {
    return (
      <TooltipIconButton title={'Use prompt'} onClick={handleClick}>
        <UseChatGptIcon
          sx={{
            fontSize: 16,
            color: 'inherit',
          }}
        />
      </TooltipIconButton>
    )
  }
  return (
    <Button
      startIcon={
        <UseChatGptIcon
          sx={{
            fontSize: 16,
            color: 'inherit',
          }}
        />
      }
      variant={'outlined'}
      onClick={handleClick}
    >
      {buttonText || 'Use ChatGPT'}
    </Button>
  )
}
export { FloatingInputButton }
