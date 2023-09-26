import React, { FC } from 'react'
import { Box, SvgIcon } from '@mui/material'
import { ISearchWithAIProviderType } from '../constants'

export interface ISearchWIthAIProviderIconProps {
  aiProviderType: ISearchWithAIProviderType
  isActive: boolean
}
const ProviderIcon: FC<ISearchWIthAIProviderIconProps> = (props) => {
  const { aiProviderType } = props
  return (
    <>
      {aiProviderType === 'USE_CHAT_GPT_PLUS' && (
        <SvgIcon viewBox="0 0 24 24">
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <g clipPath="url(#clip0_4133_35975)">
              <path
                d="M20 0H4C1.79086 0 0 1.79086 0 4V20C0 22.2091 1.79086 24 4 24H20C22.2091 24 24 22.2091 24 20V4C24 1.79086 22.2091 0 20 0Z"
                fill="#0FA47F"
              />
              <path
                d="M19.8134 10.3669C20.0179 9.76086 20.0888 9.11884 20.0215 8.48367C19.9541 7.8485 19.75 7.23485 19.4228 6.68381C18.9378 5.85033 18.197 5.19043 17.3073 4.79933C16.4175 4.40824 15.4248 4.30617 14.4724 4.50786C14.0428 4.03019 13.5148 3.64857 12.9236 3.38854C12.3325 3.12851 11.6919 2.99607 11.0447 3.00009C10.0709 2.99778 9.12167 3.30061 8.33362 3.86497C7.54557 4.42931 6.95954 5.22601 6.65998 6.14017C6.02565 6.2683 5.42637 6.52864 4.90228 6.90378C4.37818 7.27893 3.94135 7.7602 3.62103 8.31541C3.13216 9.14661 2.92348 10.1094 3.02509 11.0653C3.1267 12.021 3.53334 12.9202 4.18638 13.6332C3.9819 14.2391 3.91098 14.8812 3.97833 15.5164C4.04569 16.1515 4.24978 16.7652 4.57695 17.3162C5.062 18.1497 5.80283 18.8095 6.69259 19.2007C7.58234 19.5917 8.57502 19.6938 9.52738 19.4922C9.95701 19.9698 10.485 20.3515 11.0761 20.6115C11.6673 20.8715 12.3079 21.0039 12.955 20.9999C13.9293 21.0024 14.8791 20.6995 15.6674 20.1348C16.4558 19.5701 17.042 18.7728 17.3412 17.8581C17.9756 17.73 18.5748 17.4696 19.099 17.0945C19.623 16.7193 20.0598 16.238 20.3801 15.6829C20.8685 14.8518 21.0766 13.8891 20.9748 12.9336C20.8729 11.9783 20.4663 11.0795 19.8134 10.3669ZM12.9566 19.8233C12.1568 19.8244 11.3822 19.548 10.7681 19.0426C10.7959 19.0277 10.8444 19.0015 10.876 18.9823L14.5084 16.9121C14.5996 16.8609 14.6753 16.7866 14.7277 16.697C14.7802 16.6074 14.8075 16.5056 14.8069 16.4022V11.3494L16.3422 12.2241C16.3502 12.2281 16.3571 12.2339 16.3624 12.2412C16.3676 12.2485 16.3708 12.2568 16.372 12.2656V16.45C16.3708 17.3438 16.0107 18.2006 15.3706 18.8328C14.7304 19.4651 13.8623 19.8213 12.9566 19.8233ZM5.61127 16.7279C5.2107 16.0449 5.06633 15.2448 5.20344 14.4675C5.23041 14.4834 5.27753 14.5118 5.31133 14.531L8.94366 16.6012C9.03419 16.6533 9.13717 16.6809 9.24202 16.6809C9.34683 16.6809 9.44981 16.6533 9.54034 16.6012L13.975 14.0746V15.8241C13.9755 15.833 13.9738 15.8419 13.97 15.8501C13.9661 15.8582 13.9604 15.8652 13.9531 15.8706L10.2812 17.9624C9.49578 18.4088 8.56298 18.5294 7.6875 18.298C6.81201 18.0665 6.06532 17.5019 5.61127 16.7279ZM4.65571 8.90375C5.05454 8.21992 5.68448 7.69639 6.4352 7.42473C6.4352 7.4556 6.4334 7.51027 6.4334 7.5482V11.6886C6.43277 11.792 6.46006 11.8937 6.51245 11.9834C6.56484 12.0729 6.64047 12.147 6.73155 12.1982L11.1663 14.7244L9.63096 15.5991C9.62339 15.6041 9.61468 15.607 9.60565 15.6078C9.59662 15.6086 9.5875 15.6072 9.57915 15.6038L5.90689 13.51C5.12286 13.0621 4.55086 12.3255 4.31631 11.462C4.08177 10.5986 4.20382 9.6786 4.65571 8.90375ZM17.2697 11.8L12.835 9.27351L14.3703 8.39916C14.3779 8.39426 14.3865 8.39124 14.3955 8.39043C14.4047 8.38962 14.4137 8.39106 14.422 8.39457L18.0944 10.4864C18.657 10.807 19.1152 11.2792 19.4158 11.8476C19.7163 12.416 19.8464 13.0571 19.791 13.6958C19.7355 14.3345 19.4968 14.9445 19.1028 15.4542C18.7087 15.9639 18.1757 16.3523 17.566 16.5738C17.566 16.5426 17.566 16.4881 17.566 16.45V12.3096C17.5668 12.2064 17.5398 12.1048 17.4878 12.0152C17.4357 11.9256 17.3604 11.8515 17.2697 11.8ZM18.7978 9.53077C18.7708 9.51445 18.7237 9.4864 18.6899 9.46728L15.0576 7.39705C14.9669 7.34494 14.8641 7.31745 14.7592 7.31745C14.6544 7.31745 14.5514 7.34494 14.4609 7.39705L10.0261 9.92365V8.17421C10.0257 8.16525 10.0274 8.15634 10.0313 8.14823C10.035 8.14014 10.0409 8.13308 10.0481 8.12772L13.72 6.03762C14.2825 5.71758 14.9258 5.5622 15.5747 5.58968C16.2234 5.61716 16.8507 5.82636 17.3835 6.1928C17.9161 6.55924 18.332 7.06776 18.5825 7.6589C18.833 8.25003 18.9076 8.89929 18.7978 9.53077ZM9.19149 12.6489L7.65581 11.7742C7.64778 11.7702 7.64081 11.7644 7.6356 11.7571C7.6304 11.7498 7.62707 11.7415 7.62598 11.7326V7.5482C7.62639 6.90734 7.81183 6.27983 8.16054 5.73914C8.5093 5.19846 9.00692 4.76697 9.59516 4.49519C10.1834 4.22342 10.8379 4.12259 11.4821 4.20452C12.1263 4.28645 12.7336 4.54774 13.2327 4.95781C13.2051 4.97271 13.1568 4.99898 13.1248 5.01814L9.4925 7.08834C9.40133 7.13946 9.32567 7.21361 9.27317 7.30318C9.22073 7.39273 9.19341 7.49448 9.194 7.59788L9.19149 12.6489ZM10.0254 10.8746L12.0006 9.74903L13.9757 10.8739V13.1244L12.0006 14.2492L10.0254 13.1244V10.8746Z"
                fill="white"
              />
            </g>
            <defs>
              <clipPath id="clip0_4133_35975">
                <rect width="24" height="24" fill="white" />
              </clipPath>
            </defs>
          </svg>
        </SvgIcon>
      )}
      {aiProviderType === 'OPENAI_API' && (
        <SvgIcon
          viewBox="0 0 24 24"
          sx={{
            color: (t) =>
              props.isActive
                ? t.palette.mode === 'dark'
                  ? '#fff'
                  : 'rgba(0,0,0,1)'
                : '#717171',
          }}
        >
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
      )}
      {aiProviderType === 'OPENAI' && (
        <SvgIcon viewBox="0 0 24 24">
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <g clipPath="url(#clip0_4133_35972)">
              <path
                d="M20 0H4C1.79086 0 0 1.79086 0 4V20C0 22.2091 1.79086 24 4 24H20C22.2091 24 24 22.2091 24 20V4C24 1.79086 22.2091 0 20 0Z"
                fill={props.isActive ? 'black' : '#D9D9D9'}
              />
              <path
                d="M19.8134 10.3669C20.0179 9.76086 20.0888 9.11884 20.0215 8.48367C19.9541 7.8485 19.75 7.23485 19.4228 6.68381C18.9378 5.85033 18.197 5.19043 17.3073 4.79933C16.4175 4.40824 15.4248 4.30617 14.4724 4.50786C14.0428 4.03019 13.5148 3.64857 12.9236 3.38854C12.3325 3.12851 11.6919 2.99607 11.0447 3.00009C10.0709 2.99778 9.12167 3.30061 8.33362 3.86497C7.54557 4.42931 6.95954 5.22601 6.65998 6.14017C6.02565 6.2683 5.42637 6.52864 4.90228 6.90378C4.37818 7.27893 3.94135 7.7602 3.62103 8.31541C3.13216 9.14661 2.92348 10.1094 3.02509 11.0653C3.1267 12.021 3.53334 12.9202 4.18638 13.6332C3.9819 14.2391 3.91098 14.8812 3.97833 15.5164C4.04569 16.1515 4.24978 16.7652 4.57695 17.3162C5.062 18.1497 5.80283 18.8095 6.69259 19.2007C7.58234 19.5917 8.57502 19.6938 9.52738 19.4922C9.95701 19.9698 10.485 20.3515 11.0761 20.6115C11.6673 20.8715 12.3079 21.0039 12.955 20.9999C13.9293 21.0024 14.8791 20.6995 15.6674 20.1348C16.4558 19.5701 17.042 18.7728 17.3412 17.8581C17.9756 17.73 18.5748 17.4696 19.099 17.0945C19.623 16.7193 20.0598 16.238 20.3801 15.6829C20.8685 14.8518 21.0766 13.8891 20.9748 12.9336C20.8729 11.9783 20.4663 11.0795 19.8134 10.3669ZM12.9566 19.8233C12.1568 19.8244 11.3822 19.548 10.7681 19.0426C10.7959 19.0277 10.8444 19.0015 10.876 18.9823L14.5084 16.9121C14.5996 16.8609 14.6753 16.7866 14.7277 16.697C14.7802 16.6074 14.8075 16.5056 14.8069 16.4022V11.3494L16.3422 12.2241C16.3502 12.2281 16.3571 12.2339 16.3624 12.2412C16.3676 12.2485 16.3708 12.2568 16.372 12.2656V16.45C16.3708 17.3438 16.0107 18.2006 15.3706 18.8328C14.7304 19.4651 13.8623 19.8213 12.9566 19.8233ZM5.61127 16.7279C5.2107 16.0449 5.06633 15.2448 5.20344 14.4675C5.23041 14.4834 5.27753 14.5118 5.31133 14.531L8.94366 16.6012C9.03419 16.6533 9.13717 16.6809 9.24202 16.6809C9.34683 16.6809 9.44981 16.6533 9.54034 16.6012L13.975 14.0746V15.8241C13.9755 15.833 13.9738 15.8419 13.97 15.8501C13.9661 15.8582 13.9604 15.8652 13.9531 15.8706L10.2812 17.9624C9.49578 18.4088 8.56298 18.5294 7.6875 18.298C6.81201 18.0665 6.06532 17.5019 5.61127 16.7279ZM4.65571 8.90375C5.05454 8.21992 5.68448 7.69639 6.4352 7.42473C6.4352 7.4556 6.4334 7.51027 6.4334 7.5482V11.6886C6.43277 11.792 6.46006 11.8937 6.51245 11.9834C6.56484 12.0729 6.64047 12.147 6.73155 12.1982L11.1663 14.7244L9.63096 15.5991C9.62339 15.6041 9.61468 15.607 9.60565 15.6078C9.59662 15.6086 9.5875 15.6072 9.57915 15.6038L5.90689 13.51C5.12286 13.0621 4.55086 12.3255 4.31631 11.462C4.08177 10.5986 4.20382 9.6786 4.65571 8.90375ZM17.2697 11.8L12.835 9.27351L14.3703 8.39916C14.3779 8.39426 14.3865 8.39124 14.3955 8.39043C14.4047 8.38962 14.4137 8.39106 14.422 8.39457L18.0944 10.4864C18.657 10.807 19.1152 11.2792 19.4158 11.8476C19.7163 12.416 19.8464 13.0571 19.791 13.6958C19.7355 14.3345 19.4968 14.9445 19.1028 15.4542C18.7087 15.9639 18.1757 16.3523 17.566 16.5738C17.566 16.5426 17.566 16.4881 17.566 16.45V12.3096C17.5668 12.2064 17.5398 12.1048 17.4878 12.0152C17.4357 11.9256 17.3604 11.8515 17.2697 11.8ZM18.7978 9.53077C18.7708 9.51445 18.7237 9.4864 18.6899 9.46728L15.0576 7.39705C14.9669 7.34494 14.8641 7.31745 14.7592 7.31745C14.6544 7.31745 14.5514 7.34494 14.4609 7.39705L10.0261 9.92365V8.17421C10.0257 8.16525 10.0274 8.15634 10.0313 8.14823C10.035 8.14014 10.0409 8.13308 10.0481 8.12772L13.72 6.03762C14.2825 5.71758 14.9258 5.5622 15.5747 5.58968C16.2234 5.61716 16.8507 5.82636 17.3835 6.1928C17.9161 6.55924 18.332 7.06776 18.5825 7.6589C18.833 8.25003 18.9076 8.89929 18.7978 9.53077ZM9.19149 12.6489L7.65581 11.7742C7.64778 11.7702 7.64081 11.7644 7.6356 11.7571C7.6304 11.7498 7.62707 11.7415 7.62598 11.7326V7.5482C7.62639 6.90734 7.81183 6.27983 8.16054 5.73914C8.5093 5.19846 9.00692 4.76697 9.59516 4.49519C10.1834 4.22342 10.8379 4.12259 11.4821 4.20452C12.1263 4.28645 12.7336 4.54774 13.2327 4.95781C13.2051 4.97271 13.1568 4.99898 13.1248 5.01814L9.4925 7.08834C9.40133 7.13946 9.32567 7.21361 9.27317 7.30318C9.22073 7.39273 9.19341 7.49448 9.194 7.59788L9.19149 12.6489ZM10.0254 10.8746L12.0006 9.74903L13.9757 10.8739V13.1244L12.0006 14.2492L10.0254 13.1244V10.8746Z"
                fill="white"
              />
            </g>
            <defs>
              <clipPath id="clip0_4133_35972">
                <rect width="24" height="24" fill="white" />
              </clipPath>
            </defs>
          </svg>
        </SvgIcon>
      )}
      {aiProviderType === 'BARD' && (
        <SvgIcon>
          <svg
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
      )}
      {aiProviderType === 'BING' && (
        <SvgIcon>
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
      )}
      {aiProviderType === 'CLAUDE' && (
        <SvgIcon
          sx={{
            color: (t) =>
              props.isActive
                ? t.palette.mode === 'dark'
                  ? '#fff'
                  : 'rgba(0,0,0,1)'
                : '#717171',
          }}
        >
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <g clipPath="url(#clip0_8435_67633)">
              <path
                d="M15.6487 6H13.0444L17.7937 18H20.3981L15.6487 6ZM8.12437 6L3.375 18H6.03075L7.002 15.48H11.9707L12.942 18H15.5977L10.8484 6H8.12437ZM7.86112 13.2514L9.48637 9.03412L11.1116 13.2514H7.86112Z"
                fill="currentColor"
              />
            </g>
            <defs>
              <clipPath id="clip0_8435_67633">
                <rect width="24" height="24" fill="white" />
              </clipPath>
            </defs>
          </svg>
        </SvgIcon>
      )}
      {aiProviderType === 'MAXAI_CLAUDE' && (
        <SvgIcon>
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <g clipPath="url(#clip0_8435_67633)">
              <path
                d="M20 0H4C1.79086 0 0 1.79086 0 4V20C0 22.2091 1.79086 24 4 24H20C22.2091 24 24 22.2091 24 20V4C24 1.79086 22.2091 0 20 0Z"
                fill="#D19974"
              />
              <path
                d="M15.6487 6H13.0444L17.7937 18H20.3981L15.6487 6ZM8.12437 6L3.375 18H6.03075L7.002 15.48H11.9707L12.942 18H15.5977L10.8484 6H8.12437ZM7.86112 13.2514L9.48637 9.03412L11.1116 13.2514H7.86112Z"
                fill="#1F1F1F"
              />
            </g>
            <defs>
              <clipPath id="clip0_8435_67633">
                <rect width="24" height="24" fill="white" />
              </clipPath>
            </defs>
          </svg>
        </SvgIcon>
      )}
    </>
  )
}

const SearchWIthAIProviderIcon: FC<ISearchWIthAIProviderIconProps> = (
  props,
) => {
  const { isActive } = props

  return (
    <Box
      component={'span'}
      sx={{
        p: 1,
        lineHeight: 0,
        // bgcolor: isActive ? 'red' : 'transparent',
        filter: `grayscale(${isActive ? '0' : '1'})`,

        bgcolor: isActive ? 'rgba(0, 0, 0, 0.12)' : 'transparent',
      }}
    >
      <ProviderIcon {...props} />
    </Box>
  )
}

export default SearchWIthAIProviderIcon
