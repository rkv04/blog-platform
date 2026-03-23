import { Router } from 'express';

import type { ICradle } from '../../container.js';
import { authenticate } from '../../common/middleware/authenticate.js';


export class UserRouter {
  private router: Router = Router();
  private userController: ICradle['userController'];

  public constructor({ userController }: ICradle) {
    this.userController = userController;
    this.setupRoutes();
  }

  private setupRoutes() {
    this.router.get('/:id/following', authenticate, this.userController.getFollowing);
    this.router.post('/:id/subscribe', authenticate, this.userController.subscribe);
    this.router.delete('/:id/subscribe', authenticate, this.userController.unsubscribe);
  }

  public get(): Router {
    return this.router;
  }
};