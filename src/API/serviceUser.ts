import { api } from "./api";
import { UserOut, Me } from "../Types/types";
import { Lang } from "../Helper/i18n";

export const getUsers = async () => {
  const res = await api.get("/api/users");
  return res.data;
};

export const createUser = async (payload: {
  username: string;
  email?: string | null;
  password: string;
  alias: string;
  role: "client" | "admin";
  lang?: Lang;
  company_id?: number | null;
  warehouse_id?: number | null;
}): Promise<UserOut> => {
  const res = await api.post<UserOut>("/api/users", payload);
  return res.data;
};

export const patchMyLang = async (lang: Lang): Promise<Me> => {
  const res = await api.patch<Me>("/api/me", { lang });
  return res.data;
};
export const patchUser = async (userId: number, payload: UserOut & { password?: string }): Promise<UserOut> => {
  const res = await api.patch<UserOut>(`/api/users/${userId}`, payload)
  return res.data
}

export const deleteUser = async (userId: number): Promise<void> => {
  await api.delete(`/api/users/${userId}`)
}

export const forgotPassword = async (email: string) => {
  const res = await api.post('/api/forgot-password', { email })
  return res.data
}

export const verifyResetCode = async (email: string, code: string) => {
  const res = await api.post('/api/verify-reset-code', { email, code })
  return res.data
}

export const resetPassword = async (email: string, code: string, new_password: string) => {
  const res = await api.post('/api/reset-password', { email, code, new_password })
  return res.data
}

export const loginVerify = async (pre_auth_token: string, code: string) => {
  const res = await api.post('/api/login/verify', { pre_auth_token, code })
  return res.data
}

export const patchMy2FA = async (enabled: boolean): Promise<Me> => {
  const res = await api.patch<Me>('/api/me/2fa', { two_factor_enabled: enabled })
  return res.data
}

