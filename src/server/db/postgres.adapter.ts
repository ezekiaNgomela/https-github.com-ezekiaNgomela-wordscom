// Phase 32 - PostgreSQL adapter skeleton
import type {DBAdapter,DBRecord} from './client';
export class PostgresAdapter<T extends DBRecord> implements DBAdapter<T>{async get(id:string){throw new Error('configure postgres connection');} async list(){throw new Error('configure postgres connection');} async create(record:T){throw new Error('configure postgres connection');} async update(id:string,updates:Partial<T>){throw new Error('configure postgres connection');} async delete(id:string){throw new Error('configure postgres connection');}}
