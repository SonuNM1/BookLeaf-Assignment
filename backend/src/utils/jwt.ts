import jwt from 'jsonwebtoken';

export interface TokenPayload {
  userId: string;
  role: string;
  author_id: string | null;
}

export const generateToken = (payload: TokenPayload): string => {
  const secret = process.env.JWT_SECRET;

  if (!secret) throw new Error('JWT_SECRET is not defined');

  // payload is the parameter passed into this function
  // make sure the word "payload" matches exactly here
  return jwt.sign(payload, secret, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });
};

export const verifyToken = (token: string): TokenPayload => {
  const secret = process.env.JWT_SECRET;

  if (!secret) throw new Error('JWT_SECRET is not defined');

  return jwt.verify(token, secret) as TokenPayload;
};