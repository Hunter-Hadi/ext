import { Stack, Typography } from '@mui/material'
import React, { FC, useEffect, useMemo, useState } from 'react'
import { useShortCutsWithMessageChat } from '@/features/shortcuts/hooks/useShortCutsWithMessageChat'
import { IContextMenuItemWithChildren, useRangy } from '@/features/contextMenu'
import { Item, Separator, Submenu } from 'react-contexify'
import { getEzMailChromeExtensionSettings, showEzMailBox } from '@/utils'
import {
  checkIsCanInputElement,
  groupByContextMenuItem,
} from '@/features/contextMenu/utils'
import defaultContextMenuJson from '@/pages/options/defaultContextMenuJson'
import { pingUntilLogin } from '@/features/chatgpt'

const ShortCutsButtonItem: FC<{
  menuItem: IContextMenuItemWithChildren
}> = ({ menuItem }) => {
  const { setShortCuts, runShortCuts } = useShortCutsWithMessageChat('')
  const { hideRangy, saveSelection, lastSelectionRanges } = useRangy()
  const [running, setRunning] = useState(false)
  useEffect(() => {
    if (lastSelectionRanges && running) {
      const actions = menuItem.data.actions
      if (actions && actions.length > 0) {
        showEzMailBox()
        pingUntilLogin()
          .then((loginSuccess) => {
            if (loginSuccess) {
              const isSetSuccess = setShortCuts(actions)
              if (isSetSuccess) {
                runShortCuts()
                  .then()
                  .catch()
                  .finally(() => {
                    hideRangy()
                    setRunning(false)
                  })
              }
            }
          })
          .catch((err) => {
            console.log(err)
          })
      }
    }
  }, [lastSelectionRanges, running])
  if (menuItem.children && menuItem.children.length > 0) {
    return (
      <Submenu
        label={
          <Typography fontSize={14} textAlign={'left'} color={'inherit'}>
            {menuItem.text}
          </Typography>
        }
      >
        {menuItem.children?.map((childMenuItem) => {
          return (
            <ShortCutsButtonItem
              menuItem={childMenuItem}
              key={childMenuItem.id}
            />
          )
        })}
      </Submenu>
    )
  }
  return (
    <Item
      onClick={() => {
        if (!running) {
          saveSelection()
          setRunning(true)
        }
      }}
    >
      <Typography fontSize={14} textAlign={'left'} color={'inherit'}>
        {menuItem.text}
      </Typography>
    </Item>
  )
}

const ShortCutsGroup: FC<{ menuItem: IContextMenuItemWithChildren }> = ({
  menuItem,
}) => {
  return (
    <Stack>
      <Typography textAlign={'left'} fontSize={12} color={'text.secondary'}>
        {menuItem.text}
      </Typography>
      {menuItem.children?.map((childMenuItem) => {
        return (
          <ShortCutsButtonItem
            menuItem={childMenuItem}
            key={childMenuItem.id}
          />
        )
      })}
      <Separator />
    </Stack>
  )
}

const ListItem: FC<{ menuItem: IContextMenuItemWithChildren }> = ({
  menuItem,
}) => {
  if (menuItem.data.type === 'group') {
    return <ShortCutsGroup menuItem={menuItem} />
  }
  return <ShortCutsButtonItem menuItem={menuItem} />
}

const ContextMenuList: FC = () => {
  const [list, setList] = useState<IContextMenuItemWithChildren[]>([])
  const { rangyState } = useRangy()
  useEffect(() => {
    let isDestroy = false
    const getList = async () => {
      const settings = await getEzMailChromeExtensionSettings()
      if (isDestroy) return
      setList(
        groupByContextMenuItem(
          settings?.contextMenus || defaultContextMenuJson,
        ),
      )
    }
    getList()
    return () => {
      isDestroy = true
    }
  }, [])
  const sortByHighlighted = useMemo(() => {
    const editOrReviewSelection = list.find(
      (item) => item.text === 'Edit or review selection',
    )
    const generateFromSelection = list.find(
      (item) => item.text === 'Generate from selection',
    )
    if (editOrReviewSelection && generateFromSelection) {
      const currentRange =
        rangyState.lastSelectionRanges || rangyState.tempSelectionRanges
      const parent = currentRange?.ranges?.[0]?.parentElement?.()
      const selectionInputAble = checkIsCanInputElement(parent || document.body)
      if (selectionInputAble) {
        return [editOrReviewSelection, generateFromSelection]
      } else {
        return [generateFromSelection, editOrReviewSelection]
      }
    }
    return []
  }, [rangyState.tempSelectionRanges, rangyState.lastSelectionRanges, list])
  return (
    <>
      {sortByHighlighted.map((menuItem, index) => {
        return <ListItem key={index} menuItem={menuItem} />
      })}
    </>
  )
}
export default ContextMenuList
