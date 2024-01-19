import SearchOutlinedIcon from '@mui/icons-material/SearchOutlined'
import SummarizeOutlinedIcon from '@mui/icons-material/SummarizeOutlined'
import SvgIcon from '@mui/material/SvgIcon'
import React, { FC, useMemo } from 'react'

const SidebarTabIcons: FC<{ icon: string }> = ({ icon }) => {
  const memoSx = useMemo(() => {
    return {
      fontSize: 24,
      color: 'inherit',
    }
  }, [])

  if (icon === 'Chat') {
    return (
      <SvgIcon sx={memoSx}>
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 25" fill="none">
          <g mask="url(#mask0_6341_60613)">
            <path
              d="M7 18.377C6.71667 18.377 6.47917 18.2811 6.2875 18.0895C6.09583 17.8978 6 17.6603 6 17.377V15.377H19V6.37695H21C21.2833 6.37695 21.5208 6.47279 21.7125 6.66445C21.9042 6.85612 22 7.09362 22 7.37695V22.377L18 18.377H7ZM2 17.377V3.37695C2 3.09362 2.09583 2.85612 2.2875 2.66445C2.47917 2.47279 2.71667 2.37695 3 2.37695H16C16.2833 2.37695 16.5208 2.47279 16.7125 2.66445C16.9042 2.85612 17 3.09362 17 3.37695V12.377C17 12.6603 16.9042 12.8978 16.7125 13.0895C16.5208 13.2811 16.2833 13.377 16 13.377H6L2 17.377ZM15 11.377V4.37695H4V11.377H15Z"
              fill="currentColor"
            />
          </g>
        </svg>
      </SvgIcon>
    )
  }
  if (icon === 'Summary') {
    return <SummarizeOutlinedIcon sx={memoSx} />
  }
  if (icon === 'Search') {
    return <SearchOutlinedIcon sx={memoSx} />
  }
  if (icon === 'Art') {
    return (
      <SvgIcon sx={memoSx}>
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 25" fill="none">
          <g mask="url(#mask0_6906_93405)">
            <path
              d="M12 22.377C10.6333 22.377 9.34167 22.1145 8.125 21.5895C6.90833 21.0645 5.84583 20.3478 4.9375 19.4395C4.02917 18.5311 3.3125 17.4686 2.7875 16.252C2.2625 15.0353 2 13.7436 2 12.377C2 10.9936 2.27083 9.69362 2.8125 8.47695C3.35417 7.26029 4.0875 6.20195 5.0125 5.30195C5.9375 4.40195 7.01667 3.68945 8.25 3.16445C9.48333 2.63945 10.8 2.37695 12.2 2.37695C13.5333 2.37695 14.7917 2.60612 15.975 3.06445C17.1583 3.52279 18.1958 4.15612 19.0875 4.96445C19.9792 5.77279 20.6875 6.73112 21.2125 7.83945C21.7375 8.94779 22 10.1436 22 11.427C22 13.3436 21.4167 14.8145 20.25 15.8395C19.0833 16.8645 17.6667 17.377 16 17.377H14.15C14 17.377 13.8958 17.4186 13.8375 17.502C13.7792 17.5853 13.75 17.677 13.75 17.777C13.75 17.977 13.875 18.2645 14.125 18.6395C14.375 19.0145 14.5 19.4436 14.5 19.927C14.5 20.7603 14.2708 21.377 13.8125 21.777C13.3542 22.177 12.75 22.377 12 22.377ZM6.5 13.377C6.93333 13.377 7.29167 13.2353 7.575 12.952C7.85833 12.6686 8 12.3103 8 11.877C8 11.4436 7.85833 11.0853 7.575 10.802C7.29167 10.5186 6.93333 10.377 6.5 10.377C6.06667 10.377 5.70833 10.5186 5.425 10.802C5.14167 11.0853 5 11.4436 5 11.877C5 12.3103 5.14167 12.6686 5.425 12.952C5.70833 13.2353 6.06667 13.377 6.5 13.377ZM9.5 9.37695C9.93333 9.37695 10.2917 9.23529 10.575 8.95195C10.8583 8.66862 11 8.31029 11 7.87695C11 7.44362 10.8583 7.08529 10.575 6.80195C10.2917 6.51862 9.93333 6.37695 9.5 6.37695C9.06667 6.37695 8.70833 6.51862 8.425 6.80195C8.14167 7.08529 8 7.44362 8 7.87695C8 8.31029 8.14167 8.66862 8.425 8.95195C8.70833 9.23529 9.06667 9.37695 9.5 9.37695ZM14.5 9.37695C14.9333 9.37695 15.2917 9.23529 15.575 8.95195C15.8583 8.66862 16 8.31029 16 7.87695C16 7.44362 15.8583 7.08529 15.575 6.80195C15.2917 6.51862 14.9333 6.37695 14.5 6.37695C14.0667 6.37695 13.7083 6.51862 13.425 6.80195C13.1417 7.08529 13 7.44362 13 7.87695C13 8.31029 13.1417 8.66862 13.425 8.95195C13.7083 9.23529 14.0667 9.37695 14.5 9.37695ZM17.5 13.377C17.9333 13.377 18.2917 13.2353 18.575 12.952C18.8583 12.6686 19 12.3103 19 11.877C19 11.4436 18.8583 11.0853 18.575 10.802C18.2917 10.5186 17.9333 10.377 17.5 10.377C17.0667 10.377 16.7083 10.5186 16.425 10.802C16.1417 11.0853 16 11.4436 16 11.877C16 12.3103 16.1417 12.6686 16.425 12.952C16.7083 13.2353 17.0667 13.377 17.5 13.377ZM12 20.377C12.15 20.377 12.2708 20.3353 12.3625 20.252C12.4542 20.1686 12.5 20.0603 12.5 19.927C12.5 19.6936 12.375 19.4186 12.125 19.102C11.875 18.7853 11.75 18.3103 11.75 17.677C11.75 16.977 11.9917 16.4186 12.475 16.002C12.9583 15.5853 13.55 15.377 14.25 15.377H16C17.1 15.377 18.0417 15.0561 18.825 14.4145C19.6083 13.7728 20 12.777 20 11.427C20 9.41029 19.2292 7.73112 17.6875 6.38945C16.1458 5.04779 14.3167 4.37695 12.2 4.37695C9.93333 4.37695 8 5.15195 6.4 6.70195C4.8 8.25195 4 10.1436 4 12.377C4 14.5936 4.77917 16.4811 6.3375 18.0395C7.89583 19.5978 9.78333 20.377 12 20.377Z"
              fill="currentColor"
            />
          </g>
        </svg>
      </SvgIcon>
    )
  }

  return null
}

export default SidebarTabIcons
