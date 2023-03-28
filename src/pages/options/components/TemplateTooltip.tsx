import { IconButton, Box, Popover, Stack } from '@mui/material'
import HelpOutlineIcon from '@mui/icons-material/HelpOutline'
import React, { useState } from 'react'
import Typography from '@mui/material/Typography'
import { templateWordToDescription } from '@/features/shortcuts/utils'
import CopyTooltipIconButton from '@/components/CopyTooltipIconButton'

const PopperId = 'tempalte-description-tooltip'

const TEMPLATE_STATIC_WORDS = ['GMAIL_EMAIL_CONTEXT', 'GMAIL_DRAFT_CONTEXT']

const WordItem = (props: { word: string }) => {
  const { word } = props
  return (
    <Stack>
      <Typography
        variant="body2"
        sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}
      >
        {`{{${word}}}`} <CopyTooltipIconButton copyText={`{{${word}}}`} />
      </Typography>
      <Typography variant="body2">{templateWordToDescription(word)}</Typography>
    </Stack>
  )
}

const TemplateTooltip = () => {
  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null)

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget)
  }

  const handleClose = () => {
    setAnchorEl(null)
  }

  const open = Boolean(anchorEl)
  const id = open ? PopperId : undefined

  return (
    <Box>
      <IconButton aria-describedby={PopperId} onClick={handleClick}>
        <HelpOutlineIcon fontSize="small" />
      </IconButton>
      <Popover
        id={id}
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'left',
        }}
      >
        <Box maxWidth={360} maxHeight={420} overflow="auto" p={1}>
          <Typography variant="body2">
            The prompt template will render based on the variables when the menu
            option is selected and then be input into ChatGPT. The template can
            include any number of pre-defined variables or none at all.
            <br />
            <br />
            Here are the variables that you can use in the prompt template:
            <br />
            ----
          </Typography>
          {TEMPLATE_STATIC_WORDS.map((word, index) => {
            return (
              <>
                <WordItem key={word} word={word} />
                {TEMPLATE_STATIC_WORDS.length - 1 !== index ? (
                  <Typography key={`${word}-divider`}>----</Typography>
                ) : null}
              </>
            )
          })}
        </Box>
      </Popover>
    </Box>
  )
}

export default TemplateTooltip
