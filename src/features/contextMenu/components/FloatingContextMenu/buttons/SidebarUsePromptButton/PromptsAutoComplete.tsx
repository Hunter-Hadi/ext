import Autocomplete from '@mui/material/Autocomplete'
import Box from '@mui/material/Box'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import React, {
  FC,
  ReactNode,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import { useTranslation } from 'react-i18next'

import { IChromeExtensionButtonSettingKey } from '@/background/utils'
import { ContextMenuIcon } from '@/components/ContextMenuIcon'
import { Placement } from '@/features/common/components/Tour/TourMask'
import { useContextMenuList } from '@/features/contextMenu'
import {
  DropdownMenu,
  LiteDropdownMenuItem,
} from '@/features/contextMenu/components/FloatingContextMenu/DropdownMenu'
import { FAVORITE_CONTEXT_MENU_GROUP_ID } from '@/features/contextMenu/hooks/useFavoriteContextMenuList'
import FavoriteMediatorFactory from '@/features/contextMenu/store/FavoriteMediator'
import {
  IContextMenuItem,
  IContextMenuItemWithChildren,
} from '@/features/contextMenu/types'
import { ISetActionsType } from '@/features/shortcuts/types/Action'

type GroupByPromptType = {
  id: string
  text: string
  parent: string
  icon?: string
}

const PromptsAutoComplete: FC<{
  root: HTMLElement
  buttonSettingsKey: IChromeExtensionButtonSettingKey
  placement?: Placement
  onSelectActions?: (actions: ISetActionsType) => void
  onClose?: () => void
}> = (props) => {
  const inputRef = useRef<HTMLDivElement | null>(null)
  const { buttonSettingsKey, root, onSelectActions, onClose, placement } = props
  const direction = useMemo<Placement>(() => {
    if (placement?.startsWith('top')) {
      return 'top'
    }
    if (placement?.startsWith('bottom')) {
      return 'bottom'
    }
    return 'bottom'
  }, [placement])
  const [query, setQuery] = useState<string>('')
  const { originContextMenuList, contextMenuList } = useContextMenuList(
    buttonSettingsKey,
    query,
    true,
  )
  console.log(`PromptsAutoComplete`, direction, query)
  const { t } = useTranslation(['common', 'prompt'])
  const formatOptions = useMemo<GroupByPromptType[]>(() => {
    const filterOptions: IContextMenuItemWithChildren[] = []
    const loopChildren = (children: IContextMenuItemWithChildren[]) => {
      children.forEach((item) => {
        if (item.data.type === 'group') {
          filterOptions.push(item)
          loopChildren(item.children)
        } else {
          filterOptions.push(item)
        }
      })
    }
    contextMenuList.forEach((item) => {
      if (item.data.type === 'group') {
        filterOptions.push(item)
        loopChildren(item.children)
      } else {
        filterOptions.push(item)
      }
    })
    const parentMap = new Map<string, IContextMenuItem>()
    originContextMenuList.forEach((item) => {
      if (item.data.type === 'group') {
        const id = item.id.replace(FAVORITE_CONTEXT_MENU_GROUP_ID, '')
        const key: any = `prompt:${id}`
        let menuText = item.text
        if (t(key) !== id) {
          menuText = t(key)
        }
        parentMap.set(item.id, {
          ...item,
          text: menuText,
        })
      }
    })
    return filterOptions
      .filter((option) => {
        return option.data.type === 'shortcuts'
      })
      .map((item) => {
        const id = item.id.replace(FAVORITE_CONTEXT_MENU_GROUP_ID, '')
        const key: any = `prompt:${id}`
        let menuText = item.text
        if (t(key) !== id) {
          menuText = t(key)
        }
        return {
          id: item.id,
          text: menuText,
          parent: parentMap.get(item.parent)?.text || '',
          icon: item.data.icon,
        }
      })
  }, [contextMenuList, t, originContextMenuList])
  const handleSelectPromptId = async (promptId: string) => {
    const prompt = promptId
      ? originContextMenuList.find(
          (item) =>
            item.id === promptId.replace(FAVORITE_CONTEXT_MENU_GROUP_ID, ''),
        )
      : null
    if (prompt?.data.actions && onSelectActions) {
      await FavoriteMediatorFactory.getMediator(
        buttonSettingsKey,
      ).favoriteContextMenu(prompt)
      onSelectActions(prompt.data.actions as ISetActionsType)
    }
    if (onClose) {
      onClose()
    }
  }
  useEffect(() => {
    if (inputRef) {
      inputRef.current?.querySelector('input')?.focus()
    }
  }, [])
  return (
    <Box
      sx={{
        position: 'relative',
      }}
    >
      <Autocomplete<GroupByPromptType>
        filterOptions={(options) => {
          return options
        }}
        popupIcon={null}
        inputValue={query}
        onInputChange={(_, value) => {
          setQuery(value)
        }}
        onKeyDownCapture={(event) => {
          // esc
          if (event.key === 'Escape') {
            if (onClose) {
              onClose()
            }
          }
        }}
        onChange={(_, value: GroupByPromptType | null, reason: string) => {
          handleSelectPromptId(value?.id || '')
        }}
        onBlur={() => {
          // 如果直接close会导致prompt action无法执行
          setTimeout(() => {
            if (onClose) {
              onClose()
            }
          }, 100)
        }}
        disablePortal
        open={query !== ''}
        noOptionsText={t('common:no_options')}
        size={'small'}
        autoHighlight
        options={formatOptions}
        groupBy={(option) => option.parent}
        getOptionLabel={(option) => option.text}
        sx={{
          width: 300,
          height: 40,
          mt: direction === 'top' ? '360px' : 0,
          bgcolor: 'background.paper',
          '& ul[role="listbox"]': {
            bgcolor: 'red',
          },
        }}
        ListboxProps={{
          sx: {
            '& > li:last-of-type': {
              '& > div:last-of-type': {
                display: 'none',
              },
            },
          },
          style: {
            maxHeight: 360,
            boxSizing: 'border-box',
          },
        }}
        componentsProps={{
          popper: {
            placement: direction,
            modifiers: [
              {
                name: 'flip',
                enabled: false,
              },
            ],
          },
        }}
        renderOption={(props, option, state) => {
          return (
            <Stack
              component={'li'}
              {...props}
              direction={'row'}
              spacing={1}
              alignItems={'center'}
              sx={{
                py: '0!important',
                px: '8px!important',
              }}
            >
              {option.icon && (
                <ContextMenuIcon
                  size={16}
                  icon={option.icon || 'Empty'}
                  sx={{ color: 'primary.main', flexShrink: 0 }}
                />
              )}
              <Typography
                fontSize={14}
                textAlign={'left'}
                color={'text.primary'}
                width={0}
                noWrap
                flex={1}
                lineHeight={'28px'}
              >
                {option.text}
              </Typography>
            </Stack>
          )
        }}
        renderGroup={(params) => {
          return (
            <li key={params.key}>
              <Box
                key={params.key + '_group_name'}
                component={'div'}
                aria-disabled={true}
                sx={{
                  display: 'flex',
                  justifyContent: 'flex-start',
                  alignItems: 'center',
                  width: '100%',
                  boxSizing: 'border-box',
                  direction: 'row',
                  px: 1,
                  pointerEvents: 'none',
                }}
                onClick={(event: any) => {
                  event.stopPropagation()
                  event.preventDefault()
                }}
              >
                <Typography
                  textAlign={'left'}
                  fontSize={12}
                  color={'text.secondary'}
                >
                  {params.group}
                </Typography>
              </Box>
              <ul style={{ padding: 0 }}>{params.children}</ul>
              <ContextMenuDivider contextMenuId={params.key} />
            </li>
          )
        }}
        renderInput={(params) => <TextField {...params} ref={inputRef} />}
      />
      <Box
        sx={{
          width: '100%',
          height: '360px',
          position: 'absolute',
          overflow: 'auto',
          py: 1,
          boxSizing: 'border-box',
          // border: '1px solid',
          // borderColor: 'red',
          zIndex: query ? -1 : 2147483630,
          visibility: query ? 'hidden' : 'visible',
          // visibility: query ? 'hidden' : 'hidden',
          bgcolor: 'background.paper',
          borderRadius: '8px',
          ...(direction === 'top'
            ? {
                bottom: 40,
              }
            : {
                top: 40,
              }),
        }}
      >
        <NestedPromptList
          onSelectPromptId={handleSelectPromptId}
          deep={0}
          root={root}
          promptList={contextMenuList}
        />
      </Box>
    </Box>
  )
}

const NestedPromptList: FC<{
  root: HTMLElement
  promptList: IContextMenuItemWithChildren[]
  onSelectPromptId: (promptId: string) => void
  deep: number
}> = ({ promptList, root, onSelectPromptId, deep }) => {
  return (
    <>
      {promptList.map((item, index) => {
        return (
          <RenderDropdownItem
            onSelectPromptId={onSelectPromptId}
            deep={deep}
            key={item.id}
            menuItem={item}
            root={root}
            index={index}
          />
        )
      })}
    </>
  )
}

const ContextMenuDivider: FC<{
  contextMenuId: string
}> = (props) => {
  const { contextMenuId } = props
  return (
    <Box
      data-testid={`max-ai-context-menu-divider`}
      key={contextMenuId + '_group_spector'}
      aria-disabled={true}
      onClick={(event: any) => {
        event.stopPropagation()
        event.preventDefault()
      }}
      component={'div'}
      sx={{
        pointerEvents: 'none',
        borderTop: '1px solid',
        borderColor: 'customColor.borderColor',
        my: 1,
      }}
    />
  )
}
const RenderDropdownItem: FC<{
  onSelectPromptId: (promptId: string) => void
  menuItem: IContextMenuItemWithChildren
  root: HTMLElement
  index: number
  deep?: number
}> = ({ onSelectPromptId, menuItem, root, index, deep = 0 }) => {
  const { t } = useTranslation(['prompt'])
  const nodeList: ReactNode[] = []
  const menuLabel = useMemo(() => {
    const id = menuItem.id.replace(FAVORITE_CONTEXT_MENU_GROUP_ID, '')
    const key: any = `prompt:${id}`
    if (t(key) !== id) {
      return t(key)
    }
    return menuItem.text
  }, [menuItem.text, t])
  const handleSelectPromptId = useCallback(() => {
    onSelectPromptId(menuItem.id)
  }, [menuItem.id, onSelectPromptId])
  if (menuItem.data.type === 'group') {
    if (deep === 0) {
      if (index > 0) {
        // spector
        nodeList.push(<ContextMenuDivider contextMenuId={menuItem.id} />)
      }
      nodeList.push(
        <Box
          key={menuItem.id + '_group_name'}
          component={'div'}
          aria-disabled={true}
          sx={{
            display: 'flex',
            justifyContent: 'flex-start',
            alignItems: 'center',
            width: '100%',
            boxSizing: 'border-box',
            direction: 'row',
            px: 1,
            pointerEvents: 'none',
          }}
          onClick={(event: any) => {
            event.stopPropagation()
            event.preventDefault()
          }}
        >
          <Typography textAlign={'left'} fontSize={12} color={'text.secondary'}>
            {menuLabel}
          </Typography>
        </Box>,
      )
      menuItem.children.forEach((childMenuItem, index) => {
        nodeList.push(
          <RenderDropdownItem
            onSelectPromptId={onSelectPromptId}
            key={childMenuItem.id}
            menuItem={childMenuItem}
            root={root}
            index={index}
            deep={deep + 1}
          />,
        )
      })
    } else {
      nodeList.push(
        <DropdownMenu
          defaultPlacement={'right-start'}
          defaultFallbackPlacements={['right', 'left', 'bottom', 'top']}
          root={root}
          referenceElement={
            <LiteDropdownMenuItem
              isGroup
              icon={menuItem.data.icon}
              label={menuLabel}
            />
          }
          menuSx={{
            width: 300,
          }}
          hoverOpen
          zIndex={2147483611}
          label={''}
        >
          <NestedPromptList
            onSelectPromptId={onSelectPromptId}
            deep={deep + 1}
            root={root}
            promptList={menuItem.children}
          />
        </DropdownMenu>,
      )
    }
    return <>{nodeList}</>
  }
  return (
    <LiteDropdownMenuItem
      icon={menuItem.data.icon}
      label={menuLabel}
      onClick={handleSelectPromptId}
    />
  )
}

export default PromptsAutoComplete
