import type { Request, Response, NextFunction } from 'express';

import type { ICradle } from '../../container.js';


function getImageUrl(req: Request): string | undefined {
  if (!req.file) return undefined;
  // Build public URL: /uploads/<filename>
  return `/uploads/${req.file.filename}`;
}

export class PostsController {
  private readonly postService: ICradle['postService'];

  public constructor({ postService }: ICradle) {
    this.postService = postService;
  }

  public getMany = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await this.postService.getMany(req.query as any, req.user.id);
      res.json(result);
    } catch (err) { next(err); }
  }

  public create = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      // multipart/form-data: body fields come as strings, coerce topic
      const body = { ...req.body, topic: Number(req.body.topic) };
      const post = await this.postService.create(body, req.user.id, getImageUrl(req));
      res.json(post);
    } catch (err) { next(err); }
  }

  public update = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const postId = Number(req.params.id);
      const body = {
        ...req.body,
        ...(req.body.topic !== undefined ? { topic: Number(req.body.topic) } : {}),
      };
      const post = await this.postService.update(postId, body, req.user.id, req.user!.role, getImageUrl(req));
      res.json(post);
    } catch (err) { next(err); }
  }

  public delete = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      await this.postService.delete(Number(req.params.id), req.user.id, req.user!.role);
      res.sendStatus(204);
    } catch (err) { next(err); }
  }

  public addLike = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await this.postService.addLike(Number(req.params.id), req.user.id);
      res.json(result);
    } catch (err) { next(err); }
  }

  public removeLike = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await this.postService.removeLike(Number(req.params.id), req.user.id);
      res.json(result);
    } catch (err) { next(err); }
  }

  public getLikes = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await this.postService.getLikes(Number(req.params.id));
      res.json(result);
    } catch (err) { next(err); }
  }

  public addComment = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const comment = await this.postService.addComment(Number(req.params.id), req.body.text, req.user.id);
      res.json(comment);
    } catch (err) { next(err); }
  }

  public getComments = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const comments = await this.postService.getComments(Number(req.params.id));
      res.json(comments);
    } catch (err) { next(err); }
  }

  public deleteComment = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      await this.postService.deleteComment(Number(req.params.commentId), req.user.id, req.user!.role);
      res.sendStatus(204);
    } catch (err) { next(err); }
  }
};