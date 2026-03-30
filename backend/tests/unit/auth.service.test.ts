import { describe, it, expect, vi, beforeEach, beforeAll } from 'vitest';
import { AuthService } from '../../src/modules/auth/AuthService.js';
import { ConflictError, UnauthorizedError } from '../../src/common/exceptions/HttpErrors.js';
import type { UserRegisterDto, UserLoginDto } from '../../src/modules/auth/auth.types.js';


const mockUserRepository = {
  getByEmail: vi.fn(),
  getById: vi.fn(),
  create: vi.fn(),
};

const mockAuthRepository = {
  addRefreshToken: vi.fn(),
  deleteRefreshToken: vi.fn(),
  deleteRefreshTokensByUserId: vi.fn(),
  getRefreshTokenEntry: vi.fn(),
};

const authService = new AuthService({
  userRepository: mockUserRepository,
  authRepository: mockAuthRepository,
} as any);


const registerDto: UserRegisterDto = {
  name: 'Alice',
  email: 'alice@example.com',
  password: 'secret123',
  passwordConfirm: 'secret123',
};

const loginDto: UserLoginDto = {
  email: 'alice@example.com',
  password: 'secret123',
};

let existingUser: { id: number; name: string; email: string; role: string; passwordHash: string };

beforeAll(async () => {
  const argon2 = await import('argon2');
  const passwordHash = await argon2.hash('secret123');
  existingUser = { id: 1, name: 'Alice', email: 'alice@example.com', role: 'user', passwordHash };
});


describe('AuthService', () => {

  beforeEach(() => {
    vi.clearAllMocks();
  });


  describe('register', () => {

    it('выбрасывает ConflictError если email уже занят', async () => {
      mockUserRepository.getByEmail.mockResolvedValue(existingUser);

      await expect(authService.register(registerDto))
        .rejects
        .toThrow(ConflictError);

      expect(mockUserRepository.create).not.toHaveBeenCalled();
    });

    it('возвращает accessToken, refreshToken и user при успешной регистрации', async () => {
      mockUserRepository.getByEmail.mockResolvedValue(null);
      mockUserRepository.create.mockResolvedValue({ id: 1, name: 'Alice', email: 'alice@example.com', role: 'user' });
      mockAuthRepository.addRefreshToken.mockResolvedValue(undefined);

      const result = await authService.register(registerDto);

      expect(result).toHaveProperty('accessToken');
      expect(result).toHaveProperty('refreshToken');
      expect(result.user).toMatchObject({ id: 1, name: 'Alice', email: 'alice@example.com' });
    });

  });


  describe('login', () => {

    it('выбрасывает ConflictError если пользователь не найден', async () => {
      mockUserRepository.getByEmail.mockResolvedValue(null);

      await expect(authService.login(loginDto))
        .rejects
        .toThrow(UnauthorizedError);
    });

    it('выбрасывает ConflictError если пароль неверный', async () => {
      mockUserRepository.getByEmail.mockResolvedValue(existingUser);

      await expect(authService.login({ ...loginDto, password: 'wrong-password' }))
        .rejects
        .toThrow(UnauthorizedError);
    });

    it('возвращает токены и данные пользователя при успешном логине', async () => {
      mockUserRepository.getByEmail.mockResolvedValue(existingUser);
      mockAuthRepository.deleteRefreshTokensByUserId.mockResolvedValue(undefined);
      mockAuthRepository.addRefreshToken.mockResolvedValue(undefined);

      const result = await authService.login(loginDto);

      expect(result).toHaveProperty('accessToken');
      expect(result).toHaveProperty('refreshToken');
      expect(result.user).toMatchObject({ id: 1, name: 'Alice', email: 'alice@example.com' });
    });

  });


  describe('refresh', () => {

    it('выбрасывает UnauthorizedError если токен не найден в БД', async () => {
      mockAuthRepository.getRefreshTokenEntry.mockResolvedValue(null);

      await expect(authService.refresh('some-token'))
        .rejects
        .toThrow(UnauthorizedError);
    });

    it('выбрасывает UnauthorizedError если токен просрочен', async () => {
      mockAuthRepository.getRefreshTokenEntry.mockResolvedValue({
        userId: 1,
        tokenHash: 'hash',
        expiresAt: new Date('2000-01-01'),
      });

      await expect(authService.refresh('some-token'))
        .rejects
        .toThrow(UnauthorizedError);
    });

  });

});