import { and, eq } from "drizzle-orm";

import type { ICradle } from "../../container.js";
import { subscriptions, users } from "../../db/schema.js";
import type { DbUserSelect, DbUserInsert, DbSubscriptionSelect } from "../../db/schema.js";


export type UserEntity = Omit<DbUserSelect, 'passwordHash' | 'createdAt'>;
export type UserEntityWithPassword = DbUserSelect;
export type ShortUser = Pick<UserEntity, 'id' | 'name'>;

export class UserRepository {
  private readonly db: ICradle['db'];

  public constructor({ db }: ICradle) {
    this.db = db;
  }

  public async getById(id: number): Promise<UserEntityWithPassword | null> {
    const rows = await this.db.select().from(users).where(eq(users.id, id));
    return rows[0] ?? null;
  }

  public async getByEmail(email: string): Promise<UserEntityWithPassword | null> {
    const rows = await this.db.select().from(users).where(eq(users.email, email));
    return rows[0] ?? null;
  }

  public async create(user: DbUserInsert): Promise<UserEntity> {
    const [row] = await this.db
      .insert(users)
      .values(user)
      .returning({
        id: users.id,
        name: users.name,
        email: users.email,
        role: users.role
      });

    return row!;
  }

  public async findSubscription(followerId: number, followingId: number): Promise<DbSubscriptionSelect | null> {
    const result = await this.db
      .select()
      .from(subscriptions)
      .where(and(eq(subscriptions.followerId, followerId), eq(subscriptions.followingId, followingId)))
      .limit(1);
    return result[0] ?? null;
  }

  public async addSubscription(followerId: number, followingId: number): Promise<void> {
    await this.db.insert(subscriptions).values({ followerId, followingId });
  }

  public async removeSubscription(followerId: number, followingId: number): Promise<boolean> {
    const result = await this.db
      .delete(subscriptions)
      .where(and(eq(subscriptions.followerId, followerId), eq(subscriptions.followingId, followingId)))
      .returning({ followerId: subscriptions.followerId });
    return result.length > 0;
  }

  public async getFollowing(userId: number): Promise<ShortUser[]> {
    return this.db
      .select({ id: users.id, name: users.name })
      .from(subscriptions)
      .innerJoin(users, eq(subscriptions.followingId, users.id))
      .where(eq(subscriptions.followerId, userId));
  }
};