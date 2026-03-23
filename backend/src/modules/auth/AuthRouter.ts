import { Router } from 'express';

import { validate } from '../../common/middleware/validate.js';
import { registerRequestSchema } from './auth.types.js';
import type { ICradle } from '../../container.js';
import { loginRequestSchema } from './auth.types.js';


export class AuthRouter {
    private router: Router = Router();
    private authController: ICradle['authController'];

    public constructor({ authController }: ICradle) {
        this.authController = authController;
        this.setupRoutes();
    }

    private setupRoutes() {
        this.router.post('/login', validate(loginRequestSchema),  this.authController.login);
        this.router.post('/register', validate(registerRequestSchema), this.authController.register);
        this.router.post('/refresh', this.authController.refresh);
        this.router.post('/logout', this.authController.logout);
    }

    public get(): Router {
        return this.router;
    }
};