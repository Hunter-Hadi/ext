import React, { FC, useEffect, useMemo, useState } from 'react'
import cloneDeep from 'lodash-es/cloneDeep'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import FormControlLabel from '@mui/material/FormControlLabel'
import Modal from '@mui/material/Modal'
import Stack from '@mui/material/Stack'
import Switch from '@mui/material/Switch'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import Container from '@mui/material/Container'
import {
  IContextMenuIconKey,
  CONTEXT_MENU_ICONS,
  ContextMenuIcon,
} from '@/components/ContextMenuIcon'
import {
  RunPromptTooltip,
  TemplateTooltip,
} from '../../../../../components/tooltipCollection'
import { templateStaticWords } from '@/features/shortcuts/utils'
import AppSuspenseLoadingLayout from '@/components/AppSuspenseLoadingLayout'
import { IContextMenuItem } from '@/features/contextMenu/types'
import VisibilitySettingCard from '@/components/VisibilitySettingCard'
import { SETTINGS_PAGE_CONTENT_WIDTH } from '@/pages/settings/pages/SettingsApp'
import { useTranslation } from 'react-i18next'
import { IChromeExtensionButtonSettingKey } from '@/background/utils'
import ShortcutActionsEditor from '@/features/shortcuts/components/ShortcutActionsEditor'

function replaceString(str: string, startIndex = 0) {
  const matches = templateStaticWords
  let offset = -1
  let match = ''
  for (let i = 0; i < matches.length; i++) {
    const index = str.slice(startIndex).indexOf(matches[i])
    if (index > -1 && (index < offset || offset === -1)) {
      match = matches[i]
      offset = index
    }
  }
  console.log(offset)
  if (offset === -1) {
    return { text: str, p: startIndex, end: true }
  }
  let start = offset + startIndex
  let end = start + match.length
  while (start > startIndex && str[start - 1] === '{') {
    start--
  }
  while (end < str.length && str[end] === '}') {
    end++
  }
  console.log(start, end)
  return {
    text: str.slice(0, start) + `{{${match}}}` + str.slice(end),
    p: end - (end - start - match.length - 4),
  }
}
function processReplaceString(origin: string) {
  let p = 0
  let res = replaceString(origin, p)
  while (!res.end) {
    p = res.p
    res = replaceString(res.text, p)
  }
  return res.text
}
const AceEditor = React.lazy(async () => {
  const ace = await import('react-ace')
  if (!ace) {
    return (<></>) as any
  }
  await Promise.all([
    import('ace-builds/src-noconflict/ext-language_tools'),
    import('ace-builds/src-noconflict/mode-handlebars'),
    import('ace-builds/src-noconflict/theme-monokai'),
  ]).then(([langTools]) => {
    langTools.default.setCompleters([staticWordCompleter])
  })
  return ace.default
})

const staticWordCompleter = {
  getCompletions(
    editor: any,
    session: any,
    pos: number,
    prefix: string,
    callback: any,
  ) {
    const wordList = templateStaticWords
    callback(null, [
      ...wordList.map(function (word) {
        return {
          caption: word,
          value: `{{${word}}}`,
          meta: 'variable',
        }
      }),
    ])
  },
}
/**
 * 用户当前的动作是否是自动运行的
 * @param actions
 */
const isAutoAskChatGPT = (actions?: IContextMenuItem['data']['actions']) => {
  if (actions && actions.length > 0) {
    return actions.find((item) => item.type === 'ASK_CHATGPT') !== undefined
  } else {
    // 默认是自动运行的
    return true
  }
}
const ContextMenuEditForm: FC<{
  iconSetting?: boolean
  settingsKey: IChromeExtensionButtonSettingKey
  node: IContextMenuItem
  onSave?: (
    newNode: IContextMenuItem,
    template: string,
    autoAskChatGPT: boolean,
  ) => void
  onCancel?: () => void
  onDelete?: (id: string) => void
  open: boolean
}> = ({ open, node, onSave, onCancel, onDelete, settingsKey, iconSetting }) => {
  const { t } = useTranslation(['settings', 'common'])
  const [editNode, setEditNode] = useState<IContextMenuItem>(() =>
    cloneDeep(node),
  )
  const [focusEditor, setFocusEditor] = useState(false)
  const [template, setTemplate] = useState('')
  const [selectedIcon, setSelectedIcon] = useState<IContextMenuIconKey | null>(
    null,
  )
  const [autoAskChatGPT, setAutoAskChatGPT] = useState(() => {
    return isAutoAskChatGPT(editNode.data.actions)
  })
  const isDisabled = !editNode.data.editable
  const isDisabledSave = useMemo(() => {
    if (isDisabled) {
      return true
    }
    if (editNode.data.type === 'group') {
      return editNode.text === ''
    } else if (editNode.data.type === 'shortcuts') {
      return editNode.text === '' || template === ''
    }
    return false
  }, [isDisabled, template, editNode.text])
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
    return ''
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
    setTemplate(cloneNode.data?.actions?.[0]?.parameters?.template || '')
    setSelectedIcon(cloneNode.data?.icon as any)
    setAutoAskChatGPT(isAutoAskChatGPT(cloneNode.data.actions))
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
                  sx={{ maxHeight: '112px', overflowY: 'scroll' }}
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
                  <TemplateTooltip />
                </Stack>
                <ShortcutActionsEditor
                  placeholder={t(
                    'settings:feature_card__prompts__edit_prompt__field_template__placeholder',
                  )}
                  defaultValue={node?.data?.actions}
                />
                <Box
                  position={'relative'}
                  sx={{
                    resize: 'vertical',
                    ml: '2px!important',
                    width: 'calc(100% - 4px)',
                    p: 1,
                    boxSizing: 'border-box',
                    borderRadius: '4px',
                    border: '1px solid',
                    borderColor: (t) =>
                      t.palette.mode === 'dark'
                        ? 'rgb(97, 97, 97)'
                        : 'rgb(208, 208, 208)',
                    '.ace-tm .ace_comment': {
                      color: 'rgba(0,0,0,.6)',
                    },
                    '& > div': {
                      minHeight: 200,
                      resize: 'vertical',
                    },
                    '&:hover': {
                      borderColor: (t) =>
                        t.palette.mode === 'dark' ? '#fff' : 'rgb(0, 0, 0)',
                    },
                    ...(focusEditor && {
                      borderColor: 'transparent!important',
                      outline: '2px solid',
                      'outline-color': (t) =>
                        t.palette.mode === 'dark'
                          ? t.palette.customColor.main
                          : t.palette.customColor.main,
                    }),
                  }}
                >
                  <AppSuspenseLoadingLayout>
                    <AceEditor
                      onFocus={() => {
                        setFocusEditor(true)
                      }}
                      onBlur={() => {
                        setFocusEditor(false)
                      }}
                      placeholder={t(
                        'settings:feature_card__prompts__edit_prompt__field_template__placeholder',
                      )}
                      width={'100%'}
                      height={'100%'}
                      value={template}
                      fontSize={14}
                      showPrintMargin={false}
                      showGutter={false}
                      highlightActiveLine={false}
                      mode={'handlebars'}
                      theme={'textmate'}
                      onChange={(value: string) => {
                        setTemplate(value)
                      }}
                      name={'editor-with-chrome-extension'}
                      editorProps={{
                        $blockScrolling: true,
                      }}
                      setOptions={{
                        wrap: true,
                        enableBasicAutocompletion: true,
                        enableLiveAutocompletion: true,
                        enableSnippets: false,
                        showLineNumbers: false,
                        tabSize: 2,
                      }}
                      enableBasicAutocompletion
                      enableLiveAutocompletion
                    />
                  </AppSuspenseLoadingLayout>
                </Box>
              </Stack>
            )}
            {editNode.data.type === 'shortcuts' && (
              <Stack spacing={1} pb={1}>
                <Stack direction={'row'} alignItems="center">
                  <Typography variant={'body1'}>
                    {t(
                      'settings:feature_card__prompts__edit_prompt__field_execution_mode__title',
                    )}
                  </Typography>
                  <RunPromptTooltip />
                </Stack>
                <FormControlLabel
                  sx={{
                    p: '4px 16px',
                    borderRadius: '4px',
                    justifyContent: 'space-between',
                    flexDirection: 'row-reverse',
                    border: `1px solid`,
                    borderColor: 'customColor.borderColor',
                  }}
                  control={<Switch checked={autoAskChatGPT} />}
                  label={
                    <Stack direction={'row'} alignItems="center">
                      <Typography variant={'body1'}>
                        {t(
                          'settings:feature_card__prompts__edit_prompt__field_execution_mode__send_to_ai_directly__title',
                        )}
                      </Typography>
                    </Stack>
                  }
                  value={autoAskChatGPT}
                  disabled={isDisabled}
                  onChange={(event: any) => {
                    setAutoAskChatGPT(event.target.checked)
                  }}
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
                onSave &&
                  onSave(
                    editNode,
                    processReplaceString(template),
                    autoAskChatGPT,
                  )
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
