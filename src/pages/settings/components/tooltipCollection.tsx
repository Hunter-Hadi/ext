import IconButton from '@mui/material/IconButton'
import Popover from '@mui/material/Popover'
import Stack from '@mui/material/Stack'
import Box from '@mui/material/Box'
import HelpOutlineIcon from '@mui/icons-material/HelpOutline'
import React, { useState } from 'react'
import Typography from '@mui/material/Typography'
import YoutubePlayerBox from '@/components/YoutubePlayerBox'
import { useTranslation } from 'react-i18next'

const PDFTooltip = () => {
  const { t } = useTranslation(['common', 'settings'])
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
        <HelpOutlineIcon sx={{ fontSize: 24 }} />
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
        <Stack
          spacing={2}
          maxWidth={'600px'}
          maxHeight={420}
          overflow="auto"
          p={1}
        >
          <Typography variant="body2">
            <b>
              {t(
                'settings:feature_card__appearance__field_pdf_viewer__tooltip__how_to_use__title',
              )}
            </b>
          </Typography>
          <Stack>
            <Typography variant="body2">
              {t(
                'settings:feature_card__appearance__field_pdf_viewer__tooltip__how_to_use__item1',
              )}
            </Typography>
            <Typography variant="body2">
              {t(
                'settings:feature_card__appearance__field_pdf_viewer__tooltip__how_to_use__item2',
              )}
            </Typography>
            <Typography variant="body2">
              {t(
                'settings:feature_card__appearance__field_pdf_viewer__tooltip__how_to_use__item3',
              )}
            </Typography>
            <Typography variant="body2">
              {t(
                'settings:feature_card__appearance__field_pdf_viewer__tooltip__how_to_use__item4',
              )}
            </Typography>
          </Stack>
          <Typography variant="body2">
            {t(
              'settings:feature_card__appearance__field_pdf_viewer__tooltip__how_to_use__item5',
            )}
          </Typography>
          <YoutubePlayerBox
            borderRadius={8}
            youtubeLink={'https://www.youtube.com/embed/Gvp3chuxzCk'}
          />
        </Stack>
      </Popover>
    </Box>
  )
}

export { PDFTooltip }
