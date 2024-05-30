import { PushPin, PushPinOutlined } from '@mui/icons-material'
import CloseOutlinedIcon from '@mui/icons-material/CloseOutlined'
import IconButton from '@mui/material/IconButton'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import isEmpty from 'lodash-es/isEmpty'
import React, { FC, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { useRecoilState } from 'recoil'

import TextOnlyTooltip from '@/components/TextOnlyTooltip'
import {
  FloatingContextWindowChangesState,
  useFloatingContextMenu,
  useRangy,
} from '@/features/contextMenu'
import useFloatingContextMenuDraft from '@/features/contextMenu/hooks/useFloatingContextMenuDraft'
import useFloatingContextMenuPin from '@/features/contextMenu/hooks/useFloatingContextMenuPin'

const ContextText: FC = () => {
  const { t } = useTranslation(['client'])
  const { currentSelection } = useRangy()

  const splitCenterText = useMemo(() => {
    if (
      currentSelection?.selectionElement?.editableElementSelectionText ||
      currentSelection?.selectionElement?.selectionText
    ) {
      const context =
        currentSelection?.selectionElement?.editableElementSelectionText ||
        currentSelection?.selectionElement?.selectionText
          .trim()
          .replace(/\u200B/g, '')
      const truncateString = (string: string, count: number) => {
        if (string.length <= count) {
          return {
            start: string,
            end: '',
          }
        }
        const end = string.substring(string.length - count)
        const start = string.substring(0, string.length - count)
        return {
          start,
          end,
        }
      }
      return truncateString(context, 15)
    }
    return {
      start: '',
      end: '',
    }
  }, [currentSelection])

  if (!splitCenterText.start && !splitCenterText.end) {
    return null
  }

  return (
    <Typography
      sx={{
        display: 'flex',
        flexDirection: 'row',
      }}
      flex={1}
      fontSize="12px"
      fontWeight={400}
      color="text.secondary"
      whiteSpace="pre-wrap"
      overflow="hidden"
    >
      <span style={{ flexShrink: 0 }}>
        {t('client:floating_menu__draft_card__context__title')}:{' '}
      </span>
      <span
        style={{
          display: 'inline-block',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
          maxWidth: '100%',
        }}
      >
        {splitCenterText.start}
      </span>
      <span style={{ flexShrink: 0, whiteSpace: 'nowrap' }}>
        {splitCenterText.end}
      </span>
    </Typography>
  )
}

const FloatingContextMenuTitleBar: FC = () => {
  const { t } = useTranslation(['common', 'client'])

  const { hideFloatingContextMenu } = useFloatingContextMenu()
  const { currentFloatingContextMenuDraft, selectedDraftUserMessage } =
    useFloatingContextMenuDraft()
  const { floatingDropdownMenuPin, setFloatingDropdownMenuPin } =
    useFloatingContextMenuPin()
  const [contextWindowChanges, setContextWindowChanges] = useRecoilState(
    FloatingContextWindowChangesState,
  )

  const onPin = () => {
    setFloatingDropdownMenuPin(!floatingDropdownMenuPin)
  }

  const onClose = () => {
    if (contextWindowChanges.contextWindowMode !== 'READ') {
      setContextWindowChanges((prev) => ({
        ...prev,
        discardChangesModalVisible: true,
      }))
    } else {
      hideFloatingContextMenu(true)
    }
  }

  return (
    <Stack
      direction="row"
      justifyContent="end"
      sx={{
        wordBreak: 'break-word',
        color: (t) =>
          t.palette.mode === 'dark' ? '#FFFFFFDE' : 'rgba(0,0,0,0.87)',
      }}
      component={'div'}
    >
      {/*drag box*/}
      {/*<Box*/}
      {/*  sx={{*/}
      {/*    position: 'absolute',*/}
      {/*    width: '100%',*/}
      {/*    zIndex: 10,*/}
      {/*    cursor: 'grab',*/}
      {/*    height: '20px',*/}
      {/*  }}*/}
      {/*>*/}
      {/*  <DevContent>*/}
      {/*    <Typography fontSize={'14px'} color={'text.primary'}>*/}
      {/*      {contextWindowChanges.contextWindowMode}(debug)*/}
      {/*    </Typography>*/}
      {/*  </DevContent>*/}
      {/*</Box>*/}

      {isEmpty(currentFloatingContextMenuDraft) && !selectedDraftUserMessage ? (
        <ContextText />
      ) : null}

      <Stack direction="row" justifyContent="end">
        <TextOnlyTooltip
          title={t(
            floatingDropdownMenuPin
              ? 'client:floating_menu__pin_button__pinned__title'
              : 'client:floating_menu__pin_button__unpinned__title',
          )}
          placement="bottom"
          floatingMenuTooltip
        >
          <IconButton
            size="small"
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
                color="primary"
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
          placement="bottom"
          floatingMenuTooltip
        >
          <IconButton
            size="small"
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
