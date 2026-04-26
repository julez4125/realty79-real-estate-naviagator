# @org/integrations-immometrica

Immometrica portal integration: login flow, saved-search CSV export trigger, and CSV row parser. Uses `@org/integrations-scraper` for browser automation and `csv-parse` for structured row parsing into typed `ImmometricaListing` objects. The full authenticated session management, robust CSV download, and field normalisation are implemented in **M2**. See the consensus plan in `.omc/plans/` for milestone scope.
