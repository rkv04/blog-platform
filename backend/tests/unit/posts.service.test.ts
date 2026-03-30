import { describe, it, expect, vi, beforeEach } from 'vitest';
import { PostService } from '../../src/modules/posts/PostService.js';
import { ForbiddenError, NotFoundError } from '../../src/common/exceptions/HttpErrors.js';


const mockPostRepository = {
  findMany: vi.fn(),
  findRawById: vi.fn(),
  create: vi.fn(),
  update: vi.fn(),
  delete: vi.fn(),
  findLike: vi.fn(),
  addLike: vi.fn(),
  removeLike: vi.fn(),
  getLikesCount: vi.fn(),
  getLikesList: vi.fn(),
  addComment: vi.fn(),
  getComments: vi.fn(),
  findCommentById: vi.fn(),
  deleteComment: vi.fn(),
};

const mockTopicRepository = {
  findById: vi.fn(),
  findAll: vi.fn(),
};

const postService = new PostService({
  postRepository: mockPostRepository,
  topicRepository: mockTopicRepository,
} as any);

const existingPost = {
  id: 1,
  title: 'Test post',
  text: 'Some text',
  authorId: 10,
  topicId: 2,
  imageUrl: null,
};

const existingComment = {
  id: 5,
  text: 'Nice post',
  postId: 1,
  authorId: 10,
};


describe('PostService', () => {

  beforeEach(() => {
    vi.clearAllMocks();
  });


  describe('delete', () => {

    it('выбрасывает NotFoundError если пост не найден', async () => {
      mockPostRepository.findRawById.mockResolvedValue(null);

      await expect(postService.delete(999, 10, 'user'))
        .rejects
        .toThrow(NotFoundError);

      expect(mockPostRepository.delete).not.toHaveBeenCalled();
    });

    it('выбрасывает ForbiddenError если пользователь не является автором', async () => {
      mockPostRepository.findRawById.mockResolvedValue(existingPost); // authorId: 10

      await expect(postService.delete(1, 99, 'user')) // userId: 99 — чужой
        .rejects
        .toThrow(ForbiddenError);

      expect(mockPostRepository.delete).not.toHaveBeenCalled();
    });

    it('admin может удалить чужой пост', async () => {
      mockPostRepository.findRawById.mockResolvedValue(existingPost); // authorId: 10
      mockPostRepository.delete.mockResolvedValue(true);

      await expect(postService.delete(1, 99, 'admin')) // userId: 99, но роль admin
        .resolves
        .toBeUndefined();

      expect(mockPostRepository.delete).toHaveBeenCalledWith(1);
    });

    it('автор может удалить свой пост', async () => {
      mockPostRepository.findRawById.mockResolvedValue(existingPost); // authorId: 10
      mockPostRepository.delete.mockResolvedValue(true);

      await expect(postService.delete(1, 10, 'user')) // userId совпадает с authorId
        .resolves
        .toBeUndefined();

      expect(mockPostRepository.delete).toHaveBeenCalledWith(1);
    });

  });


  describe('update', () => {

    it('выбрасывает NotFoundError если пост не найден', async () => {
      mockPostRepository.findRawById.mockResolvedValue(null);

      await expect(postService.update(999, { title: 'New title' }, 10, 'user'))
        .rejects
        .toThrow(NotFoundError);
    });

    it('выбрасывает ForbiddenError если пользователь не является автором', async () => {
      mockPostRepository.findRawById.mockResolvedValue(existingPost); // authorId: 10

      await expect(postService.update(1, { title: 'New title' }, 99, 'user'))
        .rejects
        .toThrow(ForbiddenError);
    });

    it('выбрасывает NotFoundError если новый topic не существует', async () => {
      mockPostRepository.findRawById.mockResolvedValue(existingPost);
      mockTopicRepository.findById.mockResolvedValue(null); // топик не найден

      await expect(postService.update(1, { topic: 999 }, 10, 'user'))
        .rejects
        .toThrow(NotFoundError);
    });

    it('admin может обновить чужой пост', async () => {
      mockPostRepository.findRawById.mockResolvedValue(existingPost);
      mockPostRepository.update.mockResolvedValue({ ...existingPost, title: 'Updated' });

      await expect(postService.update(1, { title: 'Updated' }, 99, 'admin'))
        .resolves
        .toMatchObject({ title: 'Updated' });
    });

  });


  describe('addLike', () => {

    it('выбрасывает NotFoundError если пост не найден', async () => {
      mockPostRepository.findRawById.mockResolvedValue(null);

      await expect(postService.addLike(999, 10))
        .rejects
        .toThrow(NotFoundError);
    });

    it('возвращает { liked: true } если лайк уже существует (идемпотентность)', async () => {
      mockPostRepository.findRawById.mockResolvedValue(existingPost);
      mockPostRepository.findLike.mockResolvedValue({ postId: 1, userId: 10 }); // лайк уже есть

      const result = await postService.addLike(1, 10);

      expect(result).toEqual({ liked: true });
      expect(mockPostRepository.addLike).not.toHaveBeenCalled(); // повторно не добавляем
    });

    it('добавляет лайк если его ещё нет', async () => {
      mockPostRepository.findRawById.mockResolvedValue(existingPost);
      mockPostRepository.findLike.mockResolvedValue(null); // лайка нет
      mockPostRepository.addLike.mockResolvedValue(undefined);

      const result = await postService.addLike(1, 10);

      expect(result).toEqual({ liked: true });
      expect(mockPostRepository.addLike).toHaveBeenCalledWith(1, 10);
    });

  });


  describe('deleteComment', () => {

    it('выбрасывает NotFoundError если комментарий не найден', async () => {
      mockPostRepository.findCommentById.mockResolvedValue(null);

      await expect(postService.deleteComment(999, 10, 'user'))
        .rejects
        .toThrow(NotFoundError);
    });

    it('выбрасывает ForbiddenError если пользователь не является автором комментария', async () => {
      mockPostRepository.findCommentById.mockResolvedValue(existingComment); // authorId: 10

      await expect(postService.deleteComment(5, 99, 'user'))
        .rejects
        .toThrow(ForbiddenError);
    });

    it('admin может удалить чужой комментарий', async () => {
      mockPostRepository.findCommentById.mockResolvedValue(existingComment); // authorId: 10
      mockPostRepository.deleteComment.mockResolvedValue(true);

      await expect(postService.deleteComment(5, 99, 'admin'))
        .resolves
        .toBeUndefined();

      expect(mockPostRepository.deleteComment).toHaveBeenCalledWith(5);
    });

  });

});