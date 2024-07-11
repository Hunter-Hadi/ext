import { SubdirectoryArrowRight } from '@mui/icons-material'
import { Box } from '@mui/material'
import React from 'react'
import { FC, useMemo } from 'react'

// import { useTranslation } from 'react-i18next'
import { useRangy } from '../../hooks'

const ContextText: FC = () => {
  // const { t } = useTranslation(['client'])
  const { currentSelection } = useRangy()

  const text = useMemo(
    () =>
      (
        currentSelection?.selectionElement?.editableElementSelectionText ||
        currentSelection?.selectionElement?.selectionText ||
        ''
      )
        .trim()
        .replace(/\u200B/g, ''),
    [currentSelection],
  )

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'row',
        boxSizing: 'border-box',
        padding: '8px',
        margin: '10px 0',
        borderRadius: '8px',
        alignItems: 'center',
        // backgroundColor: '#F4F4F4',
        gap: '8px',
        bgcolor: (t) =>
          t.palette.mode === 'dark'
            ? 'rgba(59, 61, 62, 1)'
            : 'rgba(244, 244, 244, 1)',
        color: (t) =>
          t.palette.mode === 'dark'
            ? 'rgba(255, 255, 255, 0.38)'
            : 'rgba(0, 0, 0, 0.38)',
        width: '100%',
      }}
    >
      <SubdirectoryArrowRight
        sx={{
          height: '16px',
        }}
      />
      <Box
        sx={{
          flex: 1,
          whiteSpace: 'nowrap',
          textOverflow: 'ellipsis',
          fontSize: '14px',
          fontWeight: '400',
          overflow: 'hidden',
        }}
      >
        {text}
      </Box>
    </Box>
  )
}

export default ContextText
