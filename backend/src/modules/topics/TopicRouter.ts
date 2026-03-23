import { Router } from 'express';

import { validate } from '../../common/middleware/validate.js';
import type { ICradle } from '../../container.js';


export class TopicRouter {
    private router: Router = Router();
    private topicController: ICradle['topicController'];

    public constructor({ topicController }: ICradle) {
        this.topicController = topicController;
        this.setupRoutes();
    }

    private setupRoutes() {
      this.router.get('/', this.topicController.getAll);
    }

    public get(): Router {
        return this.router;
    }
};