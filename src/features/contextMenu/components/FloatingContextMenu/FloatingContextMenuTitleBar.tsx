import CloseOutlinedIcon from '@mui/icons-material/CloseOutlined'
import PushPin from '@mui/icons-material/PushPin'
import PushPinOutlined from '@mui/icons-material/PushPinOutlined'
import { Divider } from '@mui/material'
import IconButton from '@mui/material/IconButton'
import Stack from '@mui/material/Stack'
import React, { FC } from 'react'
import { useTranslation } from 'react-i18next'
import { useRecoilState } from 'recoil'

import TextOnlyTooltip from '@/components/TextOnlyTooltip'
import AIProviderModelSelectorButton from '@/features/chatgpt/components/AIProviderModelSelectorButton'
import {
  FloatingContextWindowChangesState,
  useFloatingContextMenu,
} from '@/features/contextMenu'
import useFloatingContextMenuPin from '@/features/contextMenu/hooks/useFloatingContextMenuPin'
import { useUserSettings } from '@/pages/settings/hooks/useUserSettings'

import { FloatingContextMenuPopupSettingButton } from './buttons'
import ContextMenuPinToSidebarButton from './buttons/ContextMenuPinToSidebarButton'
import FloatingContextMenuChatHistoryButton from './buttons/FloatingContextMenuChatHistoryButton'
import LanguageSelector from './LanguageSelector'

const FloatingContextMenuTitleBar: FC<{
  showModelSelector: boolean
}> = ({ showModelSelector }) => {
  const { t } = useTranslation(['common', 'client'])

  const { hideFloatingContextMenu, floatingDropdownMenu } =
    useFloatingContextMenu()
  const { floatingDropdownMenuPin, setFloatingDropdownMenuPin } =
    useFloatingContextMenuPin()
  const [contextWindowChanges, setContextWindowChanges] = useRecoilState(
    FloatingContextWindowChangesState,
  )

  const { userSettings, setUserSettings } = useUserSettings()

  const onPin = () => {
    setFloatingDropdownMenuPin(!floatingDropdownMenuPin)
  }

  const onClose = () => {
    /**
     * 改为按Esc触发事件，这样由FloatingContextMenu里统一逻辑处理
     * 注意这里无法直接使用event.currentTarget.dispatchEvent去触发，因为react的合成事件
     * 担心会触发网页其他地方的逻辑先注释掉
     */
    // document.body.dispatchEvent(
    //   new KeyboardEvent('keydown', {
    //     key: 'Escape',
    //     code: 'Escape',
    //     keyCode: 27,
    //     bubbles: true,
    //     cancelable: true,
    //   }),
    // )
    if (contextWindowChanges.contextWindowMode === 'LOADING') {
      // AI正在运行
      return
    }
    if (
      contextWindowChanges.contextWindowMode === 'READ' ||
      contextWindowChanges.contextWindowMode === 'EDIT_VARIABLES'
    ) {
      // 未编辑过，直接关闭
      hideFloatingContextMenu(true)
    } else {
      // 正在编辑，弹出discard
      setContextWindowChanges((prev) => ({
        ...prev,
        discardChangesModalVisible: true,
      }))
    }
  }

  return (
    <Stack
      direction='row'
      justifyContent='space-between'
      sx={{
        wordBreak: 'break-word',
        color: (t) =>
          t.palette.mode === 'dark' ? '#FFFFFFDE' : 'rgba(0,0,0,0.87)',
        padding: '4px 0',
      }}
      component={'div'}
    >
      <Stack direction={'row'} gap={'4px'}>
        {showModelSelector && (
          <AIProviderModelSelectorButton
            disabled={!showModelSelector}
            sidebarConversationType={'ContextMenu'}
            size={'small'}
            placement='top'
            tooltipProps={{
              floatingMenuTooltip: true,
            }}
          />
        )}

        <LanguageSelector
          defaultValue={userSettings?.language}
          placement='bottom-start'
          tooltipProps={{
            floatingMenuTooltip: true,
          }}
          onChangeLanguage={(lang) => {
            setUserSettings({
              ...userSettings,
              language: lang,
            })
          }}
        />
      </Stack>
      <Stack
        direction='row'
        justifyContent='end'
        alignItems='center'
        sx={{
          gap: 1,
        }}
      >
        <FloatingContextMenuChatHistoryButton
          TooltipProps={{
            placement: 'top',
            floatingMenuTooltip: true,
          }}
        />
        {floatingDropdownMenu.open && <FloatingContextMenuPopupSettingButton />}

        <Divider orientation='vertical' variant='middle' flexItem />

        {floatingDropdownMenu.open && <ContextMenuPinToSidebarButton />}

        <TextOnlyTooltip
          title={t(
            floatingDropdownMenuPin
              ? 'client:floating_menu__pin_button__pinned__title'
              : 'client:floating_menu__pin_button__unpinned__title',
          )}
          placement='top'
          floatingMenuTooltip
        >
          <IconButton
            size='small'
            sx={{
              width: 'auto',
              height: 20,
              color: 'inherit',
              padding: '0 3px',
            }}
            onClick={onPin}
          >
            {floatingDropdownMenuPin ? (
              <PushPin
                sx={{
                  fontSize: 16,
                  transform: 'rotate(45deg)',
                }}
                color='primary'
              />
            ) : (
              <PushPinOutlined
                sx={{
                  fontSize: 16,
                  transform: 'rotate(45deg)',
                }}
              />
            )}
          </IconButton>
        </TextOnlyTooltip>
        <TextOnlyTooltip
          title={t('client:floating_menu__close_button__title')}
          placement='top'
          floatingMenuTooltip
        >
          <IconButton
            size='small'
            sx={{
              width: 'auto',
              height: 20,
              color: 'inherit',
              padding: '3px',
              marginRight: '-3px',
            }}
            disabled={contextWindowChanges.contextWindowMode === 'LOADING'}
            onClick={onClose}
          >
            <CloseOutlinedIcon
              sx={{
                fontSize: 17,
              }}
            />
          </IconButton>
        </TextOnlyTooltip>
      </Stack>
    </Stack>
  )
}

export default FloatingContextMenuTitleBar
