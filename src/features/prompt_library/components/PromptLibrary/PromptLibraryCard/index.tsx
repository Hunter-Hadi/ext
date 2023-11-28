import LanguageOutlinedIcon from '@mui/icons-material/LanguageOutlined'
import LockOutlinedIcon from '@mui/icons-material/LockOutlined'
import { Box, Stack, Typography } from '@mui/material'
import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'
import React, { FC, useMemo } from 'react'
import ProLink from '@/components/ProLink'
import {
  DeleteIconButton,
  EditIconButton,
  FavoriteIconButton,
  SeeIconButton,
} from '@/features/prompt_library/components/PromptLibrary/PromptLibraryCard/PromptLibraryCardActions'
import {
  DEFAULT_PROMPT_AUTHOR,
  DEFAULT_PROMPT_AUTHOR_LINK,
} from '@/features/prompt_library/constant'
import usePromptActions from '@/features/prompt_library/hooks/usePromptActions'
import {
  IPromptActionKey,
  IPromptLibraryCardData,
} from '@/features/prompt_library/types'
import relativeTime from 'dayjs/plugin/relativeTime'
import { APP_USE_CHAT_GPT_HOST } from '@/constants'
import EllipsisTextWithTooltip from '@/components/EllipsisTextWithTooltip'
import PromptTypeList from '@/features/prompt_library/components/PromptLibrary/PromptLibraryCard/PromptTypeList'
import usePromptLibrary from '@/features/prompt_library/hooks/usePromptLibrary'
dayjs.extend(relativeTime)
dayjs.extend(utc)

const PromptLibraryCard: FC<{
  actionButton?: IPromptActionKey[]
  prompt: IPromptLibraryCardData
  onClick?: (promptData?: IPromptLibraryCardData) => void
}> = ({ prompt, actionButton = ['see', 'favorite'], onClick }) => {
  const { openPromptLibraryEditForm } = usePromptActions()
  const {
    selectedPromptLibraryCard,
    selectPromptLibraryCard,
    cancelSelectPromptLibraryCard,
  } = usePromptLibrary()
  const isActive = selectedPromptLibraryCard?.id === prompt.id
  const detailLink = useMemo(() => {
    return prompt.type === 'private'
      ? `${APP_USE_CHAT_GPT_HOST}/prompts/own/${prompt.id}`
      : `${APP_USE_CHAT_GPT_HOST}/prompts/${prompt.id}`
  }, [prompt])

  const actionBtnList = () => {
    const btnList = []
    if (actionButton.includes('see')) {
      btnList.push(<SeeIconButton key="see" detailLink={detailLink} />)
    }
    if (actionButton.includes('delete')) {
      btnList.push(
        <DeleteIconButton
          key="delete"
          promptId={prompt.id}
          promptTitle={prompt.prompt_title}
        />,
      )
    }
    if (actionButton.includes('edit')) {
      btnList.push(
        <EditIconButton
          key="edit"
          onClick={() => {
            openPromptLibraryEditForm(prompt.id)
          }}
        />,
      )
    }
    if (actionButton.includes('favorite')) {
      btnList.push(<FavoriteIconButton key="favorite" promptId={prompt.id} />)
    }

    return btnList
  }

  const authorLink = useMemo(() => {
    return prompt?.author_url || DEFAULT_PROMPT_AUTHOR_LINK
  }, [prompt.author_url])

  const author = useMemo(() => {
    if (authorLink !== DEFAULT_PROMPT_AUTHOR_LINK && !prompt?.author) {
      return authorLink
    }
    return prompt?.author || DEFAULT_PROMPT_AUTHOR
  }, [prompt?.author, authorLink])

  return (
    <Stack
      p={2}
      spacing={1.5}
      onClick={() => {
        if (isActive) {
          cancelSelectPromptLibraryCard()
          onClick?.()
        } else {
          selectPromptLibraryCard(prompt)
          onClick?.(prompt)
        }
      }}
      sx={(t) => {
        const isDark = t.palette.mode === 'dark'

        const normalBgcolor = isDark ? '#3E3F4C' : '#fff'
        const activeBgcolor = isDark ? '#202123' : 'rgba(0, 0, 0, 0.04)'
        const shadowColor = isDark
          ? 'rgba(255, 255, 255, 0.08)'
          : 'rgba(0, 0, 0, 0.16)'

        return {
          position: 'relative',
          color: 'text.primary',
          border: '1px solid',
          cursor: 'pointer',
          borderRadius: '4px',
          transition: 'all 0.2s ease-in-out',
          height: 'calc(100% - 16px - 16px)',
          borderColor: isDark
            ? 'rgba(255, 255, 255, 0.08)'
            : 'rgba(0, 0, 0, 0.08)',
          bgcolor: isActive ? activeBgcolor : normalBgcolor,
          '&:hover': {
            boxShadow: `0px 4px 8px ${shadowColor}`,
          },
        }
      }}
    >
      <Stack direction="row" spacing={1.5} justifyContent="space-between">
        <EllipsisTextWithTooltip
          tip={prompt.prompt_title}
          color={'text.secondary'}
          fontSize={16}
          sx={{
            fontSize: '20px',
            lineHeight: '24px',
            whiteSpace: 'normal',
            wordBreak: 'break-word',
            fontWeight: 700,
            minHeight: '72px',
          }}
        >
          {prompt.prompt_title}
        </EllipsisTextWithTooltip>
        <Typography variant={'body1'} sx={{}}></Typography>
        <Stack direction="row" fontSize={16} height="max-content">
          {actionBtnList()}
        </Stack>
      </Stack>
      <Stack direction={'row'} alignItems={'center'} spacing={1}>
        <PromptCardTag
          tag={`${prompt.category}${
            prompt.use_case ? ` / ${prompt.use_case}` : ''
          }`}
        />
      </Stack>
      <Stack
        direction={'row'}
        alignItems={'center'}
        spacing={0.5}
        sx={(t) => {
          const isDark = t.palette.mode === 'dark'
          return {
            fontSize: 12,
            color: isDark ? 'rgba(255, 255, 255, 0.6)' : 'rgba(0, 0, 0, 0.6)',
          }
        }}
      >
        {prompt?.type === 'private' ? (
          <LockOutlinedIcon fontSize="inherit" />
        ) : (
          <LanguageOutlinedIcon fontSize="inherit" />
        )}
        <Typography variant="caption" fontSize={12}>
          ·
        </Typography>
        <ProLink
          href={authorLink}
          underline="always"
          sx={{
            color: 'inherit',
          }}
          onClick={(event) => {
            event.stopPropagation()
          }}
        >
          {author}
        </ProLink>
        {prompt.update_time && (
          <span>
            <Typography variant="caption" fontSize={12}>
              ·
            </Typography>
            <Typography variant="caption" fontSize={12}>
              {dayjs.utc(prompt.update_time).fromNow()}
            </Typography>
          </span>
        )}
      </Stack>
      <EllipsisTextWithTooltip
        tip={prompt.teaser}
        color={'text.secondary'}
        fontSize={16}
        sx={{
          lineHeight: '20px',
          whiteSpace: 'normal',
          wordBreak: 'break-word',
          minHeight: 60,
        }}
      >
        <PromptTypeList
          typeList={prompt.variable_types}
          variables={prompt.variables}
        />
        {prompt.teaser}
      </EllipsisTextWithTooltip>
    </Stack>
  )
}

const PromptCardTag: FC<{ tag: string }> = (props) => {
  const { tag } = props
  return (
    <Box>
      <Typography
        sx={(t) => {
          const isDark = t.palette.mode === 'dark'
          return {
            borderRadius: '4px',
            display: 'inline-flex',
            bgcolor: isDark ? 'rgba(255, 255, 255, 0.16)' : 'rgb(235,235,235)',
            color: isDark ? '#fff' : 'text.secondary',
            fontSize: '14px',
            lineHeight: '20px',
            px: 0.5,
          }
        }}
      >
        {tag}
      </Typography>
    </Box>
  )
}

export default PromptLibraryCard
