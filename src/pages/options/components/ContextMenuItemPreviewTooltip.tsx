import React, { FC, useMemo } from 'react'
import { IContextMenuItem } from '@/features/contextMenu/types'
import WikiText from '@/components/WikiText'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { domain2Favicon } from '@/utils'

const ContextMenuItemPreviewTooltip: FC<{
  item: IContextMenuItem
  isGroup?: boolean
}> = (props) => {
  const { item, isGroup } = props
  const fontSx = useMemo(() => {
    return isGroup
      ? {
          fontSize: 12,
          color: 'text.secondary',
        }
      : {
          fontSize: 14,
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          display: '-webkit-box',
          WebkitLineClamp: 1,
          WebkitBoxOrient: 'vertical',
          wordBreak: 'break-word',
          color: 'text.primary',
        }
  }, [isGroup])
  const visibilitySetting = useMemo(() => {
    if (item.data.visibility) {
      const title = item.data.visibility.isWhitelistMode
        ? 'Enable on selected websites:'
        : 'Disable on selected websites:'
      const domainFavicons = (
        item.data.visibility.isWhitelistMode
          ? item.data.visibility.whitelist
          : item.data.visibility.blacklist
      ).map((domain) => domain2Favicon(domain))
      return {
        title,
        domainFavicons,
      }
    }
    return null
  }, [item.data.visibility])
  return (
    <WikiText
      text={item.text}
      wiki={
        <Stack
          width={416}
          spacing={2}
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
                  <img
                    key={favicon}
                    src={favicon}
                    alt={favicon}
                    style={{
                      width: 16,
                      height: 16,
                      flexShrink: 0,
                    }}
                  />
                ))}
              </Stack>
            </Stack>
          )}
        </Stack>
      }
      textProps={fontSx}
    />
  )
}
export default ContextMenuItemPreviewTooltip
