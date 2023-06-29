import React, { FC, useMemo } from 'react'
import { IContextMenuItem } from '@/features/contextMenu/types'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { domain2Favicon } from '@/utils'
import Tooltip, { tooltipClasses, TooltipProps } from '@mui/material/Tooltip'
import { styled } from '@mui/material/styles'
// import Button from '@mui/material/Button'

const LightTooltip = styled(({ className, ...props }: TooltipProps) => (
  <Tooltip {...props} classes={{ popper: className }} />
))(({ theme }) => ({
  [`& .${tooltipClasses.tooltip}`]: {
    backgroundColor: theme.palette.background.paper,
    color: 'rgba(0, 0, 0, 0.87)',
    fontSize: 12,
    padding: '16px',
    boxShadow: theme.shadows[5],
    maxWidth: 'none',
  },
  [`& .${tooltipClasses.arrow}`]: {
    color: theme.palette.background.paper,
  },
}))

const ContextMenuItemPreviewTooltip: FC<{
  item: IContextMenuItem
  children: React.ReactNode
}> = (props) => {
  const { item, children } = props
  // const isGroup = item.data.type === 'group'
  const visibilitySetting = useMemo(() => {
    if (item.data.visibility) {
      const selectedModeText = item.data.visibility.isWhitelistMode
        ? 'Enable on selected websites:'
        : 'Disable on selected websites:'
      const domains = (
        item.data.visibility.isWhitelistMode
          ? item.data.visibility.whitelist
          : item.data.visibility.blacklist
      ).map((domain) => {
        return {
          domain,
          icon: domain2Favicon(domain),
        }
      })
      let isEmpty = false
      const emptyText = item.data.visibility.isWhitelistMode
        ? '❌ Disabled on all websites'
        : '✅ Enabled on all websites'
      if (domains.length === 0) {
        isEmpty = true
      }
      return {
        isEmpty,
        emptyText,
        selectedModeText,
        domains,
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
    <LightTooltip
      placement={'right'}
      arrow
      title={
        <Stack
          py={1}
          spacing={2}
          width={300}
          component={'div'}
          onClick={(event) => {
            event.stopPropagation()
            event.preventDefault()
          }}
        >
          <Typography fontSize={16} fontWeight={500} color={'text.primary'}>
            {item.text}
          </Typography>
          {visibilitySetting && visibilitySetting.isEmpty && (
            <Stack spacing={0.5}>
              <Typography fontSize={14} color={'text.secondary'}>
                Mode:
              </Typography>
              <Typography fontSize={14} color={'text.primary'}>
                {visibilitySetting.emptyText}
              </Typography>
            </Stack>
          )}
          {visibilitySetting && !visibilitySetting.isEmpty && (
            <>
              <Stack>
                <Typography fontSize={14} color={'text.secondary'}>
                  Mode:
                </Typography>
                <Typography fontSize={14} color={'text.primary'}>
                  {visibilitySetting.selectedModeText}
                </Typography>
              </Stack>
              <Stack>
                <Typography fontSize={14} color={'text.secondary'}>
                  Selected websites:
                </Typography>
                <Stack
                  direction={'row'}
                  flexWrap={'wrap'}
                  alignItems={'center'}
                  width={'100%'}
                  sx={
                    {
                      // overflowY: 'auto',
                      // maxHeight: 144,
                    }
                  }
                >
                  {visibilitySetting.domains.map(({ domain, icon }) => {
                    return (
                      <Stack
                        key={domain}
                        direction={'row'}
                        alignItems={'center'}
                        spacing={0.5}
                        width={'132px'}
                        sx={{
                          py: 0.5,
                          px: 0.5,
                          m: 0.5,
                          borderRadius: '4px',
                          bgcolor: (t) =>
                            t.palette.mode === 'dark'
                              ? 'rgba(255, 255, 255, 0.08)'
                              : '#f7f8fa',
                        }}
                      >
                        <img
                          src={icon}
                          alt={domain}
                          style={{
                            width: 16,
                            height: 16,
                            flexShrink: 0,
                          }}
                        />
                        <Typography
                          fontSize={12}
                          color={'text.primary'}
                          width={0}
                          flex={1}
                          noWrap
                        >
                          {domain}
                        </Typography>
                      </Stack>
                    )
                  })}
                </Stack>
              </Stack>
            </>
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
    </LightTooltip>
  )
}
export default ContextMenuItemPreviewTooltip
