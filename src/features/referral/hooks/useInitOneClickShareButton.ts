import { useEffect, useRef } from 'react'

import { APP_USE_CHAT_GPT_HOST } from '@/constants'
import useEffectOnce from '@/features/common/hooks/useEffectOnce'
import useAutoFacebookReferral from '@/features/referral/hooks/useAutoFacebookReferral'
import useAutoLinkedinReferral from '@/features/referral/hooks/useAutoLinkedinReferral'
import useAutoTwitterReferral from '@/features/referral/hooks/useAutoTwitterReferral'
import { wait } from '@/utils'

/**
 * 初始化one-click referral, https://app.maxai.me/referral
 * @link https://app.maxai.me/referral
 */
const useInitOneClickShareButton = () => {
  const { autoTwitterReferral } = useAutoTwitterReferral()
  const { autoFacebookReferral } = useAutoFacebookReferral()
  const { autoLinkedinReferral } = useAutoLinkedinReferral()
  const ReferralActionsRef = useRef<{
    twitter?: () => Promise<boolean>
    linkedin?: () => Promise<boolean>
    facebook?: () => Promise<boolean>
  }>({})
  useEffect(() => {
    ReferralActionsRef.current = {
      twitter: autoTwitterReferral,
      linkedin: autoLinkedinReferral,
      facebook: autoFacebookReferral,
    }
  }, [autoTwitterReferral, autoLinkedinReferral, autoFacebookReferral])
  useEffectOnce(() => {
    if (
      APP_USE_CHAT_GPT_HOST &&
      location.href.includes(APP_USE_CHAT_GPT_HOST)
    ) {
      setInterval(() => {
        const oneClickShareButtonContainer = document.querySelector(
          '#appMaxAIReferralShareOneClickContainer',
        ) as HTMLDivElement
        const oneClickShareButton: HTMLButtonElement | null =
          document.querySelector('#appMaxAIReferralShareOneClickButton')
        console.log(
          'useInitOneClickShareButton oneClickShareButtonContainer',
          oneClickShareButtonContainer,
        )
        if (oneClickShareButtonContainer && oneClickShareButton) {
          if (!oneClickShareButtonContainer.classList.contains('loaded')) {
            oneClickShareButtonContainer.classList.add('loaded')
          } else {
            console.log('useInitOneClickShareButton has injected')
            return
          }
          oneClickShareButton.addEventListener('click', async () => {
            const needReferralSocialMediaElements = Array.from(
              document.querySelectorAll(
                '.app-maxai-me__one-click-share-status-card[data-checked="true"]',
              ),
            )
            for (let i = 0; i < needReferralSocialMediaElements.length; i++) {
              const needReferralSocialMediaElement =
                needReferralSocialMediaElements[i]
              const socialMediaName =
                needReferralSocialMediaElement.getAttribute('data-name')
              const runFn =
                ReferralActionsRef.current?.[socialMediaName as 'twitter']
              if (runFn) {
                await runFn()
              }
            }
            await wait(3000)
            // 获取当前页面的 URL
            const url = new URL(window.location.href)
            // 创建 URLSearchParams 对象，用于处理查询参数
            const searchParams = new URLSearchParams(url.search)
            // 添加新的查询参数
            searchParams.set('show_completed', 'true')
            // 更新 URL 的查询参数
            url.search = searchParams.toString()
            // 将更新后的 URL 赋值给 window.location.href，实现页面跳转
            window.location.href = url.toString()
          })
        }
      }, 1000)
    }
  })
}
export default useInitOneClickShareButton
