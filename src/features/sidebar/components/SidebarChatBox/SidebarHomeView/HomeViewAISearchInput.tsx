import SearchOutlinedIcon from '@mui/icons-material/SearchOutlined'
import CircularProgress from '@mui/material/CircularProgress'
import IconButton from '@mui/material/IconButton'
import InputAdornment from '@mui/material/InputAdornment'
import OutlinedInput from '@mui/material/OutlinedInput'
import Stack from '@mui/material/Stack'
import React, { FC, useEffect } from 'react'
import { useTranslation } from 'react-i18next'

import { useClientConversation } from '@/features/chatgpt/hooks/useClientConversation'
import useSearchWithAI from '@/features/sidebar/hooks/useSearchWithAI'
import useSidebarSettings from '@/features/sidebar/hooks/useSidebarSettings'

interface IHomeViewAISearchInputProps {}

const HomeViewAISearchInput: FC<IHomeViewAISearchInputProps> = () => {
  const { createSearchWithAI } = useSearchWithAI()
  const { createConversation } = useClientConversation()
  const {currentSidebarConversationType,updateSidebarConversationType} = useSidebarSettings()

  // const { cleanConversation } = useClientConversation()

  // const { updateSidebarConversationType } = useSidebarSettings()

  const { t } = useTranslation(['client'])

  const [loading, setLoading] = React.useState(false)
  const [waitAskQuestion, setWaitAskQuestion] = React.useState('')
  const onceRef = React.useRef(false)
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    if (!e?.target) {
      return
    }

    const target = e.target as HTMLFormElement

    const formData = new FormData(target)

    const question = formData.get('searchValue') as string

    if (!question) {
      return
    }

    setLoading(true)
    await createConversation('Search')
    updateSidebarConversationType('Search')
    onceRef.current = true
    setWaitAskQuestion(question)
    target.reset()

    setLoading(false)
  }
  useEffect(() => {
    if (waitAskQuestion && currentSidebarConversationType === 'Search' && onceRef.current) {
      onceRef.current = false
      createSearchWithAI(waitAskQuestion, false)
      setWaitAskQuestion('')
    }
  }, [waitAskQuestion, currentSidebarConversationType, createSearchWithAI])
  return (
    <Stack
      direction="row"
      sx={(t) => {
        const isDark = t.palette.mode === 'dark'

        return {
          width: '100%',
          height: '100%',
          bgcolor: isDark ? 'customColor.secondaryBackground' : '#F5F6F7',

          '&:hover': {
            bgcolor: isDark
              ? 'rgba(255, 255, 255, 0.10)'
              : 'rgba(0, 0, 0, 0.10)',
          },

          borderRadius: 2,

          '& > form': {
            width: '100%',
          },
        }
      }}
    >
      <form onSubmit={handleSubmit} autoComplete="off">
        <OutlinedInput
          size="small"
          placeholder={t('client:home_view_content_nav__ai_search_placeholder')}
          name="searchValue"
          disabled={loading}
          sx={{
            pr: 1,
            pl: 0,
            width: '100%',
            height: '100%',
            fontSize: 14,
            '& > fieldset': {
              borderColor: 'transparent !important',
            },
          }}
          startAdornment={
            <InputAdornment position="end" sx={{ ml: '3px', mr: '0px' }}>
              <IconButton
                type="submit"
                size="small"
                sx={{ color: 'text.primary' }}
              >
                {loading ? (
                  <CircularProgress size={20} sx={{ m: '0 auto' }} />
                ) : (
                  <SearchOutlinedIcon
                    sx={{
                      fontSize: 24,
                    }}
                  />
                )}
              </IconButton>
            </InputAdornment>
          }
        />
      </form>
    </Stack>
  )
}

export default HomeViewAISearchInput
