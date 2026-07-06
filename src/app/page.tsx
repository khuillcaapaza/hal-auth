"use client";

import { useAuth } from "@/hooks/useAuth";
import LoginView from "@/components/LoginView";
import AdminPanel from "@/components/AdminPanel";

export default function Home() {
  const { state, cargando, iniciarLogin, verificarCodigo, cerrarSesion } = useAuth();

  if (state.fase === "authenticated") {
    return (
      <AdminPanel
        usuario={state.usuario}
        token={state.token}
        onLogout={cerrarSesion}
      />
    );
  }

  if (cargando && state.fase === "idle") {
    return (
      <div className="shell--login">
        <p style={{ color: "rgba(255,255,255,0.8)" }}>Verificando sesión…</p>
      </div>
    );
  }

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
