import {
  Box,
  Card,
  Grid,
  Link,
  Skeleton,
  Stack,
  Typography,
} from '@mui/material'
import React, { useMemo } from 'react'
import { SEARCH_WITH_AI_DEFAULT_CRAWLING_LIMIT } from '../constants'
import useSearchWithAISources from '../hooks/useSearchWithAISources'
import { CaptivePortalIcon } from './SearchWithAIIcons'

const AISearchSources = () => {
  const { loading, sources } = useSearchWithAISources()

  const isEmpty = useMemo(() => loading === false && sources.length === 0, [
    loading,
    sources,
  ])

  if (isEmpty) return null

  return (
    <Box pb={3}>
      <Stack direction={'row'} alignItems="center" spacing={1} mb={1}>
        <CaptivePortalIcon
          sx={{
            color: 'primary.main',
            fontSize: 20,
          }}
        />
        <Typography
          sx={{
            color: 'primary.main',
            fontSize: 18,
          }}
        >
          Sources
        </Typography>
      </Stack>

      {loading && (
        <Grid container spacing={1}>
          {Array(SEARCH_WITH_AI_DEFAULT_CRAWLING_LIMIT)
            .fill('')
            .map((_, index) => (
              <Grid item xs={6} key={index}>
                <Skeleton variant="rounded" width={'100%'} height={60} />
              </Grid>
            ))}
        </Grid>
      )}

      {!loading && sources.length > 0 ? (
        <Grid container spacing={1}>
          {sources.map((source, index) => (
            <Grid item xs={6} key={source.title}>
              <Card variant="outlined">
                <Link href={source.url} target={'_blank'} underline="none">
                  <Stack p={1} spacing={0.5}>
                    <Typography fontSize={14} color="text.primary" noWrap>
                      {source.title}
                    </Typography>
                    <Stack direction={'row'} alignItems="center" spacing={0.5}>
                      <Box
                        width={16}
                        height={16}
                        borderRadius="50%"
                        overflow="hidden"
                        flexShrink={0}
                      >
                        <img
                          src={source.favicon}
                          alt={source.from}
                          width="100%"
                          height="100%"
                        />
                      </Box>
                      <Typography fontSize={12} color="text.secondary" noWrap>
                        {source.from}
                      </Typography>
                      <Typography
                        fontSize={12}
                        color="text.secondary"
                        flexShrink={0}
                      >
                        · {index + 1}
                      </Typography>
                    </Stack>
                  </Stack>
                </Link>
              </Card>
            </Grid>
          ))}
        </Grid>
      ) : null}
    </Box>
  )
}

export default AISearchSources
