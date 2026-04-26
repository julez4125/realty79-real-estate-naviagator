# @org/integrations-standort

Location and demographic data clients for Swiss/German PLZ areas. `DestatisClient` fetches population-trend data from the Destatis API; `RegiostatClient` retrieves broader regional statistics. Both use native `fetch` with `zod` schemas for runtime validation. Full implementation with caching, error handling, and rate-limit back-off lands in **M3**. See the consensus plan in `.omc/plans/` for details.
