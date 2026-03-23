import { ConflictError, HttpError, NotFoundError, type ErrorCodeType } from "../../common/exceptions/HttpErrors.js";
import type { ICradle } from "../../container.js";


export class UserService {
  private userRepository: ICradle['userRepository'];

  public constructor({ userRepository }: ICradle) {
    this.userRepository = userRepository;
  }

  public async subscribe(followerId: number, followingId: number): Promise<void> {
    if (followerId === followingId) {
      throw new HttpError(400, 'CANNOT_SUBSCRIBE_TO_SELF');
    }
    const target = await this.userRepository.getById(followingId);
    if (!target) {
      throw new NotFoundError();
    }
    const existing = await this.userRepository.findSubscription(followerId, followingId);
    if (existing) {
      throw new ConflictError('ALREADY_SUBSCRIBED' as ErrorCodeType);
    }
    await this.userRepository.addSubscription(followerId, followingId);
  }

  public async unsubscribe(followerId: number, followingId: number): Promise<void> {
    const target = await this.userRepository.getById(followingId);
    if (!target) {
      throw new NotFoundError();
    }
    const removed = await this.userRepository.removeSubscription(followerId, followingId);
    if (!removed) {
      throw new NotFoundError();
    }
  }

  public async getFollowing(userId: number) {
    const user = await this.userRepository.getById(userId);
    if (!user) {
      throw new NotFoundError();
    }
    return this.userRepository.getFollowing(userId);
  }
};