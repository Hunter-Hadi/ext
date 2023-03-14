import { Stack, Typography } from '@mui/material'
import React, { FC, useEffect, useMemo, useState } from 'react'
import { useShortCutsWithMessageChat } from '@/features/shortcuts/hooks/useShortCutsWithMessageChat'
import {
  ContextMenuIcon,
  IContextMenuItem,
  IContextMenuItemWithChildren,
  useRangy,
} from '@/features/contextMenu'
import { Item, Separator, Submenu } from 'react-contexify'
import {
  getChromeExtensionSettings,
  IChromeExtensionSettingsKey,
} from '@/utils'
import { groupByContextMenuItem } from '@/features/contextMenu/utils'
// import OpenInNewIcon from '@mui/icons-material/OpenInNew'
import cloneDeep from 'lodash-es/cloneDeep'
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
        const isSetSuccess = setShortCuts(actions)
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

const ContextMenuList: FC<{
  defaultContextMenuJson: IContextMenuItem[]
  settingsKey: IChromeExtensionSettingsKey
}> = (props) => {
  const { defaultContextMenuJson, settingsKey } = props
  const [list, setList] = useState<IContextMenuItemWithChildren[]>([])
  const { rangyState, parseRangySelectRangeData } = useRangy()
  useEffect(() => {
    let isDestroy = false
    const getList = async () => {
      const settings = await getChromeExtensionSettings()
      if (isDestroy) return
      setList(
        groupByContextMenuItem(settings[settingsKey] || defaultContextMenuJson),
      )
    }
    getList()
    return () => {
      isDestroy = true
    }
  }, [])
  const sortBySettingsKey = useMemo(() => {
    if (settingsKey === 'gmailToolBarContextMenu') {
      return cloneDeep(list).map((group, index) => {
        if (index === 0) {
          // gmail只有一个group
          // group第一个作为cta button
          group.children = group.children.slice(1)
        }
        return group
      })
    } else if (settingsKey === 'contextMenus') {
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
  console.log(sortBySettingsKey, settingsKey)
  return (
    <Stack
      sx={
        {
          // overflowY: 'hidden',
        }
      }
    >
      {/*{settingsKey === 'gmailToolBarContextMenu' && (*/}
      {/*  <>*/}
      {/*    <CustomizeButton />*/}
      {/*    <Separator />*/}
      {/*  </>*/}
      {/*)}*/}
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
