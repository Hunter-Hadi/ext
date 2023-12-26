import Typography from '@mui/material/Typography'
import React, { FC } from 'react'

const FormLabelRequiredFlag: FC = () => (
  <Typography
    component={'span'}
    fontSize={'inherit !important'}
    color="rgb(244, 67, 54)"
  >
    {' '}
    *
  </Typography>
)

export default FormLabelRequiredFlag
