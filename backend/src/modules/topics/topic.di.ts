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
  postRepository: asClass(TopicRepository).singleton(),
  postService: asClass(TopicService).singleton(),
  postController: asClass(TopicsController).singleton(),
  postRouter: asClass(TopicRouter).singleton()
};