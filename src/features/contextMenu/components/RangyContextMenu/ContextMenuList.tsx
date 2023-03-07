import { Stack, Typography } from '@mui/material'
import React, { FC, useEffect, useState } from 'react'
import { useShortCutsWithMessageChat } from '@/features/shortcuts/hooks/useShortCutsWithMessageChat'
import { ISetActionsType } from '@/features/shortcuts'
import { useRangy } from '@/features/contextMenu'
import { Item, Separator, Submenu } from 'react-contexify'
import { v4 } from 'uuid'

type IMenuItem = {
  id: string
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
  [
    {
      type: 'RENDER_CHATGPT_PROMPT',
      parameters: {
        template: 'Give me a joke',
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
    id: v4(),
    children: [
      {
        id: v4(),
        name: 'Improve writing',
        type: 'shortcuts',
        shortCutsId: '0',
      },
      {
        id: v4(),
        name: 'Fix spelling & grammar',
        type: 'shortcuts',
        shortCutsId: '1',
      },
      {
        id: v4(),
        name: 'Make shorter',
        type: 'shortcuts',
        shortCutsId: '2',
      },
      {
        name: 'Make longer',
        id: v4(),
        type: 'shortcuts',
        shortCutsId: '3',
      },
      {
        id: v4(),
        name: 'Summarize',
        type: 'shortcuts',
        shortCutsId: '4',
      },
      {
        id: v4(),
        name: 'See more',
        type: 'shortcuts',
        children: [
          {
            id: v4(),
            name: 'Give me a joke',
            type: 'shortcuts',
            shortCutsId: '5',
          },
        ],
      },
    ],
  },
] as IMenuItem[]

const ShortCutsButtonItem: FC<{
  menuItem: IMenuItem
}> = ({ menuItem }) => {
  const { setShortCuts, runShortCuts } = useShortCutsWithMessageChat('')
  const { hideRangy, saveSelection, lastSelectionRanges } = useRangy()
  const [running, setRunning] = useState(false)
  useEffect(() => {
    if (lastSelectionRanges && running) {
      if (menuItem.shortCutsId) {
        const action = TEMPLATE_ACTIONS[Number(menuItem.shortCutsId)]
        const isSetSuccess = setShortCuts(action)
        if (isSetSuccess) {
          runShortCuts()
            .then()
            .catch()
            .finally(() => {
              hideRangy(true)
              setRunning(false)
            })
        }
      }
    }
  }, [lastSelectionRanges, running])
  if (menuItem.children && menuItem.children.length > 0) {
    return (
      <Submenu
        label={
          <Typography fontSize={14} textAlign={'left'} color={'inherit'}>
            {menuItem.name}
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
        {menuItem.name}
      </Typography>
    </Item>
  )
}

const ShortCutsGroup: FC<{ menuItem: IMenuItem }> = ({ menuItem }) => {
  return (
    <Stack>
      <Typography
        textAlign={'left'}
        pl={1}
        fontSize={14}
        color={'text.secondary'}
      >
        {menuItem.name}
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

const ListItem: FC<{ menuItem: IMenuItem }> = ({ menuItem }) => {
  if (menuItem.type === 'group') {
    return <ShortCutsGroup menuItem={menuItem} />
  }
  return <ShortCutsButtonItem menuItem={menuItem} />
}

const ContextMenuList: FC = () => {
  return (
    <>
      {TEMPLATE_MENU_LIST.map((menuItem, index) => {
        return <ListItem key={index} menuItem={menuItem} />
      })}
    </>
  )
}
export default ContextMenuList
