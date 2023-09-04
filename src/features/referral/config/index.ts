const ReferralConfig = {
  inviteLink: (referralCode: string) => {
    // 尝试获取用户填写的referral link
    const userInputText =
      (
        document.querySelector(
          '#appMaxAIReferralShareOneClickText',
        ) as HTMLDivElement
      )?.innerText || ''
    return (
      userInputText ||
      `Sign up on MaxAI.me using my link and both of us will get a free week of MaxAI Pro rewards. It lets you use AI on any webpage with one click, powered by ChatGPT, Claude, Bard, and Bing AI. Here is my link: https://app.maxai.me?invite=${referralCode}`
    )
  },
  inviteLinkMatchText:
    'using my link and both of us will get a free week of MaxAI Pro rewards',
}
export default ReferralConfig
