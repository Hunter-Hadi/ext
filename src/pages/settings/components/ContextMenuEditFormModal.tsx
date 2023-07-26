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
import { CONTEXT_MENU_ICONS, ContextMenuIcon } from '@/features/contextMenu'
import { IContextMenuIconKey } from '@/components/ContextMenuIcon'
import { RunPromptTooltip, TemplateTooltip } from './tooltipCollection'
import { templateStaticWords } from '@/features/shortcuts/utils'
import AppSuspenseLoadingLayout from '@/components/AppSuspenseLoadingLayout'
import { IChromeExtensionButtonSettingKey } from '@/background/types/Settings'
import { IContextMenuItem } from '@/features/contextMenu/types'
import CloseAlert from '@/components/CloseAlert'
import VisibilitySettingCard from '@/components/VisibilitySettingCard'

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
      return isDisabled ? `Option group (Read only)` : 'Edit option group'
    } else {
      return isDisabled ? `Option (Read only)` : 'Edit option'
    }
    return ''
  }, [isDisabled, editNode.data.type])

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
        maxWidth={'lg'}
        sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          borderRadius: 2,
          bgcolor: (t) => (t.palette.mode === 'dark' ? '#3d3d3d' : '#fff'),
          minWidth: '60vw',
          maxWidth: '90vw',
          p: 4,
        }}
      >
        <Stack spacing={2} minHeight={'60vh'} maxHeight={'90vh'}>
          <Stack
            spacing={3}
            sx={{ overflowY: 'auto' }}
            width={'100%'}
            flex={1}
            height={0}
          >
            <Typography variant={'h6'}>{modalTitle}</Typography>
            <Stack>
              <Typography variant={'body1'}>
                {'Name '}
                <span style={{ color: 'red' }}>*</span>
              </Typography>
              <TextField
                disabled={isDisabled}
                size={'small'}
                autoFocus
                value={editNode.text}
                placeholder={'Enter name'}
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
              <Stack>
                <Typography variant={'body1'}>{'Icon'}</Typography>
                <Stack
                  flexWrap={'wrap'}
                  gap={1}
                  direction={'row'}
                  alignItems={'center'}
                  sx={{ maxHeight: '60px', overflowY: 'scroll' }}
                >
                  {CONTEXT_MENU_ICONS.filter((icon) => icon !== 'Empty').map(
                    (icon) => {
                      return (
                        <Button
                          disabled={isDisabled}
                          sx={{ width: 32, minWidth: 'unset', px: 1, py: 0.5 }}
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
                          <ContextMenuIcon icon={icon} />
                        </Button>
                      )
                    },
                  )}
                </Stack>
              </Stack>
            )}
            {editNode.data.type === 'shortcuts' && (
              <Box>
                <Stack direction={'row'} alignItems="center">
                  <Typography variant={'body1'}>
                    Prompt template <span style={{ color: 'red' }}>*</span>
                  </Typography>
                  <TemplateTooltip />
                </Stack>
                <Box
                  position={'relative'}
                  height={320}
                  sx={{
                    ml: '2px',
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
                      placeholder={`The prompt template for ChatGPT.
The template can include any number of the following variables:
{{SELECTED_TEXT}}
{{AI_RESPONSE_LANGUAGE}}
{{CURRENT_WEBSITE_DOMAIN}}`}
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
              </Box>
            )}
            {editNode.data.type === 'shortcuts' && (
              <FormControlLabel
                control={<Switch checked={autoAskChatGPT} />}
                label={
                  <Stack direction={'row'} alignItems="center">
                    <Typography variant={'body1'}>
                      Send to AI directly
                    </Typography>
                    <RunPromptTooltip />
                  </Stack>
                }
                value={autoAskChatGPT}
                disabled={isDisabled}
                onChange={(event: any) => {
                  setAutoAskChatGPT(event.target.checked)
                }}
              />
            )}
            <Stack>
              <Stack direction={'row'} alignItems="center">
                <Typography variant={'body1'}>Visibility</Typography>
              </Stack>
              {editNode.data.visibility && (
                <>
                  <CloseAlert icon={<></>} sx={{}}>
                    <Typography fontSize={14} color={'text.primary'}>
                      Change visibility on selected websites
                    </Typography>
                  </CloseAlert>
                  <VisibilitySettingCard
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
                </>
              )}
            </Stack>
          </Stack>
          <Stack></Stack>
          <Stack
            direction={'row'}
            mt={'auto!important'}
            mb={0}
            pt={2}
            flexShrink={0}
            alignItems={'center'}
            spacing={1}
            justifyContent={'center'}
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
              Save
            </Button>
            <Button variant={'outlined'} onClick={onCancel}>
              Cancel
            </Button>
            <Button
              color={'error'}
              disabled={isDisabled}
              variant={'outlined'}
              onClick={() => {
                onDelete && onDelete(editNode.id as string)
              }}
            >
              Delete
            </Button>
          </Stack>
        </Stack>
      </Container>
    </Modal>
  )
}
export default ContextMenuEditForm
