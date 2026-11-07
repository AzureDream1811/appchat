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
