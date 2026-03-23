import { asClass } from 'awilix';

import { AuthRepository } from './AuthRepository.js';
import { AuthService } from './AuthService.js';
import { AuthController } from './AuthController.js';
import { AuthRouter } from './AuthRouter.js';


export interface IAuthCradle {
  authRepository: AuthRepository;
  authService: AuthService;
  authController: AuthController;
  authRouter: AuthRouter;
}

export const authModule = {
  authRepository: asClass(AuthRepository).singleton(),
  authService: asClass(AuthService).singleton(),
  authController: asClass(AuthController).singleton(),
  authRouter: asClass(AuthRouter).singleton()
};