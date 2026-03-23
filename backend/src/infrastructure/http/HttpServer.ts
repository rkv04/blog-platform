import express, { type Application, type Response, type Request, type NextFunction, response } from 'express';
import cookieParser from 'cookie-parser';

import { type ICradle } from '../../container.js';
import { NotFoundError } from '../../common/exceptions/HttpErrors.js';
import { errorHandler } from '../../common/middleware/errorHandler.js';


export class HttpServer {
  private mainRouter: ICradle['mainRouter'];
  private expressApp: Application = express();

  public constructor({ mainRouter }: ICradle) {
    this.mainRouter = mainRouter;
    this.setupMiddleware();
    this.setupRouters();
  }

  public setupRouters() {
    this.expressApp.use('/api', this.mainRouter.get());

    // todo
    this.expressApp.get(/.*/, (req: Request, res: Response, next: NextFunction) => {
      res.status(200).json({ response: 'index.html' });
    });

    this.expressApp.use((req: Request, res: Response, next: NextFunction) => {
      return next(new NotFoundError());
    });

    this.expressApp.use(errorHandler);
  }

  public setupMiddleware() {
    this.expressApp.use(express.json());
    this.expressApp.use(cookieParser());
  }

  public start(port: number) {
    this.expressApp.listen(port, () => {
      console.log(`HTTP server running on ${port}`);
    });
  }
};