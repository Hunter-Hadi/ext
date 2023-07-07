import React, { FC } from 'react'
import { IChromeExtensionButtonSettingKey } from '@/background/types/Settings'
import Stack from '@mui/material/Stack'
import useFavoriteContextMenu from '@/features/contextMenu/hooks/useFavoriteContextMenu'
import TooltipIconButton from '@/components/TooltipIconButton'
import { ContextMenuIcon } from '@/components/ContextMenuIcon'
import { TooltipProps } from '@mui/material/Tooltip'
import Typography from '@mui/material/Typography'
import { IContextMenuItem } from '@/features/contextMenu/types'

const FavoriteContextMenuGroup: FC<{
  buttonSettingKey: IChromeExtensionButtonSettingKey
  placement?: TooltipProps['placement']
  onClick?: (contextMenuItem: IContextMenuItem) => void
}> = (props) => {
  const { buttonSettingKey, placement, onClick } = props
  const favoriteContextMenu = useFavoriteContextMenu(buttonSettingKey)
  return (
    <Stack
      direction={'row'}
      alignItems={'center'}
      sx={
        {
          // '& > button,div': {
          //   '&:not(:last-child)': {
          //     marginRight: '1px',
          //     borderRadius: '4px 0 0 4px',
          //     boxShadow: (t) =>
          //       t.palette.mode === 'dark'
          //         ? 'rgb(255 255 255 / 21%) 1px 0px 0px'
          //         : 'rgba(55, 53, 47, 0.09) 1px 0px 0px',
          //     '&:hover': {
          //       boxShadow: (t) =>
          //         t.palette.mode === 'dark'
          //           ? 'rgb(255 255 255 / 21%) 1px 0px 0px'
          //           : 'rgba(55, 53, 47, 0.09) 1px 0px 0px',
          //     },
          //   },
          // },
        }
      }
    >
      {favoriteContextMenu?.map((item) => {
        const isTextButton = !item.data.icon
        const shortTitle =
          String(item.text[0] || '').toUpperCase() + String(item.text[1] || '')
        return (
          <TooltipIconButton
            placement={placement || 'bottom'}
            title={item.text}
            key={item.id}
            sx={{
              p: isTextButton ? '6px!important' : '8px!important',
            }}
            onClick={() => {
              onClick && onClick(item)
            }}
          >
            {!isTextButton ? (
              <ContextMenuIcon icon={item.data.icon!} />
            ) : (
              <Stack
                alignItems={'center'}
                justifyContent={'center'}
                sx={{
                  width: '20px',
                  height: '20px',
                  boxSizing: 'border-box',
                  borderRadius: '4px',
                  p: '2px',
                  bgcolor: (t) =>
                    t.palette.mode === 'dark' ? '#666' : '#F5F6F7',
                  color: (t) =>
                    t.palette.mode === 'dark'
                      ? 'rgba(255,255,255,.87)'
                      : 'rgba(0,0,0,.6)',
                }}
              >
                <Typography
                  component={'span'}
                  fontSize={'12px'}
                  color={'inherit'}
                >
                  {shortTitle}
                </Typography>
              </Stack>
            )}
          </TooltipIconButton>
        )
      })}
    </Stack>
  )
}
export default FavoriteContextMenuGroup
