import React, { FC } from 'react'

import Button from '@mui/material/Button'
import { UseChatGptIcon } from '@/components/CustomIcon'
import TooltipIconButton from '@/components/TooltipIconButton'
import { useFloatingContextMenu } from '@/features/contextMenu'
import { getCurrentDomainHost } from '@/utils'
import TextOnlyTooltip from '@/components/TextOnlyTooltip'

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
  const { showFloatingContextMenuWithElement } = useFloatingContextMenu()
  const handleClick = (event: any) => {
    if (event.currentTarget) {
      let target = event.currentTarget
      let template = templateText || target.innerText || ''
      if (onBeforeShowContextMenu) {
        const result = onBeforeShowContextMenu(template, target)
        target = result.target || target
        template = result.template || template
      }
      showFloatingContextMenuWithElement(target, template)
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
    <TextOnlyTooltip placement={'top'} title={'Use prompt'}>
      <Button
        sx={{
          minWidth: 'unset',
        }}
        variant={'outlined'}
        onClick={handleClick}
      >
        <UseChatGptIcon
          sx={{
            fontSize: 24,
            color: 'inherit',
          }}
        />
      </Button>
    </TextOnlyTooltip>
  )
}
export { FloatingInputButton }
