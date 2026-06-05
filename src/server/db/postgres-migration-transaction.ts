// Phase 15B - Transaction + Migration Engine
// Production hardening: schema migrations + atomic transaction wrapper
// Builds on PostgresPool for safe execution and DB evolution control

import { PostgresPool } from "./postgres-pool";

// -----------------------------
// MIGRATION SYSTEM
// -----------------------------

export interface Migration {
  id: string;
  name: string;
  up: string;
  down?: string;
  timestamp: number;
}

export class MigrationManager {
  private migrations: Migration[] = [];
  private table = "schema_migrations";

  constructor(private pool: PostgresPool) {}

  register(migration: Migration) {
    this.migrations.push(migration);
  }

  async ensureTable() {
    const client = await this.pool.acquire();

    await client.query(
      `CREATE TABLE IF NOT EXISTS ${this.table} (
        id TEXT PRIMARY KEY,
        name TEXT,
        applied_at BIGINT
      )`
    );

    client.release();
  }

  async runMigrations() {
    await this.ensureTable();

    for (const m of this.migrations) {
      const client = await this.pool.acquire();

      const existing = await client.query(
        `SELECT id FROM ${this.table} WHERE id = $1`,
        [m.id]
      );

      if (existing.rows.length > 0) {
        client.release();
        continue;
      }

      try {
        console.log(`⚙️ Running migration: ${m.name}`);

        await client.query(m.up);

        await client.query(
          `INSERT INTO ${this.table} (id, name, applied_at) VALUES ($1, $2, $3)`,
          [m.id, m.name, Date.now()]
        );
      } catch (err) {
        console.error("Migration failed:", m.name, err);
        throw err;
      } finally {
        client.release();
      }
    }
  }
}

// -----------------------------
// TRANSACTION MANAGER
// -----------------------------

export class TransactionManager {
  constructor(private pool: PostgresPool) {}

  async run<T>(fn: (client: any) => Promise<T>): Promise<T> {
    const client = await this.pool.acquire();

    try {
      await client.query("BEGIN");

      const result = await fn(client);

      await client.query("COMMIT");

      return result;
    } catch (err) {
      await client.query("ROLLBACK");
      throw err;
    } finally {
      client.release();
    }
  }
}
