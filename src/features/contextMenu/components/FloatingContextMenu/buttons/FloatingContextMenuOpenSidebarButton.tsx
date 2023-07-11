import React, { FC } from 'react'
import { isShowChatBox, showChatBox } from '@/utils'
import Button from '@mui/material/Button'
import { SxProps } from '@mui/material/styles'
import { SidePanelIcon } from '@/components/CustomIcon'
import TextOnlyTooltip from '@/components/TextOnlyTooltip'
import useCommands from '@/hooks/useCommands'
import { FloatingDropdownMenuState, useRangy } from '@/features/contextMenu'
import { useRecoilState } from 'recoil'

const FloatingContextMenuOpenSidebarButton: FC<{
  sx?: SxProps
}> = (props) => {
  const { hideRangy } = useRangy()
  const [, setFloatingDropdownMenu] = useRecoilState(FloatingDropdownMenuState)
  const { shortCutKey } = useCommands()
  return (
    <TextOnlyTooltip
      floatingMenuTooltip
      description={shortCutKey}
      title={'Switch to sidebar'}
      placement={'bottom'}
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
        variant="text"
        onClick={() => {
          // 2023-07-10 @huangsong
          // - 点击button（或者按⌘J）的效果是从当前popup转移到sidebar里
          // - 也就是打开sidebar，并且关闭当前popup
          // - 如果当前sidebar本来就是打开的，就保持打开状态就行
          hideRangy()
          setFloatingDropdownMenu({
            open: false,
            rootRect: null,
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
