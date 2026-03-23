import { asClass } from 'awilix';

import { TopicRouter } from './TopicRouter.js';
import { TopicRepository } from './TopicRepository.js';
import { TopicService } from './TopicService.js';
import { TopicsController } from './TopicController.js';


export interface ITopicCradle {
  topicRepository: TopicRepository;
  topicService: TopicService;
  topicController: TopicsController;
  topicRouter: TopicRouter;
}

export const topicModule = {
  topicRepository: asClass(TopicRepository).singleton(),
  topicService: asClass(TopicService).singleton(),
  topicController: asClass(TopicsController).singleton(),
  topicRouter: asClass(TopicRouter).singleton()
};