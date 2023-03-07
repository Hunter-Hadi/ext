import { Divider, List, ListItemButton, Stack, Typography } from '@mui/material'
import React, { FC } from 'react'
import { useShortCutsWithMessageChat } from '@/features/shortcuts/hooks/useShortCutsWithMessageChat'
import { ISetActionsType } from '@/features/shortcuts'
import { useRangy } from '@/features/contextMenu'

type IMenuItem = {
  name: string
  type: 'group' | 'shortcuts'
  shortCutsId?: string
  children?: IMenuItem[]
}

const TEMPLATE_ACTIONS = [
  [
    {
      type: 'RENDER_CHATGPT_PROMPT',
      parameters: {
        template: 'Improve writing: \n{{USER_SELECTION_VALUE}}',
      },
    },
    {
      type: 'ASK_CHATGPT',
    },
  ],
  [
    {
      type: 'RENDER_CHATGPT_PROMPT',
      parameters: {
        template: 'Fix spelling & grammar: \n{{USER_SELECTION_VALUE}}',
      },
    },
    {
      type: 'ASK_CHATGPT',
    },
  ],
  [
    {
      type: 'RENDER_CHATGPT_PROMPT',
      parameters: {
        template: 'Make shorter: \n{{USER_SELECTION_VALUE}}',
      },
    },
    {
      type: 'ASK_CHATGPT',
    },
  ],
  [
    {
      type: 'RENDER_CHATGPT_PROMPT',
      parameters: {
        template: 'Make longer: \n{{USER_SELECTION_VALUE}}',
      },
    },
    {
      type: 'ASK_CHATGPT',
    },
  ],
  [
    {
      type: 'RENDER_CHATGPT_PROMPT',
      parameters: {
        template: 'Summarize: \n{{USER_SELECTION_VALUE}}',
      },
    },
    {
      type: 'ASK_CHATGPT',
    },
  ],
] as ISetActionsType[]

const TEMPLATE_MENU_LIST = [
  {
    name: 'Edit or review selection',
    type: 'group',
    children: [
      {
        name: 'Improve writing',
        type: 'shortcuts',
        shortCutsId: '0',
      },
      {
        name: 'Fix spelling & grammar',
        type: 'shortcuts',
        shortCutsId: '1',
      },
      {
        name: 'Make shorter',
        type: 'shortcuts',
        shortCutsId: '2',
      },
      {
        name: 'Make longer',
        type: 'shortcuts',
        shortCutsId: '3',
      },
      {
        name: 'Summarize',
        type: 'shortcuts',
        shortCutsId: '4',
      },
      {
        name: 'See more',
        type: 'shortcuts',
      },
    ],
  },
] as IMenuItem[]

const ShortCutsButtonItem: FC<{
  menuItem: IMenuItem
}> = ({ menuItem }) => {
  const { setShortCuts, runShortCuts } = useShortCutsWithMessageChat('')
  const { hideRangy } = useRangy()
  return (
    <ListItemButton
      sx={{ fontSize: 16 }}
      onClick={async () => {
        if (menuItem.shortCutsId) {
          const action = TEMPLATE_ACTIONS[Number(menuItem.shortCutsId)]
          const isSetSuccess = setShortCuts(action)
          if (isSetSuccess) {
            hideRangy()
            await runShortCuts()
          }
        }
      }}
    >
      {menuItem.name}
    </ListItemButton>
  )
}

const ShortCutsGroup: FC<{ menuItem: IMenuItem }> = ({ menuItem }) => {
  return (
    <Stack>
      <Typography pl={1} fontSize={14} color={'text.secondary'}>
        {menuItem.name}
      </Typography>
      {menuItem.children?.map((childMenuItem, childMenuItemIndex) => {
        return (
          <ShortCutsButtonItem
            menuItem={childMenuItem}
            key={childMenuItemIndex}
          />
        )
      })}
      <Divider />
    </Stack>
  )
}

const ListItem: FC<{ menuItem: IMenuItem }> = ({ menuItem }) => {
  if (menuItem.type === 'group') {
    return <ShortCutsGroup menuItem={menuItem} />
  }
  return <ShortCutsButtonItem menuItem={menuItem} />
}

const ContextMenuList: FC = () => {
  return (
    <List>
      {TEMPLATE_MENU_LIST.map((menuItem, index) => {
        return <ListItem key={index} menuItem={menuItem} />
      })}
    </List>
  )
}
export default ContextMenuList
