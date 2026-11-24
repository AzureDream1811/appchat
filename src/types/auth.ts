export interface AuthCredentials {
  username: string;
  password: string;
}

export interface RegisterRequestDto {
  user: string;
  pass: string;
}

export type RegisterResponseDataDto = string;

export interface LoginRequestDto {
  user: string;
  pass: string;
}

export interface LoginResponseDataDto {
  RE_LOGIN_CODE: string;
}

export interface ReLoginRequestDto {
  user: string;
  code: string;
}

export type ReLoginResponseDataDto = LoginResponseDataDto;
export type LogoutResponseDto = string;

export interface LoginResult {
  RE_LOGIN_CODE: string;
}

export interface AuthSession {
  username: string;
  reLoginCode: string;
  authenticatedAt: string;
}
