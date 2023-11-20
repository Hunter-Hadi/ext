import React, { FC } from 'react'
import TextOnlyTooltip from '@/components/TextOnlyTooltip'
import Button from '@mui/material/Button'
import { MagicBookIcon } from '@/components/CustomIcon'
import { useTranslation } from 'react-i18next'
import Popper from '@mui/material/Popper'
import { Fade, PopperPlacementType } from '@mui/material'
import PromptLibrary from '@/features/prompt_library/components/PromptLibrary'
import Paper from '@mui/material/Paper'
import { getAppRootElement } from '@/utils'
import { isMaxAIImmersiveChatPage } from '@/utils/dataHelper/websiteHelper'
const PromptLibraryIconButton: FC = () => {
  const { t } = useTranslation(['prompt_library'])
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null)
  const [open, setOpen] = React.useState(false)
  const [placement, setPlacement] = React.useState<PopperPlacementType>()
  const handleClick = (newPlacement: PopperPlacementType) => (
    event: React.MouseEvent<HTMLButtonElement>,
  ) => {
    const containerElement = (getAppRootElement()?.querySelector(
      '#maxAISidebarChatBox',
    ) || document.body) as HTMLDivElement
    const targetElement = event.currentTarget as HTMLButtonElement
    // 高度取决于targetElement的高度
    // 宽度取决于containerElement的中心
    const rect = targetElement.getBoundingClientRect()
    const containerRect = containerElement.getBoundingClientRect()
    setAnchorEl({
      getBoundingClientRect: () => {
        const virtualRect = {
          x: containerRect.x + containerRect.width / 2,
          y: rect.y,
          width: 1,
          height: 1,
          top: rect.top,
          left: containerRect.x + containerRect.width / 2,
          bottom: rect.top + 1,
          right: containerRect.x + containerRect.width / 2 + 1,
        } as DOMRect
        // draw
        // const div = document.createElement('div')
        // div.style.position = 'absolute'
        // div.style.top = `${virtualRect.y}px`
        // div.style.left = `${virtualRect.x}px`
        // div.style.width = `${virtualRect.width}px`
        // div.style.height = `${virtualRect.height}px`
        // div.style.border = '1px solid red'
        // div.style.zIndex = '999999999999'
        // document.body.appendChild(div)
        return virtualRect
      },
    } as any)
    setOpen((prev) => placement !== newPlacement || !prev)
    setPlacement(newPlacement)
  }

  return (
    <>
      <TextOnlyTooltip
        placement={'top'}
        title={t('prompt_library:use_prompt_library__title')}
      >
        <Button
          onClick={handleClick('top')}
          sx={{
            p: '5px',
            minWidth: 'unset',
          }}
          variant={'outlined'}
        >
          <MagicBookIcon sx={{ fontSize: '20px', color: 'primary.main' }} />
        </Button>
      </TextOnlyTooltip>
      <Popper open={open} anchorEl={anchorEl} placement={placement} transition>
        {({ TransitionProps }) => (
          <Fade {...TransitionProps} timeout={350}>
            <Paper
              elevation={1}
              sx={{
                width: isMaxAIImmersiveChatPage()
                  ? 'calc(100vw - 312px - 64px)'
                  : `calc(100% - 16px)`,
              }}
            >
              <PromptLibrary />
            </Paper>
          </Fade>
        )}
      </Popper>
    </>
  )
}
export default PromptLibraryIconButton
