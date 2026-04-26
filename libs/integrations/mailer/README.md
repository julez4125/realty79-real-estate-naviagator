# @org/integrations-mailer

Email send/receive integration for the realty79 outreach pipeline. Provides SMTP transport via `nodemailer`, IMAP polling via `imapflow`, a Handlebars-style template engine, and an LLM-backed reply classifier that categorises inbound replies as `documents-attached`, `more-info-requested`, `off-topic`, or `negative-reply`. SMTP + IMAP wiring lands in **M5.1**; template rendering and reply classification in **M5.2**. See the consensus plan in `.omc/plans/`.
