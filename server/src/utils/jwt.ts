import jwt from 'jsonwebtoken';
import { env } from '../config/env';
import { JwtPayload } from '../types';

export const generateAccessToken = (payload: JwtPayload): string => {
    return jwt.sign(payload as object, env.JWT_SECRET, {
        expiresIn: env.JWT_ACCESS_EXPIRY,
    } as jwt.SignOptions);
};

export const generateRefreshToken = (payload: JwtPayload): string => {
    return jwt.sign(payload as object, env.JWT_SECRET, {
        expiresIn: env.JWT_REFRESH_EXPIRY,
    } as jwt.SignOptions);
};

export const verifyToken = (token: string): JwtPayload | null => {
    try {
        return jwt.verify(token, env.JWT_SECRET) as JwtPayload;
    } catch {
        return null;
    }
};

export const generateTokenPair = (payload: JwtPayload) => {
    return {
        accessToken: generateAccessToken(payload),
        refreshToken: generateRefreshToken(payload),
    };
};
