import type {
  LoginRequestDto,
  LoginResponseDataDto,
  RegisterRequestDto,
  RegisterResponseDataDto,
} from "../api/events/authApi";
import { sendSocketMessage } from "../api/websocketClient";

export async function register(
  username: string,
  password: string,
): Promise<RegisterResponseDataDto> {
  const request: RegisterRequestDto = {
    user: username,
    pass: password,
  };
  const response = await sendSocketMessage<RegisterResponseDataDto>(
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
  const response = await sendSocketMessage<LoginResponseDataDto>(
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
