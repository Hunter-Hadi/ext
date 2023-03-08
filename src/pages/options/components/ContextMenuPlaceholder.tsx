import React from 'react'
import { NodeModel } from '@minoru/react-dnd-treeview'
import { Box } from '@mui/material'

type Props = {
  node: NodeModel
  depth: number
}

const ContextMenuPlaceholder: React.FC<Props> = (props) => {
  return (
    <Box
      id={'1231231231'}
      sx={{
        bgcolor: 'primary.main',
        height: 2,
        position: 'absolute',
        right: 0,
        transform: 'translateY(-50%)',
        top: 0,
      }}
      style={{ left: props.depth * 24 }}
    />
  )
}
export default ContextMenuPlaceholder
