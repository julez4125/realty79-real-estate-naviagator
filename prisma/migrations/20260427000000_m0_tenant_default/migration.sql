-- M0 default Tenant — bootstraps single-tenant ops while multi-tenant scaffolding is prepared.
INSERT INTO "Tenant" (id, name, email, plan, "createdAt", "updatedAt")
VALUES ('default', 'Default Tenant', 'admin@localhost', 'self-hosted', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;
