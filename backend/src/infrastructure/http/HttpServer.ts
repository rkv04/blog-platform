import express, { type Application, type Response, type Request, type NextFunction, response } from 'express';
import cookieParser from 'cookie-parser';
import path from 'path';
import cors from 'cors';
import fs from 'fs';

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

  public setupMiddleware() {
    this.expressApp.use(cors({
      origin: process.env.CLIENT_URL,
      credentials: true,
    }));

    this.expressApp.use(express.json());
    this.expressApp.use(cookieParser());

    this.expressApp.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));
    this.expressApp.use(express.static(path.join(process.cwd(), 'public')));
  }

  public setupRouters() {
    this.expressApp.use('/api', this.mainRouter.get());

    this.expressApp.get(/.*/, (req: Request, res: Response) => {
      const indexPath = path.join(process.cwd(), 'public', 'index.html');

      if (!fs.existsSync(indexPath)) {
        res.status(200).json({ response: 'index.html' });
        return;
      }

      res.sendFile(indexPath);
    });

    this.expressApp.use((req: Request, res: Response, next: NextFunction) => {
      return next(new NotFoundError());
    });

    this.expressApp.use(errorHandler);
  }

  public start(port: number) {
    this.expressApp.listen(port, () => {
      console.log(`HTTP server running on ${port}`);
    });
  }
}