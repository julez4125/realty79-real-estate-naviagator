// Auth DTOs — plain interfaces (zod not in workspace deps; validation lives in apps/api)

export interface RegisterDto {
  email: string;
  /** Minimum 10 characters */
  password: string;
  tenantId?: string;
}

export interface LoginDto {
  email: string;
  password: string;
}

export interface RefreshDto {
  refreshToken: string;
}

export interface AuthTokensDto {
  accessToken: string;
  refreshToken: string;
}
