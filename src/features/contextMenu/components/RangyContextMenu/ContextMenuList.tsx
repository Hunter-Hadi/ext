import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import React, { FC, useContext, useEffect, useMemo, useState } from 'react'
import { useShortCutsWithMessageChat } from '@/features/shortcuts/hooks/useShortCutsWithMessageChat'
import { ContextMenuIcon } from '@/components/ContextMenuIcon'
import { IContextMenuItemWithChildren } from '@/features/contextMenu/store'
import { Item, Submenu } from 'react-contexify'
import { groupByContextMenuItem } from '@/features/contextMenu/utils'
import cloneDeep from 'lodash-es/cloneDeep'
import { CurrentInboxMessageTypeSelector } from '@/features/gmail/store'
import { useRecoilValue } from 'recoil'
import {
  USECHATGPT_GMAIL_NEW_EMAIL_CTA_BUTTON_ID,
  USECHATGPT_GMAIL_REPLY_CTA_BUTTON_ID,
} from '@/types'
import {
  getChromeExtensionContextMenu,
  IChromeExtensionSettingsContextMenuKey,
} from '@/background/utils'
import { FloatingContextMenuGmailCloseIconButton } from '@/features/contextMenu/components/FloatingContextMenu/buttons'
// import Browser  from 'webextension-polyfill'
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
              setRunning(false)
            })
      }
    }
  }, [runShortCuts, running])
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
          sx={{
            color: 'rgba(0, 0, 0, 0.6)',
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
  const messageType = useRecoilValue(CurrentInboxMessageTypeSelector)
  useEffect(() => {
    let isDestroy = false
    const getList = async () => {
      let menuList = await getChromeExtensionContextMenu(settingsKey)
      if (settingsKey === 'gmailToolBarContextMenu') {
        menuList = menuList.filter(
          (item) =>
            item.id !== USECHATGPT_GMAIL_NEW_EMAIL_CTA_BUTTON_ID &&
            item.id !== USECHATGPT_GMAIL_REPLY_CTA_BUTTON_ID,
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
    return list
  }, [list, settingsKey])
  // console.log('sortBySettingsKey', sortBySettingsKey, settingsKey)
  return (
    <Stack maxWidth={260}>
      <ContextMenuContext.Provider value={{ staticButton: props.staticButton }}>
        {/*<Item*/}
        {/*  id="Add new prompt template"*/}
        {/*  onClick={() => {*/}
        {/*    chromeExtensionClientOpenPage({*/}
        {/*      key: 'options',*/}
        {/*      query: '#custom-prompts',*/}
        {/*    })*/}
        {/*  }}*/}
        {/*>*/}
        {/*  <Stack direction={'row'} alignItems={'center'} gap={1}>*/}
        {/*    <SettingsOutlinedIcon sx={{ fontSize: 14 }} />*/}
        {/*    <Typography fontSize={14} textAlign={'left'} color={'inherit'}>*/}
        {/*      Edit custom prompts*/}
        {/*    </Typography>*/}
        {/*  </Stack>*/}
        {/*</Item>*/}
        <Stack direction={'row'} alignItems={'center'} justifyContent={'end'}>
          <FloatingContextMenuGmailCloseIconButton />
        </Stack>
        {/*<Separator />*/}
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
//             event: 'Client_openUrl',
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
