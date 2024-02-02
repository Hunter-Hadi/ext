import Button, { ButtonProps } from '@mui/material/Button'
import { styled } from '@mui/material/styles'
import * as React from 'react'

const VisuallyHiddenInput = styled('input')({
  clip: 'rect(0 0 0 0)',
  clipPath: 'inset(50%)',
  height: 1,
  overflow: 'hidden',
  position: 'absolute',
  bottom: 0,
  left: 0,
  whiteSpace: 'nowrap',
  width: 1,
})

interface IUploadButtonProps extends ButtonProps {
  accept?: string
}

const UploadButton: React.FC<IUploadButtonProps> = (props) => {
  const { children, variant = 'contained', accept, ...restProps } = props
  return (
    <Button component="label" variant={variant} {...(restProps as any)}>
      {children}
      <VisuallyHiddenInput type="file" accept={accept} />
    </Button>
  )
}

export default UploadButton
