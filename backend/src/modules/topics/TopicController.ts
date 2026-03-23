import type { Request, Response, NextFunction } from 'express';
import type { ICradle } from '../../container.js';


export class TopicsController {
  private readonly topicService: ICradle['topicService'];

  public constructor({ topicService }: ICradle) {
    this.topicService = topicService;
  }

  public getAll = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const topics = await this.topicService.getAll();
      res.json(topics);
    } catch (err) {
      next(err);
    }
  }
};