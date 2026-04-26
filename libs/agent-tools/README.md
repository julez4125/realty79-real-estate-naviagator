# @org/agent-tools

Shared type contracts and abort-control primitives for the Claude tool-use agent loop. Defines `ToolDefinition`, `ToolResult`, and the five abort invariants from §D.M3.5 of the consensus plan. `RunBudgetAbortController` implements the cooperative-finish abort policy: it queries `CostTracker` from `@org/integrations-llm` and signals abort when the EUR run budget is exceeded. Full agent-loop wiring (tool dispatch, structured output, retries) lands in **M3**. See `.omc/plans/` for the consensus plan.
