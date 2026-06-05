// Phase 32 - PostgreSQL adapter (production implementation)
import { Pool } from "pg";
import type { DBAdapter, DBRecord } from "./client";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// Generic JSONB table strategy:
// id (text primary key)
// data (jsonb)
// created_at (bigint)
// updated_at (bigint)

export class PostgresAdapter<T extends DBRecord> implements DBAdapter<T> {
  constructor(private table: string) {}

  async get(id: string): Promise<T | null> {
    const res = await pool.query(
      `SELECT data FROM ${this.table} WHERE id = $1`,
      [id]
    );
    return res.rows[0]?.data || null;
  }

  async list(): Promise<T[]> {
    const res = await pool.query(
      `SELECT data FROM ${this.table}`
    );
    return res.rows.map((r) => r.data);
  }

  async create(record: T): Promise<T> {
    const now = Date.now();

    await pool.query(
      `INSERT INTO ${this.table} (id, data, created_at, updated_at)
       VALUES ($1, $2, $3, $4)`,
      [record.id, record, now, now]
    );

    return record;
  }

  async update(id: string, updates: Partial<T>): Promise<T | null> {
    const existing = await this.get(id);
    if (!existing) return null;

    const updated = {
      ...existing,
      ...updates,
      updatedAt: Date.now(),
    };

    await pool.query(
      `UPDATE ${this.table}
       SET data = $2, updated_at = $3
       WHERE id = $1`,
      [id, updated, updated.updatedAt]
    );

    return updated;
  }

  async delete(id: string): Promise<boolean> {
    const res = await pool.query(
      `DELETE FROM ${this.table} WHERE id = $1`,
      [id]
    );
    return (res.rowCount ?? 0) > 0;
  }
}
