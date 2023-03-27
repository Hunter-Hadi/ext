import { Stack, Typography } from '@mui/material'
import React, { FC, useEffect, useMemo, useState } from 'react'
import { useShortCutsWithMessageChat } from '@/features/shortcuts/hooks/useShortCutsWithMessageChat'
import { useRangy } from '@/features/contextMenu/hooks'
import { ContextMenuIcon } from '@/features/contextMenu/components/ContextMenuIcon'
import { IContextMenuItemWithChildren } from '@/features/contextMenu/store'
import { Item, Submenu } from 'react-contexify'
import {
  getChromeExtensionContextMenu,
  getFilteredTypeGmailToolBarContextMenu,
  IChromeExtensionSettingsKey,
} from '@/utils'
import { groupByContextMenuItem } from '@/features/contextMenu/utils'
// import OpenInNewIcon from '@mui/icons-material/OpenInNew'
import cloneDeep from 'lodash-es/cloneDeep'
import { CurrentInboxMessageTypeSelector } from '@/features/gmail/store'
import { useRecoilValue } from 'recoil'
// import SettingsIcon from '@mui/icons-material/Settings'
// import Browser from 'webextension-polyfill'
// import { CHROME_EXTENSION_POST_MESSAGE_ID } from '@/types'

const ShortCutsButtonItem: FC<{
  menuItem: IContextMenuItemWithChildren
}> = ({ menuItem }) => {
  const { setShortCuts, runShortCuts } = useShortCutsWithMessageChat('')
  const { lastSelectionRanges, rangy } = useRangy()
  const [running, setRunning] = useState(false)
  useEffect(() => {
    if (running) {
      const actions = menuItem.data.actions
      if (actions && actions.length > 0) {
        console.log('actions', actions)
        const setActions = cloneDeep(actions)
        const isSetSuccess = setShortCuts(setActions)
        isSetSuccess &&
          runShortCuts()
            .then()
            .catch()
            .finally(() => {
              rangy?.contextMenu.close()
              rangy?.contextMenu.resetActiveElement()
              setRunning(false)
            })
      }
    }
  }, [lastSelectionRanges, running])
  if (menuItem.children && menuItem.children.length > 0) {
    return (
      <Submenu
        label={
          <Stack direction={'row'} alignItems={'center'}>
            {menuItem?.data?.icon && (
              <ContextMenuIcon
                size={16}
                icon={menuItem.data.icon}
                sx={{ color: 'primary.main', mr: 1 }}
              />
            )}
            <Typography fontSize={14} textAlign={'left'} color={'inherit'}>
              {menuItem.text}
            </Typography>
          </Stack>
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
      onClick={({ event }) => {
        event.stopPropagation()
        event.preventDefault()
        if (!running) {
          setRunning(true)
        }
      }}
      onMouseUp={(event) => {
        event.stopPropagation()
        event.preventDefault()
      }}
    >
      {menuItem?.data?.icon && (
        <ContextMenuIcon
          size={16}
          icon={menuItem.data.icon}
          sx={{ color: 'primary.main', mr: 1 }}
        />
      )}
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
      <Stack direction={'row'} alignItems={'center'}>
        {menuItem?.data?.icon && (
          <ContextMenuIcon
            size={16}
            icon={menuItem.data.icon}
            sx={{ color: 'primary.main', mr: 1 }}
          />
        )}
        <Typography textAlign={'left'} fontSize={12} color={'text.secondary'}>
          {menuItem.text}
        </Typography>
      </Stack>
      {menuItem.children?.map((childMenuItem) => {
        return (
          <ShortCutsButtonItem
            menuItem={childMenuItem}
            key={childMenuItem.id}
          />
        )
      })}
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

const ContextMenuList: FC<{
  // defaultContextMenuJson: IContextMenuItem[]
  settingsKey: IChromeExtensionSettingsKey
}> = (props) => {
  const { settingsKey } = props
  const [list, setList] = useState<IContextMenuItemWithChildren[]>([])
  const { rangyState, parseRangySelectRangeData } = useRangy()
  const messageType = useRecoilValue(CurrentInboxMessageTypeSelector)
  useEffect(() => {
    let isDestroy = false
    const getList = async () => {
      let menuList = await getChromeExtensionContextMenu(settingsKey)

      if (settingsKey === 'gmailToolBarContextMenu') {
        menuList = await getFilteredTypeGmailToolBarContextMenu(
          messageType,
          true,
          menuList,
        )
      }
      if (isDestroy) return
      setList(groupByContextMenuItem(menuList))
    }
    getList()
    return () => {
      isDestroy = true
    }
  }, [messageType])
  const sortBySettingsKey = useMemo(() => {
    if (settingsKey === 'contextMenus') {
      const editOrReviewSelection = list.find(
        (group) => group.text === 'Edit or review selection',
      )
      const generateFromSelection = list.find(
        (group) => group.text === 'Generate from selection',
      )
      const currentRange = rangyState.lastSelectionRanges
      if (editOrReviewSelection && generateFromSelection) {
        if (currentRange) {
          const selectionData = parseRangySelectRangeData(
            currentRange?.selectRange,
            'ContextMenuList',
          )
          if (selectionData.isCanInputElement) {
            return [editOrReviewSelection, generateFromSelection]
          } else {
            return [generateFromSelection, editOrReviewSelection]
          }
        } else if (rangyState.currentActiveWriteableElement) {
          return [editOrReviewSelection, generateFromSelection]
        }
      }
    }
    return list
  }, [
    rangyState.lastSelectionRanges,
    rangyState.currentActiveWriteableElement,
    list,
    settingsKey,
  ])
  // console.log('sortBySettingsKey', sortBySettingsKey, settingsKey)
  return (
    <Stack>
      {/*<Item*/}
      {/*  id="Add new prompt template"*/}
      {/*  onClick={() => {*/}
      {/*    const port = Browser.runtime.connect()*/}
      {/*    port &&*/}
      {/*      port.postMessage({*/}
      {/*        id: CHROME_EXTENSION_POST_MESSAGE_ID,*/}
      {/*        event: 'Client_openUrlInNewTab',*/}
      {/*        data: {*/}
      {/*          key: 'options',*/}
      {/*        },*/}
      {/*      })*/}
      {/*    port.disconnect()*/}
      {/*  }}*/}
      {/*>*/}
      {/*  <Stack direction={'row'} alignItems={'center'} gap={1}>*/}
      {/*    <SettingsIcon sx={{ fontSize: 14 }} />*/}
      {/*    <Typography fontSize={14} textAlign={'left'} color={'inherit'}>*/}
      {/*      Add new prompt template*/}
      {/*    </Typography>*/}
      {/*  </Stack>*/}
      {/*</Item>*/}
      {/*<Separator />*/}
      {sortBySettingsKey.map((menuItem, index) => {
        return <ListItem key={index} menuItem={menuItem} />
      })}
      {/*{settingsKey === 'contextMenus' && <CustomizeButton />}*/}
    </Stack>
  )
}
// const CustomizeButton = () => {
//   return (
//     <Item
//       onClick={() => {
//         const port = chrome.runtime.connect()
//         port &&
//           port.postMessage({
//             event: 'Client_openUrlInNewTab',
//             data: {
//               key: 'options',
//             },
//           })
//       }}
//     >
//       <Stack
//         direction={'row'}
//         alignItems={'center'}
//         justifyContent={'space-between'}
//         width={'100%'}
//       >
//         <Typography fontSize={14} textAlign={'left'} color={'inherit'}>
//           {`Customize`}
//         </Typography>
//         <OpenInNewIcon sx={{ fontSize: 16, color: 'inherit' }} />
//       </Stack>
//     </Item>
//   )
// }
export default ContextMenuList
