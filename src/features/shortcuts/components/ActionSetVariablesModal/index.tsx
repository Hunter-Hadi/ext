import React, { FC, useEffect, useMemo, useRef, useState } from 'react'
import {
  IActionSetSystemVariablesData,
  IActionSetVariablesData,
} from '@/features/shortcuts/components/ActionSetVariablesModal/types'
import Stack from '@mui/material/Stack'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import IconButton from '@mui/material/IconButton'
import CloseIcon from '@mui/icons-material/Close'
import useEffectOnce from '@/hooks/useEffectOnce'
import OneShotCommunicator from '@/utils/OneShotCommunicator'
import Button from '@mui/material/Button'
import { useTranslation } from 'react-i18next'
import SendIcon from '@mui/icons-material/Send'
import cloneDeep from 'lodash-es/cloneDeep'
import TextField from '@mui/material/TextField'
import SystemVariableSelect from '@/features/shortcuts/components/SystemVariableSelect'
import CircularProgress from '@mui/material/CircularProgress'
import { useShortCutsWithMessageChat } from '@/features/shortcuts/hooks/useShortCutsWithMessageChat'
import { ISetActionsType } from '@/features/shortcuts/types/Action'
import { v4 as uuidV4 } from 'uuid'
import { IContextMenuItem } from '@/features/contextMenu/types'
import { useRecoilValue } from 'recoil'
import { SidebarSettingsState } from '@/features/sidebar'
import { isProduction } from '@/constants'
import isNumber from 'lodash-es/isNumber'
import {
  getSetVariablesModalSelectCache,
  setVariablesModalSelectCache,
} from '@/features/shortcuts/components/ActionSetVariablesModal/setVariablesModalSelectCache'
import TooltipButton from '@/components/TooltipButton'

export interface ActionSetVariablesModalConfig {
  modelKey: 'Sidebar' | 'FloatingContextMenu'
  variables: IActionSetVariablesData
  systemVariables: IActionSetSystemVariablesData
  title: string
  template?: string
  // 只是为了log记录，没其他作用
  contextMenuId: string
  // 等待用户操作
  waitForUserAction?: boolean
}
export interface ActionSetVariablesConfirmData {
  data: {
    [key: string]: string | number | undefined
  }
  type: 'close' | 'confirm' | 'cancel'
  success: boolean
}
interface ActionSetVariablesModalProps
  extends Partial<ActionSetVariablesModalConfig> {
  modelKey: 'Sidebar' | 'FloatingContextMenu'
  onShow?: () => void
  onClose?: () => void
  onConfirm?: (data: ActionSetVariablesConfirmData) => void
}

const ActionSetVariablesModal: FC<ActionSetVariablesModalProps> = (props) => {
  const { title, variables, systemVariables, modelKey, onShow, onClose } = props
  const { setShortCuts, runShortCuts, loading } = useShortCutsWithMessageChat()
  const { type } = useRecoilValue(SidebarSettingsState)
  const { t } = useTranslation(['common', 'client'])
  const [show, setShow] = useState(false)
  const [hide, setHide] = useState(false)
  const [config, setConfig] = useState<ActionSetVariablesModalConfig | null>(
    null,
  )
  const inputBoxRef = useRef<HTMLDivElement>()
  const [pendingPromises, setPendingPromises] = useState<
    Array<{
      resolve: (value?: any) => void
      reject: (reason?: any) => void
    }>
  >([])
  const [form, setForm] = useState<ActionSetVariablesConfirmData['data']>({})
  const closeModal = async (isCancel: boolean) => {
    pendingPromises.forEach((promise) => {
      promise.resolve({
        data: cloneDeep(form),
        type: isCancel ? 'cancel' : 'close',
        success: false,
      } as ActionSetVariablesConfirmData)
    })
    setForm({})
    setShow(false)
    onClose?.()
  }
  const confirmModal = async (textAreaElementIndex?: number) => {
    if (isNumber(textAreaElementIndex)) {
      const nextTextAreaElement = inputBoxRef.current?.querySelectorAll(
        `textarea[id]`,
      )?.[textAreaElementIndex + 1] as HTMLTextAreaElement | undefined
      if (nextTextAreaElement) {
        nextTextAreaElement.focus()
        return
      }
    }
    if (config?.waitForUserAction) {
      pendingPromises.forEach((promise) => {
        promise.resolve({
          data: cloneDeep(form),
          type: 'confirm',
          success: true,
        } as ActionSetVariablesConfirmData)
      })
    } else {
      const presetVariables = cloneDeep(form)
      setForm({})
      setShow(false)
      onClose?.()
      if (config?.template) {
        let template = form?.TEMPLATE || config?.template || ''
        let systemVariablesTemplate = ''
        if (
          presetVariables.AI_RESPONSE_TONE !== 'Default' &&
          presetVariables.AI_RESPONSE_WRITING_STYLE !== 'Default'
        ) {
          systemVariablesTemplate =
            '\n\nPlease write in {{AI_RESPONSE_TONE}} tone, {{AI_RESPONSE_WRITING_STYLE}} writing style, using {{AI_RESPONSE_LANGUAGE}}.'
        } else if (presetVariables.AI_RESPONSE_TONE !== 'Default') {
          systemVariablesTemplate =
            '\n\nPlease write in {{AI_RESPONSE_TONE}} tone, using {{AI_RESPONSE_LANGUAGE}}.'
        } else if (presetVariables.AI_RESPONSE_WRITING_STYLE !== 'Default') {
          systemVariablesTemplate =
            '\n\nPlease write in {{AI_RESPONSE_WRITING_STYLE}} writing style, using {{AI_RESPONSE_LANGUAGE}}.'
        } else {
          systemVariablesTemplate =
            '\n\nPlease write using {{AI_RESPONSE_LANGUAGE}}.'
        }
        template += '\n\n---' + systemVariablesTemplate
        const actions: ISetActionsType = []
        actions.push({
          type: 'SET_VARIABLE_MAP',
          parameters: {
            VariableMap: presetVariables,
          },
        })
        actions.push({
          type: 'RENDER_TEMPLATE',
          parameters: {
            template: template as string,
          },
        })
        if (isProduction) {
          actions.push({
            type: 'ASK_CHATGPT',
            parameters: {
              template: '{{LAST_ACTION_OUTPUT}}',
              AskChatGPTActionType: 'ASK_CHAT_GPT_WITH_PREFIX',
              AskChatGPTActionMeta: {
                contextMenu: {
                  id: config.contextMenuId || uuidV4(),
                  droppable: false,
                  parent: uuidV4(),
                  text: config.title,
                  data: {
                    editable: false,
                    type: 'shortcuts',
                    actions: [],
                  },
                } as IContextMenuItem,
              },
            },
          })
        } else {
          actions.push({
            type: 'ASK_CHATGPT',
            parameters: {
              template: '{{LAST_ACTION_OUTPUT}}',
            },
          })
        }
        await setShortCuts(actions)
        await runShortCuts()
      }
    }
  }
  const currentModalConfig = useMemo(() => {
    const initialForm: ActionSetVariablesConfirmData['data'] = {}
    const currentVariables = variables || config?.variables || []
    const currentSystemVariables =
      systemVariables || config?.systemVariables || []
    const currentTitle = title || config?.title || ''
    const selectTypeVariables: IActionSetVariablesData = []
    const textTypeVariables: IActionSetVariablesData = []
    currentVariables.forEach((variable) => {
      if (variable.valueType === 'Select' && !variable.hidden) {
        selectTypeVariables.push(variable)
      }
      if (variable.valueType === 'Text' && !variable.hidden) {
        textTypeVariables.push(variable)
      }
      initialForm[variable.VariableName] = variable.defaultValue
    })
    currentSystemVariables.forEach((systemVariable) => {
      initialForm[systemVariable.VariableName] = systemVariable.defaultValue
    })
    // 计算当前选择框的总数
    const currentSelectTotalCount =
      selectTypeVariables.length + currentSystemVariables.length
    // 计算单个textarea的最大行数 = ((60vh - title - select - actions) / textareaCount) / 24px
    const maxHeight = window.innerHeight * 0.6
    // 标题高度
    const titleHeight = 36
    // 选择框行数
    const selectLine = Math.ceil(currentSelectTotalCount / 3)
    // 选择框高度
    const selectHeight = selectLine * 48 + (selectLine - 1) * 16
    // textarea数量
    const textareaCount = textTypeVariables.length
    // textarea间距
    const textareaSpacing = (textareaCount - 1) * 16
    // title/选择框/textarea/action之间的间距
    const boxSpacing = 16 * 3
    const textareaMaxHeight =
      maxHeight - titleHeight - selectHeight - textareaSpacing - boxSpacing
    // NOTE: 24px是textarea的行高, -1是为了安全高度
    const maxTextareaMaxRows =
      Math.floor(textareaMaxHeight / 24 / textareaCount) - 1
    getSetVariablesModalSelectCache().then((cache) => {
      const initialFormKeys = Object.keys(initialForm)
      if (initialFormKeys.length === 0) {
        return
      }
      initialFormKeys.forEach((formKey) => {
        if (cache[formKey] !== undefined) {
          initialForm[formKey] = cache[formKey]
        }
      })
      setForm(initialForm)
    })
    return {
      currentTitle,
      currentSelectTotalCount,
      currentSystemVariables,
      selectTypeVariables,
      textTypeVariables,
      maxTextareaMaxRows,
    }
  }, [variables, title, systemVariables, modelKey, config])
  useEffectOnce(() => {
    OneShotCommunicator.receive('SetVariablesModal', (data: any) => {
      return new Promise((resolve, reject) => {
        if (data.task === 'open' && data.config?.modelKey === modelKey) {
          setShow(false)
          setTimeout(() => {
            setConfig(data.config)
            if (data.config.waitForUserAction) {
              setPendingPromises([
                {
                  resolve,
                  reject,
                },
              ])
            } else {
              resolve({
                data: cloneDeep(form),
                type: 'confirm',
                success: true,
              })
            }
            onShow?.()
            setShow(true)
          }, 0)
        }
      })
    })
  })
  useEffect(() => {
    if (type === 'Chat') {
      setHide(false)
    } else {
      setHide(true)
    }
  }, [type])
  useEffect(() => {
    if (show) {
      if (hide) {
        onClose?.()
      } else {
        const focusEmptyInput = () => {
          const emptyTextTextarea = Array.from(
            inputBoxRef.current?.querySelectorAll('textarea') || [],
          ).find((textarea) => {
            return textarea.value === ''
          })
          if (emptyTextTextarea) {
            emptyTextTextarea.focus()
          } else {
            inputBoxRef.current?.querySelector('textarea')?.focus()
          }
        }
        setTimeout(() => {
          focusEmptyInput()
        }, 0)
        setTimeout(() => {
          focusEmptyInput()
        }, 100)
        onShow?.()
      }
    } else {
      setHide(false)
    }
  }, [show, hide])
  if (!show || hide || Object.keys(form).length === 0) {
    return null
  }
  return (
    <Stack
      borderRadius={'8px'}
      border={`1px solid`}
      borderColor={'customColor.borderColor'}
      sx={{
        width: '100%',
        p: 1,
        gap: 1,
      }}
      maxHeight={'60vh'}
      // onKeyDownCapture={(event) => {
      //   event.stopPropagation()
      // }}
      // onKeyDown={(event) => {
      //   event.stopPropagation()
      // }}
      onKeyPressCapture={(event) => {
        event.stopPropagation()
      }}
      onKeyPress={(event) => {
        event.stopPropagation()
      }}
      // onKeyUpCapture={(event) => {
      //   event.stopPropagation()
      // }}
      // onKeyUp={(event) => {
      //   event.stopPropagation()
      // }}
    >
      {/*Header*/}
      <Stack
        height={36}
        direction={'row'}
        alignItems={'start'}
        justifyContent={'space-between'}
      >
        <Box
          component={'div'}
          sx={{
            borderRadius: '4px',
            p: '4px 8px',
            bgcolor: 'rgba(0, 0, 0, 0.87)',
          }}
        >
          <Typography fontSize={'14px'} color={'#fff'} fontWeight={600}>
            {currentModalConfig.currentTitle}
          </Typography>
        </Box>
        <IconButton
          onClick={async () => await closeModal(true)}
          sx={{
            position: 'relative',
            top: '-8px',
            right: '-8px',
          }}
        >
          <CloseIcon sx={{ fontSize: '24px' }} />
        </IconButton>
      </Stack>
      {/*Select*/}
      <Stack
        flexWrap={'wrap'}
        direction={'row'}
        sx={{
          gap: '16px',
        }}
      >
        {currentModalConfig.currentSystemVariables.map(
          (systemVariable, index) => {
            const width = getChildrenWidth(
              index,
              currentModalConfig.currentSelectTotalCount,
            )
            return (
              <SystemVariableSelect
                systemVariableSelectKey={systemVariable.VariableName}
                key={systemVariable.VariableName}
                defaultValue={
                  (form[systemVariable.VariableName] as string) || ''
                }
                onChange={async (value) => {
                  await setVariablesModalSelectCache(
                    systemVariable.VariableName,
                    value,
                  )
                  setForm((prevState) => {
                    return {
                      ...prevState,
                      [systemVariable.VariableName]: value,
                    }
                  })
                }}
                sx={{
                  width,
                }}
              />
            )
          },
        )}
      </Stack>
      {/*Text*/}
      <Stack gap={2} paddingTop={1} ref={inputBoxRef}>
        {currentModalConfig.textTypeVariables.map((textTypeVariable, index) => {
          return (
            <TextField
              size={'small'}
              key={textTypeVariable.VariableName}
              label={textTypeVariable.label}
              value={form[textTypeVariable.VariableName] || ''}
              onChange={(event) => {
                const value = event.target.value
                setForm((prevState) => {
                  return {
                    ...prevState,
                    [textTypeVariable.VariableName]: value,
                  }
                })
              }}
              onKeyDown={async (event) => {
                if (event.key === 'Enter' && !event.shiftKey) {
                  event.stopPropagation()
                  event.preventDefault()
                  await confirmModal(index)
                } else {
                  event.stopPropagation()
                }
              }}
              InputProps={{
                sx: {
                  fontSize: '16px',
                },
              }}
              InputLabelProps={{ shrink: true, sx: { fontSize: '16px' } }}
              multiline
              placeholder={textTypeVariable.placeholder}
              minRows={Math.min(currentModalConfig.maxTextareaMaxRows, 2)}
              maxRows={currentModalConfig.maxTextareaMaxRows}
            />
          )
        })}
      </Stack>
      {/*Actions*/}
      <Stack
        direction={'row'}
        alignItems={'center'}
        justifyContent={'end'}
        gap={1}
      >
        <Button
          sx={{
            height: '32px',
          }}
          onClick={async () => await closeModal(true)}
          variant={'secondary'}
        >
          {t('common:cancel')}
        </Button>
        <TooltipButton
          title={t(`client:sidebar__button__send_to_ai`)}
          TooltipProps={{
            description: '⏎',
          }}
          disabled={loading}
          onClick={async () => await confirmModal()}
          variant={'contained'}
          color={'primary'}
          sx={{
            width: '32px',
            height: '32px',
            minWidth: 'unset',
          }}
        >
          {loading ? (
            <CircularProgress
              size={16}
              sx={{
                fontSize: `inherit`,
                color: '#fff',
              }}
            />
          ) : (
            <SendIcon
              sx={{
                fontSize: '16px',
              }}
            />
          )}
        </TooltipButton>
      </Stack>
    </Stack>
  )
}

const getChildrenWidth = (index: number, count: number) => {
  const remainder = count % 3
  const fullRows = (count - remainder) / 3

  if (index < fullRows * 3) {
    return 'calc(33.33% - (2/3)*16px)'
  } else {
    switch (remainder) {
      case 1:
        if (index === count - 1) return '100%'
        break
      case 2:
        if (index >= count - 2) return 'calc(50% - 8px)'
        break
    }
  }
  return null
}

export default ActionSetVariablesModal
