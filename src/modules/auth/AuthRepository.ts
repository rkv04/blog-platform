import { eq } from "drizzle-orm";
import type { ICradle } from "../../container.js";
import { refreshTokens, type DbRefreshTokenInsert, type DbRefreshTokenSelect } from "../../db/schema.js";


export class AuthRepository {
  private readonly db: ICradle['db'];

  public constructor({ db }: ICradle) {
    this.db = db;
  }

  public async addRefreshToken(tokenEntry: DbRefreshTokenInsert) {
    await this.db.insert(refreshTokens).values(tokenEntry);
  }

  public async getRefreshTokenEntry(tokenHash: string): Promise<DbRefreshTokenSelect | null> {
    const rows = await this.db.select().from(refreshTokens).where(eq(refreshTokens.tokenHash, tokenHash));
    return rows[0] ?? null;
  }

  public async deleteRefreshToken(tokenHash: string) {
    await this.db.delete(refreshTokens).where(eq(refreshTokens.tokenHash, tokenHash));
  }

  public async deleteRefreshTokensByUserId(id: number) {
    await this.db.delete(refreshTokens).where(eq(refreshTokens.userId, id));
  }
};