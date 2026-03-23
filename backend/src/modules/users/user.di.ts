import { asClass } from 'awilix';

import { UserRepository } from './UserRepository.js';
import { UserService } from './UserService.js';
import { UserController } from './UserController.js';
import { UserRouter } from './UserRouter.js';


export interface IUserCrudle {
  userRepository: UserRepository;
  userService: UserService;
  userController: UserController;
  userRouter: UserRouter;
}

export const userModule = {
  userRepository: asClass(UserRepository).singleton(),
  userService: asClass(UserService).singleton(),
  userController: asClass(UserController).singleton(),
  userRouter: asClass(UserRouter).singleton()
};