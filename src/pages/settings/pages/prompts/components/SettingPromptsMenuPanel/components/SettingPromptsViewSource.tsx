import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Collapse from '@mui/material/Collapse'
import Stack from '@mui/material/Stack'
import React, { FC, memo, useMemo, useState } from 'react'

import CopyTooltipIconButton from '@/components/CopyTooltipIconButton'
import { IContextMenuItem } from '@/features/contextMenu/types'

const SettingPromptsViewSource: FC<{
  treeData: IContextMenuItem[]
}> = ({ treeData }) => {
  const [expanded, setExpanded] = useState(false)
  const jsonText = useMemo(() => {
    if (expanded) {
      return JSON.stringify(treeData, null, 2)
    }
    return ''
  }, [expanded, treeData])
  return (
    <Stack>
      <Button
        variant={'outlined'}
        onClick={() => setExpanded((prevState) => !prevState)}
      >
        {expanded ? 'Hide source json' : 'View source json'}
      </Button>
      <Collapse
        in={expanded}
        timeout='auto'
        unmountOnExit
        sx={{
          textAlign: 'left',
        }}
      >
        <Stack mt={2} spacing={1}>
          <Box
            sx={{
              border: '1px solid #ccc',
              p: 1,
              position: 'relative',
              whiteSpace: 'pre-wrap',
            }}
          >
            <Box
              sx={{
                position: 'absolute',
                top: 1,
                right: 2,
              }}
            >
              <CopyTooltipIconButton copyText={jsonText}>
                Copy Json
              </CopyTooltipIconButton>
            </Box>
            {jsonText}
          </Box>
        </Stack>
      </Collapse>
    </Stack>
  )
}
export default memo(SettingPromptsViewSource)
