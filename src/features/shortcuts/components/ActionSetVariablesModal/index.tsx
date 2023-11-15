import React, { FC, useEffect, useMemo, useRef, useState } from 'react'
import { IActionSetVariable } from '@/features/shortcuts/components/ActionSetVariablesModal/types'
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
import { isProduction } from '@/constants'
import isNumber from 'lodash-es/isNumber'
import {
  getSetVariablesModalSelectCache,
  setVariablesModalSelectCache,
} from '@/features/shortcuts/components/ActionSetVariablesModal/setVariablesModalSelectCache'
import TooltipButton from '@/components/TooltipButton'
import useSidebarSettings from '@/features/sidebar/hooks/useSidebarSettings'
import { useClientConversation } from '@/features/chatgpt/hooks/useClientConversation'
import { useForm, Controller } from 'react-hook-form'

export interface ActionSetVariablesModalConfig {
  modelKey: 'Sidebar' | 'FloatingContextMenu'
  variables: IActionSetVariable[]
  systemVariables: IActionSetVariable[]
  title: string
  template?: string
  // 只是为了log记录，没其他作用
  contextMenuId: string
  // 等待用户操作
  waitForUserAction?: boolean
  // 在Modal设置完变量后要运行的actions
  actions?: ISetActionsType
  // 答案插入的MessageId
  answerInsertMessageId?: string
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
  const {
    title,
    variables,
    systemVariables,
    modelKey,
    onShow,
    onClose,
    actions,
    answerInsertMessageId,
  } = props
  const { createConversation } = useClientConversation()
  const {
    setShortCuts,
    runShortCuts,
    loading,
    shortCutsEngineRef,
  } = useShortCutsWithMessageChat()
  const { currentSidebarConversationType } = useSidebarSettings()
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
  const {
    control,
    getValues,
    setValue,
    register,
    trigger,
    reset,
    clearErrors,
    formState: { errors },
  } = useForm<ActionSetVariablesConfirmData['data']>()
  const [form, setForm] = useState<
    {
      [key in string]: ReturnType<typeof register>
    }
  >({})
  const closeModal = async (isCancel: boolean) => {
    pendingPromises.forEach((promise) => {
      promise.resolve({
        data: getValues(),
        type: isCancel ? 'cancel' : 'close',
        success: false,
      } as ActionSetVariablesConfirmData)
    })
    reset()
    setForm({})
    setShow(false)
    onClose?.()
  }
  const validateForm = async () => {
    const success = await trigger()
    if (!success) {
      if (!show) {
        setShow(true)
      }
    }
    return success
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
      if (!(await validateForm())) {
        return
      }
      pendingPromises.forEach((promise) => {
        promise.resolve({
          data: getValues(),
          type: 'confirm',
          success: true,
        } as ActionSetVariablesConfirmData)
      })
    } else {
      await runActions(false)
    }
  }
  const runActions = async (autoExecute: boolean) => {
    const isHaveEmptyValue =
      Object.values(getValues()).filter(
        (value) => String(value || '').trim() === '',
      ).length > 0
    if (!(await validateForm())) {
      if (autoExecute) {
        // 当modal打开的时候会尝试自动运行, 如果进入到这一步，说明已经验证失败了
        // 如果有空值，就清除错误提示, 因为不需要直接报错
        // 如果没有空值，说明是其他错误，例如正则错误，就不清除错误提示
        if (isHaveEmptyValue) {
          clearErrors()
        }
      }
      return
    }
    // 因为是modal打开时尝试自动运行，即使通过表单验证，如果有任何一个空值都不再自动运行
    if (autoExecute && isHaveEmptyValue) {
      setShow(true)
      return
    }
    // 如果没有任何值，就不运行
    if (Object.keys(getValues()).length === 0) {
      return
    }
    await createConversation('Chat')
    const presetVariables = cloneDeep(getValues())
    setForm({})
    reset()
    setShow(false)
    onClose?.()
    const runActions: ISetActionsType = []
    if (config?.template) {
      let template = getValues()?.TEMPLATE || config?.template || ''
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
      runActions.push({
        type: 'SET_VARIABLE_MAP',
        parameters: {
          VariableMap: presetVariables,
        },
      })
      // 要等modal运行完后设置完成变量再push actions
      runActions.push(...(actions || config.actions || []))
      runActions.push({
        type: 'RENDER_TEMPLATE',
        parameters: {
          template: template as string,
        },
      })
      // 用来插入答案的messageId，例如search message/summary message
      const insertMessageId =
        answerInsertMessageId || config.answerInsertMessageId || ''
      if (isProduction) {
        runActions.push({
          type: 'ASK_CHATGPT',
          parameters: {
            template: '{{LAST_ACTION_OUTPUT}}',
            AskChatGPTActionType: insertMessageId
              ? 'ASK_CHAT_GPT_HIDDEN'
              : 'ASK_CHAT_GPT_WITH_PREFIX',
            AskChatGPTInsertMessageId: insertMessageId,
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
        runActions.push({
          type: 'ASK_CHATGPT',
          parameters: {
            template: '{{LAST_ACTION_OUTPUT}}',
            AskChatGPTInsertMessageId: insertMessageId,
            AskChatGPTActionType: insertMessageId
              ? 'ASK_CHAT_GPT_HIDDEN'
              : 'ASK_CHAT_GPT_WITH_PREFIX',
          },
        })
      }
      await setShortCuts(runActions)
      await runShortCuts()
    }
  }
  const currentModalConfig = useMemo(() => {
    console.log('什么意思')
    const reactHookFormRegisterMap: {
      [key in string]: ReturnType<typeof register>
    } = {}
    const currentVariables = variables || config?.variables || []
    const currentSystemVariables =
      systemVariables || config?.systemVariables || []
    const currentTitle = title || config?.title || ''
    const selectTypeVariables: IActionSetVariable[] = []
    const textTypeVariables: IActionSetVariable[] = []
    // 先添加系统预设的变量
    currentSystemVariables
      // 再添加用户自定义的变量
      .concat(currentVariables)
      .forEach((variable) => {
        if (variable.valueType === 'Select' && !variable.hidden) {
          selectTypeVariables.push(variable)
        }
        if (variable.valueType === 'Text' && !variable.hidden) {
          textTypeVariables.push(variable)
        }
        const validates = variable.validates || []
        reactHookFormRegisterMap[variable.VariableName] = register(
          variable.VariableName,
          {
            value: variable.defaultValue?.trim(),
            validate: (value) => {
              for (let i = 0; i < validates.length; i++) {
                const validateItem = validates[i]
                if (validateItem.required) {
                  if (!value) {
                    return (
                      validateItem.message || `${variable.label} is required`
                    )
                  }
                }
                if (validateItem.pattern) {
                  if (
                    !value ||
                    !new RegExp(validateItem.pattern).test(value.toString())
                  ) {
                    return (
                      validateItem.message || `${variable.label} is invalid`
                    )
                  }
                }
              }
              return true
            },
          },
        )
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
      const initialFormKeys = Object.keys(reactHookFormRegisterMap)
      if (initialFormKeys.length === 0) {
        return
      }
      initialFormKeys.forEach((formKey) => {
        if (cache[formKey] !== undefined) {
          setValue(formKey, cache[formKey])
        }
      })
      setForm(reactHookFormRegisterMap)
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
          }, 0)
        }
      })
    })
  })
  const runActionsRef = useRef(runActions)
  useEffect(() => {
    runActionsRef.current = runActions
  }, [runActions])
  useEffectOnce(() => {
    shortCutsEngineRef.current?.addListener((event, shortcutEngine) => {
      if (event === 'status') {
        if (shortcutEngine.status === 'complete') {
          runActionsRef.current(true).then().catch()
        }
      }
    })
  })
  useEffect(() => {
    if (currentSidebarConversationType === 'Chat') {
      setHide(false)
    } else {
      setHide(true)
    }
  }, [currentSidebarConversationType])
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
        {currentModalConfig.selectTypeVariables.map((systemVariable, index) => {
          const width = getChildrenWidth(
            index,
            currentModalConfig.currentSelectTotalCount,
          )
          if (systemVariable.systemVariable) {
            return (
              <Controller
                control={control}
                name={systemVariable.VariableName}
                defaultValue={systemVariable.defaultValue}
                render={({ field }) => {
                  return (
                    <SystemVariableSelect
                      systemVariableSelectKey={
                        systemVariable.VariableName as any
                      }
                      key={systemVariable.VariableName}
                      defaultValue={field.value as any}
                      onChange={async (value) => {
                        await setVariablesModalSelectCache(
                          systemVariable.VariableName,
                          value,
                        )
                        field.onChange(value)
                      }}
                      sx={{
                        width,
                      }}
                    />
                  )
                }}
              />
            )
          }
          // TODO 等待开发
          return null
        })}
      </Stack>
      {/*Text*/}
      <Stack gap={2} paddingTop={1} ref={inputBoxRef}>
        {currentModalConfig.textTypeVariables.map((textTypeVariable, index) => {
          console.log('什么意思', errors[textTypeVariable.VariableName], errors)
          return (
            <TextField
              size={'small'}
              key={textTypeVariable.VariableName}
              label={textTypeVariable.label || 'Label'}
              {...form[textTypeVariable.VariableName]}
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
              error={!!errors[textTypeVariable.VariableName]}
              helperText={errors[textTypeVariable.VariableName]?.message || ''}
              FormHelperTextProps={{
                sx: { ml: 0 },
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
