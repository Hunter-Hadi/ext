import { Stack } from '@mui/material'
import React, { FC, useMemo } from 'react'

import { ContextMenuIcon } from '@/components/ContextMenuIcon'
import useInitContextWindow from '@/features/contextMenu/hooks/useInitContextWindow'

const SidebarRewrite: FC = () => {
  const { contextWindowList } = useInitContextWindow()
  const memoSx = useMemo(() => {
    return {
      fontSize: 24,
      color: 'inherit',
    }
  }, [])

  return (
    <Stack>
      <ContextMenuIcon icon='Rewrite' sx={memoSx} />
    </Stack>
  )
}

export default SidebarRewrite
