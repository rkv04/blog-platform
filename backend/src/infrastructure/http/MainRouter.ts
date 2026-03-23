import { Router } from 'express';

import { type ICradle } from '../../container.js';


export class MainRouter {
  private router: Router = Router();

  private readonly authRouter: ICradle['authRouter'];
  private readonly userRouter: ICradle['userRouter'];
  private readonly topicRouter: ICradle['topicRouter'];
  private readonly postRouter: ICradle['postRouter'];


  public constructor({
    authRouter,
    userRouter,
    topicRouter,
    postRouter
  }: ICradle) {
    this.authRouter = authRouter;
    this.userRouter = userRouter;
    this.topicRouter = topicRouter;
    this.postRouter = postRouter;

    this.setupRouters();
  }

  private setupRouters() {
    this.router.use('/auth', this.authRouter.get());
    this.router.use('/users', this.userRouter.get());
    this.router.use('/topics', this.topicRouter.get());
    this.router.use('/posts', this.postRouter.get());
  }

  private setupMiddleware() {

  }

  public get(): Router {
    return this.router;
  }
};