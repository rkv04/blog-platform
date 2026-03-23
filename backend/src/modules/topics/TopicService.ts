import type { ICradle } from "../../container.js";


export class TopicService {
  private readonly topicRepository: ICradle['topicRepository'];

  public constructor({ topicRepository }: ICradle) {
    this.topicRepository = topicRepository;
  }

  public async getAll() {
    return await this.topicRepository.findAll();
  }
};