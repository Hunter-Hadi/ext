import React, { FC } from 'react'
import Stack from '@mui/material/Stack'
import useFavoriteContextMenuList, {
  FAVORITE_CONTEXT_MENU_GROUP_ID,
} from '@/features/contextMenu/hooks/useFavoriteContextMenuList'
import { ContextMenuIcon } from '@/components/ContextMenuIcon'
import { TooltipProps } from '@mui/material/Tooltip'
import Typography from '@mui/material/Typography'
import { IContextMenuItem } from '@/features/contextMenu/types'
import TooltipButton from '@/components/TooltipButton'
import { useTranslation } from 'react-i18next'
import { IChromeExtensionButtonSettingKey } from '@/background/utils'

const FavoriteContextMenuGroup: FC<{
  buttonSettingKey: IChromeExtensionButtonSettingKey
  placement?: TooltipProps['placement']
  onClick?: (contextMenuItem: IContextMenuItem) => void
}> = (props) => {
  const { buttonSettingKey, placement, onClick } = props
  const { t } = useTranslation(['common', 'client', 'prompt'])
  const { favoriteContextMenuList } = useFavoriteContextMenuList(
    buttonSettingKey,
  )
  return (
    <Stack
      direction={'row'}
      alignItems={'center'}
      className={'max-ai__click-menu-button--box'}
      sx={{
        // 改成正方形 - 20230728 - @huangsong
        '&.max-ai__click-menu-button--box': {
          '& button': {
            padding: '5px 5px!important',
            '&:has(.max-ai__click-menu-button--box__text-icon)': {
              padding: '3px 3px!important',
            },
          },
        },
      }}
    >
      {favoriteContextMenuList?.map((item) => {
        const isTextButton = !item.data.icon
        let itemLabel = item.text
        const itemId = item.id.replace(FAVORITE_CONTEXT_MENU_GROUP_ID, '')
        const key: any = `prompt:${itemId}`
        if (t(key) !== itemId) {
          itemLabel = t(key)
        }
        const shortTitle = String(itemLabel[0] || '').toUpperCase()
        return (
          <TooltipButton
            TooltipProps={{
              floatingMenuTooltip: true,
              placement: placement || 'bottom',
            }}
            title={itemLabel}
            key={item.id}
            sx={{
              minWidth: 'unset',
              p: isTextButton ? '6px!important' : '8px!important',
            }}
            onMouseUp={(event) => {
              event.stopPropagation()
              event.preventDefault()
            }}
            onMouseDown={(event) => {
              event.stopPropagation()
              event.preventDefault()
            }}
            onClick={(event) => {
              event.stopPropagation()
              event.preventDefault()
              onClick && onClick(item)
            }}
          >
            {!isTextButton ? (
              <ContextMenuIcon
                icon={item.data.icon!}
                sx={{
                  fontSize: '18px',
                  color: (t: any) =>
                    t.palette.mode === 'dark'
                      ? 'rgba(255,255,255,.87)'
                      : 'rgba(0,0,0,.6)',
                }}
              />
            ) : (
              <Stack
                className={'max-ai__click-menu-button--box__text-icon'}
                alignItems={'center'}
                justifyContent={'center'}
                sx={{
                  width: '22px',
                  height: '22px',
                  boxSizing: 'border-box',
                  borderRadius: '4px',
                  bgcolor: (t) =>
                    t.palette.mode === 'dark' ? '#4f4f4f' : '#F5F6F7',
                  color: (t) =>
                    t.palette.mode === 'dark'
                      ? 'rgba(255,255,255,.87)'
                      : 'rgba(0,0,0,.6)',
                }}
              >
                <Typography
                  component={'span'}
                  fontSize={'13px'}
                  color={'inherit'}
                >
                  {shortTitle}
                </Typography>
              </Stack>
            )}
          </TooltipButton>
        )
      })}
    </Stack>
  )
}
export default FavoriteContextMenuGroup
