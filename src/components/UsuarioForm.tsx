"use client";

import { useEffect, useState, type FormEvent } from "react";
import { fetchUsuario, crearUsuario, actualizarUsuario } from "@/lib/api";
import type { UsuarioInput, UsuarioUpdateInput } from "@/lib/types";

interface Props {
  modo: "crear" | "editar";
  usuarioId?: number;
  onGuardado: () => void;
  onCancelar: () => void;
}

export default function UsuarioForm({ modo, usuarioId, onGuardado, onCancelar }: Props) {
  const [form, setForm] = useState({ usuario: "", nombre: "", email: "", password: "", rol: "usuario" as "admin" | "usuario" });
  const [cargando, setCargando] = useState(modo === "editar");
  const [guardando, setGuardando] = useState(false);
  const [msg, setMsg] = useState<{ texto: string; tipo: "ok" | "error" } | null>(null);

  useEffect(() => {
    if (modo !== "editar" || !usuarioId) return;
    fetchUsuario(usuarioId)
      .then((u) => setForm({ usuario: u.usuario, nombre: u.nombre, email: u.email, password: "", rol: u.rol }))
      .catch((err) => setMsg({ texto: (err as Error).message, tipo: "error" }))
      .finally(() => setCargando(false));
  }, [modo, usuarioId]);

  function set(campo: string, valor: string) {
    setForm((f) => ({ ...f, [campo]: valor }));
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setGuardando(true);
    setMsg(null);
    try {
      if (modo === "crear") {
        const input: UsuarioInput = { ...form, modulos: [] };
        await crearUsuario(input);
        setMsg({ texto: "Usuario creado correctamente.", tipo: "ok" });
        setTimeout(onGuardado, 800);
      } else {
        const input: UsuarioUpdateInput = { nombre: form.nombre, email: form.email, rol: form.rol };
        await actualizarUsuario(usuarioId!, input);
        setMsg({ texto: "Usuario actualizado correctamente.", tipo: "ok" });
        setTimeout(onGuardado, 800);
      }
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
          <h2>{modo === "crear" ? "Nuevo usuario" : "Editar usuario"}</h2>
          <p className="seccion-sub">
            {modo === "crear" ? "Completa los datos para crear la cuenta." : "Modifica los datos del usuario."}
          </p>
        </div>
      </div>

      {msg && (
        <div className={"aviso aviso--" + msg.tipo} style={{ marginBottom: "1rem" }}>
          {msg.texto}
        </div>
      )}

      <div className="form-card">
        <form onSubmit={handleSubmit}>
          {modo === "crear" && (
            <label className="campo">
              <span>Nombre de usuario</span>
              <input type="text" required value={form.usuario} onChange={(e) => set("usuario", e.target.value)}
                placeholder="ej: jperez" autoComplete="off" />
            </label>
          )}

          <label className="campo">
            <span>Nombre completo</span>
            <input type="text" required value={form.nombre} onChange={(e) => set("nombre", e.target.value)}
              placeholder="Juan Pérez" />
          </label>

          <label className="campo">
            <span>Correo institucional</span>
            <input type="email" required value={form.email} onChange={(e) => set("email", e.target.value)}
              placeholder="j.perez@hospital.gob.pe" />
          </label>

          {modo === "crear" && (
            <label className="campo">
              <span>Contraseña (mín. 8 caracteres)</span>
              <input type="password" required minLength={8} value={form.password}
                onChange={(e) => set("password", e.target.value)} />
            </label>
          )}

          <label className="campo">
            <span>Rol</span>
            <select value={form.rol} onChange={(e) => set("rol", e.target.value as "admin" | "usuario")}
              style={{ width: "100%", padding: "0.65rem 0.75rem", border: "1px solid var(--borde)", borderRadius: "8px", fontFamily: "inherit", fontSize: "1rem" }}>
              <option value="usuario">Usuario</option>
              <option value="admin">Administrador</option>
            </select>
          </label>

          <div className="form-actions">
            <button type="submit" className="boton" disabled={guardando}>
              {guardando ? "Guardando…" : modo === "crear" ? "Crear usuario" : "Guardar cambios"}
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
