"use client";

import { useState } from "react";
import type { Usuario } from "@/lib/types";
import Sidebar, { type Vista } from "@/components/Sidebar";
import Dashboard from "@/components/Dashboard";
import UsuariosList from "@/components/UsuariosList";
import UsuarioForm from "@/components/UsuarioForm";
import ModulosManager from "@/components/ModulosManager";
import ResetPasswordForm from "@/components/ResetPasswordForm";
import CambiarPasswordForm from "@/components/CambiarPasswordForm";

interface Props {
  usuario: Usuario;
  token: string;
  onLogout: () => void;
}

export default function AdminPanel({ usuario, token, onLogout }: Props) {
  const [vista, setVista] = useState<Vista>("dashboard");
  const [usuarioEditandoId, setUsuarioEditandoId] = useState<number | null>(null);

  const esAdmin = usuario.rol === "admin" || usuario.es_superadmin;

  function navegar(v: Vista, id?: number) {
    setVista(v);
    if (id !== undefined) setUsuarioEditandoId(id);
  }

  function renderContenido() {
    switch (vista) {
      case "dashboard":
        return <Dashboard usuario={usuario} onLogout={onLogout} onAdmin={() => navegar("usuarios-lista")} />;

      case "usuarios-lista":
        return (
          <UsuariosList
            onNuevo={() => navegar("usuario-nuevo")}
            onEditar={(id) => navegar("usuario-editar", id)}
            onModulos={(id) => navegar("usuario-modulos", id)}
            onReset={(id) => navegar("usuario-reset", id)}
          />
        );

      case "usuario-nuevo":
        return (
          <UsuarioForm
            modo="crear"
            onGuardado={() => navegar("usuarios-lista")}
            onCancelar={() => navegar("usuarios-lista")}
          />
        );

      case "usuario-editar":
        return usuarioEditandoId ? (
          <UsuarioForm
            modo="editar"
            usuarioId={usuarioEditandoId}
            onGuardado={() => navegar("usuarios-lista")}
            onCancelar={() => navegar("usuarios-lista")}
          />
        ) : null;

      case "usuario-modulos":
        return usuarioEditandoId ? (
          <ModulosManager
            usuarioId={usuarioEditandoId}
            onGuardado={() => navegar("usuarios-lista")}
            onCancelar={() => navegar("usuarios-lista")}
          />
        ) : null;

      case "usuario-reset":
        return usuarioEditandoId ? (
          <ResetPasswordForm
            usuarioId={usuarioEditandoId}
            onGuardado={() => navegar("usuarios-lista")}
            onCancelar={() => navegar("usuarios-lista")}
          />
        ) : null;

      case "mi-cuenta":
        return (
          <CambiarPasswordForm onGuardado={() => navegar("dashboard")} />
        );

      default:
        return null;
    }
  }

  // El dashboard ocupa el ancho completo (sin sidebar lateral)
  if (vista === "dashboard") {
    return (
      <div className="panel">
        <header className="topbar">
          <div className="topbar__brand">
            <strong>Sistema HAL</strong>
            <span>Hospital Antonio Lorena del Cusco</span>
          </div>
          <div className="topbar__user">
            <span>Hola, <strong>{usuario.nombre || usuario.usuario}</strong></span>
            {esAdmin && (
              <button type="button" className="boton boton--sm boton--secundario"
                onClick={() => navegar("usuarios-lista")}>
                Gestión de usuarios
              </button>
            )}
            <button type="button" className="boton boton--sm boton--secundario"
              onClick={() => navegar("mi-cuenta")}>
              Mi cuenta
            </button>
            <button type="button" className="boton boton--sm boton--secundario" onClick={onLogout}>
              Salir
            </button>
          </div>
        </header>
        <Dashboard usuario={usuario} onLogout={onLogout} onAdmin={() => navegar("usuarios-lista")} />
      </div>
    );
  }

  // Resto de vistas usan el layout con sidebar
  return (
    <div className="panel">
      <header className="topbar">
        <div className="topbar__brand">
          <strong>Sistema HAL</strong>
          <span>Hospital Antonio Lorena del Cusco</span>
        </div>
        <div className="topbar__user">
          <span>Hola, <strong>{usuario.nombre || usuario.usuario}</strong></span>
        </div>
      </header>

      <div className="layout">
        <Sidebar
          vista={vista}
          onNavegar={navegar}
          usuario={usuario}
          onLogout={onLogout}
          esAdmin={esAdmin}
        />
        <div className="layout contenido">
          {renderContenido()}
        </div>
      </div>
    </div>
  );
}
