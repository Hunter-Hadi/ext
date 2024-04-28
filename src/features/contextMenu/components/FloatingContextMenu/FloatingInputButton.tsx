import Button from '@mui/material/Button'
import { SxProps } from '@mui/material/styles'
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
  sx?: SxProps
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
  sx,
}) => {
  const testid = 'max-ai__actions__button--use-max-ai'
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
      showFloatingContextMenuWithElement(target, template, true)
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
          ...sx,
        }}
        className={className}
        title={t('client:sidebar__button__use_prompt')}
        onClick={handleClick}
        data-testid={testid}
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
      data-testid={testid}
    >
      <Button
        className={className}
        sx={{
          p: '7px',
          minWidth: 'unset',
          ...sx,
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
