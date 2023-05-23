import React, { FC, useMemo } from 'react'
import DevContent from '@/components/DevContent'
import { IChatMessage } from '@/features/chatgpt/types'
import Box from '@mui/material/Box'
import Tooltip from '@mui/material/Tooltip'
import CodeIcon from '@mui/icons-material/Code'
import Stack from '@mui/material/Stack'
import CopyTooltipIconButton from '@/components/CopyTooltipIconButton'
const DevMessageSourceData: FC<{
  message: IChatMessage
}> = ({ message }) => {
  const copyJson = useMemo(() => {
    return JSON.stringify(message, null, 2)
  }, [message])
  return (
    <DevContent>
      <Box position={'absolute'} top={16} right={16}>
        <Tooltip
          title={
            <Stack>
              <pre
                style={{
                  fontSize: '12px',
                }}
              >
                {copyJson}
              </pre>
              <CopyTooltipIconButton copyText={copyJson} />
            </Stack>
          }
        >
          <CodeIcon />
        </Tooltip>
      </Box>
    </DevContent>
  )
}
export default DevMessageSourceData
