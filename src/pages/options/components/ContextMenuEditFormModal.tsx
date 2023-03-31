import React, { FC, useEffect, useMemo, useState } from 'react'
import cloneDeep from 'lodash-es/cloneDeep'
import {
  Box,
  Button,
  FormControlLabel,
  Modal,
  Stack,
  Switch,
  TextField,
  Typography,
  Container,
  IconButton,
} from '@mui/material'
import {
  CONTEXT_MENU_ICONS,
  ContextMenuIcon,
  IContextMenuItem,
} from '@/features/contextMenu'
import { IChromeExtensionSettingsContextMenuKey } from '@/utils'
import { IContextMenuIconKey } from '@/features/contextMenu/components/ContextMenuIcon'
import AceEditor from 'react-ace'
import 'ace-builds/src-noconflict/mode-handlebars'
import 'ace-builds/src-noconflict/theme-monokai'
import langTools from 'ace-builds/src-noconflict/ext-language_tools'
import TemplateTooltip from './TemplateTooltip'
import { templateStaticWords } from '@/features/shortcuts/utils'
import DeleteIcon from '@mui/icons-material/Delete'
// const isEzMailApp = process.env.APP_ENV === 'EZ_MAIL_AI'

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
langTools.setCompleters([staticWordCompleter])
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
  const [template, setTemplate] = useState('')
  const [selectedIcon, setSelectedIcon] = useState<IContextMenuIconKey | null>(
    null,
  )
  const [autoAskChatGPT, setAutoAskChatGPT] = useState(() => {
    return editNode.data.actions?.length === 3
  })
  const isDisabled = !node.data.editable
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
      return isDisabled ? `Group (Read only)` : 'Edit option group'
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
          bgcolor: '#fff',
          minWidth: '60vw',
          maxWidth: '90vw',
          p: 4,
        }}
      >
        <Stack
          spacing={3}
          minHeight={'60vh'}
          maxHeight={'90vh'}
          sx={{ overflowY: 'auto' }}
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
                              icon: prev.data.icon === icon ? undefined : icon,
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
              <Box position={'relative'} width={'100%'} height={320}>
                <AceEditor
                  placeholder={`The prompt template for ChatGPT. The template can include any number of the following variables:
{{SELECTED_TEXT}}
{{AI_OUTPUT_LANGUAGE}}`}
                  width={'100%'}
                  height={'100%'}
                  value={template}
                  showPrintMargin={true}
                  showGutter={true}
                  fontSize={14}
                  mode={'handlebars'}
                  theme={'monokai'}
                  onChange={(value) => {
                    setTemplate(value)
                  }}
                  name={'editor-with-chrome-extension'}
                  editorProps={{
                    $blockScrolling: true,
                  }}
                  setOptions={{
                    enableBasicAutocompletion: true,
                    enableLiveAutocompletion: true,
                    enableSnippets: false,
                    showLineNumbers: true,
                    wrap: true,
                    tabSize: 2,
                  }}
                  enableBasicAutocompletion
                  enableLiveAutocompletion
                />
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

          <Stack
            direction={'row'}
            mt={'auto!important'}
            mb={0}
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
          <IconButton
            disabled={isDisabled}
            size={'small'}
            onClick={() => {
              onDelete && onDelete(node.id as string)
            }}
          >
            <DeleteIcon sx={{ fontSize: 20 }} />
          </IconButton>
        </Box>
      </Container>
    </Modal>
  )
}
export default ContextMenuEditForm
