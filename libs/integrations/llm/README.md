# @org/integrations-llm

Thin wrapper around the Anthropic Claude API for the realty79 pipeline. Provides `AnthropicClient` (messages, tool-use loop) and `CostTracker` (EUR-denominated token billing using the streaming-token convention). The real implementation — full Tool-Use loop with abort semantics and cooperative-finish policy — lands in **M3** (see consensus plan `.omc/plans/`). This package exists as a typed interface boundary so agent-tools and other consumers can import stubs without circular dependencies during earlier milestones.
