"use client";

import type { Usuario } from "@/lib/types";

export type Vista =
  | "dashboard"
  | "usuarios-lista"
  | "usuario-nuevo"
  | "usuario-editar"
  | "usuario-modulos"
  | "usuario-reset"
  | "mi-cuenta";

interface Props {
  vista: Vista;
  onNavegar: (v: Vista) => void;
  usuario: Usuario;
  onLogout: () => void;
  esAdmin: boolean;
}

function Icono({ tipo }: { tipo: string }) {
  const paths: Record<string, string> = {
    dashboard: "M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6",
    usuarios:  "M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z",
    nuevo:     "M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z",
    modulos:   "M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z",
    password:  "M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z",
    cuenta:    "M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z",
  };
  const d = paths[tipo] ?? paths.dashboard;
  return (
    <svg fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d={d} />
    </svg>
  );
}

export default function Sidebar({ vista, onNavegar, usuario, onLogout, esAdmin }: Props) {
  function item(v: Vista, icono: string, label: string) {
    return (
      <button
        type="button"
        className={"nav-item" + (vista === v ? " nav-item--activo" : "")}
        onClick={() => onNavegar(v)}
      >
        <Icono tipo={icono} />
        {label}
      </button>
    );
  }

  return (
    <aside className="sidebar">
      <nav>
        {item("dashboard", "dashboard", "Dashboard")}

        {esAdmin && (
          <>
            <span className="sidebar__section">Usuarios</span>
            {item("usuarios-lista", "usuarios", "Listar usuarios")}
            {item("usuario-nuevo", "nuevo", "Nuevo usuario")}
          </>
        )}

        <span className="sidebar__section">Mi cuenta</span>
        {item("mi-cuenta", "cuenta", "Cambiar contraseña")}

        <button type="button" className="nav-item" style={{ marginTop: "auto", color: "#b91c1c" }} onClick={onLogout}>
          <svg fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round"
              d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          Salir
        </button>
      </nav>
    </aside>
  );
}
