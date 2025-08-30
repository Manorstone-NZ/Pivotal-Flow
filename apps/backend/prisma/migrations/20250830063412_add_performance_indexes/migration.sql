-- CreateIndex
CREATE INDEX "idx_audit_logs_org_created" ON "audit_logs"("organizationId", "createdAt" DESC);

-- CreateIndex
CREATE INDEX "idx_audit_logs_org_entity" ON "audit_logs"("organizationId", "entityType", "entityId");

-- CreateIndex
CREATE INDEX "idx_audit_logs_org_action" ON "audit_logs"("organizationId", "action", "createdAt" DESC);

-- CreateIndex
CREATE INDEX "idx_roles_org_active" ON "roles"("organizationId", "isActive");

-- CreateIndex
CREATE INDEX "idx_roles_org_name" ON "roles"("organizationId", "name");

-- CreateIndex
CREATE INDEX "idx_user_roles_org_user_active" ON "user_roles"("organizationId", "userId", "isActive");

-- CreateIndex
CREATE INDEX "idx_user_roles_org_role_active" ON "user_roles"("organizationId", "roleId", "isActive");

-- CreateIndex
CREATE INDEX "idx_users_org_status_deleted" ON "users"("organizationId", "status", "deletedAt");

-- CreateIndex
CREATE INDEX "idx_users_org_email" ON "users"("organizationId", "email");

-- CreateIndex
CREATE INDEX "idx_users_org_created" ON "users"("organizationId", "createdAt" DESC);
