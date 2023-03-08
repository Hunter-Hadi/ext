import Portal from '@/components/Portal'
import React from 'react'
import { Paper } from '@mui/material'
import { Menu } from 'react-contexify'
import ContextMenuList from '@/features/contextMenu/components/RangyContextMenu/ContextMenuList'
// import ContextMenuList from '@/features/contextMenu/components/RangyContextMenu/ContextMenuList'
export const RangyContextMenuId = 'EzMail_AI_ROOT_Context_Menu_ID'

const RangyContextMenu = () => {
  // const [dropdownType, setDropdownType] = React.useState<
  //   'ezMailAI' | 'buttons'
  // >('buttons')
  return (
    <Portal containerId={'EzMail_AI_ROOT_Context_Menu'}>
      <Paper elevation={3}>
        <Menu
          style={{
            zIndex: 999998,
          }}
          id={RangyContextMenuId}
        >
          {/*{dropdownType === 'buttons' && (*/}
          {/*  <Item closeOnClick={false}>*/}
          {/*    <Stack direction={'row'} alignItems={'center'} spacing={1}>*/}
          {/*      <Button*/}
          {/*        startIcon={<EzMailAIIcon sx={{ fontSize: 16 }} />}*/}
          {/*        sx={{ width: 110, height: 32 }}*/}
          {/*        size={'small'}*/}
          {/*        onClick={(event) => {*/}
          {/*          saveSelection()*/}
          {/*          setDropdownType('ezMailAI')*/}
          {/*        }}*/}
          {/*      >*/}
          {/*        EzMail.AI*/}
          {/*      </Button>*/}
          {/*    </Stack>*/}
          {/*  </Item>*/}
          {/*)}*/}
          <ContextMenuList />
        </Menu>
      </Paper>
    </Portal>
  )
}
export { RangyContextMenu }
