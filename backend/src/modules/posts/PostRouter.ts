import { Router } from 'express';

import { validate } from '../../common/middleware/validate.js';
import type { ICradle } from '../../container.js';
import { authenticate, optionalAuthenticate } from '../../common/middleware/authenticate.js';
import { uploadSingle } from '../../common/middleware/upload.js';
import { addCommentSchema, createPostSchema, postsQuerySchema, updatePostSchema } from './post.types.js';


export class PostRouter {
    private router: Router = Router();
    private postController: ICradle['postController'];

    public constructor({ postController }: ICradle) {
        this.postController = postController;
        this.setupRoutes();
    }

    private setupRoutes() {
      this.router.get('/', optionalAuthenticate, validate(postsQuerySchema, 'query'), this.postController.getMany);
      this.router.post('/', authenticate, uploadSingle, validate(createPostSchema), this.postController.create);
      this.router.put('/:id', authenticate, uploadSingle, validate(updatePostSchema), this.postController.update);
      this.router.delete('/:id', authenticate, this.postController.delete);
      this.router.post('/:id/likes', authenticate, this.postController.addLike);
      this.router.delete('/:id/likes', authenticate, this.postController.removeLike);
      this.router.get('/:id/likes', this.postController.getLikes);
      this.router.get('/:id/comments', this.postController.getComments);
      this.router.post('/:id/comments', authenticate, validate(addCommentSchema), this.postController.addComment);
      this.router.delete('/:postId/comments/:commentId', authenticate, this.postController.deleteComment);
    }

    public get(): Router {
        return this.router;
    }
};