# @org/integrations-proxy

Pure-utility proxy adapter layer with no external runtime dependencies. Exposes the `ProxyAdapter` interface and a `BrightDataAdapter` implementation that reads server/username/password from environment variables. Designed to be injected into scraper sessions to route traffic through residential proxies. Full proxy-rotation logic and health-checking land in **M3**. See the consensus plan in `.omc/plans/` for details.
