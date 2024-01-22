import SearchOutlinedIcon from '@mui/icons-material/SearchOutlined'
import CircularProgress from '@mui/material/CircularProgress'
import IconButton from '@mui/material/IconButton'
import InputAdornment from '@mui/material/InputAdornment'
import OutlinedInput from '@mui/material/OutlinedInput'
import Stack from '@mui/material/Stack'
import React, { FC } from 'react'

import useSearchWithAI from '@/features/sidebar/hooks/useSearchWithAI'

interface IHomeViewAISearchInputProps {}

const HomeViewAISearchInput: FC<IHomeViewAISearchInputProps> = () => {
  const { createSearchWithAI } = useSearchWithAI()

  // const { cleanConversation } = useClientConversation()

  // const { updateSidebarConversationType } = useSidebarSettings()

  const [loading, setLoading] = React.useState(false)

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
    await createSearchWithAI(question, false)

    target.reset()

    setLoading(false)
  }

  return (
    <Stack
      direction="row"
      sx={(t) => {
        const isDark = t.palette.mode === 'dark'

        return {
          width: '100%',
          height: '100%',
          bgcolor: isDark
            ? 'rgba(59, 61, 62, 0.60)'
            : 'rgba(233, 233, 235, 0.60)',

          '&:hover': {
            bgcolor: isDark
              ? 'rgba(59, 61, 62, 0.80)'
              : 'rgba(233, 233, 235, 0.80)',
          },

          borderRadius: 2,

          '& > form': {
            width: '100%',
          },
        }
      }}
    >
      <form onSubmit={handleSubmit}>
        <OutlinedInput
          size="small"
          placeholder="AI Search"
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
            '& > input::placeholder': {
              color: 'inherit',
              opacity: 1,
            },
          }}
          startAdornment={
            <InputAdornment position="end" sx={{ ml: '3px', mr: '3px' }}>
              <IconButton type="submit" size="small">
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
