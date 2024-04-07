import CloseIcon from '@mui/icons-material/Close'
import Box from '@mui/material/Box'
import Fade from '@mui/material/Fade'
import IconButton from '@mui/material/IconButton'
import Modal, { ModalProps } from '@mui/material/Modal'
import Paper from '@mui/material/Paper'
import { lighten, SxProps } from '@mui/material/styles'
import React, { FC } from 'react'

interface IProps extends Omit<ModalProps, 'children' | 'onClose' | 'open'> {
  show: boolean
  onClose?: (reason?: string) => void
  sx?: SxProps
  bgTransparent?: boolean
  maxWidth?: string | number
  width?: string | number
  height?: string | number
  children?: JSX.Element
}

const CustomModal: FC<IProps> = ({
  children,
  show = false,
  sx,
  onClose,
  bgTransparent = false,
  maxWidth,
  width,
  height,
  ...restProps
}) => {
  const handleClose = (event: any, reason: string) => {
    if (onClose) onClose(reason)
  }

  return (
    <Modal open={show} onClose={handleClose} disablePortal {...restProps}>
      {/* 添加 React.Fragment 为了解决 modal 内部元素 focus 无效的问题 */}
      {/* reference: https://stackoverflow.com/questions/53951479/react-material-ui-modal-causing-an-error-with-the-tabindex */}
      <>
        <Fade in={show}>
          <Paper
            id="mui-modal"
            sx={[
              {
                width: width ?? '90vw',
                height: height ?? '90vh',
                maxWidth: maxWidth ?? 'lg',
                margin: '5vh auto',
                overflowY: 'auto',
                '&:focus-visible': {
                  outline: 'none',
                },
                bgcolor: (t) =>
                  t.palette.mode === 'dark'
                    ? lighten(t.palette.background.paper, 0.1)
                    : 'pageBackground',
                ...sx,
                tabIndex: '100',
              },
              // sx Array types
              // @see https://github.com/mui/material-ui/issues/32948
              bgTransparent &&
                ({
                  bgcolor: 'transparent',
                  boxShadow: 'none',
                } as any),
            ]}
          >
            <Box sx={{ position: 'fixed', top: 16, left: 16 }}>
              <IconButton
                data-testid="maxai-custom-modal-close-btn"
                onClick={() => {
                  onClose && onClose('closeBtn')
                }}
                sx={{
                  color: 'white',
                  bgcolor: '#616161',
                  '&:hover': {
                    bgcolor: '#7e7e7e',
                  },
                }}
              >
                <CloseIcon />
              </IconButton>
            </Box>
            {children}
          </Paper>
        </Fade>
      </>
    </Modal>
  )
}

export default CustomModal
