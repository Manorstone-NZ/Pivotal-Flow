import { FastifyRequest } from 'fastify';

export interface AuthenticatedUser {
  sub: string;
  org: string;
  roles: string[];
  permissions: string[];
  aud?: string;
  iss?: string;
  iat?: number;
  exp?: number;
  nbf?: number;
  jti?: string;
  mfa?: boolean;
  scope?: string[];
}

export interface AuthenticatedRequest extends FastifyRequest {
  user: AuthenticatedUser;
  organizationId: string;
  customerId?: string;
}

export interface AuthContext {
  userId: string;
  organizationId: string;
  customerId?: string;
  roles: string[];
  permissions: string[];
}

export interface TokenPayload {
  sub: string;
  org: string;
  aud: string;
  iss: string;
  iat: number;
  exp: number;
  nbf: number;
  jti: string;
  roles: string[];
  permissions: string[];
  mfa: boolean;
  scope: string[];
}

export interface LoginRequest {
  email: string;
  password: string;
  mfaCode?: string;
}

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  tokenType: 'Bearer';
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    roles: string[];
    permissions: string[];
    organizationId: string;
  };
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

export interface RefreshTokenResponse {
  accessToken: string;
  expiresIn: number;
  tokenType: 'Bearer';
}

export interface LogoutRequest {
  refreshToken: string;
}

export interface LogoutResponse {
  message: string;
}

export interface MeResponse {
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    roles: string[];
    permissions: string[];
    organizationId: string;
    customerId?: string;
  };
}

// JWT Token Manager interface
export interface TokenManager {
  signAccessToken(payload: Partial<TokenPayload>): Promise<string>;
  signRefreshToken(payload: Partial<TokenPayload>): Promise<string>;
  verifyToken(token: string): Promise<TokenPayload>;
  decodeToken(token: string): TokenPayload | null;
}
