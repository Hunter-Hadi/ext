import SvgIcon, { SvgIconProps } from '@mui/material/SvgIcon'
import React, { FC } from 'react'

const ReadIcon: FC<SvgIconProps> = (props) => {
  return (
    <SvgIcon {...props}>
      <svg
        viewBox="0 0 24 24"
        fill="CurrentColor"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M3.96429 3.19824H3V5.15421H3.96429H13.6071H14.5714V3.19824H13.6071H3.96429ZM3.96429 8.41415H3V10.3701H3.96429H20.0357H21V8.41415H20.0357H3.96429ZM3 13.6301V15.586H3.96429H13.6071H14.5714V13.6301H13.6071H3.96429H3ZM3.96429 18.846H3V20.8019H3.96429H20.0357H21V18.846H20.0357H3.96429Z"
          fill="CurrentColor"
        />
      </svg>
    </SvgIcon>
  )
}

const CaptivePortalIcon: FC<SvgIconProps> = (props) => {
  return (
    <SvgIcon {...props}>
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="none">
        <g mask="url(#mask0_1921_34815)">
          <path
            d="M7.83335 16.5879C7.58335 16.1296 7.3646 15.6539 7.1771 15.1608C6.9896 14.6678 6.83335 14.1573 6.70835 13.6296H4.25002C4.6528 14.324 5.15627 14.9282 5.76044 15.4421C6.3646 15.9559 7.05558 16.3379 7.83335 16.5879ZM3.54169 11.9629H6.37502C6.33335 11.6851 6.3021 11.4108 6.28127 11.14C6.26044 10.8691 6.25002 10.5879 6.25002 10.2962C6.25002 10.0046 6.26044 9.72331 6.28127 9.45247C6.3021 9.18164 6.33335 8.90733 6.37502 8.62956H3.54169C3.47224 8.90733 3.42016 9.18164 3.38544 9.45247C3.35071 9.72331 3.33335 10.0046 3.33335 10.2962C3.33335 10.5879 3.35071 10.8691 3.38544 11.14C3.42016 11.4108 3.47224 11.6851 3.54169 11.9629ZM4.25002 6.96289H6.70835C6.83335 6.43511 6.9896 5.9247 7.1771 5.43164C7.3646 4.93859 7.58335 4.46289 7.83335 4.00456C7.05558 4.25456 6.3646 4.6365 5.76044 5.15039C5.15627 5.66428 4.6528 6.26845 4.25002 6.96289ZM8.41669 6.96289H11.5834C11.4167 6.35178 11.2014 5.77539 10.9375 5.23372C10.6736 4.69206 10.3611 4.17122 10 3.67122C9.63891 4.17122 9.32641 4.69206 9.06252 5.23372C8.79863 5.77539 8.58335 6.35178 8.41669 6.96289ZM13.2917 6.96289H15.75C15.3472 6.26845 14.8438 5.66428 14.2396 5.15039C13.6354 4.6365 12.9445 4.25456 12.1667 4.00456C12.4167 4.46289 12.6354 4.93859 12.8229 5.43164C13.0104 5.9247 13.1667 6.43511 13.2917 6.96289ZM10 18.6296C8.86113 18.6296 7.78474 18.4108 6.77085 17.9733C5.75696 17.5358 4.87155 16.9386 4.1146 16.1816C3.35766 15.4247 2.76044 14.5393 2.32294 13.5254C1.88544 12.5115 1.66669 11.4351 1.66669 10.2962C1.66669 9.14345 1.88544 8.06359 2.32294 7.05664C2.76044 6.0497 3.35766 5.16775 4.1146 4.41081C4.87155 3.65386 5.75696 3.05664 6.77085 2.61914C7.78474 2.18164 8.86113 1.96289 10 1.96289C11.1528 1.96289 12.2327 2.18164 13.2396 2.61914C14.2465 3.05664 15.1285 3.65386 15.8854 4.41081C16.6424 5.16775 17.2396 6.0497 17.6771 7.05664C18.1146 8.06359 18.3334 9.14345 18.3334 10.2962C18.3334 10.4351 18.3299 10.574 18.3229 10.7129C18.316 10.8518 18.3056 10.9907 18.2917 11.1296H16.6042C16.632 10.9907 16.6493 10.8553 16.6563 10.7233C16.6632 10.5914 16.6667 10.449 16.6667 10.2962C16.6667 10.0046 16.6493 9.72331 16.6146 9.45247C16.5799 9.18164 16.5278 8.90733 16.4584 8.62956H13.625C13.6667 8.90733 13.6979 9.18164 13.7188 9.45247C13.7396 9.72331 13.75 10.0046 13.75 10.2962V10.7233C13.75 10.8553 13.7431 10.9907 13.7292 11.1296H12.0625C12.0764 10.9907 12.0834 10.8553 12.0834 10.7233V10.2962C12.0834 10.0046 12.0729 9.72331 12.0521 9.45247C12.0313 9.18164 12 8.90733 11.9584 8.62956H8.04169C8.00002 8.90733 7.96877 9.18164 7.94794 9.45247C7.9271 9.72331 7.91669 10.0046 7.91669 10.2962C7.91669 10.5879 7.9271 10.8691 7.94794 11.14C7.96877 11.4108 8.00002 11.6851 8.04169 11.9629H10.8334V13.6296H8.41669C8.58335 14.2407 8.79863 14.8171 9.06252 15.3587C9.32641 15.9004 9.63891 16.4212 10 16.9212C10.1528 16.699 10.2986 16.4733 10.4375 16.2441C10.5764 16.015 10.7084 15.7823 10.8334 15.5462V18.5879C10.6945 18.6018 10.559 18.6122 10.4271 18.6191C10.2952 18.6261 10.1528 18.6296 10 18.6296ZM16.625 18.1087L14.1667 15.6504V17.5046H12.5V12.7962H17.2084V14.4629H15.3334L17.7917 16.9212L16.625 18.1087Z"
            fill="CurrentColor"
          />
        </g>
      </svg>
    </SvgIcon>
  )
}

export { CaptivePortalIcon, ReadIcon }
