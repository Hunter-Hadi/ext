import React, { FC, useEffect, useState } from 'react'
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
} from '@mui/material'
import {
  CONTEXT_MENU_ICONS,
  ContextMenuIcon,
  IContextMenuItem,
} from '@/features/contextMenu'
import { IChromeExtensionSettingsKey } from '@/utils'
import { IContextMenuIconKey } from '@/features/contextMenu/components/ContextMenuIcon'
import AceEditor from 'react-ace'
import 'ace-builds/src-noconflict/mode-handlebars'
import 'ace-builds/src-noconflict/theme-monokai'
import langTools from 'ace-builds/src-noconflict/ext-language_tools'
const isEzMailApp = process.env.APP_ENV === 'EZ_MAIL_AI'

const staticWordCompleter = {
  getCompletions(
    editor: any,
    session: any,
    pos: number,
    prefix: string,
    callback: any,
  ) {
    const wordList = isEzMailApp
      ? [
          // gmail
          'GMAIL_MESSAGE_CONTEXT',
          'GMAIL_DRAFT_CONTEXT',
          // system
          'LAST_ACTION_OUTPUT',
          'USER_INPUT',
          'HIGHLIGHTED_TEXT',
        ]
      : [
          // system
          'LAST_ACTION_OUTPUT',
          'USER_INPUT',
          'HIGHLIGHTED_TEXT',
        ]
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
  settingsKey: IChromeExtensionSettingsKey
  node: IContextMenuItem
  onSave?: (
    newNode: IContextMenuItem,
    template: string,
    autoAskChatGPT: boolean,
  ) => void
  onCancel?: () => void
  open: boolean
}> = ({ open, node, onSave, onCancel, settingsKey, iconSetting }) => {
  const [editNode, setEditNode] = useState<IContextMenuItem>(() =>
    cloneDeep(node),
  )
  const [template, setTemplate] = useState('')
  const [selectedIcon, setSelectedIcon] = useState<
    IContextMenuIconKey | undefined
  >()
  const [autoAskChatGPT, setAutoAskChatGPT] = useState(() => {
    return editNode.data.actions?.length === 3
  })
  const isDisabled = !node.data.editable
  useEffect(() => {
    const cloneNode: IContextMenuItem = cloneDeep(node)
    setEditNode(cloneDeep(node))
    setTemplate(cloneNode.data?.actions?.[0]?.parameters?.template || '')
    setSelectedIcon(cloneNode.data?.icon as any)
    setAutoAskChatGPT(cloneNode.data?.actions?.length === 3)
  }, [node])
  return (
    <Modal open={open} onClose={onCancel}>
      <Stack spacing={2} p={4} height={'100%'}>
        <Typography variant={'h6'}>
          Edit Menu Item{isDisabled ? '(Read only)' : ''}
        </Typography>
        <TextField
          disabled={isDisabled}
          size={'small'}
          value={editNode.text}
          label={'Menu Name'}
          onChange={(event) => {
            setEditNode((prev) => {
              return {
                ...prev,
                text: event.target.value,
              }
            })
          }}
        />
        {iconSetting && (
          <Stack>
            <Typography variant={'body1'}>Menu Icon</Typography>
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
                    sx={{ minWidth: 'unset', px: 1, py: 0.5 }}
                    variant={
                      icon === (selectedIcon as string)
                        ? 'contained'
                        : 'outlined'
                    }
                    key={icon}
                    onClick={() => {
                      setSelectedIcon(icon)
                      setEditNode((prev) => {
                        return {
                          ...prev,
                          data: {
                            ...prev.data,
                            icon,
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
          <>
            <Typography variant={'body1'}>Template</Typography>
            <Box position={'relative'} width={'100%'} height={280}>
              <AceEditor
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
          </>
        )}

        {node.data.type === 'shortcuts' &&
          settingsKey === 'gmailToolBarContextMenu' && (
            <FormControlLabel
              control={<Switch checked={autoAskChatGPT} />}
              label="Auto Ask ChatGPT"
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
            variant={'outlined'}
            onClick={() => {
              onCancel?.()
            }}
          >
            Cancel
          </Button>
          <Button
            disabled={isDisabled}
            variant={'contained'}
            onClick={() => {
              onSave && onSave(editNode, template, autoAskChatGPT)
            }}
          >
            Save
          </Button>
        </Stack>
      </Stack>
    </Modal>
  )
}
export default ContextMenuEditForm
