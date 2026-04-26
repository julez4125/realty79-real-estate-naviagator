export type ReplyCategory =
  | 'documents-attached'
  | 'more-info-requested'
  | 'off-topic'
  | 'negative-reply';

/**
 * Classifies inbound reply text into one of the four reply categories
 * using an LLM-backed classification prompt.
 *
 * TODO M5.2: implement — send text to AnthropicClient with a classification
 * system prompt, parse structured JSON response, map to ReplyCategory.
 */
export async function classifyReply(_text: string): Promise<ReplyCategory> {
  throw new Error('classifyReply not yet implemented — see M5.2');
}
