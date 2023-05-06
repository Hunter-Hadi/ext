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
  CONTEXT_MENU_ICONS,
  ContextMenuIcon,
  IContextMenuItem,
} from '@/features/contextMenu'
import { IContextMenuIconKey } from '@/features/contextMenu/components/ContextMenuIcon'
import TemplateTooltip from './TemplateTooltip'
import { templateStaticWords } from '@/features/shortcuts/utils'
import DeleteOutlinedIcon from '@mui/icons-material/DeleteOutlined'
import TooltipIconButton from '@/components/TooltipIconButton'
import { IChromeExtensionSettingsContextMenuKey } from '@/background/utils'
import AppSuspenseLoadingLayout from '@/components/AppSuspenseLoadingLayout'

const AceEditor = React.lazy(() => {
  return Promise.all([
    import('react-ace'),
    import('ace-builds/src-noconflict/ext-language_tools'),
    import('ace-builds/src-noconflict/mode-handlebars'),
    import('ace-builds/src-noconflict/theme-monokai'),
  ]).then(([ace, langTools]) => {
    langTools.setCompleters([staticWordCompleter])
    return ace
  })
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
const ContextMenuEditForm: FC<{
  iconSetting?: boolean
  settingsKey: IChromeExtensionSettingsContextMenuKey
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
    return editNode.data.actions?.length === 3
  })
  const isDisabled = !node.data.editable
  const isGroup = node.data.type === 'group'
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
    setEditNode(cloneDeep(node))
    setTemplate(cloneNode.data?.actions?.[0]?.parameters?.template || '')
    setSelectedIcon(cloneNode.data?.icon as any)
    setAutoAskChatGPT(cloneNode.data?.actions?.length === 3)
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
        <Stack spacing={3} minHeight={'60vh'} maxHeight={'90vh'}>
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
                  {CONTEXT_MENU_ICONS.map((icon) => {
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
                  })}
                </Stack>
              </Stack>
            )}
            {node.data.type === 'shortcuts' && (
              <Box>
                <Stack direction={'row'} alignItems="center">
                  <Typography variant={'body1'}>
                    Prompt template for ChatGPT{' '}
                    <span style={{ color: 'red' }}>*</span>
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
{{AI_OUTPUT_LANGUAGE}}
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
                      onChange={(value) => {
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
            {node.data.type === 'shortcuts' &&
              settingsKey === 'gmailToolBarContextMenu' && (
                <FormControlLabel
                  control={<Switch checked={autoAskChatGPT} />}
                  label="Run prompt automatically"
                  value={autoAskChatGPT}
                  disabled={isDisabled}
                  onChange={(event: any) => {
                    setAutoAskChatGPT(event.target.checked)
                  }}
                />
              )}
          </Stack>
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
                onSave && onSave(editNode, template, autoAskChatGPT)
              }}
            >
              Save
            </Button>
            <Button variant={'outlined'} onClick={onCancel}>
              Cancel
            </Button>
          </Stack>
        </Stack>
        <Box
          sx={{
            position: 'absolute',
            top: 24,
            right: 24,
          }}
        >
          <TooltipIconButton
            title={`Delete ${isGroup ? 'option group' : 'option'}`}
            disabled={isDisabled}
            size={'small'}
            onClick={() => {
              onDelete && onDelete(node.id as string)
            }}
          >
            <DeleteOutlinedIcon sx={{ fontSize: 20 }} />
          </TooltipIconButton>
        </Box>
      </Container>
    </Modal>
  )
}
export default ContextMenuEditForm
