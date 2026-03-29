import type { NextFunction, Request, Response } from 'express';

import type { ICradle } from '../../container.js';
import { ErrorCode, UnauthorizedError } from '../../common/exceptions/HttpErrors.js';


const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: false,
  sameSite: 'lax',
  path: '/api/auth',
  maxAge: 30 * 24 * 60 * 60 * 1000
} as const;

export class AuthController {
  private authService: ICradle['authService'];

  public constructor({ authService }: ICradle) {
    this.authService = authService;
  }

  public register = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await this.authService.register(req.body);
      res.cookie('refreshToken', result.refreshToken, COOKIE_OPTIONS);
      res.status(200).json({ accessToken: result.accessToken, user: result.user });
    }
    catch (err) {
      next(err);
    }
  }

  public login = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await this.authService.login(req.body);
      res.cookie('refreshToken', result.refreshToken, COOKIE_OPTIONS);
      res.status(200).json({ accessToken: result.accessToken, user: result.user });
    }
    catch (err) {
      next(err);
    }
  }

  public refresh = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const refreshToken: string | undefined = req.cookies?.refreshToken;
      if (!refreshToken) {
        throw new UnauthorizedError('INVALID_REFRESH_TOKEN');
      }
      const result = await this.authService.refresh(refreshToken);
      res.cookie('refreshToken', result.refreshToken, COOKIE_OPTIONS);
      res.status(200).json({ accessToken: result.accessToken });
    }
    catch (err) {
      next(err);
    }
  }

  public logout = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const refreshToken: string | undefined = req.cookies?.refreshToken;
      if (refreshToken) {
        await this.authService.logout(refreshToken);
      }
      res.clearCookie('refreshToken');
      res.sendStatus(204);
    }
    catch (err) {
      next(err);
    }
  }
};