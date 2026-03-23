import type { PostsFilter, PostRow, CommentRow } from './PostRepository.js';
import type { CreatePostDto, UpdatePostDto, PostsQuery } from './post.types.js'
import { ForbiddenError, NotFoundError } from '../../common/exceptions/HttpErrors.js';
import type { ICradle } from '../../container.js';


export class PostService {
  private readonly postRepository: ICradle['postRepository'];
  private readonly topicRepository: ICradle['topicRepository'];

  public constructor({ postRepository, topicRepository }: ICradle) {
    this.postRepository = postRepository;
    this.topicRepository = topicRepository;
  }

  public async getMany(query: PostsQuery, currentUserId?: number) {
    const filter: PostsFilter = {
      page: query.page,
      limit: query.limit,
      topicId: query.topic,
      search: query.search,
      subscriptions: query.subscriptions === 'true',
      currentUserId,
    };
    const { data, total } = await this.postRepository.findMany(filter);
    return {
      data,
      meta: { page: query.page, limit: query.limit, total, totalPages: Math.ceil(total / query.limit) },
    };
  }

  public async create(dto: CreatePostDto, authorId: number, imageUrl?: string): Promise<PostRow> {
    const topic = await this.topicRepository.findById(dto.topic);
    if (!topic) {
      throw new NotFoundError();
    }
    return this.postRepository.create({
      title: dto.title,
      text: dto.text,
      authorId,
      topicId: dto.topic,
      imageUrl: imageUrl ?? null,
    });
  }

  public async update(postId: number, dto: UpdatePostDto, userId: number, role: string, imageUrl?: string): Promise<PostRow> {
    const post = await this.postRepository.findRawById(postId);
    if (!post) {
      throw new NotFoundError();
    }
    if (post.authorId !== userId && role !== 'admin') {
      throw new ForbiddenError();
    }

    if (dto.topic !== undefined) {
      const topic = await this.topicRepository.findById(dto.topic);
      if (!topic) {
        throw new NotFoundError();
      }
    }

    const updated = await this.postRepository.update(postId, {
      title: dto.title,
      text: dto.text,
      topicId: dto.topic,
      ...(imageUrl !== undefined ? { imageUrl } : {}),
    });
    return updated!;
  }

  public async delete(postId: number, userId: number, role: string): Promise<void> {
    const post = await this.postRepository.findRawById(postId);
    if (!post) {
      throw new NotFoundError();
    }
    if (post.authorId !== userId && role !== 'admin') {
      throw new ForbiddenError();
    }
    await this.postRepository.delete(postId);
  }

  public async addLike(postId: number, userId: number): Promise<{ liked: boolean }> {
    const post = await this.postRepository.findRawById(postId);
    if (!post) {
      throw new NotFoundError();
    }
    const existing = await this.postRepository.findLike(postId, userId);
    if (existing) return { liked: true }; // already liked — idempotent
    await this.postRepository.addLike(postId, userId);
    return { liked: true };
  }

  public async removeLike(postId: number, userId: number): Promise<{ liked: boolean }> {
    const post = await this.postRepository.findRawById(postId);
    if (!post) {
      throw new NotFoundError();
    }
    await this.postRepository.removeLike(postId, userId);
    return { liked: false };
  }

  public async getLikes(postId: number) {
    const post = await this.postRepository.findRawById(postId);
    if (!post) {
      throw new NotFoundError();
    }
    const [count, users] = await Promise.all([
      this.postRepository.getLikesCount(postId),
      this.postRepository.getLikesList(postId),
    ]);
    return { count, users };
  }

  public async addComment(postId: number, text: string, authorId: number): Promise<CommentRow> {
    const post = await this.postRepository.findRawById(postId);
    if (!post) {
      throw new NotFoundError();
    }
    return this.postRepository.addComment({ text, postId, authorId });
  }

  public async getComments(postId: number): Promise<CommentRow[]> {
    const post = await this.postRepository.findRawById(postId);
    if (!post) {
      throw new NotFoundError();
    }
    return this.postRepository.getComments(postId);
  }

  public async deleteComment(commentId: number, userId: number, role: string): Promise<void> {
    const comment = await this.postRepository.findCommentById(commentId);
    if (!comment) {
      throw new NotFoundError();
    }
    if (comment.authorId !== userId && role !== 'admin') {
      throw new ForbiddenError();
    }
    await this.postRepository.deleteComment(commentId);
  }
};