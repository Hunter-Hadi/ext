import React, { FC } from 'react'
import Stack from '@mui/material/Stack'

const SidebarTabs: FC = () => {
  return null
  return (
    <Stack
      direction={'row'}
      height={36}
      alignItems={'center'}
      width={'100%'}
      borderBottom={'1px solid'}
      borderColor="customColor.borderColor"
      bgcolor={'background.paper'}
      sx={{
        position: 'sticky',
        top: 0,
        zIndex: 1,
      }}
    >
      {/*// right*/}
      <Stack alignItems={'center'} direction={'row'} ml={'auto'}></Stack>
    </Stack>
  )
}
export default SidebarTabs
