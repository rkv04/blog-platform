import argon2 from 'argon2';

import type { UserLoginDto, UserRegisterDto } from "./auth.types.js";
import type { ICradle } from "../../container.js";

import {
  ConflictError,
  UnauthorizedError,
  ValidationError
} from '../../common/exceptions/HttpErrors.js';

import {
  buildTokens,
  getRefreshTokenHash
} from '../../common/utils/token.utils.js';


const REFRESH_TOKEN_TTL_MS = 30 * 24 * 60 * 60 * 1000;

export class AuthService {
  private authRepository: ICradle['authRepository'];
  private userRepository: ICradle['userRepository'];

  public constructor({
    authRepository,
    userRepository
  }: ICradle) {
    this.authRepository = authRepository;
    this.userRepository = userRepository;
  }

  public async register(userDto: UserRegisterDto) {
    const emailExists = await this.userRepository.getByEmail(userDto.email);
    if (emailExists) {
      throw new ConflictError('EMAIL_ALREADY_TAKEN');
    }

    const hashedPassword = await argon2.hash(userDto.password);
    const createdUser = await this.userRepository.create({
      name: userDto.name,
      email: userDto.email,
      passwordHash: hashedPassword,
      role: 'user'
    });

    const { accessToken, refreshToken, refreshTokenHash } = buildTokens(createdUser.id, createdUser.role);

    await this.authRepository.addRefreshToken({
      userId: createdUser.id,
      tokenHash: refreshTokenHash,
      expiresAt: new Date(Date.now() + REFRESH_TOKEN_TTL_MS)
    });

    return { accessToken, refreshToken, user: { ...createdUser } };
  }

  public async login(userDto: UserLoginDto) {
    const user = await this.userRepository.getByEmail(userDto.email);
    if (!user) {
      throw new ConflictError('INVALID_CREDENTIALS');
    }
    const match = await argon2.verify(user.passwordHash, userDto.password);
    if (!match) {
      throw new ConflictError('INVALID_CREDENTIALS');
    }

    await this.authRepository.deleteRefreshTokensByUserId(user.id);

    const { accessToken, refreshToken, refreshTokenHash } = buildTokens(user.id, user.role);

    await this.authRepository.addRefreshToken({
      userId: user.id,
      tokenHash: refreshTokenHash,
      expiresAt: new Date(Date.now() + REFRESH_TOKEN_TTL_MS)
    });

    return {
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        name: user.name,
        email: user.email
      }
    };
  }

  public async refresh(token: string) {
    const oldRefreshTokenHash = getRefreshTokenHash(token);
    const tokenEntry = await this.authRepository.getRefreshTokenEntry(oldRefreshTokenHash);
    if (!tokenEntry || tokenEntry.expiresAt < new Date()) {
      throw new UnauthorizedError('INVALID_REFRESH_TOKEN');
    }

    await this.authRepository.deleteRefreshToken(oldRefreshTokenHash);

    const user = await this.userRepository.getById(tokenEntry.userId);
    if (!user) {
      throw new UnauthorizedError('INVALID_REFRESH_TOKEN');
    }

    const { accessToken, refreshToken, refreshTokenHash } = buildTokens(user.id, user.role);

    await this.authRepository.addRefreshToken({
      userId: user.id,
      tokenHash: refreshTokenHash,
      expiresAt: new Date(Date.now() + REFRESH_TOKEN_TTL_MS)
    });

    return { accessToken, refreshToken };
  }

  public async logout(token: string) {
    const refreshTokenHash = getRefreshTokenHash(token);
    await this.authRepository.deleteRefreshToken(refreshTokenHash);
  }
};