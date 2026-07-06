"use client";

import { useEffect, useState, type FormEvent } from "react";
import { fetchUsuario, resetPassword } from "@/lib/api";

interface Props {
  usuarioId: number;
  onGuardado: () => void;
  onCancelar: () => void;
}

export default function ResetPasswordForm({ usuarioId, onGuardado, onCancelar }: Props) {
  const [nombre, setNombre]       = useState("");
  const [password, setPassword]   = useState("");
  const [confirmar, setConfirmar] = useState("");
  const [cargando, setCargando]   = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [msg, setMsg]             = useState<{ texto: string; tipo: "ok" | "error" } | null>(null);

  useEffect(() => {
    fetchUsuario(usuarioId)
      .then((u) => setNombre(u.nombre))
      .catch((err) => setMsg({ texto: (err as Error).message, tipo: "error" }))
      .finally(() => setCargando(false));
  }, [usuarioId]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (password.length < 8) {
      setMsg({ texto: "La contraseña debe tener al menos 8 caracteres.", tipo: "error" });
      return;
    }
    if (password !== confirmar) {
      setMsg({ texto: "Las contraseñas no coinciden.", tipo: "error" });
      return;
    }
    setGuardando(true);
    setMsg(null);
    try {
      await resetPassword(usuarioId, password);
      setMsg({ texto: "Contraseña reseteada correctamente.", tipo: "ok" });
      setTimeout(onGuardado, 800);
    } catch (err) {
      setMsg({ texto: (err as Error).message, tipo: "error" });
    } finally {
      setGuardando(false);
    }
  }

  if (cargando) return <div className="contenido"><p style={{ color: "#6b7280" }}>Cargando…</p></div>;

  return (
    <div className="contenido">
      <div className="seccion-head">
        <div>
          <h2>Resetear contraseña</h2>
          <p className="seccion-sub">Establece una nueva contraseña para <strong>{nombre}</strong>.</p>
        </div>
      </div>

      {msg && <div className={"aviso aviso--" + msg.tipo} style={{ marginBottom: "1rem" }}>{msg.texto}</div>}

      <div className="form-card">
        <form onSubmit={handleSubmit}>
          <label className="campo">
            <span>Nueva contraseña (mín. 8 caracteres)</span>
            <input type="password" required minLength={8} value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="new-password" />
          </label>
          <label className="campo">
            <span>Confirmar contraseña</span>
            <input type="password" required minLength={8} value={confirmar}
              onChange={(e) => setConfirmar(e.target.value)}
              autoComplete="new-password" />
          </label>
          <div className="form-actions">
            <button type="submit" className="boton" disabled={guardando}>
              {guardando ? "Guardando…" : "Resetear contraseña"}
            </button>
            <button type="button" className="boton boton--secundario" onClick={onCancelar} disabled={guardando}>
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
