import { Router } from 'express';

import { type ICradle } from '../../container.js';


export class MainRouter {
  private router: Router = Router();

  private authRouter: ICradle['authRouter'];
  private userRouter: ICradle['userRouter'];

  public constructor({
    authRouter,
    userRouter
  }: ICradle) {
    this.authRouter = authRouter;
    this.userRouter = userRouter;

    this.setupRouters();
  }

  private setupRouters() {
    this.router.use('/auth', this.authRouter.get());
    this.router.use('/users', this.userRouter.get());
  }

  private setupMiddleware() {

  }

  public get(): Router {
    return this.router;
  }
};