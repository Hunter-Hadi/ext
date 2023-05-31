import IconButton from '@mui/material/IconButton'
import Popover from '@mui/material/Popover'
import Stack from '@mui/material/Stack'
import Divider from '@mui/material/Divider'
import Box from '@mui/material/Box'
import HelpOutlineIcon from '@mui/icons-material/HelpOutline'
import React, { useState } from 'react'
import Typography from '@mui/material/Typography'
import {
  templateStaticWords,
  templateWordToExamples,
} from '@/features/shortcuts/utils'
import CopyTooltipIconButton from '@/components/CopyTooltipIconButton'
import YoutubePlayerBox from '@/components/YoutubePlayerBox'

const PopperId = 'tempalte-description-tooltip'

const WordItem = (props: { word: string }) => {
  const { word } = props
  const { description, examples } = templateWordToExamples(word)
  return (
    <Stack
      sx={{
        '.code': {
          borderRadius: '4px',
          px: '4px',
          py: '2px',
          fontWeight: 700,
          bgcolor: (t) =>
            t.palette.mode === 'dark' ? '#fff' : 'rgba(118, 1, 211, 0.1)',
          color: 'customColor.main',
        },
      }}
    >
      <Typography
        variant="body2"
        sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}
      >
        <span className={'code'}>{`{{${word}}}`}</span>{' '}
        <CopyTooltipIconButton copyText={`{{${word}}}`} />
      </Typography>
      {description && (
        <Typography variant="body2" whiteSpace={'pre-wrap'}>
          {description}
        </Typography>
      )}
      {examples && examples.length > 0 && (
        <Stack mt={2}>
          <Typography variant="body2" color={'text.secondary'}>
            Example phrases to use:
          </Typography>
          {examples.map((example, index) => (
            <Typography
              key={index}
              fontSize={14}
              sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}
            >
              <Box
                component={'span'}
                sx={{
                  width: 4,
                  height: 4,
                  borderRadius: '50%',
                  bgcolor: (t) =>
                    t.palette.mode === 'dark'
                      ? '#fff'
                      : 'rgba(118, 1, 211, 0.5)',
                  mx: 1,
                }}
              ></Box>
              <span className={'code'}>{example}</span>{' '}
              <CopyTooltipIconButton copyText={example} />
            </Typography>
          ))}
        </Stack>
      )}
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
        <Box maxWidth={'60vw'} maxHeight={420} overflow="auto" p={1}>
          <Typography variant="body2">
            The prompt template for ChatGPT.
            <br />
            <br />
            The template can include any number of the following pre-defined
            variables, or none at all:
            <br />
            <Divider sx={{ my: 1 }} />
          </Typography>
          {templateStaticWords.map((word, index) => {
            return (
              <>
                <WordItem key={word} word={word} />
                {templateStaticWords.length - 1 !== index ? (
                  <Divider sx={{ my: 1 }} />
                ) : null}
              </>
            )
          })}
        </Box>
      </Popover>
    </Box>
  )
}

const RunPromptTooltip = () => {
  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null)

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget)
  }

  const handleClose = () => {
    setAnchorEl(null)
  }

  const open = Boolean(anchorEl)
  const id = open ? 'run-prompt-tooltip' : undefined
  return (
    <Box>
      <IconButton aria-describedby={'run-prompt-tooltip'} onClick={handleClick}>
        <HelpOutlineIcon fontSize="small" />
      </IconButton>
      <Popover
        id={id}
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
      >
        <Box maxWidth={'600px'} maxHeight={420} overflow="auto" p={1}>
          <Typography variant="body2">
            <b>If this option is enabled</b>
          </Typography>
          <Typography variant="body2">
            {`The prompt will be sent to AI chat directly, which is the default "normal behavior". All prompt templates will have this option enabled by default.`}
          </Typography>
          <Divider sx={{ my: 1 }} />
          <Typography variant="body2">
            <b>If this option is disabled</b>
          </Typography>
          <Typography variant="body2">
            {`The prompt goes to the input box first,
            so you can modify or add additional information before sending it to
            AI chat.GPT.`}
          </Typography>
          <YoutubePlayerBox
            borderRadius={8}
            youtubeLink={'https://www.youtube.com/embed/URUQea_AfM4'}
          />
        </Box>
      </Popover>
    </Box>
  )
}

export { TemplateTooltip, RunPromptTooltip }
