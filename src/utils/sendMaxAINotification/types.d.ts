export type botUuid =
  // use chatgpt cmd + j not working larkbot
  | 'dd385931-45f4-4de1-8e48-8145561b0f9d'
  // pricing issue
  | '7a04bc02-6155-4253-bcdb-ade3db6de492'
  // maxai api issue
  | '6f02f533-def6-4696-b14e-1b00c2d9a4df'
  // maxai referral
  | '608156c7-e65d-4a69-a055-6c10a6ba7217'
  // maxai summary
  | '95fbacd5-f4a6-4fca-9d77-ac109ae4a94a'
  //  maxai memory indexdb log
  | '247cb207-4b00-4cd3-be74-bdb9ade6f8f4'

export type SendNotificationType =
  | 'PRICING'
  | 'REFERRAL'
  | 'MEMORY'
  | 'CLIENT'
  | 'MAXAI_API'
  | 'SUMMARY'
