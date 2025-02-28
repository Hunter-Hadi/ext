import QuestionAnswerIcon from '@mui/icons-material/QuestionAnswer'
import SearchOutlinedIcon from '@mui/icons-material/SearchOutlined'
import SummarizeOutlinedIcon from '@mui/icons-material/SummarizeOutlined'
import React, { FC, useMemo } from 'react'

import { ContextMenuIcon } from '@/components/ContextMenuIcon'

const SidebarTabIcons: FC<{ icon: string }> = ({ icon }) => {
  const memoSx = useMemo(() => {
    return {
      fontSize: 24,
      color: 'inherit',
    }
  }, [])

  if (icon === 'Chat') {
    return <QuestionAnswerIcon sx={memoSx} />
  }
  if (icon === 'Summary') {
    return <SummarizeOutlinedIcon sx={memoSx} />
  }
  if (icon === 'Search') {
    return <SearchOutlinedIcon sx={memoSx} />
  }
  if (icon === 'Art') {
    return <ContextMenuIcon icon='Art' sx={memoSx} />
  }
  if (icon === 'Rewrite') {
    return <ContextMenuIcon icon='Rewrite' sx={memoSx} />
  }
  if (icon === 'More') {
    return <ContextMenuIcon icon='More' sx={memoSx} />
  }

  return null
}

export default SidebarTabIcons
