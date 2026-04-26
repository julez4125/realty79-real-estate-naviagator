/**
 * Tracks LLM token costs in EUR using the streaming-token-billing convention from §D.M3.5.
 * Input and output tokens are priced per model; totals are accumulated across calls.
 */

interface TokenRecord {
  inputTokens: number;
  outputTokens: number;
  model: string;
}

// Approximate EUR rates per 1M tokens (placeholder — update in M3 with real Anthropic pricing).
const EUR_PER_1M_INPUT: Record<string, number> = {
  'claude-3-5-sonnet-20241022': 3.0,
  'claude-3-haiku-20240307': 0.25,
};

const EUR_PER_1M_OUTPUT: Record<string, number> = {
  'claude-3-5-sonnet-20241022': 15.0,
  'claude-3-haiku-20240307': 1.25,
};

const DEFAULT_INPUT_RATE = 3.0;
const DEFAULT_OUTPUT_RATE = 15.0;

export class CostTracker {
  private readonly records: TokenRecord[] = [];

  /**
   * Record token usage for a single API call.
   * @param inputTokens  - number of input/prompt tokens billed
   * @param outputTokens - number of output/completion tokens billed
   * @param model        - Anthropic model identifier
   */
  record(inputTokens: number, outputTokens: number, model: string): void {
    this.records.push({ inputTokens, outputTokens, model });
  }

  /**
   * Returns the cumulative cost in EUR across all recorded calls.
   */
  totalEur(): number {
    return this.records.reduce((sum, r) => {
      const inputRate = EUR_PER_1M_INPUT[r.model] ?? DEFAULT_INPUT_RATE;
      const outputRate = EUR_PER_1M_OUTPUT[r.model] ?? DEFAULT_OUTPUT_RATE;
      return sum + (r.inputTokens * inputRate + r.outputTokens * outputRate) / 1_000_000;
    }, 0);
  }
}
