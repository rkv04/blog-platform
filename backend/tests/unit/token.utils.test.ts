import { describe, it, expect } from 'vitest';
import jwt from 'jsonwebtoken';

import {
  signAccessToken,
  verifyAccessToken,
  generateRefreshToken,
  getRefreshTokenHash,
  buildTokens,
} from '../../src/common/utils/token.utils.js';


describe('token.utils', () => {

  describe('signAccessToken / verifyAccessToken', () => {

    it('подписанный токен успешно верифицируется', () => {
      const payload = { id: 1, role: 'user' };

      const token = signAccessToken(payload);
      const decoded = verifyAccessToken(token);

      expect(decoded.id).toBe(payload.id);
      expect(decoded.role).toBe(payload.role);
    });

    it('токен содержит корректный payload', () => {
      const payload = { id: 42, role: 'admin' };

      const token = signAccessToken(payload);
      const decoded = verifyAccessToken(token);

      expect(decoded.id).toBe(42);
      expect(decoded.role).toBe('admin');
    });

    it('verifyAccessToken выбрасывает ошибку для невалидного токена', () => {
      expect(() => verifyAccessToken('invalid.token.string'))
        .toThrow(jwt.JsonWebTokenError);
    });

    it('verifyAccessToken выбрасывает ошибку для токена подписанного другим секретом', () => {
      const foreignToken = jwt.sign({ id: 1, role: 'user' }, 'other-secret');

      expect(() => verifyAccessToken(foreignToken))
        .toThrow(jwt.JsonWebTokenError);
    });

  });


  describe('generateRefreshToken', () => {

    it('возвращает строку длиной 64 символа (32 байта в hex)', () => {
      const token = generateRefreshToken();

      expect(typeof token).toBe('string');
      expect(token).toHaveLength(64);
    });

    it('каждый вызов возвращает уникальный токен', () => {
      const token1 = generateRefreshToken();
      const token2 = generateRefreshToken();

      expect(token1).not.toBe(token2);
    });

  });


  describe('getRefreshTokenHash', () => {

    it('один и тот же токен всегда даёт одинаковый хэш', () => {
      const token = 'some-refresh-token';

      const hash1 = getRefreshTokenHash(token);
      const hash2 = getRefreshTokenHash(token);

      expect(hash1).toBe(hash2);
    });

    it('разные токены дают разные хэши', () => {
      const hash1 = getRefreshTokenHash('token-one');
      const hash2 = getRefreshTokenHash('token-two');

      expect(hash1).not.toBe(hash2);
    });

    it('возвращает строку длиной 64 символа (sha256 в hex)', () => {
      const hash = getRefreshTokenHash('any-token');

      expect(hash).toHaveLength(64);
    });

  });


  describe('buildTokens', () => {

    it('возвращает accessToken, refreshToken и refreshTokenHash', () => {
      const result = buildTokens(1, 'user');

      expect(result).toHaveProperty('accessToken');
      expect(result).toHaveProperty('refreshToken');
      expect(result).toHaveProperty('refreshTokenHash');
    });

    it('refreshTokenHash является хэшем от refreshToken', () => {
      const { refreshToken, refreshTokenHash } = buildTokens(1, 'user');

      expect(refreshTokenHash).toBe(getRefreshTokenHash(refreshToken));
    });

    it('accessToken содержит переданный userId и role', () => {
      const { accessToken } = buildTokens(7, 'admin');
      const decoded = verifyAccessToken(accessToken);

      expect(decoded.id).toBe(7);
      expect(decoded.role).toBe('admin');
    });

  });

});