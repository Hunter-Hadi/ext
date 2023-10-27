import React, { FC, useMemo } from 'react'
import { IAIResponseOriginalMessageCopilotStep } from '@/features/chatgpt/types'
import Stack from '@mui/material/Stack'
import { Card, CircularProgress } from '@mui/material'
import { ContextMenuIcon } from '@/components/ContextMenuIcon'
import Typography from '@mui/material/Typography'

const SidebarAIMessageCopilotStep: FC<{
  messageIsComplete?: boolean
  copilot: IAIResponseOriginalMessageCopilotStep
}> = (props) => {
  const { messageIsComplete } = props
  const { title, icon, value, valueType = 'text', status } = props.copilot
  const RenderValueDom = useMemo(() => {
    if (!value) return null
    switch (valueType) {
      case 'text': {
        return (
          <Card variant="outlined" sx={{ px: 1 }}>
            <Typography
              fontSize={14}
              color={'text.primary'}
              noWrap
              maxWidth={256}
            >
              {String(value)}
            </Typography>
          </Card>
        )
      }
      case 'tags': {
        let tags: string[] = []
        if (typeof value === 'string') {
          tags = value.split(',')
        } else if (Array.isArray(value)) {
          tags = value
        }
        return (
          <Stack
            gap={1}
            direction={'row'}
            alignItems={'center'}
            flexWrap={'wrap'}
          >
            {tags.map((tag, index) => (
              <Card key={tag} variant="outlined" sx={{ px: 1 }}>
                <Typography
                  noWrap
                  maxWidth={160}
                  fontSize={14}
                  color={'text.primary'}
                >
                  {tag}
                </Typography>
              </Card>
            ))}
          </Stack>
        )
      }
      default:
        return null
    }
  }, [value, valueType])
  return (
    <Stack spacing={0.5}>
      <Stack spacing={1} direction={'row'} alignItems={'center'}>
        <Stack
          alignItems={'center'}
          justifyContent={'center'}
          width={16}
          height={16}
        >
          {status === 'loading' && !messageIsComplete ? (
            <CircularProgress size={16} />
          ) : (
            <ContextMenuIcon
              sx={{
                color: 'primary.main',
                fontSize: 16,
              }}
              icon={icon}
            />
          )}
        </Stack>
        <Typography
          fontSize={16}
          color="text.primary"
          noWrap
          sx={{
            p: 0,
          }}
        >
          {title}
        </Typography>
      </Stack>
      {value && (
        <Stack spacing={1} direction={'row'} alignItems={'center'}>
          <Stack
            alignItems={'center'}
            justifyContent={'center'}
            width={16}
            height={16}
          />
          {RenderValueDom}
        </Stack>
      )}
    </Stack>
  )
}

export default SidebarAIMessageCopilotStep
