import Button from '@mui/material/Button'
import Container from '@mui/material/Container'
import Modal from '@mui/material/Modal'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import cloneDeep from 'lodash-es/cloneDeep'
import React, { FC, memo, useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useRecoilState } from 'recoil'
import { v4 } from 'uuid'

import {
  CONTEXT_MENU_ICONS,
  ContextMenuIcon,
  IContextMenuIconKey,
} from '@/components/ContextMenuIcon'
import VisibilitySettingCard from '@/components/VisibilitySettingCard'
import { IContextMenuItem } from '@/features/contextMenu/types'
import ShortcutActionsEditor from '@/features/shortcuts/components/ShortcutsActionsEditor'
import useShortcutEditorActions from '@/features/shortcuts/components/ShortcutsActionsEditor/hooks/useShortcutEditorActions'
import { PRESET_VARIABLES_GROUP_MAP } from '@/features/shortcuts/components/ShortcutsActionsEditor/hooks/useShortcutEditorActionsVariables'
import {
  SettingPromptsEditButtonKeyAtom,
  specialInputAssistantButtonKeys,
} from '@/pages/settings/pages/prompts/store'
import { SETTINGS_PAGE_CONTENT_WIDTH } from '@/pages/settings/pages/SettingsApp'
import { mergeWithObject } from '@/utils/dataHelper/objectHelper'

const SettingPromptsUpdateFormModal: FC<{
  iconSetting?: boolean
  node: IContextMenuItem
  onSave?: (newNode: IContextMenuItem) => void
  onCancel?: () => void
  onDelete?: (id: string) => void
  open: boolean
}> = ({ open, node, onSave, onCancel, onDelete, iconSetting }) => {
  const { t } = useTranslation(['settings', 'common'])
  const { editHTML, setActions, generateActions } = useShortcutEditorActions()
  const [settingPromptsEditButtonKey] = useRecoilState(
    SettingPromptsEditButtonKeyAtom,
  )
  const isEditingSpecialButtonKey =
    settingPromptsEditButtonKey &&
    specialInputAssistantButtonKeys.includes(settingPromptsEditButtonKey) &&
    false

  const [editNode, setEditNode] = useState<IContextMenuItem>(() =>
    cloneDeep(node),
  )
  const [selectedIcon, setSelectedIcon] = useState<IContextMenuIconKey | null>(
    null,
  )

  const shortcutActionsEditorPlaceholder = useMemo(() => {
    let placeholder = ''

    if (settingPromptsEditButtonKey === 'textSelectPopupButton') {
      placeholder = t(
        'settings:feature_card__prompts__edit_prompt__field_template__placeholder',
      )
    } else if (
      settingPromptsEditButtonKey === 'inputAssistantComposeReplyButton'
    ) {
      placeholder = t(
        'settings:feature_card__prompts__edit_instant_reply_prompt__compose_reply__field_template__placeholder',
      )
    } else if (
      settingPromptsEditButtonKey === 'inputAssistantRefineDraftButton'
    ) {
      placeholder = t(
        'settings:feature_card__prompts__edit_instant_reply_prompt__refine_draft__field_template__placeholder',
      )
    } else if (
      settingPromptsEditButtonKey === 'inputAssistantComposeNewButton'
    ) {
      placeholder = t(
        'settings:feature_card__prompts__edit_instant_reply_prompt__compose_new__field_template__placeholder',
      )
    } else if (settingPromptsEditButtonKey === 'sidebarSummaryButton') {
      placeholder = t(
        'settings:feature_card__prompts__edit_summary_prompt__field_template__placeholder',
      )
    }

    if (placeholder) {
      const presetVariables =
        PRESET_VARIABLES_GROUP_MAP[
          'prompt_editor:preset_variables__system__title'
        ]
      presetVariables.forEach(({ variable, permissionKeys = [] }) => {
        if (
          permissionKeys.length === 0 ||
          permissionKeys.includes(settingPromptsEditButtonKey!)
        ) {
          placeholder += `\n{{${variable?.label}}}`
        }
      })

      if (settingPromptsEditButtonKey === 'sidebarSummaryButton') {
        placeholder +=
          `\n\n` +
          t(
            'settings:feature_card__prompts__edit_summary_prompt__field_template__placeholder__example',
          ) +
          `\nOutput a summary of the {{PAGE_CONTENT}} on {{CURRENT_WEBPAGE_DOMAIN}}.`
      }
    }

    return placeholder
  }, [t, settingPromptsEditButtonKey])

  const isDisabled = !editNode.data.editable
  const isDisabledSave = useMemo(() => {
    if (isDisabled) {
      return true
    }
    let disabledSave = editNode.text === ''
    if (!disabledSave && editNode.data.type === 'shortcuts') {
      disabledSave = disabledSave || editHTML.trim() === ''
      if (isEditingSpecialButtonKey) {
        disabledSave = Boolean(
          disabledSave || !editNode?.data?.visibility?.whitelist?.length,
        )
      }
    }
    return disabledSave
  }, [
    isDisabled,
    settingPromptsEditButtonKey,
    editNode.text,
    editNode.data.visibility,
    editHTML,
  ])

  const modalTitle = useMemo(() => {
    if (editNode.data.type === 'group') {
      return isDisabled
        ? t('settings:feature_card__prompts__read_prompt_group__title')
        : editNode.id === ''
        ? t('settings:feature_card__prompts__new_prompt_group__title')
        : t('settings:feature_card__prompts__edit_prompt_group__title')
    } else {
      return isDisabled
        ? t('settings:feature_card__prompts__read_prompt__title')
        : editNode.id === ''
        ? t('settings:feature_card__prompts__new_prompt__title')
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
                  disableCustomVariables={
                    settingPromptsEditButtonKey === 'sidebarSummaryButton'
                  }
                  placeholder={shortcutActionsEditorPlaceholder}
                />
              </Stack>
            )}
            <Stack>
              <Stack direction={'row'} alignItems="center">
                <Typography variant={'body1'}>
                  {t(
                    'settings:feature_card__prompts__edit_prompt__field_visibility__title',
                  )}
                  {isEditingSpecialButtonKey && (
                    <span style={{ color: 'red' }}>*</span>
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
                if (editNode.id === '') {
                  editNode.id = v4()
                }
                const actions = generateActions(
                  editNode.text,
                  settingPromptsEditButtonKey === 'sidebarSummaryButton',
                )
                // Summary custom prompts 需要特殊处理，将输出端转成 AI
                if (settingPromptsEditButtonKey === 'sidebarSummaryButton') {
                  const askChatGPTAction = actions.find(
                    (action) => action.type === 'ASK_CHATGPT',
                  )
                  if (askChatGPTAction) {
                    const originalData = cloneDeep(editNode)
                    delete originalData.data.actions
                    askChatGPTAction.parameters.AskChatGPTActionQuestion = {
                      meta: {
                        outputMessageId: `{{AI_RESPONSE_MESSAGE_ID}}`,
                        contextMenu: originalData,
                      },
                      text: askChatGPTAction.parameters.template || '',
                    }
                    askChatGPTAction.parameters.AskChatGPTActionType =
                      'ASK_CHAT_GPT_HIDDEN'
                  }
                }
                onSave?.(
                  mergeWithObject([
                    editNode,
                    {
                      data: {
                        actions,
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
export default memo(SettingPromptsUpdateFormModal)
