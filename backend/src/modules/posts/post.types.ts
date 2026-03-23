import { z } from 'zod';

export const createPostSchema = z.object({
  title: z.string().min(1).max(500),
  text: z.string().min(1),
  topic: z.coerce.number().int().positive(),
});

export const updatePostSchema = z.object({
  title: z.string().min(1).max(500).optional(),
  text: z.string().min(1).optional(),
  topic: z.coerce.number().int().positive().optional(),
});

export const postsQuerySchema = z.object({
  topic: z.coerce.number().int().positive().optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
  search: z.string().optional(),
  subscriptions: z.enum(['true', 'false']).optional(),
  authorId: z.coerce.number().int().positive().optional()
});

export const addCommentSchema = z.object({
  text: z.string().min(1),
});

export type CreatePostDto = z.infer<typeof createPostSchema>;
export type UpdatePostDto = z.infer<typeof updatePostSchema>;
export type PostsQuery = z.infer<typeof postsQuerySchema>;
export type AddCommentDto = z.infer<typeof addCommentSchema>;