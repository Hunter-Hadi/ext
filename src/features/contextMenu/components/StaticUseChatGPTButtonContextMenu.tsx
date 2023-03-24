import { Button, ButtonProps } from '@mui/material'
import React, { FC } from 'react'
import { UseChatGptIcon } from '@/components/CustomIcon'
import { useContextMenu } from 'react-contexify'
import { ROOT_CONTEXT_MENU_CONTAINER_ID } from '@/types'
import {
  cloneRect,
  computedRectPosition,
  getContextMenuRenderPosition,
} from '@/features/contextMenu/utils'
const StaticUseChatGPTButtonContextMenu: FC<ButtonProps> = (props) => {
  const { show: showContextMenu } = useContextMenu({
    id: ROOT_CONTEXT_MENU_CONTAINER_ID + 'StaticButton',
  })
  return (
    <>
      <Button
        {...props}
        startIcon={
          <UseChatGptIcon
            sx={{
              fontSize: 16,
              color: 'inherit',
            }}
          />
        }
        onClick={(event) => {
          event.stopPropagation()
          event.preventDefault()
          const position = getContextMenuRenderPosition(
            computedRectPosition(
              cloneRect(event.currentTarget.getBoundingClientRect()),
            ),
            220,
            490,
          )
          showContextMenu({
            event,
            position,
          })
        }}
      >
        Use ChatGPT
      </Button>
    </>
  )
}
export { StaticUseChatGPTButtonContextMenu }
