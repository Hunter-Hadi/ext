import SvgIcon from '@mui/material/SvgIcon'
import React, { FC } from 'react'

interface IProps {
  iconSize?: number
  color?: string
}

const ProviderMainPartIcon: FC<IProps> = ({
  iconSize = 16,
  color = 'primary.main',
}) => (
  <SvgIcon
    sx={{
      fontSize: iconSize,
      color,
    }}
  >
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="none">
      <path
        d="M14.8334 8.00045C14.8203 7.53063 14.677 7.07317 14.4189 6.67972C14.1614 6.28699 13.7992 5.97281 13.373 5.77354C13.5352 5.33208 13.5694 4.85426 13.4749 4.3939C13.3796 3.93281 13.157 3.50808 12.8334 3.16699C12.4916 2.84336 12.0676 2.62154 11.6065 2.52554C11.1461 2.43099 10.6683 2.46517 10.2269 2.62736C10.0283 2.20045 9.71487 1.83754 9.32141 1.58008C8.92796 1.32263 8.4705 1.17863 7.99996 1.16699C7.53014 1.17936 7.07414 1.3219 6.68141 1.58008C6.28869 1.83826 5.97669 2.20117 5.77959 2.62736C5.33741 2.46517 4.85814 2.42954 4.39632 2.52554C3.9345 2.62008 3.50905 2.84263 3.16723 3.16699C2.84359 3.50881 2.6225 3.93426 2.52869 4.39463C2.43414 4.85499 2.4705 5.33281 2.63341 5.77354C2.2065 5.97281 1.84287 6.28626 1.58396 6.67899C1.32505 7.07172 1.18032 7.5299 1.1665 8.00045C1.18105 8.47099 1.32505 8.92845 1.58396 9.3219C1.84287 9.71463 2.2065 10.0288 2.63341 10.2274C2.4705 10.6681 2.43414 11.1459 2.52869 11.6063C2.62323 12.0674 2.84359 12.4921 3.1665 12.8339C3.50832 13.1561 3.93305 13.3772 4.39341 13.4724C4.85378 13.5684 5.33159 13.5335 5.77305 13.3735C5.97232 13.7997 6.28578 14.1619 6.67923 14.4201C7.07196 14.6775 7.53014 14.8208 7.99996 14.8339C8.4705 14.8223 8.92796 14.679 9.32141 14.4215C9.71487 14.1641 10.0283 13.8004 10.2269 13.3743C10.6661 13.5481 11.1476 13.5895 11.6109 13.4935C12.0734 13.3975 12.4981 13.1684 12.8327 12.8339C13.1672 12.4994 13.397 12.0746 13.493 11.6114C13.589 11.1481 13.5476 10.6666 13.373 10.2274C13.7992 10.0281 14.1614 9.71463 14.4196 9.32117C14.677 8.92845 14.8203 8.47026 14.8334 8.00045ZM7.02687 10.8004L4.53305 8.30736L5.47341 7.36045L6.98032 8.86736L10.1803 5.38081L11.16 6.28699L7.02687 10.8004Z"
        fill="currentColor"
      />
    </svg>
  </SvgIcon>
)

export default ProviderMainPartIcon
