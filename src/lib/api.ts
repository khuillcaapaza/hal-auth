import axios from "axios";
import type {
  LoginChallenge,
  LoginResponse,
  Modulo,
  UsuarioAdmin,
  UsuarioInput,
  UsuarioListResult,
  UsuarioUpdateInput,
} from "./types";

const API_BASE = (
  process.env.NEXT_PUBLIC_AUTH_API_BASE ||
  "https://auth.hospitalantoniolorena.gob.pe/api"
).replace(/\/+$/, "");

const TOKEN_KEY = "hal_auth_token";

// ── Token de sesión (admin portal) ────────────────────────────────────

export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return window.sessionStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string): void {
  if (typeof window === "undefined") return;
  window.sessionStorage.setItem(TOKEN_KEY, token);
}

export function clearToken(): void {
  if (typeof window === "undefined") return;
  window.sessionStorage.removeItem(TOKEN_KEY);
}

// ── Cliente HTTP ───────────────────────────────────────────────────────

const http = axios.create({ baseURL: API_BASE });

http.interceptors.request.use((config) => {
  const t = getToken();
  if (t) config.headers.Authorization = `Bearer ${t}`;
  return config;
});

http.interceptors.response.use(
  (r) => r,
  (error) => {
    const status: number = error?.response?.status;
    const url: string = error?.config?.url ?? "";
    if (status === 401 && !url.includes("/login")) {
      clearToken();
      if (typeof window !== "undefined") {
        window.dispatchEvent(new Event("auth:logout"));
      }
      return Promise.reject(new Error("Sesión expirada. Vuelve a entrar."));
    }
    const msg =
      error?.response?.data?.error || error?.message || "Error en la solicitud";
    return Promise.reject(new Error(msg));
  }
);

// ── Auth ───────────────────────────────────────────────────────────────

export async function login(email: string, password: string): Promise<LoginChallenge> {
  const { data } = await http.post<LoginChallenge>("/login", { email, password });
  return data;
}

export async function verifyCode(email: string, codigo: string): Promise<LoginResponse> {
  const { data } = await http.post<LoginResponse>("/login/verify", { email, codigo });
  return data;
}

export async function fetchMe() {
  const { data } = await http.get<{ usuario: Record<string, unknown> }>("/me");
  return data.usuario;
}

// ── Usuarios (admin) ───────────────────────────────────────────────────

interface UsuariosApiResponse {
  usuarios: UsuarioAdmin[];
  meta: { total: number; page: number; per_page: number; total_pages: number };
}

export async function fetchUsuarios(params: { page?: number; perPage?: number } = {}): Promise<UsuarioListResult> {
  const { data } = await http.get<UsuariosApiResponse>("/admin/users", {
    params: { page: params.page, per_page: params.perPage },
  });
  return {
    items: data.usuarios,
    total: data.meta.total,
    page: data.meta.page,
    perPage: data.meta.per_page,
    totalPages: data.meta.total_pages,
  };
}

export async function fetchUsuario(id: number): Promise<UsuarioAdmin> {
  const { data } = await http.get<{ usuario: UsuarioAdmin }>(`/admin/users/${id}`);
  return data.usuario;
}

export async function crearUsuario(input: UsuarioInput): Promise<number> {
  const { data } = await http.post<{ id: number }>("/admin/users", input);
  return data.id;
}

export async function actualizarUsuario(id: number, input: UsuarioUpdateInput): Promise<void> {
  await http.put(`/admin/users/${id}`, input);
}

export async function eliminarUsuario(id: number): Promise<void> {
  await http.delete(`/admin/users/${id}`);
}

export async function resetPassword(id: number, password: string): Promise<void> {
  await http.post(`/admin/users/${id}/reset-password`, { password });
}

export async function getModulos(id: number): Promise<Modulo[]> {
  const { data } = await http.get<{ modulos: Modulo[] }>(`/admin/users/${id}/modulos`);
  return data.modulos;
}

export async function setModulos(id: number, modulos: Modulo[]): Promise<void> {
  await http.put(`/admin/users/${id}/modulos`, { modulos });
}

// ── Cuenta propia ──────────────────────────────────────────────────────

export async function changePassword(currentPassword: string, newPassword: string): Promise<void> {
  await http.post("/users/change-password", {
    current_password: currentPassword,
    new_password: newPassword,
  });
}

export default http;
