export enum PoeModel {
  ClaudeInstant = 'a2',
  ClaudePlus = 'a2_2',
  ClaudeInstant100k = 'a2_100k',
}
export const POE_MODELS = [
  {
    label: 'Claude-instant',
    value: PoeModel.ClaudeInstant,
    description: `Anthropic’s fastest model, with strength in creative tasks. Features a context window of 9k tokens (around 7,000 words).`,
  },
  {
    label: 'Claude+',
    value: PoeModel.ClaudePlus,
    description:
      "Anthropic's most powerful model. Particularly good at creative writing.",
  },
  {
    label: 'Claude-instant-100k',
    value: PoeModel.ClaudeInstant100k,
    description: `Anthropic’s fastest model, with an increased context window of 100k tokens (around 75,000 words). Enables analysis of very long documents, code, and more. Since this is an experimental early access model, usage is currently limited to 100 messages per month for Poe subscribers (subject to change).`,
  },
]
