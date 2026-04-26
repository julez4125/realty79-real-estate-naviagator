import type { CostTracker } from '@org/integrations-llm';
import type { AbortReason } from './types.js';

/**
 * Implements the cooperative-finish abort policy from §D.M3.5.
 *
 * The controller is checked after each tool-use turn. When the cumulative EUR
 * cost tracked by CostTracker exceeds the configured runBudgetEur, shouldAbort()
 * returns true and the agent loop must honour the abort on the next cooperative
 * finish boundary (i.e. after the current tool completes, not mid-execution).
 *
 * TODO M3: extend with MAX_TURNS_REACHED, FATAL_TOOL_ERROR, and USER_REQUESTED
 * signals. Wire into the main agent loop in @org/agent-tools.
 */
export class RunBudgetAbortController {
  private readonly runBudgetEur: number;
  private readonly costTracker: CostTracker;
  private aborted = false;
  private abortReason: AbortReason | null = null;

  constructor(runBudgetEur: number, costTracker: CostTracker) {
    this.runBudgetEur = runBudgetEur;
    this.costTracker = costTracker;
  }

  /**
   * Returns true when the run should abort on the next cooperative-finish boundary.
   * Automatically sets the reason to BUDGET_EXCEEDED when the budget is exhausted.
   */
  shouldAbort(): boolean {
    if (this.aborted) return true;

    if (this.costTracker.totalEur() >= this.runBudgetEur) {
      this.aborted = true;
      this.abortReason = 'BUDGET_EXCEEDED';
      return true;
    }

    return false;
  }

  /**
   * Manually mark the run as aborted with the given reason.
   */
  markAborted(reason: AbortReason = 'USER_REQUESTED'): void {
    this.aborted = true;
    this.abortReason = reason;
  }

  /**
   * Returns the abort reason, or null if the run has not been aborted.
   */
  getAbortReason(): AbortReason | null {
    return this.abortReason;
  }
}
