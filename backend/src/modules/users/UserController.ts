import type { NextFunction, Request, Response } from 'express';

import type { ICradle } from "../../container.js";


export class UserController {
  private userService: ICradle['userService'];

  public constructor({ userService }: ICradle) {
    this.userService = userService;
  }

  public subscribe = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const targetId = Number(req.params.id);
      await this.userService.subscribe(req.user.id, targetId);
      res.sendStatus(204);
    } catch (err) {
      next(err);
    }
  }

  public unsubscribe = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const targetId = Number(req.params.id);
      await this.userService.unsubscribe(req.user.id, targetId);
      res.sendStatus(204);
    } catch (err) {
      next(err);
    }
  }

  public getFollowing = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = Number(req.params.id);
      const following = await this.userService.getFollowing(userId);
      res.json(following);
    } catch (err) {
      next(err);
    }
  }
};