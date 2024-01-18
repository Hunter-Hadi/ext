import Box from '@mui/material/Box'
import Skeleton from '@mui/material/Skeleton'
import Stack from '@mui/material/Stack'
import React, { FC } from 'react'

import { getChromeExtensionAssetsURL } from '@/utils/imageHelper'

const SidebarAIMessageSkeletonContent: FC<{
  contentType?: 'text' | 'image'
}> = (props) => {
  const { contentType = 'text' } = props
  if (contentType === 'image') {
    return (
      <Stack mt={1} width={'60%'} minWidth={415}>
        <Stack
          width={'100%'}
          sx={{
            position: 'relative',
            paddingBottom: '100%',
            bgcolor: '#F4F4F7',
            borderRadius: '8px',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Box
            sx={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
            }}
          />
          <img
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%,-50%)',
            }}
            width={64}
            height={64}
            src={getChromeExtensionAssetsURL('/images/art/creating-image.gif')}
            alt="Creating image"
          />
        </Stack>
      </Stack>
    )
  }
  return (
    <Stack mt={1}>
      <Skeleton animation="wave" height={10} />
      <Skeleton animation="wave" height={10} />
      <Skeleton animation="wave" height={10} />
      <Skeleton animation="wave" height={10} />
      <Skeleton animation="wave" height={10} />
      <Skeleton animation="wave" height={10} />
    </Stack>
  )
}
export default SidebarAIMessageSkeletonContent
