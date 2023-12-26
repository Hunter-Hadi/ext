import LanguageOutlinedIcon from '@mui/icons-material/LanguageOutlined'
import LockOutlinedIcon from '@mui/icons-material/LockOutlined'
import Box from '@mui/material/Box'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
import utc from 'dayjs/plugin/utc'
import React, { FC, useMemo } from 'react'

import EllipsisTextWithTooltip from '@/features/common/components/EllipsisTextWithTooltip'
import ProLink from '@/features/common/components/ProLink'
import {
  MAXAI_CHROME_EXTENSION_APP_HOMEPAGE_URL,
  MAXAI_CHROME_EXTENSION_WWW_HOMEPAGE_URL,
} from '@/features/common/constants'
import {
  DeleteIconButton,
  EditIconButton,
  FavoriteIconButton,
  SeeIconButton,
} from '@/features/prompt_library/components/PromptLibrary/PromptLibraryCard/PromptLibraryCardActions'
import PromptTypeList from '@/features/prompt_library/components/PromptLibrary/PromptLibraryCard/PromptTypeList'
import {
  DEFAULT_PROMPT_AUTHOR,
  DEFAULT_PROMPT_AUTHOR_LINK,
} from '@/features/prompt_library/constant'
import usePromptActions from '@/features/prompt_library/hooks/usePromptActions'
import usePromptLibrary from '@/features/prompt_library/hooks/usePromptLibrary'
import {
  IPromptActionKey,
  IPromptLibraryCardData,
} from '@/features/prompt_library/types'
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
    const pageHost = (window.location.host || location.host)
      .replace(/^www\./, '')
      .replace(/:\d+$/, '')
    const currentHost = MAXAI_CHROME_EXTENSION_WWW_HOMEPAGE_URL.includes(
      pageHost,
    )
      ? MAXAI_CHROME_EXTENSION_WWW_HOMEPAGE_URL
      : MAXAI_CHROME_EXTENSION_APP_HOMEPAGE_URL
    return prompt.type === 'private'
      ? `${currentHost}/prompts/own/${prompt.id}`
      : `${currentHost}/prompts/${prompt.id}`
  }, [prompt])

  const actionBtnList = () => {
    const btnList: React.ReactNode[] = []
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
          textAlign: 'left',
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
        <Stack direction="row" fontSize={'16px'} height="max-content">
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
            fontSize: '12px',
            color: isDark ? 'rgba(255, 255, 255, 0.6)' : 'rgba(0, 0, 0, 0.6)',
          }
        }}
      >
        {prompt?.type === 'private' ? (
          <LockOutlinedIcon fontSize="inherit" />
        ) : (
          <LanguageOutlinedIcon fontSize="inherit" />
        )}
        <Typography variant="caption" fontSize={'12px'}>
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
            <Typography variant="caption" fontSize={'12px'}>
              ·
            </Typography>
            <Typography variant="caption" fontSize={'12px'}>
              {dayjs.utc(prompt.update_time).fromNow()}
            </Typography>
          </span>
        )}
      </Stack>
      <EllipsisTextWithTooltip
        variant={'custom'}
        tip={prompt.teaser}
        color={'text.secondary'}
        sx={{
          fontSize: '16px',
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
        variant={'custom'}
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
