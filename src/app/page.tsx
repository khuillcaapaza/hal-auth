"use client";

import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import LoginView from "@/components/LoginView";
import Dashboard from "@/components/Dashboard";
import UsersPanel from "@/components/UsersPanel";

type Pantalla = "dashboard" | "usuarios";

export default function Home() {
  const {
    state,
    cargando,
    iniciarLogin,
    verificarCodigo,
    cerrarSesion,
  } = useAuth();

  const [pantalla, setPantalla] = useState<Pantalla>("dashboard");

  // Autenticado → mostrar dashboard o panel de usuarios
  if (state.fase === "authenticated") {
    if (pantalla === "usuarios") {
      return (
        <UsersPanel onVolver={() => setPantalla("dashboard")} />
      );
    }
    return (
      <Dashboard
        usuario={state.usuario}
        onLogout={cerrarSesion}
        onAdmin={() => setPantalla("usuarios")}
      />
    );
  }

  // Cargando sesión inicial
  if (cargando && state.fase === "idle") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-100 flex items-center justify-center">
        <p className="text-gray-500">Verificando sesión…</p>
      </div>
    );
  }

  // Login / 2FA
  return (
    <LoginView
      onLogin={iniciarLogin}
      onVerify={verificarCodigo}
      challenge={state.fase === "challenge" ? state.challenge : null}
      cargando={cargando}
      error={state.fase === "error" ? state.mensaje : null}
    />
  );
}
