import { IContextMenuItemWithChildren } from '@/features/contextMenu/types'

/**
 * 基于Draft操作的上下文菜单ID集合
 */
export const CONTEXT_MENU_DRAFT_TYPES = {
  REPLACE_SELECTION: '397f0c89-596c-4433-be95-02faeccee083',
  INSERT_BELOW: 'd0b0b2a0-0b7e-4b1e-9b0e-5b7b6b2b4b2b',
  INSERT: '5fd6256c-f03c-4520-8df4-64b248247216',
  CONTINUE_WRITING: '207d0f63-7905-479f-9962-1e3ebd0b65ee',
  INSERT_ABOVE: '1f755cfe-cc56-4a73-9cc4-d2baf2c39624',
  TRY_AGAIN: '6b9f9cb4-b1b1-4897-9156-903dbc52b2a1',
  DISCARD: '82dc6fe3-da3d-437c-aa0e-268e4f602787',
  MAKE_LONGER: '2bd23d4b-6f6b-491c-a42f-f6c24a3b075d',
  MAKE_SHORTER: '44ea14bf-e81d-4e24-9627-b2ce9b1546dd',
  COPY: '8fcccd1e-eb6e-419e-8c79-d8bc7c10e72c',
}

export const CONTEXT_MENU_DRAFT_LIST: IContextMenuItemWithChildren[] = [
  {
    id: CONTEXT_MENU_DRAFT_TYPES.REPLACE_SELECTION,
    text: 'Replace selection',
    parent: 'root',
    droppable: false,
    data: {
      type: 'shortcuts',
      editable: false,
      icon: 'Done',
    },
    children: [],
  },
  {
    id: CONTEXT_MENU_DRAFT_TYPES.INSERT,
    text: 'Insert',
    parent: 'root',
    droppable: false,
    data: {
      type: 'shortcuts',
      editable: false,
      icon: 'NoteRight',
    },
    children: [],
  },
  {
    id: CONTEXT_MENU_DRAFT_TYPES.INSERT_BELOW,
    text: 'Insert below',
    parent: 'root',
    droppable: false,
    data: {
      type: 'shortcuts',
      editable: false,
      icon: 'NoteDown',
    },
    children: [],
  },
  {
    id: CONTEXT_MENU_DRAFT_TYPES.CONTINUE_WRITING,
    text: 'Continue writing',
    parent: 'root',
    droppable: false,
    data: {
      type: 'shortcuts',
      editable: false,
      icon: 'DefaultIcon',
      actions: [
        {
          type: 'FETCH_ACTIONS',
          parameters: {
            template: 'c0f7a642-9e34-4b1f-a2ee-1c4c5e93fa23',
          },
        },
      ],
    },
    children: [],
  },
  {
    id: CONTEXT_MENU_DRAFT_TYPES.COPY,
    text: 'Copy',
    parent: 'root',
    droppable: false,
    data: {
      type: 'shortcuts',
      editable: false,
      icon: 'Copy',
    },
    children: [],
  },
  {
    id: CONTEXT_MENU_DRAFT_TYPES.TRY_AGAIN,
    text: 'Try again',
    parent: 'root',
    droppable: false,
    data: {
      icon: 'Replay',
      type: 'shortcuts',
      editable: false,
    },
    children: [],
  },
  {
    id: CONTEXT_MENU_DRAFT_TYPES.DISCARD,
    text: 'Discard',
    parent: 'root',
    droppable: false,
    data: {
      icon: 'Delete',
      type: 'shortcuts',
      editable: false,
    },
    children: [],
  },
]
