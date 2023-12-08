import { Link as MuiLink, LinkProps } from '@mui/material'
import React, { FC, useRef } from 'react'

interface IProLinkProps extends LinkProps {
  href?: string
  underline?: LinkProps['underline']
}

// TODO: maybe can refine ?
const ProLink: FC<IProLinkProps> = (props) => {
  const { href, underline = 'none', ...rest } = props
  const ref = useRef<HTMLAnchorElement>(null)

  return (
    <MuiLink
      target={'_blank'}
      ref={ref}
      href={href ?? '#'}
      component={'a'}
      underline={underline}
      {...rest}
    />
  )
}

export default ProLink
