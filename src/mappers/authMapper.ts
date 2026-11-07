import type { LoginResponseDataDto } from "../api/events/authApi";
import type { AuthSession } from "../domain/auth/AuthSession";

export function mapLoginResponseToSession(
  username: string,
  data: LoginResponseDataDto,
): AuthSession {
  return {
    username,
    reLoginCode: data.RE_LOGIN_CODE,
    authenticatedAt: new Date().toISOString(),
  };
}
