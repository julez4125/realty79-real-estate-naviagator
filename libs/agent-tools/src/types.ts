/**
 * Defines the shape of a single Anthropic tool for the tool-use API.
 */
export interface ToolDefinition {
  name: string;
  description: string;
  input_schema: {
    type: 'object';
    properties: Record<string, unknown>;
    required?: string[];
  };
}

/**
 * The result returned by a tool handler back to the agent loop.
 */
export interface ToolResult {
  content: string;
  is_error?: boolean;
}

/**
 * The five abort invariants from §D.M3.5 of the consensus plan.
 *
 * 1. BUDGET_EXCEEDED   — cumulative EUR cost has exceeded the configured run budget.
 * 2. MAX_TURNS_REACHED — the agent has completed the maximum allowed tool-use turns.
 * 3. FATAL_TOOL_ERROR  — a tool returned is_error=true and the error is unrecoverable.
 * 4. USER_REQUESTED    — an external cancellation signal was received.
 * 5. COOPERATIVE_FINISH — the model emitted stop_reason='end_turn' with no pending tools.
 */
export type AbortReason =
  | 'BUDGET_EXCEEDED'
  | 'MAX_TURNS_REACHED'
  | 'FATAL_TOOL_ERROR'
  | 'USER_REQUESTED'
  | 'COOPERATIVE_FINISH';
