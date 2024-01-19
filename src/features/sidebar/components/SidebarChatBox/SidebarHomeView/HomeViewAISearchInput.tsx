import SearchOutlinedIcon from '@mui/icons-material/SearchOutlined'
import CircularProgress from '@mui/material/CircularProgress'
import IconButton from '@mui/material/IconButton'
import InputAdornment from '@mui/material/InputAdornment'
import OutlinedInput from '@mui/material/OutlinedInput'
import Stack from '@mui/material/Stack'
import { SxProps } from '@mui/material/styles'
import React, { FC } from 'react'

import { useClientConversation } from '@/features/chatgpt/hooks/useClientConversation'
import useSearchWithAI from '@/features/sidebar/hooks/useSearchWithAI'

interface IHomeViewAISearchInputProps {
  sx?: SxProps
}

const HomeViewAISearchInput: FC<IHomeViewAISearchInputProps> = ({ sx }) => {
  const { createSearchWithAI } = useSearchWithAI()

  const { cleanConversation } = useClientConversation()

  const [loading, setLoading] = React.useState(false)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    if (!e?.target) {
      return
    }

    const formData = new FormData(e.target as HTMLFormElement)

    const question = formData.get('searchValue') as string

    if (!question) {
      return
    }

    setLoading(true)
    await cleanConversation()
    await createSearchWithAI(question, true)
    setLoading(false)
  }

  return (
    <Stack
      direction="row"
      sx={{
        width: '100%',
        bgcolor: 'rgba(233, 233, 235, 0.6)',
        borderRadius: 2,

        '& > form': {
          width: '100%',
        },
        ...sx,
      }}
    >
      <form onSubmit={handleSubmit}>
        <OutlinedInput
          size="small"
          placeholder="AI Search"
          name="searchValue"
          disabled={loading}
          sx={{
            p: 1,
            pr: 2,
            width: '100%',
            '& > fieldset': {
              borderColor: 'transparent !important',
            },
          }}
          endAdornment={
            <InputAdornment position="end">
              <IconButton type="submit" size="small">
                {loading ? (
                  <CircularProgress size={20} sx={{ m: '0 auto' }} />
                ) : (
                  <SearchOutlinedIcon />
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
