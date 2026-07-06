"use client";

import { useState, type FormEvent } from "react";
import { changePassword } from "@/lib/api";

interface Props {
  onGuardado: () => void;
}

export default function CambiarPasswordForm({ onGuardado }: Props) {
  const [actual, setActual]       = useState("");
  const [nueva, setNueva]         = useState("");
  const [confirmar, setConfirmar] = useState("");
  const [guardando, setGuardando] = useState(false);
  const [msg, setMsg]             = useState<{ texto: string; tipo: "ok" | "error" } | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (nueva.length < 8) {
      setMsg({ texto: "La nueva contraseña debe tener al menos 8 caracteres.", tipo: "error" });
      return;
    }
    if (nueva !== confirmar) {
      setMsg({ texto: "Las contraseñas nuevas no coinciden.", tipo: "error" });
      return;
    }
    setGuardando(true);
    setMsg(null);
    try {
      await changePassword(actual, nueva);
      setMsg({ texto: "Contraseña cambiada correctamente. Vuelve a entrar para actualizar la sesión.", tipo: "ok" });
      setActual("");
      setNueva("");
      setConfirmar("");
      setTimeout(onGuardado, 2000);
    } catch (err) {
      setMsg({ texto: (err as Error).message, tipo: "error" });
    } finally {
      setGuardando(false);
    }
  }

  return (
    <div className="contenido">
      <div className="seccion-head">
        <div>
          <h2>Cambiar contraseña</h2>
          <p className="seccion-sub">Actualiza la contraseña de tu cuenta.</p>
        </div>
      </div>

      {msg && (
        <div className={"aviso aviso--" + msg.tipo} style={{ marginBottom: "1rem" }}>
          {msg.texto}
        </div>
      )}

      <div className="form-card">
        <form onSubmit={handleSubmit}>
          <label className="campo">
            <span>Contraseña actual</span>
            <input type="password" required value={actual}
              onChange={(e) => setActual(e.target.value)}
              autoComplete="current-password" />
          </label>
          <label className="campo">
            <span>Nueva contraseña (mín. 8 caracteres)</span>
            <input type="password" required minLength={8} value={nueva}
              onChange={(e) => setNueva(e.target.value)}
              autoComplete="new-password" />
          </label>
          <label className="campo">
            <span>Confirmar nueva contraseña</span>
            <input type="password" required minLength={8} value={confirmar}
              onChange={(e) => setConfirmar(e.target.value)}
              autoComplete="new-password" />
          </label>
          <div className="form-actions">
            <button type="submit" className="boton" disabled={guardando}>
              {guardando ? "Guardando…" : "Cambiar contraseña"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
