// ── Módulos disponibles ────────────────────────────────────────────────
export type Modulo = "citas" | "noticias" | "convocatorias";

export const MODULOS: Record<Modulo, { label: string; descripcion: string; color: string; url: string }> = {
  citas: {
    label: "Citas Médicas",
    descripcion: "Gestión de cronogramas y áreas de atención",
    color: "from-blue-500 to-blue-700",
    url: process.env.NEXT_PUBLIC_URL_CITAS || "https://citas.hospitalantoniolorena.gob.pe",
  },
  noticias: {
    label: "Noticias",
    descripcion: "Redacción y publicación de notas de prensa",
    color: "from-green-500 to-green-700",
    url: process.env.NEXT_PUBLIC_URL_NOTICIAS || "https://noticias.hospitalantoniolorena.gob.pe",
  },
  convocatorias: {
    label: "Convocatorias",
    descripcion: "Administración de convocatorias laborales",
    color: "from-amber-500 to-amber-700",
    url: process.env.NEXT_PUBLIC_URL_CONVOCATORIAS || "https://convocatorias.hospitalantoniolorena.gob.pe",
  },
};

// ── Usuario ────────────────────────────────────────────────────────────
export interface Usuario {
  id: number;
  usuario: string;
  email: string;
  nombre: string;
  rol: "admin" | "usuario";
  es_superadmin: boolean;
  modulos: Modulo[];
  activo?: boolean;
}

// ── Respuestas de la API ───────────────────────────────────────────────
export interface LoginChallenge {
  requiere2fa: true;
  email: string;
  expira_en: number;
  mensaje: string;
  /** Solo en modo desarrollo. */
  dev_codigo?: string;
}

export interface LoginResponse {
  token: string;
  usuario: Usuario;
}

export interface UsuarioListResult {
  items: UsuarioAdmin[];
  total: number;
  page: number;
  perPage: number;
  totalPages: number;
}

export interface UsuarioAdmin extends Usuario {
  creado_en?: string;
  actualizado_en?: string;
}

export interface UsuarioInput {
  usuario: string;
  email: string;
  nombre: string;
  password: string;
  rol: "admin" | "usuario";
  modulos: Modulo[];
}

export interface UsuarioUpdateInput {
  nombre?: string;
  email?: string;
  rol?: "admin" | "usuario";
  activo?: boolean;
}

export type Mensaje = { texto: string; tipo: "ok" | "error" } | null;
