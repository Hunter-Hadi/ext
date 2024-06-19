import { Box, Card, Link, Stack, Typography } from '@mui/material'
import React from 'react'

import MultiLineEllipsisTypography from '@/components/MultiLineEllipsisTypography'
import { IAIResponseOriginalMessageSourceLink } from '@/features/indexed_db/conversations/models/Message'

interface CitationTooltipContentProps {
  source: IAIResponseOriginalMessageSourceLink
}

/**
 * 引用(citation) 的 hover tooltip内容
 */
const CitationTooltipContent: React.FC<CitationTooltipContentProps> = ({
  source,
}) => {
  return (
    <Card
      className='citation-tooltp-card'
      variant='outlined'
      sx={{ width: 300 }}
    >
      <Stack
        spacing={0.5}
        sx={{
          pt: 1,
          pb: 1,
          pl: 2,
          pr: 2,
        }}
      >
        <Stack direction={'row'} alignItems='center' spacing={0.5}>
          <Box
            width={16}
            height={16}
            borderRadius='50%'
            overflow='hidden'
            flexShrink={0}
          >
            <img
              src={source.favicon}
              alt={source?.from}
              width='100%'
              height='100%'
            />
          </Box>
          <Typography fontSize={12} color='text.secondary' noWrap>
            {source?.from}
          </Typography>
        </Stack>
        <Link href={source.url} target={'_blank'} underline='none'>
          <MultiLineEllipsisTypography
            maxLine={2}
            fontSize={14}
            color='text.primary'
            sx={{
              p: 0,
              '&:hover': {
                color: '#4169E1',
              },
            }}
          >
            {source.title}
          </MultiLineEllipsisTypography>
        </Link>
        <MultiLineEllipsisTypography
          maxLine={3}
          fontSize={13}
          color='text.secondary'
        >
          {source.body}
        </MultiLineEllipsisTypography>
      </Stack>
    </Card>
  )
}

export default CitationTooltipContent
