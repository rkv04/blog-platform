import { asClass } from 'awilix';

import { PostRepository } from './PostRepository.js';
import { PostService } from './PostService.js';
import { PostsController } from './PostController.js';
import { PostRouter } from './PostRouter.js';


export interface IPostCradle {
  postRepository: PostRepository;
  postService: PostService;
  postController: PostsController;
  postRouter: PostRouter;
}

export const postModule = {
  postRepository: asClass(PostRepository).singleton(),
  postService: asClass(PostService).singleton(),
  postController: asClass(PostsController).singleton(),
  postRouter: asClass(PostRouter).singleton()
};