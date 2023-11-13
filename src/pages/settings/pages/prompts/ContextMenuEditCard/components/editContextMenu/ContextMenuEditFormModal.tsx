import React, { FC, useEffect, useMemo, useState } from 'react'
import cloneDeep from 'lodash-es/cloneDeep'
import Button from '@mui/material/Button'
import Modal from '@mui/material/Modal'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import Container from '@mui/material/Container'
import {
  IContextMenuIconKey,
  CONTEXT_MENU_ICONS,
  ContextMenuIcon,
} from '@/components/ContextMenuIcon'
import { IContextMenuItem } from '@/features/contextMenu/types'
import VisibilitySettingCard from '@/components/VisibilitySettingCard'
import { SETTINGS_PAGE_CONTENT_WIDTH } from '@/pages/settings/pages/SettingsApp'
import { useTranslation } from 'react-i18next'
import { IChromeExtensionButtonSettingKey } from '@/background/utils'
import ShortcutActionsEditor from '@/features/shortcuts/components/ShortcutActionsEditor'
import useShortcutEditorActions from '@/features/shortcuts/components/ShortcutActionsEditor/hooks/useShortcutEditorActions'
import { mergeWithObject } from '@/utils/dataHelper/objectHelper'

const ContextMenuEditForm: FC<{
  iconSetting?: boolean
  settingsKey: IChromeExtensionButtonSettingKey
  node: IContextMenuItem
  onSave?: (newNode: IContextMenuItem) => void
  onCancel?: () => void
  onDelete?: (id: string) => void
  open: boolean
}> = ({ open, node, onSave, onCancel, onDelete, settingsKey, iconSetting }) => {
  const { t } = useTranslation(['settings', 'common'])
  const { setActions, generateActions } = useShortcutEditorActions()
  const [editNode, setEditNode] = useState<IContextMenuItem>(() =>
    cloneDeep(node),
  )
  const [selectedIcon, setSelectedIcon] = useState<IContextMenuIconKey | null>(
    null,
  )
  const isDisabled = !editNode.data.editable
  const isDisabledSave = useMemo(() => {
    if (isDisabled) {
      return true
    }
    if (editNode.data.type === 'group') {
      return editNode.text === ''
    } else if (editNode.data.type === 'shortcuts') {
      return editNode.text === ''
    }
    return false
  }, [isDisabled, editNode.text])
  const modalTitle = useMemo(() => {
    if (editNode.data.type === 'group') {
      return isDisabled
        ? t('settings:feature_card__prompts__read_prompt_group__title')
        : t('settings:feature_card__prompts__edit_prompt_group__title')
    } else {
      return isDisabled
        ? t('settings:feature_card__prompts__read_prompt__title')
        : t('settings:feature_card__prompts__edit_prompt__title')
    }
  }, [isDisabled, editNode.data.type, t])

  useEffect(() => {
    const cloneNode: IContextMenuItem = cloneDeep(node)
    // 兼容旧版本，设置默认值
    if (!cloneNode.data.visibility) {
      cloneNode.data.visibility = {
        whitelist: [],
        blacklist: [],
        isWhitelistMode: false,
      }
    }
    setEditNode(cloneNode)
    setSelectedIcon(cloneNode.data?.icon as any)
  }, [node])
  useEffect(() => {
    if (node) {
      console.log('[Actions]: ', '初始化actions')
      setActions(node.data.actions || [])
    }
  }, [node])
  return (
    <Modal open={open} onClose={onCancel}>
      <Container
        sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          borderRadius: 2,
          bgcolor: (t) => (t.palette.mode === 'dark' ? '#3d3d3d' : '#fff'),
          minWidth: SETTINGS_PAGE_CONTENT_WIDTH,
          maxWidth: SETTINGS_PAGE_CONTENT_WIDTH,
          p: 2,
        }}
      >
        <Stack spacing={2} minHeight={'60vh'} maxHeight={'90vh'}>
          <Stack
            sx={{ overflowY: 'auto' }}
            width={'100%'}
            flex={1}
            height={0}
            spacing={1}
          >
            <Typography variant={'h6'}>{modalTitle}</Typography>
            <Stack spacing={1} pb={1}>
              <Typography variant={'body1'}>
                {`${t(
                  'settings:feature_card__prompts__edit_prompt__field_name__title',
                )} `}
                <span style={{ color: 'red' }}>*</span>
              </Typography>
              <TextField
                disabled={isDisabled}
                size={'small'}
                autoFocus
                value={editNode.text}
                placeholder={t(
                  'settings:feature_card__prompts__edit_prompt__field_name__placeholder',
                )}
                onChange={(event) => {
                  setEditNode((prev) => {
                    return {
                      ...prev,
                      text: event.target.value,
                    }
                  })
                }}
              />
            </Stack>
            {iconSetting && (
              <Stack spacing={1} pb={1}>
                <Typography variant={'body1'}>
                  {t(
                    'settings:feature_card__prompts__edit_prompt__field_icon__title',
                  )}
                </Typography>
                <Stack
                  flexWrap={'wrap'}
                  gap={1}
                  direction={'row'}
                  alignItems={'center'}
                  sx={{ maxHeight: '72px', overflowY: 'scroll' }}
                >
                  {CONTEXT_MENU_ICONS.filter((icon) => icon !== 'Empty').map(
                    (icon) => {
                      return (
                        <Button
                          data-name={icon}
                          disabled={isDisabled}
                          sx={{ width: 32, minWidth: 'unset', height: 32 }}
                          variant={
                            icon === (selectedIcon as string)
                              ? 'contained'
                              : 'outlined'
                          }
                          key={icon}
                          onClick={() => {
                            setSelectedIcon((preIcon) =>
                              preIcon === icon ? null : icon,
                            )
                            setEditNode((prev) => {
                              return {
                                ...prev,
                                data: {
                                  ...prev.data,
                                  icon:
                                    prev.data.icon === icon ? undefined : icon,
                                },
                              }
                            })
                          }}
                        >
                          <ContextMenuIcon icon={icon} sx={{ fontSize: 20 }} />
                        </Button>
                      )
                    },
                  )}
                </Stack>
              </Stack>
            )}
            {editNode.data.type === 'shortcuts' && (
              <Stack spacing={1} pb={1}>
                <Stack direction={'row'} alignItems="center">
                  <Typography variant={'body1'}>
                    {`${t(
                      'settings:feature_card__prompts__edit_prompt__field_template__title',
                    )} `}
                    <span style={{ color: 'red' }}>*</span>
                  </Typography>
                </Stack>
                <ShortcutActionsEditor
                  placeholder={t(
                    'settings:feature_card__prompts__edit_prompt__field_template__placeholder',
                  )}
                />
              </Stack>
            )}
            <Stack>
              <Stack direction={'row'} alignItems="center">
                <Typography variant={'body1'}>
                  {t(
                    'settings:feature_card__prompts__edit_prompt__field_visibility__title',
                  )}
                </Typography>
              </Stack>
              {editNode.data.visibility && (
                <VisibilitySettingCard
                  mode={'white'}
                  disabled={isDisabled}
                  sx={{ mt: 2 }}
                  defaultValue={editNode.data.visibility}
                  onChange={async (newVisibilitySetting) => {
                    setEditNode((prev) => {
                      return {
                        ...prev,
                        data: {
                          ...prev.data,
                          visibility: newVisibilitySetting,
                        },
                      }
                    })
                  }}
                />
              )}
            </Stack>
          </Stack>
          <Stack></Stack>
          <Stack
            direction={'row'}
            mt={'auto!important'}
            mb={0}
            flexShrink={0}
            alignItems={'center'}
            spacing={1}
          >
            <Button
              disabled={isDisabledSave}
              variant={'contained'}
              onClick={() => {
                onSave?.(
                  mergeWithObject([
                    editNode,
                    {
                      data: {
                        actions: generateActions(editNode.text),
                      },
                    } as IContextMenuItem,
                  ]),
                )
                // onSave &&
                //   onSave(
                //     editNode,
                //     processReplaceString(template),
                //     autoAskChatGPT,
                //   )
              }}
            >
              {t('common:save')}
            </Button>
            <Button variant={'outlined'} onClick={onCancel}>
              {t('common:cancel')}
            </Button>
            <Button
              sx={{ ml: 'auto!important', mr: 0 }}
              startIcon={<ContextMenuIcon icon={'Delete'} />}
              color={'error'}
              disabled={isDisabled}
              variant={'outlined'}
              onClick={() => {
                onDelete && onDelete(editNode.id as string)
              }}
            >
              {t('common:delete')}
            </Button>
          </Stack>
        </Stack>
      </Container>
    </Modal>
  )
}
export default ContextMenuEditForm
