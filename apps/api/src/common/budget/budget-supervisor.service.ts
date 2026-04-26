import { Injectable } from '@nestjs/common';

export interface RunHandle {
  savedSearchId: string;
  budgetEur: number;
  cumulativeEur: number;
  aborted: boolean;
}

/**
 * In-process €-budget supervisor for M0.
 * M3 will swap in a Redis-backed implementation per §D.M3.5.
 */
@Injectable()
export class BudgetSupervisorService {
  startRun(savedSearchId: string, budgetEur: number): RunHandle {
    return {
      savedSearchId,
      budgetEur,
      cumulativeEur: 0,
      aborted: false,
    };
  }

  record(handle: RunHandle, costEur: number): void {
    handle.cumulativeEur += costEur;
    if (handle.cumulativeEur > handle.budgetEur) {
      handle.aborted = true;
      throw new Error(
        `Budget exceeded for savedSearchId=${handle.savedSearchId}: ` +
          `${handle.cumulativeEur.toFixed(4)} EUR > ${handle.budgetEur.toFixed(4)} EUR`,
      );
    }
  }

  finishRun(handle: RunHandle): { totalEur: number; aborted: boolean } {
    return {
      totalEur: handle.cumulativeEur,
      aborted: handle.aborted,
    };
  }
}
