import { NodeModel } from '@minoru/react-dnd-treeview'
import Box from '@mui/material/Box'
import React, { type FC } from 'react'

const MenuDropDestinationPlaceholder: FC<{
  node: NodeModel
  depth: number
}> = ({ node, depth }) => {
  return (
    <Box
      sx={{
        bgcolor: 'primary.main',
        height: 4,
        position: 'absolute',
        right: 0,
        transform: 'translateY(-50%)',
        top: 0,
        zIndex: 100,
      }}
      style={{ left: depth * 24 }}
    />
  )
}
export default MenuDropDestinationPlaceholder
