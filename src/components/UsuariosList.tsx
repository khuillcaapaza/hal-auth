"use client";

import { useEffect, useState } from "react";
import { useUsers } from "@/hooks/useUsers";
import type { UsuarioAdmin } from "@/lib/types";
import { MODULOS } from "@/lib/types";

interface Props {
  onNuevo: () => void;
  onEditar: (id: number) => void;
  onModulos: (id: number) => void;
  onReset: (id: number) => void;
}

function Aviso({ msg, tipo, onClose }: { msg: string; tipo: "ok" | "error"; onClose: () => void }) {
  return (
    <div className={"aviso aviso--" + tipo}>
      {msg}
      <button type="button" onClick={onClose}
        style={{ float: "right", background: "none", border: "none", cursor: "pointer", fontWeight: "bold" }}>×</button>
    </div>
  );
}

function inicialNombre(nombre: string): string {
  return (nombre || "?").charAt(0).toUpperCase();
}

export default function UsuariosList({ onNuevo, onEditar, onModulos, onReset }: Props) {
  const { items, total, pagina, totalPaginas, cargando, error, cargar, eliminar, setPagina } = useUsers();
  const [msg, setMsg] = useState<{ texto: string; tipo: "ok" | "error" } | null>(null);

  useEffect(() => { cargar(); }, [cargar]);

  async function handleEliminar(u: UsuarioAdmin) {
    if (!window.confirm(`¿Eliminar al usuario "${u.nombre}"? Esta acción no se puede deshacer.`)) return;
    try {
      await eliminar(u.id);
      setMsg({ texto: "Usuario eliminado correctamente.", tipo: "ok" });
    } catch (err) {
      setMsg({ texto: (err as Error).message, tipo: "error" });
    }
  }

  return (
    <div className="contenido">
      <div className="seccion-head">
        <div>
          <h2>Usuarios</h2>
          <p className="seccion-sub">{total} usuarios registrados</p>
        </div>
        <button type="button" className="boton boton--sm" onClick={onNuevo}>+ Nuevo usuario</button>
      </div>

      {msg && <Aviso msg={msg.texto} tipo={msg.tipo} onClose={() => setMsg(null)} />}
      {error && <p className="aviso aviso--error">{error}</p>}

      {cargando ? (
        <p style={{ color: "#6b7280" }}>Cargando usuarios…</p>
      ) : items.length === 0 ? (
        <p style={{ color: "#6b7280" }}>No hay usuarios registrados. Crea el primero.</p>
      ) : (
        <div className="usuarios-grid">
          {items.map((u) => (
            <article key={u.id} className="usuario-card">
              <div className="usuario-card__avatar">{inicialNombre(u.nombre)}</div>
              <p className="usuario-card__nombre">{u.nombre}</p>
              <p className="usuario-card__email">{u.email}</p>
              <div className="usuario-card__chips">
                <span className={"chip chip--" + (u.es_superadmin ? "superadmin" : u.rol)}>
                  {u.es_superadmin ? "superadmin" : u.rol}
                </span>
                <span className={"chip chip--" + (u.activo ? "activo" : "inactivo")}>
                  {u.activo ? "activo" : "inactivo"}
                </span>
                {(u.modulos ?? []).map((m) => (
                  <span key={m} className="chip chip--modulo">{MODULOS[m]?.label ?? m}</span>
                ))}
                {(u.modulos ?? []).length === 0 && (
                  <span style={{ fontSize: "0.75rem", color: "#9ca3af" }}>sin módulos</span>
                )}
              </div>
              <div className="usuario-card__acciones">
                <button type="button" className="boton boton--sm" onClick={() => onEditar(u.id)}>
                  Editar datos
                </button>
                <button type="button" className="boton boton--sm boton--secundario" onClick={() => onModulos(u.id)}>
                  Módulos
                </button>
                <button type="button" className="enlace enlace--advertencia" onClick={() => onReset(u.id)}>
                  Reset pwd
                </button>
                <button type="button" className="enlace enlace--peligro" onClick={() => handleEliminar(u)}>
                  Eliminar
                </button>
              </div>
            </article>
          ))}
        </div>
      )}

      {totalPaginas > 1 && (
        <div style={{ display: "flex", gap: "0.5rem", justifyContent: "center", marginTop: "1.5rem" }}>
          {Array.from({ length: totalPaginas }, (_, i) => i + 1).map((p) => (
            <button key={p} type="button" onClick={() => setPagina(p)}
              style={{ width: "2rem", height: "2rem", borderRadius: "50%", border: "none", cursor: "pointer",
                background: p === pagina ? "var(--verde)" : "#fff", color: p === pagina ? "#fff" : "#374151",
                boxShadow: "0 1px 3px rgba(0,0,0,0.1)" }}>
              {p}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
