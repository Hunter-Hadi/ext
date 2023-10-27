import React, { FC, useMemo, useState } from 'react'
import { IAIResponseOriginalMessageSourceLink } from '@/features/chatgpt/types'
import Stack from '@mui/material/Stack'
import { Box, Card, Grid, Link, Skeleton } from '@mui/material'
import Typography from '@mui/material/Typography'
import { SEARCH_WITH_AI_DEFAULT_CRAWLING_LIMIT } from '@/features/searchWithAI/constants'
import useSidebarSettings from '@/features/sidebar/hooks/useSidebarSettings'

const SidebarAIMessageCopilotStep: FC<{
  loading?: boolean
  sourceLinks: IAIResponseOriginalMessageSourceLink[]
}> = (props) => {
  const { sidebarBreakpoints } = useSidebarSettings()
  const { sourceLinks, loading } = props
  const [expandAll, setExpandAll] = useState(false)
  const currentRenderSourceLinks = useMemo(() => {
    if (expandAll) {
      return sourceLinks
    }
    return sourceLinks.length > 6 ? sourceLinks.slice(0, 5) : sourceLinks
  }, [expandAll, sourceLinks])
  const hiddenFavicons = useMemo(() => {
    if (expandAll) {
      return []
    }
    return sourceLinks.length > 6
      ? sourceLinks
          .slice(5)
          .map((sourceLink) => sourceLink.favicon)
          .filter(Boolean)
      : []
  }, [expandAll, sourceLinks])
  const itemWidth = useMemo(() => {
    if (sidebarBreakpoints === 'xs' || sidebarBreakpoints === 'sm') {
      return 6
    } else if (sidebarBreakpoints === 'md') {
      return 4
    } else if (sidebarBreakpoints === 'lg' || sidebarBreakpoints === 'xl') {
      return 3
    }
    return 6
  }, [sidebarBreakpoints])
  return (
    <Grid
      container
      spacing={1}
      sx={{
        ml: `-8px!important`,
      }}
    >
      {loading ? (
        Array(SEARCH_WITH_AI_DEFAULT_CRAWLING_LIMIT)
          .fill('')
          .map((_, index) => (
            <Grid item xs={itemWidth} key={index}>
              <Skeleton variant="rounded" width={'100%'} height={60} />
            </Grid>
          ))
      ) : (
        <>
          {currentRenderSourceLinks.map((source, index) => (
            <Grid item xs={itemWidth} key={source.title}>
              <Card variant="outlined">
                <Link href={source.url} target={'_blank'} underline="none">
                  <Stack p={1} spacing={0.5}>
                    <Typography
                      fontSize={14}
                      color="text.primary"
                      noWrap
                      sx={{
                        p: 0,
                      }}
                    >
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
                          alt={source?.from}
                          width="100%"
                          height="100%"
                        />
                      </Box>
                      <Typography fontSize={12} color="text.secondary" noWrap>
                        {source?.from}
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
          {!expandAll && sourceLinks.length > 6 && (
            <Grid
              item
              xs={itemWidth}
              onClick={() => {
                setExpandAll(true)
              }}
            >
              <Card variant="outlined">
                <Link href={'#'} underline="none">
                  <Stack p={1} spacing={1}>
                    <Stack direction={'row'} spacing={1}>
                      {hiddenFavicons.map((hiddenFavicon, index) => {
                        return (
                          <Box
                            key={index + hiddenFavicon}
                            width={16}
                            height={16}
                            borderRadius="50%"
                            overflow="hidden"
                            flexShrink={0}
                          >
                            <img
                              src={hiddenFavicon}
                              width="100%"
                              height="100%"
                            />
                          </Box>
                        )
                      })}
                    </Stack>
                    <Stack direction={'row'} alignItems="center" spacing={0.5}>
                      <Typography
                        fontSize={12}
                        color="text.secondary"
                        flexShrink={0}
                      >
                        View {hiddenFavicons.length} more
                      </Typography>
                    </Stack>
                  </Stack>
                </Link>
              </Card>
            </Grid>
          )}
        </>
      )}
    </Grid>
  )
}

export default SidebarAIMessageCopilotStep