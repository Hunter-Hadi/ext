import SvgIcon, { SvgIconProps } from '@mui/material/SvgIcon'
import React, { FC } from 'react'
const EzMailAIIcon: FC<SvgIconProps> = (props) => {
  return (
    <SvgIcon viewBox="0 0 24 24" sx={props.sx}>
      <svg
        width="24"
        height="24"
        viewBox="0 0 30 30"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M23.9552 0H6.04478C2.70634 0 0 2.70634 0 6.04478V23.9552C0 27.2937 2.70634 30 6.04478 30H23.9552C27.2937 30 30 27.2937 30 23.9552V6.04478C30 2.70634 27.2937 0 23.9552 0Z"
          fill="#DB4437"
        />
        <path
          d="M4.58936 9.43672C4.58936 7.87253 5.85641 6.60449 7.41939 6.60449H18.7395C19.521 6.60449 20.1545 7.2385 20.1545 8.0206C20.1545 8.80271 19.521 9.43672 18.7395 9.43672H7.41939V20.5633H22.5802V11.9491C22.5802 11.6139 22.8517 11.3422 23.1867 11.3422H24.8038C25.1387 11.3422 25.4103 11.6139 25.4103 11.9491V20.9402C25.4103 21.0485 25.3814 21.1541 25.3274 21.2464C25.022 22.4805 23.9078 23.3955 22.5802 23.3955H7.41939C5.85641 23.3955 4.58936 22.1275 4.58936 20.5633V9.43672Z"
          fill="white"
        />
        <path
          d="M23.1871 9.43672C22.8521 9.43672 22.5806 9.16499 22.5806 8.82982V7.19699C22.5806 7.19699 22.5806 6.60449 23.9957 6.60449C25.4106 6.60449 25.4106 7.19699 25.4106 7.19699V8.82982C25.4106 9.16499 25.1391 9.43672 24.8041 9.43672H23.1871Z"
          fill="white"
        />
        <path
          d="M11.409 11.6786C10.7481 11.2613 9.87426 11.4592 9.45724 12.1206C9.04024 12.782 9.23797 13.6566 9.89889 14.0739L14.3842 16.9061C14.8479 17.1989 15.4388 17.1973 15.9008 16.902L20.3328 14.0698C20.9914 13.6489 21.1844 12.7733 20.7638 12.1141C20.3432 11.4549 19.4683 11.2618 18.8097 11.6827L15.1347 14.0312L11.409 11.6786Z"
          fill="white"
        />
      </svg>
    </SvgIcon>
  )
}
const UseChatGptIcon: FC<SvgIconProps> = (props) => {
  return (
    <SvgIcon viewBox="0 0 24 24" sx={{ color: 'primary.main', ...props.sx }}>
      <svg
        width="24"
        height="24"
        viewBox="0 0 44 44"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M36 16L33.5 10.5L28 8L33.5 5.5L36 0L38.5 5.5L44 8L38.5 10.5L36 16ZM36 44L33.5 38.5L28 36L33.5 33.5L36 28L38.5 33.5L44 36L38.5 38.5L36 44ZM16 38L11 27L0 22L11 17L16 6L21 17L32 22L21 27L16 38Z"
          fill="currentColor"
        />
      </svg>
    </SvgIcon>
  )
}
const ChatGPTIcon: FC<SvgIconProps> = (props) => {
  return (
    <SvgIcon viewBox="0 0 24 24" sx={props.sx}>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        shapeRendering="geometricPrecision"
        textRendering="geometricPrecision"
        imageRendering="optimizeQuality"
        fillRule="evenodd"
        clipRule="evenodd"
        viewBox="0 0 512 512"
      >
        <rect
          fill="#10A37F"
          width="512"
          height="512"
          rx="104.187"
          ry="105.042"
        />
        <path
          fill="#fff"
          fillRule="nonzero"
          d="M378.68 230.011a71.432 71.432 0 003.654-22.541 71.383 71.383 0 00-9.783-36.064c-12.871-22.404-36.747-36.236-62.587-36.236a72.31 72.31 0 00-15.145 1.604 71.362 71.362 0 00-53.37-23.991h-.453l-.17.001c-31.297 0-59.052 20.195-68.673 49.967a71.372 71.372 0 00-47.709 34.618 72.224 72.224 0 00-9.755 36.226 72.204 72.204 0 0018.628 48.395 71.395 71.395 0 00-3.655 22.541 71.388 71.388 0 009.783 36.064 72.187 72.187 0 0077.728 34.631 71.375 71.375 0 0053.374 23.992H271l.184-.001c31.314 0 59.06-20.196 68.681-49.995a71.384 71.384 0 0047.71-34.619 72.107 72.107 0 009.736-36.194 72.201 72.201 0 00-18.628-48.394l-.003-.004zM271.018 380.492h-.074a53.576 53.576 0 01-34.287-12.423 44.928 44.928 0 001.694-.96l57.032-32.943a9.278 9.278 0 004.688-8.06v-80.459l24.106 13.919a.859.859 0 01.469.661v66.586c-.033 29.604-24.022 53.619-53.628 53.679zm-115.329-49.257a53.563 53.563 0 01-7.196-26.798c0-3.069.268-6.146.79-9.17.424.254 1.164.706 1.695 1.011l57.032 32.943a9.289 9.289 0 009.37-.002l69.63-40.205v27.839l.001.048a.864.864 0 01-.345.691l-57.654 33.288a53.791 53.791 0 01-26.817 7.17 53.746 53.746 0 01-46.506-26.818v.003zm-15.004-124.506a53.5 53.5 0 0127.941-23.534c0 .491-.028 1.361-.028 1.965v65.887l-.001.054a9.27 9.27 0 004.681 8.053l69.63 40.199-24.105 13.919a.864.864 0 01-.813.074l-57.66-33.316a53.746 53.746 0 01-26.805-46.5 53.787 53.787 0 017.163-26.798l-.003-.003zm198.055 46.089l-69.63-40.204 24.106-13.914a.863.863 0 01.813-.074l57.659 33.288a53.71 53.71 0 0126.835 46.491c0 22.489-14.033 42.612-35.133 50.379v-67.857c.003-.025.003-.051.003-.076a9.265 9.265 0 00-4.653-8.033zm23.993-36.111a81.919 81.919 0 00-1.694-1.01l-57.032-32.944a9.31 9.31 0 00-4.684-1.266 9.31 9.31 0 00-4.684 1.266l-69.631 40.205v-27.839l-.001-.048c0-.272.129-.528.346-.691l57.654-33.26a53.696 53.696 0 0126.816-7.177c29.644 0 53.684 24.04 53.684 53.684a53.91 53.91 0 01-.774 9.077v.003zm-150.831 49.618l-24.111-13.919a.859.859 0 01-.469-.661v-66.587c.013-29.628 24.053-53.648 53.684-53.648a53.719 53.719 0 0134.349 12.426c-.434.237-1.191.655-1.694.96l-57.032 32.943a9.272 9.272 0 00-4.687 8.057v.053l-.04 80.376zm13.095-28.233l31.012-17.912 31.012 17.9v35.812l-31.012 17.901-31.012-17.901v-35.8z"
        />
      </svg>
    </SvgIcon>
  )
}
const OpenAIIcon: FC<SvgIconProps> = (props) => {
  return (
    <SvgIcon viewBox="0 0 24 24" sx={props.sx}>
      <svg
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          fill="currentColor"
          d="M22.2796 9.82242C22.5486 9.01446 22.6419 8.15844 22.5533 7.31154C22.4647 6.46464 22.1962 5.64646 21.7657 4.91173C21.1277 3.80042 20.1531 2.92056 18.9825 2.3991C17.812 1.87765 16.506 1.74155 15.253 2.01047C14.6879 1.37358 13.9933 0.86475 13.2156 0.518046C12.4378 0.171345 11.5951 -0.00523847 10.7436 0.000118326C9.46263 -0.00297347 8.21372 0.400818 7.17698 1.15328C6.14024 1.90574 5.36926 2.968 4.97516 4.18689C4.14065 4.35772 3.35226 4.70484 2.66276 5.20503C1.97327 5.70522 1.39858 6.34692 0.977178 7.0872C0.334023 8.19546 0.0594872 9.47928 0.193163 10.7537C0.326839 12.028 0.861816 13.2269 1.72094 14.1776C1.45194 14.9855 1.35862 15.8416 1.44724 16.6885C1.53585 17.5354 1.80435 18.3535 2.23477 19.0883C2.87289 20.1995 3.84752 21.0793 5.01807 21.6008C6.18861 22.1222 7.49456 22.2584 8.74749 21.9895C9.31263 22.6264 10.0073 23.1352 10.785 23.482C11.5627 23.8286 12.4054 24.0052 13.2569 23.9999C14.5386 24.0032 15.7881 23.5993 16.8252 22.8463C17.8624 22.0934 18.6335 21.0304 19.0273 19.8107C19.8618 19.6399 20.6502 19.2928 21.3397 18.7926C22.0291 18.2924 22.6038 17.6507 23.0253 16.9104C23.6676 15.8023 23.9415 14.5187 23.8075 13.2449C23.6735 11.971 23.1385 10.7726 22.2796 9.82242ZM13.2588 22.4309C12.2067 22.4324 11.1877 22.064 10.3798 21.3901C10.4162 21.3702 10.4801 21.3352 10.5217 21.3097L15.3004 18.5494C15.4203 18.4811 15.5199 18.3822 15.5889 18.2627C15.658 18.1432 15.6939 18.0074 15.6931 17.8695V11.1325L17.7129 12.2988C17.7235 12.3041 17.7326 12.3119 17.7395 12.3215C17.7463 12.3312 17.7507 12.3424 17.7522 12.3541V17.9333C17.7507 19.125 17.2769 20.2675 16.4347 21.1105C15.5925 21.9535 14.4504 22.4284 13.2588 22.4309ZM3.59551 18.3038C3.06853 17.3933 2.8786 16.3264 3.05897 15.2899C3.09445 15.3112 3.15643 15.3491 3.20091 15.3746L7.97955 18.1349C8.09865 18.2045 8.23413 18.2412 8.37207 18.2412C8.50995 18.2412 8.64543 18.2045 8.76453 18.1349L14.5987 14.7662V17.0987C14.5994 17.1106 14.5971 17.1226 14.5921 17.1334C14.587 17.1442 14.5794 17.1536 14.5699 17.1607L9.73917 19.9498C8.70591 20.545 7.47873 20.7058 6.32697 20.3972C5.17518 20.0887 4.19285 19.3358 3.59551 18.3038ZM2.33839 7.87164C2.86308 6.95988 3.69182 6.26184 4.67945 5.89962C4.67945 5.94078 4.67709 6.01368 4.67709 6.06426V11.5848C4.67625 11.7227 4.71215 11.8583 4.78108 11.9777C4.85002 12.0971 4.9495 12.196 5.06932 12.2642L10.9035 15.6325L8.88375 16.7987C8.87379 16.8053 8.86233 16.8093 8.85045 16.8104C8.83857 16.8115 8.82657 16.8096 8.81559 16.8049L3.98442 14.0134C2.95295 13.4161 2.20044 12.4341 1.89188 11.2828C1.58332 10.1315 1.74389 8.90478 2.33839 7.87164ZM18.9331 11.7334L13.0989 8.36466L15.1187 7.19886C15.1287 7.19232 15.1401 7.1883 15.152 7.18722C15.1639 7.18614 15.1758 7.18806 15.1868 7.19274L20.018 9.98184C20.7582 10.4094 21.3612 11.0389 21.7565 11.7968C22.1518 12.5546 22.323 13.4094 22.2501 14.261C22.1772 15.1127 21.8631 15.9259 21.3447 16.6055C20.8263 17.2852 20.125 17.803 19.323 18.0985C19.323 18.0568 19.323 17.984 19.323 17.9333V12.4128C19.3241 12.2752 19.2886 12.1397 19.2201 12.0203C19.1515 11.9009 19.0525 11.8019 18.9331 11.7334ZM20.9434 8.70768C20.908 8.6859 20.846 8.64852 20.8015 8.62302L16.0228 5.86272C15.9037 5.79324 15.7683 5.75658 15.6304 5.75658C15.4925 5.75658 15.357 5.79324 15.2379 5.86272L9.4037 9.23148V6.89892C9.40304 6.88698 9.40533 6.8751 9.41037 6.8643C9.41541 6.8535 9.42303 6.84408 9.43257 6.83694L14.2633 4.05015C15.0033 3.62342 15.8496 3.41626 16.7031 3.45289C17.5566 3.48953 18.382 3.76846 19.0828 4.25705C19.7835 4.74563 20.3307 5.42367 20.6602 6.21186C20.9897 7.00002 21.088 7.8657 20.9434 8.70768ZM8.30559 12.8651L6.28527 11.6989C6.27471 11.6936 6.26553 11.6858 6.25869 11.6761C6.25185 11.6665 6.24746 11.6552 6.24602 11.6435V6.06426C6.24656 5.20977 6.49053 4.37309 6.94929 3.65218C7.40811 2.93126 8.06276 2.35595 8.83664 1.99358C9.61053 1.63121 10.4716 1.49678 11.3191 1.60602C12.1666 1.71526 12.9655 2.06365 13.6222 2.6104C13.5858 2.63027 13.5223 2.66529 13.4802 2.69084L8.70159 5.4511C8.58165 5.51927 8.48211 5.61814 8.41305 5.73756C8.34405 5.85696 8.30811 5.99262 8.30889 6.1305L8.30559 12.8651ZM9.40274 10.4995L12.0012 8.99868L14.5996 10.4985V13.4991L12.0012 14.999L9.40274 13.4991V10.4995Z"
        />
      </svg>
    </SvgIcon>
  )
}

const CleanChatBoxIcon = (props: SvgIconProps) => {
  return (
    <SvgIcon viewBox="0 0 24 24" sx={props.sx}>
      <path d="M16.9656 16.1407L10.0549 12.633C10.0724 12.5981 10.4827 11.787 10.945 11.4289C12.0451 10.5766 13.4754 11.1671 14.4003 11.5336L19.3215 3L20.5256 3.62824C20.5256 3.62824 15.7615 12.1095 15.7091 12.2142C16.8609 12.9995 17.4368 13.6801 17.4368 14.7271C17.4368 15.2833 17.1698 15.8416 16.9656 16.1407Z" />
      <path d="M6.59963 18.706C5.67821 18.4966 3.98197 17.1877 3.24902 16.5595C5.92951 16.2663 8.01317 15.3554 9.47906 13.5754L16.3897 17.083C15.6742 17.9556 13.971 19.9415 12.882 20.6954C11.6381 21.5566 9.38869 20.188 8.53083 19.6661C8.44994 19.6169 8.38142 19.5752 8.32729 19.5436C8.58906 19.596 9.68847 18.9154 10.6308 18.0777C10.1597 18.4442 7.7514 18.9677 6.59963 18.706Z" />
      <path d="M7.8921 11.4452L8.432 12.633L8.97189 11.4452L10.1597 10.9053L8.97189 10.3655L8.432 9.17769L7.8921 10.3655L6.70434 10.9053L7.8921 11.4452Z" />
      <path d="M13.3008 9.07298L12.9409 8.28114L12.1491 7.92121L12.9409 7.56128L13.3008 6.76944L13.6608 7.56128L14.4526 7.92121L13.6608 8.28114L13.3008 9.07298Z" />
      <path d="M11.7263 12.0089L11.8353 12.2488L11.9444 12.0089L12.1844 11.8998L11.9444 11.7907L11.8353 11.5508L11.7263 11.7907L11.4863 11.8998L11.7263 12.0089Z" />
    </SvgIcon>
  )
}
const GmailToolBarIconBase64Data = `data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHZpZXdCb3g9IjAgMCAyMCAyMCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTE1LjMwMjkgNy43MjczNUwxNC4zNTU5IDUuNjQ0MDJMMTIuMjcyNiA0LjY5NzA1TDE0LjM1NTkgMy43NTAwOEwxNS4zMDI5IDEuNjY2NzVMMTYuMjQ5OCAzLjc1MDA4TDE4LjMzMzIgNC42OTcwNUwxNi4yNDk4IDUuNjQ0MDJMMTUuMzAyOSA3LjcyNzM1Wk0xNS4zMDI5IDE4LjMzMzRMMTQuMzU1OSAxNi4yNTAxTDEyLjI3MjYgMTUuMzAzMUwxNC4zNTU5IDE0LjM1NjFMMTUuMzAyOSAxMi4yNzI4TDE2LjI0OTggMTQuMzU2MUwxOC4zMzMyIDE1LjMwMzFMMTYuMjQ5OCAxNi4yNTAxTDE1LjMwMjkgMTguMzMzNFpNNy43MjcxMSAxNi4wNjA3TDUuODMzMTcgMTEuODk0TDEuNjY2NSAxMC4wMDAxTDUuODMzMTcgOC4xMDYxNEw3LjcyNzExIDMuOTM5NDhMOS42MjEwNSA4LjEwNjE0TDEzLjc4NzcgMTAuMDAwMUw5LjYyMTA1IDExLjg5NEw3LjcyNzExIDE2LjA2MDdaIiBmaWxsPSJ3aGl0ZSIvPgo8L3N2Zz4K`
const GmailToolBarDropdownIconBase64Data = `data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABQAAAAUCAQAAAAngNWGAAAAIUlEQVR4AWOgPhgF/xv+I4MG4pQ2EGdqA3EOaKCV50YBAK5AI+Hsps9tAAAAAElFTkSuQmCC`
const GiftIcon = (props: SvgIconProps) => {
  return (
    <SvgIcon sx={props.sx}>
      <path
        fill="currentColor"
        d="M2.66634 11.3359V12.6693H13.333V11.3359H2.66634ZM2.66634 4.0026H4.13301C4.07745 3.9026 4.04134 3.79705 4.02467 3.68594C4.00801 3.57483 3.99967 3.45816 3.99967 3.33594C3.99967 2.78038 4.19412 2.30816 4.58301 1.91927C4.9719 1.53038 5.44412 1.33594 5.99967 1.33594C6.33301 1.33594 6.64134 1.42205 6.92467 1.59427C7.20801 1.76649 7.45523 1.98038 7.66634 2.23594L7.99967 2.66927L8.33301 2.23594C8.53301 1.96927 8.77745 1.7526 9.06634 1.58594C9.35523 1.41927 9.66634 1.33594 9.99967 1.33594C10.5552 1.33594 11.0275 1.53038 11.4163 1.91927C11.8052 2.30816 11.9997 2.78038 11.9997 3.33594C11.9997 3.45816 11.9913 3.57483 11.9747 3.68594C11.958 3.79705 11.9219 3.9026 11.8663 4.0026H13.333C13.6997 4.0026 14.0136 4.13316 14.2747 4.39427C14.5358 4.65538 14.6663 4.96927 14.6663 5.33594V12.6693C14.6663 13.0359 14.5358 13.3498 14.2747 13.6109C14.0136 13.872 13.6997 14.0026 13.333 14.0026H2.66634C2.29967 14.0026 1.98579 13.872 1.72467 13.6109C1.46356 13.3498 1.33301 13.0359 1.33301 12.6693V5.33594C1.33301 4.96927 1.46356 4.65538 1.72467 4.39427C1.98579 4.13316 2.29967 4.0026 2.66634 4.0026ZM2.66634 9.33594H13.333V5.33594H9.93301L11.333 7.23594L10.2663 8.0026L7.99967 4.93594L5.73301 8.0026L4.66634 7.23594L6.03301 5.33594H2.66634V9.33594ZM5.99967 4.0026C6.18856 4.0026 6.3469 3.93872 6.47467 3.81094C6.60245 3.68316 6.66634 3.52483 6.66634 3.33594C6.66634 3.14705 6.60245 2.98872 6.47467 2.86094C6.3469 2.73316 6.18856 2.66927 5.99967 2.66927C5.81079 2.66927 5.65245 2.73316 5.52467 2.86094C5.3969 2.98872 5.33301 3.14705 5.33301 3.33594C5.33301 3.52483 5.3969 3.68316 5.52467 3.81094C5.65245 3.93872 5.81079 4.0026 5.99967 4.0026ZM9.99967 4.0026C10.1886 4.0026 10.3469 3.93872 10.4747 3.81094C10.6025 3.68316 10.6663 3.52483 10.6663 3.33594C10.6663 3.14705 10.6025 2.98872 10.4747 2.86094C10.3469 2.73316 10.1886 2.66927 9.99967 2.66927C9.81079 2.66927 9.65245 2.73316 9.52467 2.86094C9.3969 2.98872 9.33301 3.14705 9.33301 3.33594C9.33301 3.52483 9.3969 3.68316 9.52467 3.81094C9.65245 3.93872 9.81079 4.0026 9.99967 4.0026Z"
      />
    </SvgIcon>
  )
}

const BingIcon: FC<SvgIconProps> = (props) => {
  return (
    <SvgIcon {...props}>
      <svg
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <g clipPath="url(#clip0_234_9664)">
          <path
            d="M11.3268 8.32338C11.3232 8.35219 11.3232 8.3849 11.3232 8.417C11.3232 8.54183 11.3481 8.66186 11.3932 8.77229L11.4334 8.85511L11.5924 9.262L12.4185 11.3694L13.139 13.2097C13.3445 13.5812 13.6737 13.8729 14.0707 14.0283L14.194 14.0736C14.1988 14.0751 14.2069 14.0751 14.2135 14.0769L16.1883 14.756V14.7575L16.9433 15.0168L16.9949 15.0342C16.9967 15.0342 16.9997 15.036 17.0015 15.036C17.1503 15.0735 17.2962 15.1239 17.4354 15.1854C17.7574 15.3243 18.0493 15.5224 18.2987 15.7639C18.3992 15.86 18.4916 15.9635 18.5772 16.0739C18.65 16.1666 18.7165 16.2641 18.7764 16.3656C19.0399 16.8031 19.1911 17.3174 19.1911 17.865C19.1911 17.9629 19.1863 18.0574 19.1764 18.1534C19.1731 18.1957 19.168 18.2365 19.1617 18.277V18.2803C19.1551 18.3233 19.147 18.3677 19.1389 18.4112C19.1305 18.4535 19.1227 18.4955 19.1131 18.5375C19.1116 18.5423 19.1098 18.5474 19.108 18.5522C19.099 18.5948 19.0876 18.6368 19.0759 18.6791C19.0654 18.7191 19.0522 18.7602 19.0375 18.7989C19.0245 18.8412 19.0094 18.8829 18.9922 18.9237C18.9775 18.9657 18.9601 19.0083 18.9406 19.0485C18.8871 19.1719 18.8235 19.2904 18.7521 19.4035C18.66 19.5521 18.5549 19.6922 18.4379 19.8221C19.3646 18.8259 19.9806 17.5395 20.1339 16.1159C20.1597 15.8825 20.1729 15.6457 20.1729 15.4075C20.1729 15.2553 20.1663 15.1047 20.1564 14.9535C20.0397 13.2464 19.2625 11.7196 18.0763 10.63C17.7493 10.3273 17.3919 10.0578 17.0075 9.82914L16.2813 9.45795L12.6015 7.5696C12.4884 7.5211 12.3666 7.49619 12.2436 7.49638C11.767 7.49638 11.3737 7.85977 11.3268 8.32338Z"
            fill="#7F7F7F"
          />
          <path
            d="M11.3268 8.32338C11.3232 8.35219 11.3232 8.3849 11.3232 8.417C11.3232 8.54183 11.3481 8.66186 11.3932 8.77229L11.4334 8.85511L11.5924 9.262L12.4185 11.3694L13.139 13.2097C13.3445 13.5812 13.6737 13.8729 14.0707 14.0283L14.194 14.0736C14.1988 14.0751 14.2069 14.0751 14.2135 14.0769L16.1883 14.756V14.7575L16.9433 15.0168L16.9949 15.0342C16.9967 15.0342 16.9997 15.036 17.0015 15.036C17.1503 15.0735 17.2962 15.1239 17.4354 15.1854C17.7574 15.3243 18.0493 15.5224 18.2987 15.7639C18.3992 15.86 18.4916 15.9635 18.5772 16.0739C18.65 16.1666 18.7165 16.2641 18.7764 16.3656C19.0399 16.8031 19.1911 17.3174 19.1911 17.865C19.1911 17.9629 19.1863 18.0574 19.1764 18.1534C19.1731 18.1957 19.168 18.2365 19.1617 18.277V18.2803C19.1551 18.3233 19.147 18.3677 19.1389 18.4112C19.1305 18.4535 19.1227 18.4955 19.1131 18.5375C19.1116 18.5423 19.1098 18.5474 19.108 18.5522C19.099 18.5948 19.0876 18.6368 19.0759 18.6791C19.0654 18.7191 19.0522 18.7602 19.0375 18.7989C19.0245 18.8412 19.0094 18.8829 18.9922 18.9237C18.9775 18.9657 18.9601 19.0083 18.9406 19.0485C18.8871 19.1719 18.8235 19.2904 18.7521 19.4035C18.66 19.5521 18.5549 19.6922 18.4379 19.8221C19.3646 18.8259 19.9806 17.5395 20.1339 16.1159C20.1597 15.8825 20.1729 15.6457 20.1729 15.4075C20.1729 15.2553 20.1663 15.1047 20.1564 14.9535C20.0397 13.2464 19.2625 11.7196 18.0763 10.63C17.7493 10.3273 17.3919 10.0578 17.0075 9.82914L16.2813 9.45795L12.6015 7.5696C12.4884 7.5211 12.3666 7.49619 12.2436 7.49638C11.767 7.49638 11.3737 7.85977 11.3268 8.32338Z"
            fill="url(#paint0_linear_234_9664)"
          />
          <path
            d="M4.77459 0C4.25097 0.00930221 3.83057 0.437804 3.83057 0.961729V17.7375C3.83267 17.8545 3.83927 17.9701 3.84767 18.0874C3.85517 18.1492 3.86327 18.2134 3.87468 18.2758C4.11383 19.6223 5.28531 20.644 6.69985 20.644C7.19587 20.644 7.66098 20.5177 8.06787 20.298C8.07027 20.2962 8.07447 20.2938 8.07657 20.2938L8.22301 20.2053L8.81655 19.856L9.57153 19.408L9.57333 4.50257C9.57333 3.51203 9.07761 2.63883 8.31873 2.12C8.30073 2.1092 8.28332 2.0978 8.26742 2.0849L5.32972 0.163839C5.18089 0.0654155 5.00144 0.00360086 4.8091 0H4.77459Z"
            fill="#7F7F7F"
          />
          <path
            d="M4.77459 0C4.25097 0.00930221 3.83057 0.437804 3.83057 0.961729V17.7375C3.83267 17.8545 3.83927 17.9701 3.84767 18.0874C3.85517 18.1492 3.86327 18.2134 3.87468 18.2758C4.11383 19.6223 5.28531 20.644 6.69985 20.644C7.19587 20.644 7.66098 20.5177 8.06787 20.298C8.07027 20.2962 8.07447 20.2938 8.07657 20.2938L8.22301 20.2053L8.81655 19.856L9.57153 19.408L9.57333 4.50257C9.57333 3.51203 9.07761 2.63883 8.31873 2.12C8.30073 2.1092 8.28332 2.0978 8.26742 2.0849L5.32972 0.163839C5.18089 0.0654155 5.00144 0.00360086 4.8091 0H4.77459Z"
            fill="url(#paint1_linear_234_9664)"
          />
          <path
            d="M16.4233 15.3258L9.66896 19.3294L9.57174 19.3879V19.4092L8.81676 19.8563L8.22352 20.2065L8.07799 20.2944L8.06808 20.2992C7.66209 20.5198 7.19668 20.6446 6.70096 20.6446C5.28672 20.6446 4.11374 19.6235 3.87549 18.2764C3.98862 19.2619 4.32439 20.1792 4.83092 20.9783C5.87396 22.6248 7.63778 23.7701 9.67827 23.9691H10.926C12.0296 23.8539 12.9511 23.4119 13.9198 22.815L15.4093 21.904C16.0803 21.474 17.9014 20.4162 18.4379 19.8227C18.5547 19.6928 18.66 19.5535 18.7521 19.4044C18.8235 19.291 18.8872 19.1725 18.9406 19.0491C18.9586 19.0071 18.9757 18.9663 18.9922 18.9246C19.0078 18.8832 19.0225 18.8415 19.0375 18.7992C19.0654 18.7181 19.0876 18.6368 19.1089 18.5531C19.1197 18.5054 19.1296 18.4583 19.1395 18.4115C19.1719 18.2347 19.1896 18.0532 19.1896 17.865C19.1896 17.3174 19.0384 16.8031 18.7764 16.3662C18.7164 16.2642 18.6504 16.1666 18.5772 16.0745C18.4917 15.9635 18.3992 15.8606 18.2987 15.7645C18.0494 15.523 17.7583 15.3249 17.4354 15.1857C17.2962 15.1242 17.1509 15.0735 17.0015 15.0366C16.9997 15.0366 16.9967 15.0348 16.9949 15.0348L16.9433 15.0174L16.4233 15.3258Z"
            fill="#7F7F7F"
          />
          <path
            d="M16.4233 15.3258L9.66896 19.3294L9.57174 19.3879V19.4092L8.81676 19.8563L8.22352 20.2065L8.07799 20.2944L8.06808 20.2992C7.66209 20.5198 7.19668 20.6446 6.70096 20.6446C5.28672 20.6446 4.11374 19.6235 3.87549 18.2764C3.98862 19.2619 4.32439 20.1792 4.83092 20.9783C5.87396 22.6248 7.63778 23.7701 9.67827 23.9691H10.926C12.0296 23.8539 12.9511 23.4119 13.9198 22.815L15.4093 21.904C16.0803 21.474 17.9014 20.4162 18.4379 19.8227C18.5547 19.6928 18.66 19.5535 18.7521 19.4044C18.8235 19.291 18.8872 19.1725 18.9406 19.0491C18.9586 19.0071 18.9757 18.9663 18.9922 18.9246C19.0078 18.8832 19.0225 18.8415 19.0375 18.7992C19.0654 18.7181 19.0876 18.6368 19.1089 18.5531C19.1197 18.5054 19.1296 18.4583 19.1395 18.4115C19.1719 18.2347 19.1896 18.0532 19.1896 17.865C19.1896 17.3174 19.0384 16.8031 18.7764 16.3662C18.7164 16.2642 18.6504 16.1666 18.5772 16.0745C18.4917 15.9635 18.3992 15.8606 18.2987 15.7645C18.0494 15.523 17.7583 15.3249 17.4354 15.1857C17.2962 15.1242 17.1509 15.0735 17.0015 15.0366C16.9997 15.0366 16.9967 15.0348 16.9949 15.0348L16.9433 15.0174L16.4233 15.3258Z"
            fill="url(#paint2_linear_234_9664)"
          />
          <path
            opacity="0.15"
            d="M19.1896 17.865C19.1896 18.0532 19.1719 18.235 19.1392 18.4118C19.1296 18.4586 19.1197 18.5054 19.1086 18.5528C19.0876 18.6368 19.0654 18.7181 19.0375 18.7995C19.0228 18.8415 19.0078 18.8835 18.9922 18.9243C18.976 18.9663 18.9586 19.0071 18.9403 19.0491C18.8868 19.1721 18.824 19.2907 18.7524 19.4041C18.6604 19.5527 18.5552 19.6927 18.4379 19.8224C17.9014 20.4162 16.0803 21.474 15.4093 21.904L13.9198 22.815C12.8278 23.4878 11.7962 23.964 10.4951 23.9967C10.4335 23.9985 10.3732 24 10.3135 24C10.2295 24 10.1467 23.9985 10.0636 23.9952C7.86043 23.9112 5.93908 22.7274 4.83092 20.9783C4.31238 20.1614 3.98573 19.2377 3.87549 18.2764C4.11374 19.6235 5.28672 20.6446 6.70096 20.6446C7.19668 20.6446 7.66209 20.5195 8.06808 20.2992L8.07799 20.2941L8.22352 20.2065L8.81676 19.8563L9.57174 19.4092V19.3879L9.66896 19.3294L16.4233 15.3255L16.9433 15.0174L16.9949 15.0348C16.9964 15.0348 16.9997 15.0366 17.0015 15.0366C17.1509 15.0735 17.2965 15.1242 17.4354 15.1857C17.7583 15.3249 18.0491 15.523 18.2987 15.7645C18.3992 15.8607 18.4923 15.9643 18.5772 16.0745C18.6504 16.1666 18.7164 16.2642 18.7764 16.3662C19.0384 16.8031 19.1896 17.3174 19.1896 17.865Z"
            fill="#7F7F7F"
          />
          <path
            opacity="0.15"
            d="M19.1896 17.865C19.1896 18.0532 19.1719 18.235 19.1392 18.4118C19.1296 18.4586 19.1197 18.5054 19.1086 18.5528C19.0876 18.6368 19.0654 18.7181 19.0375 18.7995C19.0228 18.8415 19.0078 18.8835 18.9922 18.9243C18.976 18.9663 18.9586 19.0071 18.9403 19.0491C18.8868 19.1721 18.824 19.2907 18.7524 19.4041C18.6604 19.5527 18.5552 19.6927 18.4379 19.8224C17.9014 20.4162 16.0803 21.474 15.4093 21.904L13.9198 22.815C12.8278 23.4878 11.7962 23.964 10.4951 23.9967C10.4335 23.9985 10.3732 24 10.3135 24C10.2295 24 10.1467 23.9985 10.0636 23.9952C7.86043 23.9112 5.93908 22.7274 4.83092 20.9783C4.31238 20.1614 3.98573 19.2377 3.87549 18.2764C4.11374 19.6235 5.28672 20.6446 6.70096 20.6446C7.19668 20.6446 7.66209 20.5195 8.06808 20.2992L8.07799 20.2941L8.22352 20.2065L8.81676 19.8563L9.57174 19.4092V19.3879L9.66896 19.3294L16.4233 15.3255L16.9433 15.0174L16.9949 15.0348C16.9964 15.0348 16.9997 15.0366 17.0015 15.0366C17.1509 15.0735 17.2965 15.1242 17.4354 15.1857C17.7583 15.3249 18.0491 15.523 18.2987 15.7645C18.3992 15.8607 18.4923 15.9643 18.5772 16.0745C18.6504 16.1666 18.7164 16.2642 18.7764 16.3662C19.0384 16.8031 19.1896 17.3174 19.1896 17.865Z"
            fill="url(#paint3_linear_234_9664)"
          />
        </g>
        <defs>
          <linearGradient
            id="paint0_linear_234_9664"
            x1="12.4195"
            y1="8.5241"
            x2="20.0915"
            y2="17.0744"
            gradientUnits="userSpaceOnUse"
          >
            <stop stopColor="#37BDFF" />
            <stop offset="0.25" stopColor="#26C6F4" />
            <stop offset="0.5" stopColor="#15D0E9" />
            <stop offset="0.75" stopColor="#3BD6DF" />
            <stop offset="1" stopColor="#62DCD4" />
          </linearGradient>
          <linearGradient
            id="paint1_linear_234_9664"
            x1="7.09591"
            y1="20.2812"
            x2="6.84916"
            y2="1.30738"
            gradientUnits="userSpaceOnUse"
          >
            <stop stopColor="#1B48EF" />
            <stop offset="0.5" stopColor="#2080F1" />
            <stop offset="1" stopColor="#26B8F4" />
          </linearGradient>
          <linearGradient
            id="paint2_linear_234_9664"
            x1="11.5325"
            y1="19.4932"
            x2="30.1012"
            y2="19.4932"
            gradientUnits="userSpaceOnUse"
          >
            <stop stopColor="#39D2FF" />
            <stop offset="0.5" stopColor="#248FFA" />
            <stop offset="1" stopColor="#104CF5" />
          </linearGradient>
          <linearGradient
            id="paint3_linear_234_9664"
            x1="11.5325"
            y1="19.4932"
            x2="30.1012"
            y2="19.4932"
            gradientUnits="userSpaceOnUse"
          >
            <stop stopColor="white" />
            <stop offset="1" />
          </linearGradient>
          <clipPath id="clip0_234_9664">
            <rect width="24" height="24" fill="white" />
          </clipPath>
        </defs>
      </svg>
    </SvgIcon>
  )
}

const BardIcon: FC<SvgIconProps> = (props) => {
  return (
    <SvgIcon {...props}>
      <svg
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <g clipPath="url(#clip0_1_2)">
          <path
            d="M11.4464 16.1294L10.489 18.3223C10.121 19.1652 8.95452 19.1652 8.5865 18.3223L7.62905 16.1294C6.77701 14.1779 5.24338 12.6245 3.33038 11.7754L0.695048 10.6056C-0.142816 10.2337 -0.142815 9.01477 0.695048 8.64286L3.24807 7.50959C5.21027 6.63859 6.77141 5.02764 7.6089 3.00957L8.57874 0.672646C8.93863 -0.194591 10.1369 -0.194593 10.4968 0.672643L11.4666 3.00959C12.3041 5.02764 13.8652 6.63859 15.8274 7.50959L18.3805 8.64286C19.2183 9.01477 19.2183 10.2337 18.3805 10.6056L15.7451 11.7754C13.8321 12.6245 12.2985 14.1779 11.4464 16.1294Z"
            fill="url(#paint0_radial_1_2)"
          />
          <path
            d="M20.3441 23.044L20.0748 23.6611C19.8778 24.1129 19.2522 24.1129 19.0552 23.6611L18.7859 23.044C18.3059 21.9437 17.4414 21.0676 16.3626 20.5883L15.5331 20.2198C15.0845 20.0205 15.0845 19.3684 15.5331 19.1691L16.3163 18.8211C17.4228 18.3295 18.3028 17.421 18.7745 16.2833L19.051 15.6165C19.2437 15.1517 19.8863 15.1517 20.079 15.6165L20.3555 16.2833C20.8273 17.421 21.7073 18.3295 22.8138 18.8211L23.5969 19.1691C24.0456 19.3684 24.0456 20.0205 23.5969 20.2198L22.7674 20.5883C21.6886 21.0676 20.8241 21.9437 20.3441 23.044Z"
            fill="url(#paint1_radial_1_2)"
          />
        </g>
        <defs>
          <radialGradient
            id="paint0_radial_1_2"
            cx="0"
            cy="0"
            r="1"
            gradientUnits="userSpaceOnUse"
            gradientTransform="translate(14.8988 10.5335) rotate(78.858) scale(14.7889 14.7961)"
          >
            <stop stopColor="#1BA1E3" />
            <stop offset="0.0001" stopColor="#1BA1E3" />
            <stop offset="0.300221" stopColor="#5489D6" />
            <stop offset="0.545524" stopColor="#9B72CB" />
            <stop offset="0.825372" stopColor="#D96570" />
            <stop offset="1" stopColor="#F49C46" />
          </radialGradient>
          <radialGradient
            id="paint1_radial_1_2"
            cx="0"
            cy="0"
            r="1"
            gradientUnits="userSpaceOnUse"
            gradientTransform="translate(14.8988 10.5335) rotate(78.858) scale(14.7889 14.7961)"
          >
            <stop stopColor="#1BA1E3" />
            <stop offset="0.0001" stopColor="#1BA1E3" />
            <stop offset="0.300221" stopColor="#5489D6" />
            <stop offset="0.545524" stopColor="#9B72CB" />
            <stop offset="0.825372" stopColor="#D96570" />
            <stop offset="1" stopColor="#F49C46" />
          </radialGradient>
          <clipPath id="clip0_1_2">
            <rect width="24" height="24" fill="white" />
          </clipPath>
        </defs>
      </svg>
    </SvgIcon>
  )
}
const ClaudeIcon: FC<SvgIconProps> = (props) => {
  return (
    <SvgIcon {...props}>
      <svg
        width="24"
        height="24"
        viewBox="0 0 256 256"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <rect width="256" height="256" fill="#D19974" />
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M155.465 174L118.721 82H98.2052L61.4609 174H80.0968L87.4259 155.282H129.5L136.829 174H155.465ZM122.791 138.147H94.1348L108.433 101.479L122.791 138.147Z"
          fill="#1E1E1C"
        />
        <path
          d="M193.635 174L156.439 82H138.449L174.999 174H193.635Z"
          fill="#1E1E1C"
        />
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M94.1504 138.147L108.449 101.479L122.807 138.147H94.1504ZM95.6133 137.147L108.451 104.226L121.342 137.147H95.6133Z"
          fill="black"
        />
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M119.666 81.6289L119.414 81H97.543L97.293 81.6289L60 175H80.7949L88.123 156.282H128.834L136.162 175H156.957L119.666 81.6289ZM129.516 155.282H87.4414L80.1133 174H61.4766L98.2207 82H118.736L155.48 174H136.846L129.516 155.282Z"
          fill="black"
        />
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M157.295 81.625L157.043 81H138.174C138.174 81 137.996 81 137.891 81C137.785 81 137.607 81 137.607 81H136.977L174.336 175H195.135L157.295 81.625ZM156.369 82H138.449L175.016 174H193.65L156.369 82Z"
          fill="black"
        />
      </svg>
    </SvgIcon>
  )
}
const GoogleIcon: FC<SvgIconProps> = (props) => {
  return (
    <SvgIcon {...props}>
      <path
        d="M21.8055 10.0415H21V10H12V14H17.6515C16.827 16.3285 14.6115 18 12 18C8.6865 18 6 15.3135 6 12C6 8.6865 8.6865 6 12 6C13.5295 6 14.921 6.577 15.9805 7.5195L18.809 4.691C17.023 3.0265 14.634 2 12 2C6.4775 2 2 6.4775 2 12C2 17.5225 6.4775 22 12 22C17.5225 22 22 17.5225 22 12C22 11.3295 21.931 10.675 21.8055 10.0415Z"
        fill="#FFC107"
      />
      <path
        d="M3.15308 7.3455L6.43858 9.755C7.32758 7.554 9.48058 6 12.0001 6C13.5296 6 14.9211 6.577 15.9806 7.5195L18.8091 4.691C17.0231 3.0265 14.6341 2 12.0001 2C8.15908 2 4.82808 4.1685 3.15308 7.3455Z"
        fill="#FF3D00"
      />
      <path
        d="M11.9999 22C14.5829 22 16.9299 21.0115 18.7044 19.404L15.6094 16.785C14.6054 17.5455 13.3574 18 11.9999 18C9.39891 18 7.19041 16.3415 6.35841 14.027L3.09741 16.5395C4.75241 19.778 8.11341 22 11.9999 22Z"
        fill="#4CAF50"
      />
      <path
        d="M21.8055 10.0415H21V10H12V14H17.6515C17.2555 15.1185 16.536 16.083 15.608 16.7855C15.6085 16.785 15.609 16.785 15.6095 16.7845L18.7045 19.4035C18.4855 19.6025 22 17 22 12C22 11.3295 21.931 10.675 21.8055 10.0415Z"
        fill="#1976D2"
      />
    </SvgIcon>
  )
}

const BrowserIcon: FC<SvgIconProps> = (props) => {
  return (
    <SvgIcon {...props}>
      <svg
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M6.38095 14.8256L5.71627 11.8449H6.39567L6.78114 13.8211L7.24333 11.8449H7.82387L8.2904 13.8233L8.67364 11.8449H9.35093L8.68626 14.8256H7.98793L7.53225 12.9908L7.08348 14.8256H6.38095Z"
          fill="currentColor"
        />
        <path
          d="M10.9345 14.8256L10.2699 11.8449H10.9493L11.3347 13.8211L11.7969 11.8449H12.3775L12.844 13.8233L13.2272 11.8449H13.9045L13.2398 14.8256H12.5415L12.0858 12.9908L11.6371 14.8256H10.9345Z"
          fill="currentColor"
        />
        <path
          d="M15.4881 14.8256H16.1906L16.6394 12.9908L17.0951 14.8256H17.7934L18.4581 11.8449H17.7808L17.3976 13.8233L16.931 11.8449H16.3505L15.8883 13.8211L15.5028 11.8449H14.8234L15.4881 14.8256Z"
          fill="currentColor"
        />
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M17.6308 10.0915H19.7672C20.2492 10.0915 20.6399 10.484 20.6399 10.9682V15.3516C20.6399 15.8358 20.2492 16.2283 19.7672 16.2283H17.7263C16.6592 18.2615 14.5343 19.6474 12.0872 19.6474C9.64007 19.6474 7.5152 18.2615 6.44802 16.2283H4.40718C3.92519 16.2283 3.53446 15.8358 3.53446 15.3516V10.9682C3.53446 10.484 3.92519 10.0915 4.40718 10.0915H6.54358C7.63879 8.15442 9.71108 6.84773 12.0872 6.84773C14.4633 6.84773 16.5356 8.15442 17.6308 10.0915ZM10.4088 7.6193C9.05129 8.02721 7.90098 8.91722 7.15483 10.0915H9.04299C9.18875 9.61479 9.36687 9.17588 9.5724 8.78527C9.81055 8.33266 10.0917 7.93482 10.4088 7.6193ZM9.59245 10.0915H11.8254V7.39749C11.1699 7.51643 10.5359 8.07982 10.0353 9.03108C9.86806 9.349 9.71911 9.70472 9.59245 10.0915ZM12.349 10.0915H14.5819C14.4553 9.70472 14.3063 9.349 14.139 9.03108C13.6385 8.07982 13.0045 7.51643 12.349 7.39749V10.0915ZM15.1314 10.0915H17.0195C16.2734 8.91722 15.1231 8.02721 13.7655 7.6193C14.0826 7.93482 14.3638 8.33266 14.602 8.78527C14.8075 9.17588 14.9856 9.61479 15.1314 10.0915ZM7.04767 16.2283C7.78831 17.4892 8.98451 18.4479 10.4088 18.8759C10.0917 18.5603 9.81055 18.1625 9.5724 17.7099C9.34191 17.2718 9.14588 16.773 8.99133 16.2283H7.04767ZM9.5372 16.2283C9.67503 16.6833 9.84308 17.0987 10.0353 17.4641C10.5359 18.4153 11.1699 18.9787 11.8254 19.0977V16.2283H9.5372ZM12.349 16.2283V19.0977C13.0045 18.9787 13.6385 18.4153 14.139 17.4641C14.3313 17.0987 14.4993 16.6833 14.6372 16.2283H12.349ZM15.183 16.2283C15.0285 16.773 14.8325 17.2718 14.602 17.7099C14.3638 18.1625 14.0826 18.5603 13.7655 18.8759C15.1899 18.4479 16.3861 17.4892 17.1267 16.2283H15.183ZM4.05809 10.9682C4.05809 10.7745 4.21439 10.6175 4.40718 10.6175H19.7672C19.96 10.6175 20.1163 10.7745 20.1163 10.9682V15.3516C20.1163 15.5453 19.96 15.7023 19.7672 15.7023H4.40718C4.21439 15.7023 4.05809 15.5453 4.05809 15.3516V10.9682Z"
          fill="currentColor"
        />
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M1.96355 2.72728C1.48159 2.72728 1.09082 3.11978 1.09082 3.60397V20.0858C1.09082 20.7636 1.63785 21.3131 2.31264 21.3131H21.6872C22.362 21.3131 22.909 20.7636 22.909 20.0858V3.60397C22.909 3.11978 22.5182 2.72728 22.0363 2.72728H1.96355ZM1.789 20.0858V5.88337H22.2108V20.0858C22.2108 20.3763 21.9764 20.6118 21.6872 20.6118H2.31264C2.02344 20.6118 1.789 20.3763 1.789 20.0858ZM3.18537 4.30532C3.18537 4.59584 2.95091 4.83134 2.66173 4.83134C2.37255 4.83134 2.13809 4.59584 2.13809 4.30532C2.13809 4.01481 2.37255 3.77931 2.66173 3.77931C2.95091 3.77931 3.18537 4.01481 3.18537 4.30532ZM4.58173 4.30532C4.58173 4.59584 4.34727 4.83134 4.05809 4.83134C3.76892 4.83134 3.53446 4.59584 3.53446 4.30532C3.53446 4.01481 3.76892 3.77931 4.05809 3.77931C4.34727 3.77931 4.58173 4.01481 4.58173 4.30532ZM5.45446 4.83134C5.74363 4.83134 5.97809 4.59584 5.97809 4.30532C5.97809 4.01481 5.74363 3.77931 5.45446 3.77931C5.16528 3.77931 4.93082 4.01481 4.93082 4.30532C4.93082 4.59584 5.16528 4.83134 5.45446 4.83134ZM20.1163 4.30532C20.1163 4.20849 20.1944 4.12999 20.2908 4.12999H21.6872C21.7836 4.12999 21.8617 4.20849 21.8617 4.30532C21.8617 4.40215 21.7836 4.48066 21.6872 4.48066H20.2908C20.1944 4.48066 20.1163 4.40215 20.1163 4.30532Z"
          fill="currentColor"
        />
      </svg>
    </SvgIcon>
  )
}
const SidePanelIcon: FC<SvgIconProps> = (props) => {
  return (
    <SvgIcon {...props}>
      <svg
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <mask maskUnits="userSpaceOnUse" x="0" y="0" width="24" height="24">
          <rect width="24" height="24" fill="black" />
        </mask>
        <g mask="url(#mask0_2797_41925)">
          <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M21 3H3V21H21V3ZM14.5 5.5H5.5V18.5H14.5V5.5Z"
            fill="currentColor"
          />
        </g>
      </svg>
    </SvgIcon>
  )
}

export {
  BardIcon,
  GoogleIcon,
  EzMailAIIcon,
  ChatGPTIcon,
  UseChatGptIcon,
  GmailToolBarIconBase64Data,
  GmailToolBarDropdownIconBase64Data,
  CleanChatBoxIcon,
  GiftIcon,
  OpenAIIcon,
  ClaudeIcon,
  BingIcon,
  BrowserIcon,
  SidePanelIcon,
}
