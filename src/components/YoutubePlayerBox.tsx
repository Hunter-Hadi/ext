import { Box } from '@mui/material';
import React, { FC } from 'react';

const YoutubePlayerBox: FC<{ youtubeLink: string; borderRadius?: number }> = ({
  youtubeLink,
  borderRadius = 16,
}) => {
  return (
    <Box
      className='video-container'
      sx={{
        '&.video-container': {
          position: 'relative',
          paddingBottom: '56.25%' /* 16:9 */,
          height: 0,
        },
        '&.video-container iframe': {
          borderRadius: borderRadius + 'px',
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
        },
      }}
    >
      <iframe
        title='YouTube video player'
        width='560'
        height='315'
        src={youtubeLink}
        frameBorder='0'
        allow='accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture'
        allowFullScreen
      />
    </Box>
  );
};
export default YoutubePlayerBox;
