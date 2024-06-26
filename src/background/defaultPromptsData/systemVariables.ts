import { IActionSetVariable } from '@/features/shortcuts/components/ShortcutsActionsEditor/types'

export const VARIABLE_SELECTED_TEXT: IActionSetVariable = {
  label: 'Selected text',
  VariableName: 'SELECTED_TEXT',
  valueType: 'Text',
}
// social media start ---------------------
export const VARIABLE_SOCIAL_MEDIA_POST_OR_COMMENT_CONTEXT: IActionSetVariable =
  {
    label: 'Context',
    VariableName: 'SOCIAL_MEDIA_POST_OR_COMMENT_CONTEXT',
    valueType: 'Text',
    placeholder: 'Enter context',
    defaultValue: '{{SOCIAL_MEDIA_POST_OR_COMMENT_CONTEXT}}',
    systemVariable: true,
    hidden: true,
  }
export const VARIABLE_SOCIAL_MEDIA_TARGET_POST_OR_COMMENT: IActionSetVariable =
  {
    label: 'Target post/comment',
    VariableName: 'SOCIAL_MEDIA_TARGET_POST_OR_COMMENT',
    valueType: 'Text',
    placeholder: 'Enter target post/comment',
    defaultValue: '{{SOCIAL_MEDIA_TARGET_POST_OR_COMMENT}}',
    systemVariable: true,
    hidden: true,
  }

export const VARIABLE_EMAIL_CONTEXTS_OF_WEBPAGE_FULL_EMAIL_CONTEXT: IActionSetVariable =
  {
    label: 'Email context',
    VariableName: 'EMAIL_CONTEXTS_OF_WEBPAGE_FULL_EMAIL_CONTEXT',
    valueType: 'Text',
    placeholder: 'Enter email context',
    defaultValue: '{{EMAIL_CONTEXTS_OF_WEBPAGE_FULL_EMAIL_CONTEXT}}',
    systemVariable: true,
    hidden: true,
  }

export const VARIABLE_EMAIL_CONTEXTS_OF_WEBPAGE_TARGET_EMAIL_CONTEXT: IActionSetVariable =
  {
    label: 'Target email',
    VariableName: 'EMAIL_CONTEXTS_OF_WEBPAGE_TARGET_EMAIL_CONTEXT',
    valueType: 'Text',
    placeholder: 'Enter email context',
    defaultValue: '{{EMAIL_CONTEXTS_OF_WEBPAGE_TARGET_EMAIL_CONTEXT}}',
    systemVariable: true,
    hidden: true,
  }

export const VARIABLE_MAXAI__CHAT_APP_WRITING_ASSISTANT_CHAT_MESSAGES_CONTEXT: IActionSetVariable =
  {
    label: 'Context',
    VariableName: 'MAXAI__CHAT_APP_WRITING_ASSISTANT_CHAT_MESSAGES_CONTEXT',
    valueType: 'Text',
    placeholder: 'Enter context',
    defaultValue: '{{MAXAI__CHAT_APP_WRITING_ASSISTANT_CHAT_MESSAGES_CONTEXT}}',
    systemVariable: true,
    hidden: true,
  }
export const VARIABLE_MAXAI__CHAT_APP_WRITING_ASSISTANT_REPLY_TARGET_CONTENT: IActionSetVariable =
  {
    label: 'Target message',
    VariableName: 'MAXAI__CHAT_APP_WRITING_ASSISTANT_REPLY_TARGET_CONTENT',
    valueType: 'Text',
    placeholder: 'Enter target message',
    defaultValue: '{{MAXAI__CHAT_APP_WRITING_ASSISTANT_REPLY_TARGET_CONTENT}}',
    systemVariable: true,
    hidden: true,
  }

// social media end ---------------------

// set variables modal start ---------------------

export const VARIABLE_CURRENT_WEBSITE_DOMAIN: IActionSetVariable = {
  label: 'The domain of the current website',
  VariableName: 'CURRENT_WEBSITE_DOMAIN',
  defaultValue: '{{CURRENT_WEBSITE_DOMAIN}}',
  valueType: 'Text',
  systemVariable: true,
  hidden: true,
}

export const VARIABLE_CURRENT_WEBPAGE_URL: IActionSetVariable = {
  label: 'Current page url',
  VariableName: 'CURRENT_WEBPAGE_URL',
  defaultValue: '{{CURRENT_WEBPAGE_URL}}',
  valueType: 'Text',
  systemVariable: true,
  hidden: true,
}

export const VARIABLE_AI_RESPONSE_LANGUAGE: IActionSetVariable = {
  label: 'AI Response language',
  VariableName: 'AI_RESPONSE_LANGUAGE',
  defaultValue: 'English',
  valueType: 'Select',
  systemVariable: true,
}

export const VARIABLE_AI_RESPONSE_WRITING_STYLE: IActionSetVariable = {
  label: 'Writing style',
  VariableName: 'AI_RESPONSE_WRITING_STYLE',
  defaultValue: 'Default',
  valueType: 'Select',
  systemVariable: true,
}

export const VARIABLE_AI_RESPONSE_TONE: IActionSetVariable = {
  label: 'Tone',
  VariableName: 'AI_RESPONSE_TONE',
  defaultValue: 'Default',
  valueType: 'Select',
  systemVariable: true,
}

// set variables modal end ---------------------

// output
export const OUTPUT_CHAT_COMPLETE: IActionSetVariable = {
  label: 'Chat complete',
  VariableName: 'CHAT_COMPLETE',
  valueType: 'Text',
  systemVariable: true,
}
