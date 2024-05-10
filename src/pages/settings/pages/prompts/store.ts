import { atom } from 'recoil'

import { type IChromeExtensionButtonSettingKey } from '@/background/utils/chromeExtensionStorage/type'

export const SettingPromptsEditButtonKeyAtom =
  atom<IChromeExtensionButtonSettingKey | null>({
    key: 'SettingPromptsEditButtonKey',
    default: null,
  })

export const specialInputAssistantButtonKeys: string[] = [
  'inputAssistantComposeReplyButton',
  'inputAssistantComposeNewButton',
  'inputAssistantRefineDraftButton',
]

export const EXAMPLE_PROMPT_TEMPLATE_MAPS: Record<
  IChromeExtensionButtonSettingKey,
  string
> = {
  // Context menu
  // Ignore all previous instructions. You are a real human that can read and write properly and fluently. Your task is to write a better version of the following text delimited by triple backticks.\n\nYour task means making the text clearer, easier to understand, and well put together, by correcting grammar, spelling, choosing the most suitable punctuation marks, selecting the best tone and style based on the topic and purpose of the text.\n\nChoose simple words and phrases to improve the text. Avoid ones that are too hard or confusing. Write the text like a real person would. Keep your tone balanced, not too casual or too formal, to match what the text is meant to do. If a word, phrase, or part of the text is already clear and effective, leave it as it is, unchanged.\n\nKeep the meaning the same. If possible, retain the structure of the paragraphs. Ensure the re-written text's word count is near to the original text.\n\nOutput the answer without additional context, explanation, or extra wording, just the improved text itself. Don't use any punctuation, especially no quotes or backticks, around the text.\n\nText:\n```\n{{SELECTED_TEXT}}\n```
  textSelectPopupButton: 'Provide writing improvement suggestions for `{{SELECTED_TEXT}}`.',
  // Instant reply
  // Ignore all previous instructions. You're a highly skilled email expert, adept at responding to all types of email messages in an appropriate manner. Your task is to write a reply to the following text delimited by triple backticks, which is an email message on {{CURRENT_WEBSITE_DOMAIN}}.\n\nYour task requires you to write an email reply which responds 'thank you', without confirming or denying whatever the recipient is asking for, in a polite, friendly, professional, and proper way.\n\nMake the reply clear, easy to understand, and well put together. Choose the most suitable punctuation marks, selecting the best tone and style based on the topic of the email message and the purpose of your reply.\n\nChoose simple words and phrases. Avoid ones that are too hard or confusing. Write the reply like a real person would. Keep your tone balanced, not too casual or too formal, to match what the reply is meant to do.\n\nDo not include email subject, just output the reply message. Ensure the reply's word count is no more than 100 words.\n\nOutput the reply without additional context, explanation, or extra wording, just the reply itself. Don't use any punctuation, especially no quotes or backticks, around the text.\n\nText:\n```\n{{SLICE_EMAIL_CONTEXT}}\n```
  inputAssistantComposeReplyButton: 'Thank you for sharing {{TARGET_CONTEXT}}. Your insights are truly valuable and appreciated!',
  inputAssistantComposeNewButton: 'Based on {{DRAFT_CONTEXT}}, offer specific suggestions to enhance clarity, fluency, and engagement in the text.',
  inputAssistantRefineDraftButton: 'asdasdasdjio ',
  // Summary
  sidebarSummaryButton: 'Output a summary of the {{PAGE_CONTENT}} on {{CURRENT_WEBPAGE_DOMAIN}}.',
}
