import Button from '@mui/material/Button'
import { SxProps } from '@mui/material/styles'
import React, { FC } from 'react'
import { useTranslation } from 'react-i18next'
import { useRecoilState } from 'recoil'

import { SidePanelIcon } from '@/components/CustomIcon'
import TextOnlyTooltip, {
  TextOnlyTooltipProps,
} from '@/components/TextOnlyTooltip'
import { FloatingDropdownMenuState, useRangy } from '@/features/contextMenu'
import { floatingContextMenuSaveDraftToChatBox } from '@/features/contextMenu/utils'
import {
  isShowChatBox,
  showChatBox,
} from '@/features/sidebar/utils/sidebarChatBoxHelper'
import useCommands from '@/hooks/useCommands'

const FloatingContextMenuOpenSidebarButton: FC<{
  sx?: SxProps
  TooltipProps?: Omit<TextOnlyTooltipProps, 'title' | 'children'>
}> = (props) => {
  const { t } = useTranslation(['common', 'client'])
  const { hideRangy } = useRangy()
  const [, setFloatingDropdownMenu] = useRecoilState(FloatingDropdownMenuState)
  const { chatBoxShortCutKey } = useCommands()
  return (
    <TextOnlyTooltip
      description={chatBoxShortCutKey}
      title={t('client:floating_menu__button__switch_to_sidebar')}
      placement={'bottom'}
      {...props.TooltipProps}
    >
      <Button
        sx={{
          ml: '0px!important',
          height: '24px',
          flexShrink: 0,
          alignSelf: 'end',
          minWidth: 'unset',
          padding: '6px 5px',
        }}
        className={'max-ai__actions__button--toggle-sidebar'}
        variant="text"
        onClick={() => {
          // 2023-07-10 @huangsong
          // - 点击button（或者按⌘J）的效果是从当前popup转移到sidebar里
          // - 也就是打开sidebar，并且关闭当前popup，把popup的内容转移到sidebar里
          // - 如果当前sidebar本来就是打开的，就保持打开状态就行
          floatingContextMenuSaveDraftToChatBox()
          hideRangy()
          setFloatingDropdownMenu({
            open: false,
            rootRect: null,
            showModelSelector: false,
          })
          if (isShowChatBox()) {
            // hideChatBox()
          } else {
            showChatBox()
          }
        }}
      >
        <SidePanelIcon
          sx={{
            fontSize: '16px',
            color: 'text.primary',
          }}
        />
      </Button>
    </TextOnlyTooltip>
  )
}
export { FloatingContextMenuOpenSidebarButton }
