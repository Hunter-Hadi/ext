import { NodeModel } from '@minoru/react-dnd-treeview'
import Box from '@mui/material/Box'
import React from 'react'

type Props = {
  node: NodeModel
  depth: number
}

const ContextMenuPlaceholder: React.FC<Props> = (props) => {
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
      style={{ left: props.depth * 24 }}
    />
  )
}
export default ContextMenuPlaceholder
