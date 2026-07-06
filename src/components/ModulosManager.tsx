"use client";

import { useEffect, useState } from "react";
import { fetchUsuario, getModulos, setModulos } from "@/lib/api";
import type { Modulo } from "@/lib/types";
import { MODULOS } from "@/lib/types";

const TODOS = Object.keys(MODULOS) as Modulo[];

interface Props {
  usuarioId: number;
  onGuardado: () => void;
  onCancelar: () => void;
}

export default function ModulosManager({ usuarioId, onGuardado, onCancelar }: Props) {
  const [nombre, setNombre]         = useState("");
  const [seleccion, setSeleccion]   = useState<Modulo[]>([]);
  const [cargando, setCargando]     = useState(true);
  const [guardando, setGuardando]   = useState(false);
  const [msg, setMsg]               = useState<{ texto: string; tipo: "ok" | "error" } | null>(null);

  useEffect(() => {
    Promise.all([fetchUsuario(usuarioId), getModulos(usuarioId)])
      .then(([u, mods]) => { setNombre(u.nombre); setSeleccion(mods); })
      .catch((err) => setMsg({ texto: (err as Error).message, tipo: "error" }))
      .finally(() => setCargando(false));
  }, [usuarioId]);

  function toggle(m: Modulo) {
    setSeleccion((prev) =>
      prev.includes(m) ? prev.filter((x) => x !== m) : [...prev, m]
    );
  }

  async function handleGuardar() {
    setGuardando(true);
    setMsg(null);
    try {
      await setModulos(usuarioId, seleccion);
      setMsg({ texto: "Módulos actualizados correctamente.", tipo: "ok" });
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
          <h2>Módulos de acceso</h2>
          <p className="seccion-sub">Configura a qué módulos puede acceder <strong>{nombre}</strong>.</p>
        </div>
      </div>

      {msg && <div className={"aviso aviso--" + msg.tipo}>{msg.texto}</div>}

      <div className="form-card">
        <div className="modulos-check">
          {TODOS.map((m) => {
            const activo = seleccion.includes(m);
            const config = MODULOS[m];
            return (
              <label key={m} className={"modulo-item" + (activo ? " modulo-item--activo" : "")}
                onClick={() => toggle(m)}>
                <input type="checkbox" checked={activo} onChange={() => toggle(m)} />
                <span className="modulo-item__check">
                  {activo && (
                    <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth={3} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </span>
                <span className="modulo-item__info">
                  <span className="modulo-item__label">{config.label}</span>
                  <span className="modulo-item__desc">{config.descripcion}</span>
                </span>
              </label>
            );
          })}
        </div>

        <p style={{ fontSize: "0.82rem", color: "#6b7280", margin: "0 0 1.5rem" }}>
          {seleccion.length === 0 ? "Sin acceso a ningún módulo." : `Acceso a ${seleccion.length} módulo(s).`}
        </p>

        <div className="form-actions">
          <button type="button" className="boton" onClick={handleGuardar} disabled={guardando}>
            {guardando ? "Guardando…" : "Guardar módulos"}
          </button>
          <button type="button" className="boton boton--secundario" onClick={onCancelar} disabled={guardando}>
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
}
