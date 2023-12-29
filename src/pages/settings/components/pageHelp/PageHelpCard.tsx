import Box from '@mui/material/Box'
import Collapse from '@mui/material/Collapse'
import ListItemButton from '@mui/material/ListItemButton'
import Stack from '@mui/material/Stack'
import { SxProps } from '@mui/material/styles'
import Typography from '@mui/material/Typography'
import React, { FC, useState } from 'react'

import { ContextMenuIcon } from '@/components/ContextMenuIcon'
import TextOnlyTooltip from '@/components/TextOnlyTooltip'

const PageHelpCard: FC<{
  title: string
  listType: 'bullet' | 'number'
  list: React.ReactNode[]
  sx?: SxProps
  defaultOpen?: boolean
}> = (props) => {
  const { title, listType, list, sx, defaultOpen = false } = props
  const [open, setOpen] = useState(() => defaultOpen)
  return (
    <Stack sx={{ ...sx }} className={'max-ai__settings__page-help-card'}>
      <TextOnlyTooltip title={title} placement={'top-start'}>
        <ListItemButton
          sx={{
            p: 1,
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
          onClick={(event) => {
            event.stopPropagation()
            setOpen((prev) => !prev)
          }}
        >
          <Typography fontSize={16} fontWeight={400} noWrap>
            {title}
          </Typography>
          <ContextMenuIcon
            sx={{ fontSize: 24 }}
            icon={open ? 'ExpandLess' : 'ExpandMore'}
          />
        </ListItemButton>
      </TextOnlyTooltip>
      <Collapse in={open}>
        <Stack p={1} spacing={0.5}>
          {list.map((text, index) => {
            return (
              <Stack direction={'row'} alignItems={'start'} key={index}>
                <Stack
                  alignItems={'center'}
                  justifyContent={'center'}
                  sx={{
                    width: 20,
                    height: 20,
                    flexShrink: 0,
                  }}
                >
                  {listType === 'bullet' ? (
                    <Box
                      sx={{
                        width: 4,
                        height: 4,
                        borderRadius: '50%',
                        backgroundColor: 'text.secondary',
                      }}
                    />
                  ) : (
                    <Typography
                      color={'text.secondary'}
                      fontSize={14}
                      fontWeight={400}
                      noWrap
                    >
                      {index + 1}.
                    </Typography>
                  )}
                </Stack>
                <Typography
                  color={'text.secondary'}
                  fontSize={14}
                  fontWeight={400}
                  component={'div'}
                >
                  {text}
                </Typography>
              </Stack>
            )
          })}
        </Stack>
      </Collapse>
    </Stack>
  )
}
export default PageHelpCard
