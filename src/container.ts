import { createContainer, asValue, asClass } from "awilix";

import { db, type DbInstance } from './db/db.js';
import { HttpServer } from './infrastructure/http/HttpServer.js';
import { MainRouter } from './infrastructure/http/MainRouter.js';
import { userModule, type IUserCrudle } from "./modules/users/user.di.js";
import { authModule, type IAuthCradle } from "./modules/auth/auth.di.js";


export interface ICradle extends
  IUserCrudle,
  IAuthCradle
{
  db: DbInstance;
  mainRouter: MainRouter;
  httpServer: HttpServer;
};

export const setupContainer = () => {
  const container = createContainer<ICradle>();

  container.register({
    db: asValue(db),
    mainRouter: asClass(MainRouter).singleton(),
    httpServer: asClass(HttpServer).singleton(),

    ...authModule,
    ...userModule
  });

  return container;
};