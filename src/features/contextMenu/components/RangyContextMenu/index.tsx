import Portal from '@/components/Portal'
import React, { useEffect } from 'react'
import { Button, Paper, Stack } from '@mui/material'
import { useClickOutsideContextMenu, useRangy } from '../../hooks'
import { EzMailAIIcon } from '@/components/CustomIcon'
import ContextMenuList from '@/features/contextMenu/components/RangyContextMenu/ContextMenuList'

const RangyContextMenu = () => {
  const { show, hideRangy, saveSelection } = useRangy()
  const { isClickOutside, reset } = useClickOutsideContextMenu()
  const [dropdownType, setDropdownType] = React.useState<
    'ezMailAI' | 'buttons'
  >('buttons')
  useEffect(() => {
    if (isClickOutside && show) {
      setDropdownType('buttons')
      hideRangy()
      reset()
    }
    setDropdownType('buttons')
  }, [isClickOutside, show])
  return (
    <Portal containerId={'EzMail_AI_ROOT_Context_Menu'} visible={show}>
      <Paper elevation={3}>
        {dropdownType === 'buttons' && (
          <Stack direction={'row'} alignItems={'center'} spacing={1}>
            <Button
              startIcon={<EzMailAIIcon sx={{ fontSize: 16 }} />}
              sx={{ width: 110, height: 32 }}
              size={'small'}
              onClick={() => {
                saveSelection()
                setDropdownType('ezMailAI')
              }}
            >
              EzMail.AI
            </Button>
          </Stack>
        )}
        {dropdownType === 'ezMailAI' && <ContextMenuList />}
      </Paper>
    </Portal>
  )
}
export { RangyContextMenu }
