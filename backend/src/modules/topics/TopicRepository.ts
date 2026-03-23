import { eq } from 'drizzle-orm';

import { topics, type Topic } from '../../db/schema.js';
import type { ICradle } from '../../container.js';


export class TopicRepository {
  private readonly db: ICradle['db'];

  public constructor({ db }: ICradle) {
    this.db = db;
  }

  public async findAll(): Promise<Topic[]> {
    return this.db.select().from(topics);
  }

  public async findById(id: number): Promise<Topic | null> {
    const result = await this.db.select().from(topics).where(eq(topics.id, id)).limit(1);
    return result[0] ?? null;
  }
};