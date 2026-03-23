import jwt from 'jsonwebtoken';
import crypto from 'crypto';


const JWT_ACCESS_SECRET = process.env.JWT_ACCESS_SECRET!;

export interface AccessTokenPayload {
  id: number;
  role: string;
};

export const signAccessToken = (payload: AccessTokenPayload): string => {
  return jwt.sign(payload, JWT_ACCESS_SECRET, { expiresIn: '30d' }); // todo!
};

export const verifyAccessToken = (token: string): AccessTokenPayload => {
  return jwt.verify(token, JWT_ACCESS_SECRET) as AccessTokenPayload;
}

export const generateRefreshToken = (): string => {
  return crypto.randomBytes(32).toString('hex');
};

export const getRefreshTokenHash = (token: string) => {
  return crypto.createHash('sha256').update(token).digest('hex');
};

export const buildTokens = (userId: number, role: string) => {
  const payload: AccessTokenPayload = { id: userId, role };
  const accessToken = signAccessToken(payload);
  const refreshToken = generateRefreshToken();
  const refreshTokenHash = getRefreshTokenHash(refreshToken);
  return { accessToken, refreshToken, refreshTokenHash };
};