import React, { FC, useCallback, useMemo, useRef, useState } from 'react'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import useShortcutEditorActionVariables from '@/features/shortcuts/components/ShortcutActionsEditor/hooks/useShortcutEditorActionsVariables'
import TextField from '@mui/material/TextField'
import InputAdornment from '@mui/material/InputAdornment'
import IconButton from '@mui/material/IconButton'
import SearchIcon from '@mui/icons-material/Search'
import { Theme } from '@mui/material/styles'
import MenuList from '@mui/material/MenuList'
import MenuItem from '@mui/material/MenuItem'
import Button from '@mui/material/Button'
import AddIcon from '@mui/icons-material/Add'
import EditOutlinedIcon from '@mui/icons-material/EditOutlined'
import { useCustomTheme } from '@/hooks/useCustomTheme'
import {
  generateRandomColorWithTheme,
  promptNameToVariable,
} from '@/features/shortcuts/components/ShortcutActionsEditor/utils'
import Chip from '@mui/material/Chip'
import { IActionSetVariable } from '@/features/shortcuts/components/ActionSetVariablesModal/types'
import PromptVariableForm from '@/features/shortcuts/components/ShortcutActionsEditor/PromptVariableEditor/PromptVariableForm'
import RemoveRedEyeOutlinedIcon from '@mui/icons-material/RemoveRedEyeOutlined'

const VARIABLE_MENU_LIST_ID = 'variable-menu-list-container'

const findCanFocusEl = (
  container: HTMLElement,
  type: 'first' | 'last' = 'first',
) => {
  const el = container[
    type === 'first' ? 'firstChild' : 'lastChild'
  ] as HTMLElement
  if (!el) return
  if (el.tagName === 'BUTTON') {
    return el
  } else {
    const lis = container.querySelectorAll('li')
    return lis[type === 'first' ? 0 : lis.length - 1] as HTMLElement
  }
}

const PromptVariableEditor: FC<{
  onAddTextVariable?: (variable: IActionSetVariable) => void
}> = (props) => {
  const { onAddTextVariable } = props
  const { isDarkMode } = useCustomTheme()
  const [inputValue, setInputValue] = useState('')
  const {
    filterVariables,
    addVariable,
    updateVariable,
  } = useShortcutEditorActionVariables(inputValue)
  const [
    editingVariable,
    setEditingVariable,
  ] = useState<IActionSetVariable | null>(null)
  const [editorType, setEditorType] = useState<
    'add' | 'edit' | 'search' | 'view'
  >('search')
  const inputRef = useRef<HTMLInputElement>(null)
  const menuListRef = useRef<HTMLUListElement>(null)
  const showAddBtn = useMemo(() => {
    return inputValue.length > 0
  }, [inputValue])

  const handleCreateVariable = useCallback(() => {
    const newVariable: IActionSetVariable = {
      label: inputValue,
      placeholder: inputValue,
      VariableName: promptNameToVariable(inputValue),
      valueType: 'Text',
    }
    setEditingVariable(newVariable)
    setEditorType('add')
    setInputValue('')
  }, [inputValue])

  const handleEditVariable = useCallback((editVariable: IActionSetVariable) => {
    setEditingVariable(editVariable)
    setEditorType('edit')
    setInputValue('')
  }, [])

  const handleViewVariable = useCallback((viewVariable: IActionSetVariable) => {
    setEditingVariable(viewVariable)
    setEditorType('view')
    setInputValue('')
  }, [])

  const handleListItemArrowUpKeyPress = (e: React.KeyboardEvent) => {
    const currentEl = e.target as HTMLElement
    if (!currentEl) return
    if (currentEl === currentEl.parentElement?.firstChild) {
      handleInputFocus()
    } else {
      if (currentEl.previousSibling) {
        currentEl.blur()
        ;(currentEl.previousSibling as HTMLElement).focus()
      }
    }
  }
  const handleListItemArrowDownKeyPress = (e: React.KeyboardEvent) => {
    const currentEl = e.target as HTMLElement
    if (currentEl) {
      if (currentEl?.nextSibling) {
        currentEl.blur()
        ;(currentEl.nextSibling as HTMLElement).focus()
      } else {
        handleInputFocus()
      }
    }
  }
  const handleInputFocus = () => {
    const inputEl = inputRef.current
    if (inputEl) {
      // 聚焦并且光标移动到最后
      inputEl.focus()
      // 由于 焦点事件在光标移入该字段之前触发，所以需要延迟一下
      setTimeout(() => {
        if (inputEl) {
          inputEl.setSelectionRange(inputEl.value.length, inputEl.value.length)
        }
      }, 0)
    }
  }
  const handleFocusListItem = (type: 'first' | 'last') => {
    if (menuListRef.current) {
      const container = menuListRef.current
      const el = findCanFocusEl(container, type)
      if (el) {
        // console.log('el', type, el)
        el.focus()
      }
    }
  }

  const handleVariableKeyPress = useCallback(
    (event: any) => {
      const { key } = event
      if (key === 'Enter') {
        event.preventDefault()

        if (key === 'Enter') {
          event.preventDefault()
          if (showAddBtn) {
            handleCreateVariable()
          }
        }
      }
      const pattern = /[{}]/g
      if (pattern.test(key)) {
        event.preventDefault()
      }
    },
    [showAddBtn, handleCreateVariable],
  )

  return (
    <Stack>
      <Stack direction={'row'} alignItems={'center'} spacing={0.5} mb={1}>
        <Typography fontSize={'14px'}>Add new variables</Typography>
      </Stack>
      {/*搜索部分*/}
      {editorType === 'search' && (
        <Stack
          sx={{
            borderRadius: '4px',
            bgcolor: 'customColor.paperBackground',
          }}
          p={1}
        >
          <TextField
            inputRef={inputRef}
            size="small"
            value={inputValue}
            onChange={(e) => {
              // 移除非法字符
              const value = e.target.value.replace(/[{}]/g, '')
              setInputValue(value)
            }}
            onKeyPress={handleVariableKeyPress}
            onKeyDown={(e) => {
              if (e.key === 'ArrowDown') {
                e.preventDefault()
                inputRef.current?.blur()
                handleFocusListItem('first')
              }
              if (e.key === 'ArrowUp') {
                e.preventDefault()
                handleFocusListItem('last')
              }
            }}
            InputProps={{
              sx: {
                fontSize: '16px !important',
              },
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    aria-label="toggle password visibility"
                    edge="end"
                  >
                    <SearchIcon />
                  </IconButton>
                </InputAdornment>
              ),
            }}
            inputProps={{
              autoComplete: 'off',
            }}
            fullWidth
            placeholder="Type to search..."
          />
          <Stack
            id={VARIABLE_MENU_LIST_ID}
            bgcolor={(t: Theme) =>
              t.palette.mode === 'dark' ? '#3E3F4C' : 'transparent'
            }
            maxHeight={142}
            overflow={'auto'}
          >
            <MenuList sx={{ py: 0 }} ref={menuListRef}>
              {filterVariables.map((variable) => (
                <MenuItem
                  key={variable.VariableName}
                  onClick={(e) => {
                    e.stopPropagation()
                    if (variable.valueType === 'Text') {
                      onAddTextVariable?.(variable)
                    }
                  }}
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                    borderRadius: 1,
                    cursor: 'pointer',
                    transition: 'all 0.2s ease-in-out',
                    bgcolor: 'transparent',
                    ':hover': {
                      bgcolor: (t: Theme) =>
                        t.palette.mode === 'dark'
                          ? 'rgba(178, 115, 255, 0.08)'
                          : 'rgba(118, 1, 211, 0.04)',
                      '& > button': {
                        visibility: 'visible',
                      },
                    },
                    '&.Mui-focusVisible': {
                      bgcolor: 'rgba(118, 1, 211, 0.1)',
                    },
                  }}
                  onKeyDown={(e) => {
                    e.stopPropagation()
                    if (e.key === 'ArrowUp') {
                      e.preventDefault()
                      handleListItemArrowUpKeyPress(e)
                    }
                    if (e.key === 'ArrowDown') {
                      e.preventDefault()
                      handleListItemArrowDownKeyPress(e)
                    }
                  }}
                >
                  <Typography
                    fontSize={16}
                    color={generateRandomColorWithTheme(
                      variable.VariableName,
                      isDarkMode,
                    )}
                  >
                    {`{{${variable.label}}}`}
                  </Typography>
                  <Typography
                    fontSize={14}
                    color="#808082"
                    sx={{
                      flex: 1,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {variable.placeholder}
                  </Typography>
                  <Chip
                    sx={{
                      width: '64px',
                      fontSize: '14px',
                      padding: '0!important',
                      height: '16px!important',
                      '& > span': {
                        padding: '0 6px',
                      },
                    }}
                    label={variable.valueType}
                    size="small"
                  />
                  <Chip
                    sx={{
                      width: '64px',
                      fontSize: '14px',
                      padding: '0!important',
                      height: '16px!important',
                      '& > span': {
                        padding: '0 6px',
                      },
                    }}
                    label={variable.systemVariable ? 'Preset' : 'Custom'}
                    size="small"
                  />
                  <IconButton
                    size="small"
                    sx={{
                      visibility: 'hidden',
                      ml: 'auto !important',
                    }}
                    onClick={(e) => {
                      e.stopPropagation()
                      if (variable.systemVariable) {
                        handleViewVariable(variable)
                      } else {
                        handleEditVariable(variable)
                      }
                    }}
                  >
                    {variable.systemVariable ? (
                      <RemoveRedEyeOutlinedIcon
                        fontSize="inherit"
                        color="primary"
                      />
                    ) : (
                      <EditOutlinedIcon fontSize="inherit" color="primary" />
                    )}
                  </IconButton>
                </MenuItem>
              ))}

              {/* Add btn */}
              {showAddBtn && (
                <Stack mt={1} width={'100%'}>
                  <Button
                    fullWidth
                    variant="text"
                    disableFocusRipple
                    sx={(t) => {
                      const isDark = t.palette.mode === 'dark'
                      const bgcolor = isDark
                        ? 'rgba(178, 115, 255, 0.08)'
                        : 'rgba(118, 1, 211, 0.04)'
                      const hoverBgcolor = isDark
                        ? 'rgba(178, 115, 255, 0.2)'
                        : 'rgba(118, 1, 211, 0.1)'
                      return {
                        bgcolor: bgcolor,
                        ':hover': {
                          bgcolor: hoverBgcolor,
                        },
                        ':focus': {
                          bgcolor: hoverBgcolor,
                        },
                      }
                    }}
                    onClick={() => {
                      handleCreateVariable()
                    }}
                    onKeyDown={(e) => {
                      e.stopPropagation()
                      if (e.key === 'ArrowUp') {
                        e.preventDefault()
                        handleListItemArrowUpKeyPress(e)
                      }
                      if (e.key === 'ArrowDown') {
                        e.preventDefault()
                        handleListItemArrowDownKeyPress(e)
                      }
                    }}
                  >
                    <AddIcon fontSize="inherit" />
                    <Typography variant="body2" fontWeight={500}>
                      Add
                    </Typography>
                  </Button>
                </Stack>
              )}
            </MenuList>
          </Stack>
        </Stack>
      )}
      {/*创建部分*/}
      {editorType !== 'search' && (
        <Stack
          sx={{
            borderRadius: '4px',
            bgcolor: 'customColor.paperBackground',
          }}
          p={1}
        >
          <PromptVariableForm
            initialValue={editingVariable || undefined}
            type={editorType as 'add'}
            onConfirm={(editingVariable) => {
              debugger
              if (editorType === 'add') {
                addVariable(editingVariable)
              } else if (editorType === 'edit') {
                updateVariable(editingVariable)
              }
              setEditorType('search')
              setEditingVariable(null)
            }}
            onCancel={() => {
              setEditorType('search')
              setEditingVariable(null)
            }}
          />
        </Stack>
      )}
    </Stack>
  )
}
export default PromptVariableEditor
