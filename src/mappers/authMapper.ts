import type {
  LoginResponseDataDto,
  ReLoginResponseDataDto,
} from "../api/events/authApi";
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

export function mapReLoginResponseToSession(
  session: AuthSession,
  data: ReLoginResponseDataDto,
): AuthSession {
  return {
    ...session,
    reLoginCode: data.RE_LOGIN_CODE,
  };
}
