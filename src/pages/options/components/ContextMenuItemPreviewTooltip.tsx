import React, { FC, useMemo } from 'react'
import { IContextMenuItem } from '@/features/contextMenu/types'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { domain2Favicon } from '@/utils'
import Tooltip from '@mui/material/Tooltip'
// import Button from '@mui/material/Button'

const ContextMenuItemPreviewTooltip: FC<{
  item: IContextMenuItem
  children: React.ReactNode
}> = (props) => {
  const { item, children } = props
  // const isGroup = item.data.type === 'group'
  const visibilitySetting = useMemo(() => {
    if (item.data.visibility) {
      const title = item.data.visibility.isWhitelistMode
        ? 'Enable on selected websites:'
        : 'Disable on selected websites:'
      const domainFavicons = (
        item.data.visibility.isWhitelistMode
          ? item.data.visibility.whitelist
          : item.data.visibility.blacklist
      ).map((domain) => {
        return {
          domain,
          icon: domain2Favicon(domain),
        }
      })
      return {
        title,
        domainFavicons,
      }
    }
    return null
  }, [item.data.visibility])
  // const promptText = useMemo(() => {
  //   if (item.data?.actions && item.data.actions.length > 0) {
  //     const prompt = item.data.actions.find(
  //       (action) => action.type === 'RENDER_CHATGPT_PROMPT',
  //     )
  //     if (prompt) {
  //       return prompt.parameters.template
  //     }
  //   }
  //   return ''
  // }, [item.data])
  return (
    <Tooltip
      placement={'right'}
      arrow
      title={
        <Stack
          width={200}
          component={'div'}
          onClick={(event) => {
            event.stopPropagation()
            event.preventDefault()
          }}
        >
          <Typography fontSize={16} fontWeight={500} color={'text.primary'}>
            {item.text}
          </Typography>
          {visibilitySetting && (
            <Stack spacing={0.5}>
              <Typography fontSize={14} color={'text.secondary'}>
                {visibilitySetting.title}
              </Typography>
              <Stack direction={'row'} spacing={1}>
                {visibilitySetting.domainFavicons.map((favicon) => (
                  <Tooltip
                    placement={'top'}
                    arrow
                    title={favicon.domain}
                    key={favicon.domain}
                    PopperProps={{
                      style: {
                        zIndex: 9999,
                      },
                    }}
                  >
                    <img
                      src={favicon.icon}
                      alt={favicon.domain}
                      style={{
                        width: 16,
                        height: 16,
                        flexShrink: 0,
                      }}
                    />
                  </Tooltip>
                ))}
              </Stack>
            </Stack>
          )}
          {/*{!isGroup && (*/}
          {/*  <Stack>*/}
          {/*    <Typography fontSize={14} color={'text.secondary'}>*/}
          {/*      Prompt:*/}
          {/*    </Typography>*/}
          {/*    <Typography*/}
          {/*      sx={{*/}
          {/*        fontSize: 14,*/}
          {/*        overflow: 'hidden',*/}
          {/*        textOverflow: 'ellipsis',*/}
          {/*        display: '-webkit-box',*/}
          {/*        WebkitLineClamp: 2,*/}
          {/*        WebkitBoxOrient: 'vertical',*/}
          {/*        wordBreak: 'break-word',*/}
          {/*        color: 'text.primary',*/}
          {/*      }}*/}
          {/*    >*/}
          {/*      {promptText || 'No prompt is set for this item.'}*/}
          {/*    </Typography>*/}
          {/*  </Stack>*/}
          {/*)}*/}
          {/*<Stack>*/}
          {/*  <Typography fontSize={14} color={'text.secondary'}>*/}
          {/*    Learn more:*/}
          {/*  </Typography>*/}
          {/*  <Stack direction={'row'} spacing={1}>*/}
          {/*    <Button size={'small'} color={'primary'} variant={'contained'}>*/}
          {/*      Edit*/}
          {/*    </Button>*/}
          {/*  </Stack>*/}
          {/*</Stack>*/}
        </Stack>
      }
    >
      {children as any}
    </Tooltip>
  )
}
export default ContextMenuItemPreviewTooltip
