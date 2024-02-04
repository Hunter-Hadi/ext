import ContentCutOutlinedIcon from '@mui/icons-material/ContentCutOutlined'
import ImageOutlinedIcon from '@mui/icons-material/ImageOutlined'
import { SxProps } from '@mui/material'
import SvgIcon from '@mui/material/SvgIcon'
import React, { FC, useMemo } from 'react'

const HomeViewContentNavIcons: FC<{ icon: string; sx?: SxProps }> = ({
  icon,
  sx,
}) => {
  const sxMemo = useMemo(
    () => ({
      fontSize: 24,
      color: 'inherit',

      ...sx,
    }),
    [sx],
  )

  const renderIcon = () => {
    if (icon === 'one_click_prompts') {
      return (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
        >
          <g mask="url(#mask0_7022_37353)">
            <path
              d="M10.2601 10.172V8.69272C9.78149 8.48969 9.29203 8.33741 8.7917 8.23589C8.29136 8.13438 7.76564 8.08362 7.21455 8.08362C6.83748 8.08362 6.46767 8.11262 6.1051 8.17063C5.74254 8.22864 5.38723 8.30115 5.03917 8.38817V9.78041C5.38723 9.64989 5.73891 9.552 6.09422 9.48674C6.44954 9.42147 6.82298 9.38884 7.21455 9.38884C7.76564 9.38884 8.29498 9.45773 8.80257 9.59551C9.31016 9.73328 9.796 9.92544 10.2601 10.172Z"
              fill="currentColor"
            />
            <path
              d="M10.2601 14.9578V13.4786C9.78149 13.2755 9.29203 13.1232 8.7917 13.0217C8.29136 12.9202 7.76564 12.8695 7.21455 12.8695C6.83748 12.8695 6.46767 12.8985 6.1051 12.9565C5.74254 13.0145 5.38723 13.087 5.03917 13.174V14.5662C5.38723 14.4357 5.73891 14.3378 6.09422 14.2726C6.44954 14.2073 6.82298 14.1747 7.21455 14.1747C7.76564 14.1747 8.29498 14.2399 8.80257 14.3705C9.31016 14.501 9.796 14.6968 10.2601 14.9578Z"
              fill="currentColor"
            />
            <path
              d="M10.2601 11.0856V12.5649C9.796 12.3184 9.31016 12.1262 8.80257 11.9884C8.29498 11.8506 7.76564 11.7818 7.21455 11.7818C6.82298 11.7818 6.44954 11.8144 6.09422 11.8797C5.73891 11.9449 5.38723 12.0428 5.03917 12.1733V10.7811C5.38723 10.6941 5.74254 10.6216 6.1051 10.5635C6.46767 10.5055 6.83748 10.4765 7.21455 10.4765C7.76564 10.4765 8.29136 10.5273 8.7917 10.6288C9.29203 10.7303 9.78149 10.8826 10.2601 11.0856Z"
              fill="currentColor"
            />
            <path
              fillRule="evenodd"
              clipRule="evenodd"
              d="M20.2668 9.38884C20.1204 9.38884 19.9753 9.39441 19.8317 9.40533V7.3875C19.3532 7.18446 18.8565 7.03218 18.3416 6.93067C17.8268 6.82915 17.3083 6.77839 16.7862 6.77839C16.1046 6.77839 15.4302 6.8654 14.7631 7.03943C14.096 7.21346 13.4651 7.47451 12.8705 7.82257V16.3936C13.4617 16.1114 14.0561 15.8946 14.6535 15.7431C14.7261 16.3325 14.8893 16.8938 15.1288 17.4126C14.8365 17.482 14.5479 17.5701 14.2628 17.677C13.4506 17.9816 12.6965 18.4094 12.0004 18.9605C11.3043 18.4094 10.5501 17.9816 9.73799 17.677C8.92584 17.3725 8.0847 17.2202 7.21455 17.2202C6.60544 17.2202 6.00721 17.3 5.41986 17.4595C4.83251 17.619 4.27053 17.8438 3.73394 18.1339C3.42939 18.2934 3.13571 18.2861 2.85291 18.1121C2.57011 17.9381 2.42871 17.6843 2.42871 17.3507V6.8654C2.42871 6.70588 2.46859 6.5536 2.54836 6.40857C2.62812 6.26355 2.74777 6.15478 2.90729 6.08227C3.57441 5.73421 4.27053 5.47316 4.99566 5.29913C5.72078 5.1251 6.46041 5.03809 7.21455 5.03809C8.05569 5.03809 8.87871 5.14685 9.6836 5.36439C10.4885 5.58193 11.2608 5.90824 12.0004 6.34331C12.74 5.90824 13.5123 5.58193 14.3172 5.36439C15.122 5.14685 15.9451 5.03809 16.7862 5.03809C17.5403 5.03809 18.28 5.1251 19.0051 5.29913C19.7302 5.47316 20.4263 5.73421 21.0935 6.08227C21.253 6.15478 21.3726 6.26355 21.4524 6.40857C21.5322 6.5536 21.5721 6.70588 21.5721 6.8654V9.54019C21.1531 9.44122 20.7161 9.38884 20.2668 9.38884ZM11.1302 16.3936C10.4921 16.089 9.85038 15.8606 9.20502 15.7083C8.55965 15.556 7.89616 15.4799 7.21455 15.4799C6.69245 15.4799 6.18124 15.5234 5.6809 15.6104C5.18056 15.6974 4.6766 15.828 4.16901 16.002V7.3875C4.6476 7.18446 5.14431 7.03218 5.65915 6.93067C6.17399 6.82915 6.69245 6.77839 7.21455 6.77839C7.89616 6.77839 8.57053 6.8654 9.23765 7.03943C9.90476 7.21346 10.5356 7.47451 11.1302 7.82257V16.3936Z"
              fill="currentColor"
            />
            <path
              d="M18.8851 13.2213L17.6615 15.9133L16.4378 13.2213L13.7458 11.9976L16.4378 10.7739L17.6615 8.08192L18.8851 10.7739L21.5771 11.9976L18.8851 13.2213Z"
              fill="currentColor"
            />
            <path
              d="M20.1513 17.5397L19.5054 18.9605L18.8596 17.5397L17.4388 16.8939L18.8596 16.2481L19.5054 14.8273L20.1513 16.2481L21.5721 16.8939L20.1513 17.5397Z"
              fill="currentColor"
            />
          </g>
        </svg>
      )
    }

    if (icon === 'my_own_prompts') {
      return (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
        >
          <g mask="url(#mask0_7022_37358)">
            <path
              d="M9.53731 21L9.1791 18.12C8.98507 18.045 8.80224 17.955 8.6306 17.85C8.45895 17.745 8.29104 17.6325 8.12687 17.5125L5.46269 18.6375L3 14.3625L5.30597 12.6075C5.29104 12.5025 5.28358 12.4012 5.28358 12.3038V11.6962C5.28358 11.5988 5.29104 11.4975 5.30597 11.3925L3 9.6375L5.46269 5.3625L8.12687 6.4875C8.29104 6.3675 8.46269 6.255 8.64179 6.15C8.8209 6.045 9 5.955 9.1791 5.88L9.53731 3H14.4627L14.8209 5.88C15.0149 5.955 15.1978 6.045 15.3694 6.15C15.541 6.255 15.709 6.3675 15.8731 6.4875L18.5373 5.3625L21 9.6375L18.694 11.3925C18.709 11.4975 18.7164 11.5988 18.7164 11.6962V12.3038C18.7164 12.4012 18.7015 12.5025 18.6716 12.6075L20.9776 14.3625L18.5149 18.6375L15.8731 17.5125C15.709 17.6325 15.5373 17.745 15.3582 17.85C15.1791 17.955 15 18.045 14.8209 18.12L14.4627 21H9.53731ZM12.0448 15.15C12.9104 15.15 13.6493 14.8425 14.2612 14.2275C14.8731 13.6125 15.1791 12.87 15.1791 12C15.1791 11.13 14.8731 10.3875 14.2612 9.7725C13.6493 9.1575 12.9104 8.85 12.0448 8.85C11.1642 8.85 10.4216 9.1575 9.81716 9.7725C9.21269 10.3875 8.91045 11.13 8.91045 12C8.91045 12.87 9.21269 13.6125 9.81716 14.2275C10.4216 14.8425 11.1642 15.15 12.0448 15.15ZM12.0448 13.35C11.6716 13.35 11.3545 13.2188 11.0933 12.9563C10.8321 12.6937 10.7015 12.375 10.7015 12C10.7015 11.625 10.8321 11.3062 11.0933 11.0437C11.3545 10.7812 11.6716 10.65 12.0448 10.65C12.4179 10.65 12.7351 10.7812 12.9963 11.0437C13.2575 11.3062 13.3881 11.625 13.3881 12C13.3881 12.375 13.2575 12.6937 12.9963 12.9563C12.7351 13.2188 12.4179 13.35 12.0448 13.35ZM11.1045 19.2H12.8731L13.1866 16.815C13.6493 16.695 14.0784 16.5187 14.4739 16.2862C14.8694 16.0537 15.2313 15.7725 15.5597 15.4425L17.7761 16.365L18.6493 14.835L16.7239 13.3725C16.7985 13.1625 16.8507 12.9412 16.8806 12.7087C16.9104 12.4762 16.9254 12.24 16.9254 12C16.9254 11.76 16.9104 11.5238 16.8806 11.2913C16.8507 11.0588 16.7985 10.8375 16.7239 10.6275L18.6493 9.165L17.7761 7.635L15.5597 8.58C15.2313 8.235 14.8694 7.94625 14.4739 7.71375C14.0784 7.48125 13.6493 7.305 13.1866 7.185L12.8955 4.8H11.1269L10.8134 7.185C10.3507 7.305 9.92164 7.48125 9.52612 7.71375C9.1306 7.94625 8.76866 8.2275 8.4403 8.5575L6.22388 7.635L5.35075 9.165L7.27612 10.605C7.20149 10.83 7.14925 11.055 7.1194 11.28C7.08955 11.505 7.07463 11.745 7.07463 12C7.07463 12.24 7.08955 12.4725 7.1194 12.6975C7.14925 12.9225 7.20149 13.1475 7.27612 13.3725L5.35075 14.835L6.22388 16.365L8.4403 15.42C8.76866 15.765 9.1306 16.0537 9.52612 16.2862C9.92164 16.5187 10.3507 16.695 10.8134 16.815L11.1045 19.2Z"
              fill="currentColor"
            />
          </g>
        </svg>
      )
    }

    if (icon === 'summary') {
      return (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
        >
          <g mask="url(#mask0_7022_37363)">
            <path
              d="M8.66667 9.5C8.90278 9.5 9.10069 9.42014 9.26042 9.26042C9.42014 9.10069 9.5 8.90278 9.5 8.66667C9.5 8.43056 9.42014 8.23264 9.26042 8.07292C9.10069 7.91319 8.90278 7.83333 8.66667 7.83333C8.43056 7.83333 8.23264 7.91319 8.07292 8.07292C7.91319 8.23264 7.83333 8.43056 7.83333 8.66667C7.83333 8.90278 7.91319 9.10069 8.07292 9.26042C8.23264 9.42014 8.43056 9.5 8.66667 9.5ZM8.66667 12.8333C8.90278 12.8333 9.10069 12.7535 9.26042 12.5938C9.42014 12.434 9.5 12.2361 9.5 12C9.5 11.7639 9.42014 11.566 9.26042 11.4062C9.10069 11.2465 8.90278 11.1667 8.66667 11.1667C8.43056 11.1667 8.23264 11.2465 8.07292 11.4062C7.91319 11.566 7.83333 11.7639 7.83333 12C7.83333 12.2361 7.91319 12.434 8.07292 12.5938C8.23264 12.7535 8.43056 12.8333 8.66667 12.8333ZM8.66667 16.1667C8.90278 16.1667 9.10069 16.0868 9.26042 15.9271C9.42014 15.7674 9.5 15.5694 9.5 15.3333C9.5 15.0972 9.42014 14.8993 9.26042 14.7396C9.10069 14.5799 8.90278 14.5 8.66667 14.5C8.43056 14.5 8.23264 14.5799 8.07292 14.7396C7.91319 14.8993 7.83333 15.0972 7.83333 15.3333C7.83333 15.5694 7.91319 15.7674 8.07292 15.9271C8.23264 16.0868 8.43056 16.1667 8.66667 16.1667ZM6.16667 19.5C5.70833 19.5 5.31597 19.3368 4.98958 19.0104C4.66319 18.684 4.5 18.2917 4.5 17.8333V6.16667C4.5 5.70833 4.66319 5.31597 4.98958 4.98958C5.31597 4.66319 5.70833 4.5 6.16667 4.5H15.3333L19.5 8.66667V17.8333C19.5 18.2917 19.3368 18.684 19.0104 19.0104C18.684 19.3368 18.2917 19.5 17.8333 19.5H6.16667ZM6.16667 17.8333H17.8333V9.5H14.5V6.16667H6.16667V17.8333Z"
              fill="currentColor"
            />
          </g>
        </svg>
      )
    }

    if (icon === 'chat_with_pdf') {
      return (
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <g mask="url(#mask0_7601_104797)">
            <path
              fillRule="evenodd"
              clipRule="evenodd"
              d="M6.87187 17.9641C7.01975 18.1932 7.22182 18.3876 7.48877 18.4933C7.75778 18.5998 8.0307 18.5916 8.27442 18.5243C8.72952 18.3986 9.14918 18.0501 9.5056 17.6672C9.98807 17.1488 10.4775 16.4314 10.9225 15.6371C11.2592 15.5408 11.6077 15.4533 11.96 15.3767C12.3476 15.2924 12.7328 15.2229 13.105 15.1698C13.6383 15.6985 14.1884 16.1501 14.704 16.447C15.1347 16.695 15.6371 16.8917 16.1267 16.8307C16.3879 16.7982 16.6367 16.6926 16.8442 16.5008C17.0465 16.3137 17.1807 16.0718 17.2659 15.8075C17.3484 15.5516 17.3718 15.2794 17.2964 15.0117C17.2204 14.7417 17.059 14.5302 16.8641 14.373C16.4984 14.0782 15.9826 13.9467 15.478 13.8879C14.9195 13.8229 14.2563 13.835 13.5543 13.9054C13.3463 13.6795 13.1395 13.4393 12.9382 13.1895C12.7242 12.9239 12.5209 12.6532 12.333 12.3839C12.5307 11.7447 12.6676 11.13 12.7151 10.591C12.7617 10.0626 12.7324 9.50735 12.4964 9.07296C12.3708 8.84193 12.1837 8.64058 11.9248 8.51261C11.6695 8.38641 11.3886 8.35337 11.1075 8.38156C10.8405 8.40834 10.5803 8.49347 10.3638 8.66798C10.1437 8.84549 10.0135 9.07949 9.95027 9.32418C9.83246 9.77992 9.9375 10.3003 10.1007 10.7703C10.2924 11.3228 10.6136 11.9411 11.0082 12.5616C10.8587 12.981 10.6822 13.4143 10.4853 13.845C10.3627 14.1132 10.234 14.3766 10.1012 14.6313C9.33528 14.8766 8.62432 15.1698 8.05826 15.4955C7.59167 15.7641 7.16126 16.0895 6.90418 16.4806C6.7708 16.6835 6.67115 16.9238 6.65748 17.194C6.64349 17.4707 6.72218 17.7322 6.87187 17.9641ZM8.65726 16.5364C8.78138 16.465 8.91566 16.3945 9.0587 16.3254C8.9123 16.5216 8.76742 16.6976 8.62657 16.849C8.30963 17.1895 8.07889 17.3325 7.9547 17.3668C7.94283 17.37 7.93411 17.3717 7.92805 17.3726C7.91856 17.3638 7.90228 17.3461 7.88084 17.3129C7.85424 17.2717 7.85666 17.2559 7.85684 17.2547C7.85718 17.248 7.86085 17.2115 7.90765 17.1403C8.01092 16.9832 8.24829 16.7717 8.65726 16.5364ZM7.91691 17.3733L7.91893 17.3734C7.91752 17.3734 7.91688 17.3733 7.91691 17.3733ZM7.93572 17.3789L7.93749 17.38C7.93748 17.3801 7.93688 17.3797 7.93572 17.3789ZM11.7048 14.2032L11.6344 14.2186C11.7055 14.0599 11.7746 13.8996 11.8412 13.7387C11.8947 13.8074 11.9487 13.8755 12.0032 13.9431C12.0492 14.0002 12.0957 14.0571 12.1426 14.1137C11.9963 14.1417 11.8502 14.1716 11.7048 14.2032ZM15.3032 15.4063C15.136 15.31 14.9584 15.1888 14.7742 15.0468C14.9771 15.0495 15.1664 15.0607 15.3391 15.0808C15.7777 15.1318 16.0142 15.2304 16.1104 15.3079C16.1296 15.3234 16.1377 15.3336 16.1406 15.3381C16.1417 15.3462 16.1431 15.3765 16.1229 15.4389C16.0839 15.5601 16.0434 15.6057 16.029 15.619C16.0198 15.6275 16.0098 15.6351 15.9783 15.639C15.8825 15.6509 15.6637 15.6139 15.3032 15.4063ZM16.142 15.3409C16.1421 15.3409 16.1422 15.3414 16.142 15.3409ZM11.5188 10.4856C11.5068 10.6218 11.4874 10.7666 11.4609 10.9184C11.37 10.7277 11.294 10.546 11.2351 10.3765C11.0937 9.96913 11.0861 9.72865 11.1129 9.62472C11.116 9.61274 11.1188 9.60536 11.1208 9.60119C11.1313 9.5957 11.162 9.58301 11.2273 9.57646C11.3383 9.56533 11.383 9.58438 11.3927 9.5892C11.399 9.59228 11.4166 9.60097 11.4412 9.64634C11.5056 9.76491 11.5591 10.0286 11.5188 10.4856Z"
              fill="currentColor"
            />
            <path
              fillRule="evenodd"
              clipRule="evenodd"
              d="M7.81764 1.87891C5.85807 1.87891 4.26953 3.46745 4.26953 5.42701V18.5696C4.26953 20.5292 5.85807 22.1177 7.81764 22.1177H16.1808C18.1403 22.1177 19.7289 20.5292 19.7289 18.5696V8.37868C19.7289 7.43771 19.3551 6.53527 18.6897 5.86988L15.7383 2.91822C15.0729 2.25276 14.1704 1.87891 13.2293 1.87891H7.81764ZM5.90712 5.42701C5.90712 4.37186 6.76249 3.51649 7.81764 3.51649H13.2293C13.736 3.51649 14.222 3.7178 14.5803 4.07612L17.5317 7.02779C17.89 7.38607 18.0913 7.872 18.0913 8.37868V18.5696C18.0913 19.6248 17.2359 20.4801 16.1808 20.4801H7.81764C6.76249 20.4801 5.90712 19.6248 5.90712 18.5696V5.42701Z"
              fill="currentColor"
            />
          </g>
        </svg>
      )
    }
    if (icon === 'immersive_chat') {
      return (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
        >
          <g mask="url(#mask0_7022_37519)">
            <path
              d="M4.22168 19.7772V14.2217H6.4439V17.555H9.77724V19.7772H4.22168ZM4.22168 9.77724V4.22168H9.77724V6.4439H6.4439V9.77724H4.22168ZM14.2217 19.7772V17.555H17.555V14.2217H19.7772V19.7772H14.2217ZM17.555 9.77724V6.4439H14.2217V4.22168H19.7772V9.77724H17.555Z"
              fill="currentColor"
            />
          </g>
        </svg>
      )
    }

    return null
  }

  if (icon === 'screenshot') {
    return (
      <ContentCutOutlinedIcon
        sx={{
          transform: 'rotate(-90deg)',
          ...sxMemo,
          p: '2px',
        }}
      />
    )
  }

  if (icon === 'drop_image') {
    return (
      <ImageOutlinedIcon
        sx={{
          ...sxMemo,
          p: '2px',
        }}
      />
    )
  }

  return <SvgIcon sx={sxMemo}>{renderIcon()}</SvgIcon>
}

export default HomeViewContentNavIcons
