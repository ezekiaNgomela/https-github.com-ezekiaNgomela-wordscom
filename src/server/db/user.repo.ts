// Phase 30.1 - Database Integration: User Repository
// Bridges AuthService with DBClient for persistent user storage

import { DBClient } from "./client";
import { User } from "../auth/user.model";

const USERS_COLLECTION = "users";

export class UserRepository {
  private static db() {
    return DBClient.get<User>(USERS_COLLECTION);
  }

  static async findById(id: string): Promise<User | null> {
    return this.db().get(id);
  }

  static async findByEmail(email: string): Promise<User | null> {
    const users = await this.db().list();
    return users.find(u => u.email === email) || null;
  }

  static async create(user: User): Promise<User> {
    return this.db().create(user);
  }

  static async update(id: string, updates: Partial<User>): Promise<User | null> {
    return this.db().update(id, updates);
  }

  static async delete(id: string): Promise<boolean> {
    return this.db().delete(id);
  }

  static async list(): Promise<User[]> {
    return this.db().list();
  }
}
