import { eq, and, or, ilike, inArray, sql, desc } from 'drizzle-orm';

import {
  posts, comments, likes, subscriptions, users, topics
} from '../../db/schema.js';

import type {
  Post, NewPost, Comment, NewComment, Like, Topic, User,
} from '../../db/schema.js';

import { type ICradle } from '../../container.js';


export type PostRow = {
  id: number;
  title: string;
  text: string;
  imageUrl: string | null;
  author: { id: number; name: string };
  topic: { id: number; name: string };
};

export type CommentRow = Pick<Comment, 'id' | 'text'>;
export type LikeRow = Pick<Like, 'userId'>;

export interface PostsFilter {
  topicId?: number;
  page: number;
  limit: number;
  search?: string;
  subscriptions?: boolean;
  currentUserId?: number;
}

export class PostRepository {
  private readonly db: ICradle['db'];

  public constructor({ db }: ICradle) {
    this.db = db;
  }

  public async findMany(filter: PostsFilter): Promise<{ data: PostRow[]; total: number }> {
    const conditions: ReturnType<typeof eq>[] = [];

    if (filter.topicId) {
      conditions.push(eq(posts.topicId, filter.topicId));
    }

    if (filter.search) {
      conditions.push(
        or(
          ilike(posts.title, `%${filter.search}%`),
          ilike(posts.text, `%${filter.search}%`),
        ) as ReturnType<typeof eq>,
      );
    }

    if (filter.subscriptions && filter.currentUserId) {
      const followingRows = await this.db
        .select({ id: subscriptions.followingId })
        .from(subscriptions)
        .where(eq(subscriptions.followerId, filter.currentUserId));

      const followingIds = followingRows.map((r: any) => r.id);
      if (followingIds.length === 0) return { data: [], total: 0 };

      conditions.push(inArray(posts.authorId, followingIds) as ReturnType<typeof eq>);
    }

    const where = conditions.length > 0 ? and(...conditions) : undefined;
    const offset = (filter.page - 1) * filter.limit;

    const [rawPosts, [countRow]] = await Promise.all([
      this.db.select().from(posts).where(where).orderBy(desc(posts.createdAt))
        .limit(filter.limit).offset(offset),
      this.db.select({ count: sql<number>`count(*)::int` }).from(posts).where(where),
    ]);

    return { data: await this.enrichPosts(rawPosts), total: countRow!.count };
  }

  public async findById(id: number): Promise<PostRow | null> {
    const result = await this.db.select().from(posts).where(eq(posts.id, id)).limit(1);
    if (!result[0]) return null;
    const [enriched] = await this.enrichPosts(result);
    return enriched ?? null;
  }

  public async findRawById(id: number): Promise<Post | null> {
    const result = await this.db.select().from(posts).where(eq(posts.id, id)).limit(1);
    return result[0] ?? null;
  }

  public async create(data: NewPost): Promise<PostRow> {
    const result = await this.db.insert(posts).values(data).returning();
    const [enriched] = await this.enrichPosts(result);
    return enriched!;
  }

  public async update(
    id: number,
    data: Partial<Pick<Post, 'title' | 'text' | 'topicId' | 'imageUrl'>>,
  ): Promise<PostRow | null> {
    const result = await this.db
      .update(posts)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(posts.id, id))
      .returning();
    if (!result[0]) return null;
    const [enriched] = await this.enrichPosts(result);
    return enriched!;
  }

  public async delete(id: number): Promise<boolean> {
    const result = await this.db.delete(posts).where(eq(posts.id, id)).returning({ id: posts.id });
    return result.length > 0;
  }

  public async findLike(postId: number, userId: number): Promise<Like | null> {
    const result = await this.db
      .select()
      .from(likes)
      .where(and(eq(likes.postId, postId), eq(likes.userId, userId)))
      .limit(1);
    return result[0] ?? null;
  }

  public async addLike(postId: number, userId: number): Promise<void> {
    await this.db.insert(likes).values({ postId, userId });
  }

  public async removeLike(postId: number, userId: number): Promise<void> {
    await this.db.delete(likes).where(and(eq(likes.postId, postId), eq(likes.userId, userId)));
  }

  public async getLikesCount(postId: number): Promise<number> {
    const [row] = await this.db
      .select({ count: sql<number>`count(*)::int` })
      .from(likes)
      .where(eq(likes.postId, postId));
    return row!.count;
  }

  public async getLikesList(postId: number): Promise<LikeRow[]> {
    return this.db.select({ userId: likes.userId }).from(likes).where(eq(likes.postId, postId));
  }

  public async getComments(postId: number): Promise<CommentRow[]> {
    return this.db
      .select({ id: comments.id, text: comments.text })
      .from(comments)
      .where(eq(comments.postId, postId))
      .orderBy(comments.createdAt);
  }

  public async addComment(data: NewComment): Promise<CommentRow> {
    const result = await this.db.insert(comments).values(data).returning({ id: comments.id, text: comments.text });
    return result[0]!;
  }

  public async findCommentById(id: number): Promise<Comment | null> {
    const result = await this.db.select().from(comments).where(eq(comments.id, id)).limit(1);
    return result[0] ?? null;
  }

  public async deleteComment(id: number): Promise<boolean> {
    const result = await this.db.delete(comments).where(eq(comments.id, id)).returning({ id: comments.id });
    return result.length > 0;
  }

  private async enrichPosts(rawPosts: Post[]): Promise<PostRow[]> {
    if (rawPosts.length === 0) return [];

    const authorIds = [...new Set(rawPosts.map((p) => p.authorId))];
    const topicIds = [...new Set(rawPosts.map((p) => p.topicId))];

    const [authorRows, topicRows] = await Promise.all([
      this.db.select({ id: users.id, name: users.name })
        .from(users)
        .where(inArray(users.id, authorIds)),
      this.db.select({ id: topics.id, name: topics.name })
        .from(topics)
        .where(inArray(topics.id, topicIds)),
    ]);

    const authorMap = Object.fromEntries(authorRows.map((a: any) => [a.id, a]));
    const topicMap = Object.fromEntries(topicRows.map((t: any) => [t.id, t]));

    return rawPosts.map((p) => ({
      id: p.id,
      title: p.title,
      text: p.text,
      imageUrl: p.imageUrl ?? null,
      author: authorMap[p.authorId] ?? { id: p.authorId, name: 'Unknown' },
      topic: topicMap[p.topicId] ?? { id: p.topicId, name: 'Unknown' },
    }));
  }
};