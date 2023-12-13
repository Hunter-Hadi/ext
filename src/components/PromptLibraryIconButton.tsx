import { Fade, PopperPlacementType } from '@mui/material'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Paper from '@mui/material/Paper'
import Popper from '@mui/material/Popper'
import React, { FC, useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'

import { MagicBookIcon } from '@/components/CustomIcon'
import TextOnlyTooltip from '@/components/TextOnlyTooltip'
import { MAXAI_PROMPT_LIBRARY_ICON_BUTTON_ROOT_ID } from '@/features/common/constants'
import useEffectOnce from '@/features/common/hooks/useEffectOnce'
import { getMaxAISidebarRootElement } from '@/features/common/utils'
import PromptLibrary from '@/features/prompt_library/components/PromptLibrary'
import usePromptActions from '@/features/prompt_library/hooks/usePromptActions'
import usePromptLibrary from '@/features/prompt_library/hooks/usePromptLibrary'
import { useShortCutsWithMessageChat } from '@/features/shortcuts/hooks/useShortCutsWithMessageChat'
import { promptLibraryCardDetailDataToActions } from '@/features/shortcuts/utils/promptInterpreter'
import useSidebarSettings from '@/features/sidebar/hooks/useSidebarSettings'
import { isMaxAIImmersiveChatPage } from '@/utils/dataHelper/websiteHelper'

const PromptLibraryIconButton: FC = () => {
  const {
    setShortCuts,
    runShortCuts,
    shortCutsEngineRef,
  } = useShortCutsWithMessageChat()
  const { t } = useTranslation(['prompt_library'])
  const {
    promptLibraryOpen,
    openPromptLibrary,
    closePromptLibrary,
    initPromptLibrary,
    selectedPromptLibraryCard,
    cancelSelectPromptLibraryCard,
  } = usePromptLibrary()
  const { updateSidebarConversationType } = useSidebarSettings()
  const { isOpenPromptLibraryEditForm } = usePromptActions()
  // 因为有keepMounted，所以需要这个来控制点击一次才能渲染
  const [isClickOpenOnce, setIsClickOpenOnce] = React.useState(false)
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null)
  const [placement, setPlacement] = React.useState<PopperPlacementType>()
  const isImmersiveChatPage = isMaxAIImmersiveChatPage()
  const paperRef = useRef<HTMLDivElement>()
  const handleClick = (newPlacement: PopperPlacementType) => (
    event: React.MouseEvent<HTMLButtonElement>,
  ) => {
    const containerElement = (getMaxAISidebarRootElement()?.querySelector(
      '#maxAISidebarChatBox',
    ) || document.body) as HTMLDivElement
    const targetElement = event.currentTarget as HTMLButtonElement
    // 高度取决于targetElement的高度
    // 宽度取决于containerElement的中心
    const rect = targetElement.getBoundingClientRect()
    const containerRect = containerElement.getBoundingClientRect()
    setAnchorEl({
      getBoundingClientRect: () => {
        const left = isImmersiveChatPage
          ? document.body.offsetWidth / 2 + 8
          : containerRect.x + containerRect.width / 2
        const virtualRect = {
          x: left,
          y: rect.y - 8,
          width: 1,
          height: 1,
          top: rect.top - 8,
          left: left,
          bottom: rect.top + 1,
          right: left + 1,
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
    setTimeout(() => {
      paperRef.current?.focus()
    }, 100)
    setIsClickOpenOnce(true)
    openPromptLibrary()
    setPlacement(newPlacement)
  }
  useEffectOnce(() => {
    initPromptLibrary({})
  })
  useEffect(() => {
    if (selectedPromptLibraryCard) {
      const actions = promptLibraryCardDetailDataToActions(
        selectedPromptLibraryCard,
      )
      if (actions && shortCutsEngineRef.current?.status === 'idle') {
        updateSidebarConversationType('Chat')
        cancelSelectPromptLibraryCard()
        setShortCuts(actions)
        runShortCuts().then().catch()
      }
    }
  }, [selectedPromptLibraryCard])
  useEffect(() => {
    if (!isOpenPromptLibraryEditForm && promptLibraryOpen) {
      // 为了方便esc
      setTimeout(() => {
        paperRef.current?.focus()
      }, 100)
    }
  }, [isOpenPromptLibraryEditForm, promptLibraryOpen])
  return (
    <>
      <TextOnlyTooltip
        placement={'top'}
        title={t('prompt_library:use_prompt_library__title__tooltip')}
      >
        <Button
          id={MAXAI_PROMPT_LIBRARY_ICON_BUTTON_ROOT_ID}
          data-testid={'maxai-prompt-library-button'}
          onClick={handleClick('top')}
          sx={{
            p: '5px',
            minWidth: 'unset',
          }}
          variant={promptLibraryOpen ? 'contained' : 'outlined'}
        >
          <MagicBookIcon
            sx={{
              fontSize: '20px',
            }}
          />
        </Button>
      </TextOnlyTooltip>
      {promptLibraryOpen && (
        <Box
          onClick={() => {
            closePromptLibrary()
          }}
          sx={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            zIndex: 1000,
            bgcolor: 'rgba(0,0,0,0.5)',
          }}
        />
      )}
      <Popper
        open={promptLibraryOpen}
        anchorEl={anchorEl}
        placement={placement}
        transition
        keepMounted
      >
        {({ TransitionProps }) => (
          <Fade {...TransitionProps} timeout={350}>
            <div>
              <Paper
                tabIndex={-1}
                onKeyDown={(event) => {
                  if (
                    promptLibraryOpen &&
                    !isOpenPromptLibraryEditForm &&
                    event.key === 'Escape'
                  ) {
                    closePromptLibrary()
                  }
                }}
                ref={(ref) => {
                  if (ref) {
                    paperRef.current = ref
                  }
                }}
                elevation={4}
                sx={{
                  width: isImmersiveChatPage
                    ? 'calc(100vw - 128px)'
                    : `calc(100% - 48px)`,
                  height: 'calc(100vh - 140px)',
                  maxHeight: '1067px',
                  minWidth: 402,
                  ml: isImmersiveChatPage ? 0 : 1,
                  p: 2,
                }}
              >
                {isClickOpenOnce && (
                  <PromptLibrary
                    runtime={isImmersiveChatPage ? 'WebPage' : 'CRXSidebar'}
                  />
                )}
              </Paper>
            </div>
          </Fade>
        )}
      </Popper>
    </>
  )
}
export default PromptLibraryIconButton
