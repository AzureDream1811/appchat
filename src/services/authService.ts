import type {
  LoginRequestDto,
  LoginResponseDataDto,
  LogoutResponseDto,
  ReLoginRequestDto,
  ReLoginResponseDataDto,
  RegisterRequestDto,
  RegisterResponseDataDto,
} from "../types/auth";
import { socket } from "./socket";

export async function register(
  username: string,
  password: string,
): Promise<RegisterResponseDataDto> {
  const request: RegisterRequestDto = {
    user: username,
    pass: password,
  };
  const response = await socket.request<RegisterResponseDataDto>(
    "REGISTER",
    request,
  );

  if (typeof response !== "string") {
    throw new Error("Invalid REGISTER response.");
  }

  return response;
}

export async function login(
  username: string,
  password: string,
): Promise<LoginResponseDataDto> {
  const request: LoginRequestDto = {
    user: username,
    pass: password,
  };
  const response = await socket.request<LoginResponseDataDto>(
    "LOGIN",
    request,
  );

  if (
    typeof response !== "object" ||
    response === null ||
    typeof response.RE_LOGIN_CODE !== "string"
  ) {
    throw new Error("Invalid LOGIN response.");
  }

  return response;
}

export async function relogin(
  username: string,
  reLoginCode: string,
): Promise<ReLoginResponseDataDto> {
  const request: ReLoginRequestDto = {
    user: username,
    code: reLoginCode,
  };
  const response = await socket.request<ReLoginResponseDataDto>(
    "RE_LOGIN",
    request,
  );

  if (
    typeof response !== "object" ||
    response === null ||
    typeof response.RE_LOGIN_CODE !== "string"
  ) {
    throw new Error("Invalid RE_LOGIN response.");
  }

  return response;
}

export async function logout(): Promise<LogoutResponseDto> {
  try {
    const response = await socket.request<LogoutResponseDto>("LOGOUT");

    if (typeof response !== "string") {
      throw new Error("Invalid LOGOUT response.");
    }

    return response;
  } finally {
    socket.disconnect();
  }
}
