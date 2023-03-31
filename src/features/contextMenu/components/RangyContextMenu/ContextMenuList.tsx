import { Stack, Typography } from '@mui/material'
import React, { FC, useContext, useEffect, useMemo, useState } from 'react'
import { useShortCutsWithMessageChat } from '@/features/shortcuts/hooks/useShortCutsWithMessageChat'
import { useRangy } from '@/features/contextMenu/hooks'
import { ContextMenuIcon } from '@/features/contextMenu/components/ContextMenuIcon'
import { IContextMenuItemWithChildren } from '@/features/contextMenu/store'
import { Item, Separator, Submenu } from 'react-contexify'
import {
  chromeExtensionClientOpenPage,
  getChromeExtensionContextMenu,
  IChromeExtensionSettingsContextMenuKey,
} from '@/utils'
import { groupByContextMenuItem } from '@/features/contextMenu/utils'
// import OpenInNewIcon from '@mui/icons-material/OpenInNew'
import cloneDeep from 'lodash-es/cloneDeep'
import { CurrentInboxMessageTypeSelector } from '@/features/gmail/store'
import { useRecoilValue } from 'recoil'
import SettingsOutlinedIcon from '@mui/icons-material/SettingsOutlined'
import {
  EZMAIL_NEW_EMAIL_CTA_BUTTON_ID,
  EZMAIL_REPLY_CTA_BUTTON_ID,
} from '@/types'
// import Browser from 'webextension-polyfill'
// import { CHROME_EXTENSION_POST_MESSAGE_ID } from '@/types'

const ContextMenuContext = React.createContext<{
  staticButton?: boolean
}>({
  staticButton: false,
})

const ShortCutsButtonItem: FC<{
  menuItem: IContextMenuItemWithChildren
}> = ({ menuItem }) => {
  const contextMenuContext = useContext(ContextMenuContext)
  const { setShortCuts, runShortCuts } = useShortCutsWithMessageChat('')
  const { lastSelectionRanges, rangy } = useRangy()
  const [running, setRunning] = useState(false)
  useEffect(() => {
    if (running) {
      const actions = menuItem.data.actions
      if (actions && actions.length > 0) {
        console.log('actions', actions)
        let setActions = cloneDeep(actions)
        if (contextMenuContext.staticButton) {
          setActions = setActions.map((action) => {
            if (action.type === 'RENDER_CHATGPT_PROMPT') {
              return {
                ...action,
                parameters: {
                  ...action.parameters,
                  template: (action.parameters?.template || '').replace(
                    /\{\{SELECTED_TEXT\}\}/g,
                    '{{LAST_AI_OUTPUT}}',
                  ),
                },
              }
            }
            return action
          })
        }
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
          <Stack direction={'row'} alignItems={'center'} width={'90%'}>
            {menuItem?.data?.icon && (
              <ContextMenuIcon
                size={16}
                icon={menuItem.data.icon}
                sx={{ color: 'primary.main', mr: 1 }}
              />
            )}
            <Typography
              fontSize={14}
              textAlign={'left'}
              color={'inherit'}
              sx={{
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
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
      <Typography
        fontSize={14}
        textAlign={'left'}
        color={'inherit'}
        sx={{
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
        }}
      >
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
        <Typography
          textAlign={'left'}
          fontSize={12}
          color={'text.secondary'}
          sx={{
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
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
  staticButton?: boolean
  // defaultContextMenuJson: IContextMenuItem[]
  settingsKey: IChromeExtensionSettingsContextMenuKey
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
        menuList = menuList.filter(
          (item) =>
            item.id !== EZMAIL_NEW_EMAIL_CTA_BUTTON_ID &&
            item.id !== EZMAIL_REPLY_CTA_BUTTON_ID,
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
    <Stack maxWidth={260}>
      <ContextMenuContext.Provider value={{ staticButton: props.staticButton }}>
        <Item
          id="Add new prompt template"
          onClick={() => {
            chromeExtensionClientOpenPage({
              key: 'options',
            })
          }}
        >
          <Stack direction={'row'} alignItems={'center'} gap={1}>
            <SettingsOutlinedIcon sx={{ fontSize: 14 }} />
            <Typography fontSize={14} textAlign={'left'} color={'inherit'}>
              Edit options
            </Typography>
          </Stack>
        </Item>
        <Separator />
        {sortBySettingsKey.map((menuItem, index) => {
          return <ListItem key={index} menuItem={menuItem} />
        })}
        {/*{settingsKey === 'contextMenus' && <CustomizeButton />}*/}
      </ContextMenuContext.Provider>
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
