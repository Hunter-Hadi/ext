import Button from '@mui/material/Button'
import React, { FC } from 'react'
import { useTranslation } from 'react-i18next'

import { UseChatGptIcon } from '@/components/CustomIcon'
import TextOnlyTooltip from '@/components/TextOnlyTooltip'
import TooltipButton from '@/components/TooltipButton'
import { useFloatingContextMenu } from '@/features/contextMenu'
import { getCurrentDomainHost } from '@/utils/dataHelper/websiteHelper'

const NO_SUPPORT_HOST: string[] = []

/**
 * 输入框呼出按钮
 * @param buttonText
 * @param templateText
 * @param onBeforeShowContextMenu
 * @param iconButton
 * @constructor
 */
const FloatingInputButton: FC<{
  className?: string
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
}> = ({
  buttonText,
  templateText,
  onBeforeShowContextMenu,
  iconButton,
  className,
}) => {
  const { t } = useTranslation(['common', 'client'])
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
      <TooltipButton
        sx={{
          minWidth: 'unset',
          p: '5px',
          color: 'text.secondary',
        }}
        className={className}
        title={t('client:sidebar__button__use_prompt')}
        onClick={handleClick}
      >
        <UseChatGptIcon
          sx={{
            fontSize: 16,
            color: 'inherit',
          }}
        />
      </TooltipButton>
    )
  }
  return (
    <TextOnlyTooltip
      placement={'top'}
      title={t('client:sidebar__button__use_prompt')}
    >
      <Button
        className={className}
        sx={{
          p: '7px',
          minWidth: 'unset',
        }}
        variant={'outlined'}
        onClick={handleClick}
      >
        <UseChatGptIcon
          sx={{
            fontSize: 16,
            color: 'inherit',
          }}
        />
      </Button>
    </TextOnlyTooltip>
  )
}
export { FloatingInputButton }
