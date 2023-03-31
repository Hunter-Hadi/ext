import CloseIcon from '@mui/icons-material/Close';
import { Alert, Collapse, IconButton, Stack } from '@mui/material';
import { AlertProps } from '@mui/material/Alert/Alert';
import React, { FC, useEffect, useState } from 'react';

const CloseAlert: FC<AlertProps> = props => {
  const { sx, ...rest } = props;
  const [open, setOpen] = useState(true);
  const [boxOpen, setBoxOpen] = useState(true);
  useEffect(() => {
    if (!open) {
      setTimeout(() => setBoxOpen(false), 500);
    }
  }, [open]);
  return (
    <Stack
      direction={'row'}
      sx={{
        display: boxOpen ? 'flex' : 'none',
        width: (sx as any)?.width || '100%',
      }}
    >
      <Collapse
        in={open}
        sx={{
          width: (sx as any)?.width || '100%',
        }}
      >
        <Alert
          sx={sx}
          {...rest}
          action={
            props.action ? (
              props.action
            ) : (
              <IconButton
                aria-label='close'
                color='inherit'
                size='small'
                onClick={() => {
                  setOpen(false);
                }}
              >
                <CloseIcon fontSize='inherit' />
              </IconButton>
            )
          }
        />
      </Collapse>
    </Stack>
  );
};
export default CloseAlert;
