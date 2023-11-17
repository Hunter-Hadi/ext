import React, { FC } from 'react'
import TextOnlyTooltip from '@/components/TextOnlyTooltip'
import Button from '@mui/material/Button'
import { MagicBookIcon } from '@/components/CustomIcon'
import { useTranslation } from 'react-i18next'
import Popper from '@mui/material/Popper'
import { Fade, PopperPlacementType } from '@mui/material'
import PromptLibrary from '@/features/prompt_library/components/PromptLibrary'
import Paper from '@mui/material/Paper'

const PromptLibraryIconButton: FC = () => {
  const { t } = useTranslation(['prompt_library'])
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null)
  const [open, setOpen] = React.useState(false)
  const [placement, setPlacement] = React.useState<PopperPlacementType>()
  const handleClick = (newPlacement: PopperPlacementType) => (
    event: React.MouseEvent<HTMLButtonElement>,
  ) => {
    setAnchorEl(event.currentTarget)
    setOpen((prev) => placement !== newPlacement || !prev)
    setPlacement(newPlacement)
  }

  return (
    <>
      <TextOnlyTooltip
        placement={'top'}
        title={t('prompt_library:use_prompt_library__title')}
      >
        <Button
          onClick={handleClick('top')}
          sx={{
            p: '5px',
            minWidth: 'unset',
          }}
          variant={'outlined'}
        >
          <MagicBookIcon sx={{ fontSize: '20px', color: 'primary.main' }} />
        </Button>
      </TextOnlyTooltip>
      <Popper open={open} anchorEl={anchorEl} placement={placement} transition>
        {({ TransitionProps }) => (
          <Fade {...TransitionProps} timeout={350}>
            <Paper
              elevation={0}
              sx={{
                minWidth: '80vw',
              }}
            >
              <PromptLibrary />
            </Paper>
          </Fade>
        )}
      </Popper>
    </>
  )
}
export default PromptLibraryIconButton
