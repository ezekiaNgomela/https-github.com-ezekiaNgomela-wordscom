-- Phase 32.4 - Database Migrations (Initial Production Schema)
-- WordCom SaaS Core Tables

-- USERS
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  data JSONB NOT NULL,
  created_at BIGINT NOT NULL,
  updated_at BIGINT NOT NULL
);

-- SESSIONS (refresh token system)
CREATE TABLE IF NOT EXISTS sessions (
  id TEXT PRIMARY KEY,
  data JSONB NOT NULL,
  created_at BIGINT NOT NULL,
  updated_at BIGINT NOT NULL
);

-- OTP STORAGE
CREATE TABLE IF NOT EXISTS otp_sessions (
  id TEXT PRIMARY KEY,
  data JSONB NOT NULL,
  created_at BIGINT NOT NULL,
  expires_at BIGINT NOT NULL
);

-- AUDIT LOGS
CREATE TABLE IF NOT EXISTS audit_logs (
  id TEXT PRIMARY KEY,
  data JSONB NOT NULL,
  created_at BIGINT NOT NULL
);

-- WORKSPACES
CREATE TABLE IF NOT EXISTS workspaces (
  id TEXT PRIMARY KEY,
  data JSONB NOT NULL,
  created_at BIGINT NOT NULL,
  updated_at BIGINT NOT NULL
);

-- DOCUMENTS
CREATE TABLE IF NOT EXISTS documents (
  id TEXT PRIMARY KEY,
  data JSONB NOT NULL,
  created_at BIGINT NOT NULL,
  updated_at BIGINT NOT NULL
);

-- SUBSCRIPTIONS
CREATE TABLE IF NOT EXISTS subscriptions (
  id TEXT PRIMARY KEY,
  data JSONB NOT NULL,
  created_at BIGINT NOT NULL,
  updated_at BIGINT NOT NULL
);

-- INDEXES for performance
CREATE INDEX IF NOT EXISTS idx_users_email ON users USING gin ((data->'email'));
CREATE INDEX IF NOT EXISTS idx_sessions_user ON sessions USING gin ((data->'userId'));
CREATE INDEX IF NOT EXISTS idx_docs_workspace ON documents USING gin ((data->'workspaceId'));
