export const ONBOARDING_TOOLTIP_SCENE_TYPES = [
  'CONTEXT_MENU_CTA_BUTTON',
  'FLOATING_CONTEXT_MENU_INPUT_BOX',
  'FLOATING_CONTEXT_MENU_LIST_BOX',
  'FLOATING_CONTEXT_MENU_REPLACE_SELECTION_MENUITEM',
  'FLOATING_CONTEXT_MENU_INPUT_BOX_AFTER_AI_RESPONSE',
  'QUICK_ACCESS_CTA_BUTTON',

  // summary 不区分 gmail、 outlook 之类的
  'EMAIL_SUMMARY_BUTTON',

  'PDF_SUMMARY_BUTTON',

  // ==================== instant reply start ====================
  // instant reply 需要区分不同 社媒场景和使用场景
  // Gmail
  'INSTANT_REPLY__GMAIL__COMPOSE_REPLY_BUTTON',
  'INSTANT_REPLY__GMAIL__COMPOSE_NEW_BUTTON',
  'INSTANT_REPLY__GMAIL__REFINE_DRAFT_BUTTON',

  // Outlook
  'INSTANT_REPLY__OUTLOOK__COMPOSE_REPLY_BUTTON',
  'INSTANT_REPLY__OUTLOOK__COMPOSE_NEW_BUTTON',
  'INSTANT_REPLY__OUTLOOK__REFINE_DRAFT_BUTTON',

  // Twitter
  'INSTANT_REPLY__TWITTER__COMPOSE_REPLY_BUTTON',
  'INSTANT_REPLY__TWITTER__COMPOSE_NEW_BUTTON',
  'INSTANT_REPLY__TWITTER__REFINE_DRAFT_BUTTON',

  // LinkedIn
  'INSTANT_REPLY__LINKEDIN__COMPOSE_REPLY_BUTTON',
  'INSTANT_REPLY__LINKEDIN__COMPOSE_NEW_BUTTON',
  'INSTANT_REPLY__LINKEDIN__REFINE_DRAFT_BUTTON',

  // Facebook
  'INSTANT_REPLY__FACEBOOK__COMPOSE_REPLY_BUTTON',
  'INSTANT_REPLY__FACEBOOK__COMPOSE_NEW_BUTTON',
  'INSTANT_REPLY__FACEBOOK__REFINE_DRAFT_BUTTON',

  // YouTube
  'INSTANT_REPLY__YOUTUBE__COMPOSE_REPLY_BUTTON',
  'INSTANT_REPLY__YOUTUBE__COMPOSE_NEW_BUTTON',
  'INSTANT_REPLY__YOUTUBE__REFINE_DRAFT_BUTTON',

  // YouTube Studio
  'INSTANT_REPLY__YOUTUBE_STUDIO__COMPOSE_REPLY_BUTTON',
  'INSTANT_REPLY__YOUTUBE_STUDIO__COMPOSE_NEW_BUTTON',
  'INSTANT_REPLY__YOUTUBE_STUDIO__REFINE_DRAFT_BUTTON',

  // Reddit
  'INSTANT_REPLY__REDDIT__COMPOSE_REPLY_BUTTON',
  'INSTANT_REPLY__REDDIT__COMPOSE_NEW_BUTTON',
  'INSTANT_REPLY__REDDIT__REFINE_DRAFT_BUTTON',

  // Discord
  'INSTANT_REPLY__DISCORD__COMPOSE_REPLY_BUTTON',
  'INSTANT_REPLY__DISCORD__REFINE_DRAFT_BUTTON',

  // Slack
  'INSTANT_REPLY__SLACK__COMPOSE_REPLY_BUTTON',
  'INSTANT_REPLY__SLACK__REFINE_DRAFT_BUTTON',

  // WhatsApp
  'INSTANT_REPLY__WHATSAPP__COMPOSE_REPLY_BUTTON',
  'INSTANT_REPLY__WHATSAPP__REFINE_DRAFT_BUTTON',

  // Telegram
  'INSTANT_REPLY__TELEGRAM__COMPOSE_REPLY_BUTTON',
  'INSTANT_REPLY__TELEGRAM__REFINE_DRAFT_BUTTON',

  // Messenger
  'INSTANT_REPLY__MESSENGER__COMPOSE_REPLY_BUTTON',
  'INSTANT_REPLY__MESSENGER__REFINE_DRAFT_BUTTON',

  // Instagram
  'INSTANT_REPLY__INSTAGRAM__COMPOSE_REPLY_BUTTON',
  'INSTANT_REPLY__INSTAGRAM__COMPOSE_NEW_BUTTON',
  'INSTANT_REPLY__INSTAGRAM__REFINE_DRAFT_BUTTON',
  // ==================== instant reply end ====================
] as const
