// TODO M3: full Tool-Use loop with abort semantics per §D.M3.5

export interface MessagesCreateParams {
  model: string;
  max_tokens: number;
  messages: Array<{ role: 'user' | 'assistant'; content: string }>;
  tools?: unknown[];
}

export interface MessagesCreateResponse {
  id: string;
  type: string;
  role: string;
  content: unknown[];
  model: string;
  stop_reason: string | null;
  usage: { input_tokens: number; output_tokens: number };
}

/**
 * Thin wrapper around the Anthropic Messages API.
 * Full Tool-Use loop with cooperative-finish abort semantics implemented in M3 per §D.M3.5.
 */
export class AnthropicClient {
  // TODO M3: replace with real Anthropic SDK client. apiKey is stashed for the future implementation.
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  constructor(_apiKey: string) {
    // intentionally empty — real wiring happens in M3 per §D.M3.5
  }

  readonly messages = {
    /**
     * Placeholder for Anthropic messages.create().
     * TODO M3: implement full streaming tool-use loop with abort semantics per §D.M3.5.
     */
    create: async (
      _params: MessagesCreateParams
    ): Promise<MessagesCreateResponse> => {
      throw new Error('AnthropicClient.messages.create not yet implemented — see M3');
    },
  };
}
