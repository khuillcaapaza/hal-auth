"use client";

import type { Modulo, Usuario } from "@/lib/types";
import { MODULOS } from "@/lib/types";

interface Props {
  usuario: Usuario;
  onLogout: () => void;
  onAdmin: () => void;
}

export default function Dashboard({ usuario, onLogout, onAdmin }: Props) {
  function abrirModulo(modulo: Modulo) {
    window.open(MODULOS[modulo].url, "_blank", "noopener");
  }

  const esAdmin = usuario.rol === "admin" || usuario.es_superadmin;

  return (
    <div className="contenido">
      <div className="seccion-head">
        <div>
          <h2>Módulos disponibles</h2>
          <p className="seccion-sub">
            Selecciona el módulo al que deseas acceder. Se abrirá en una nueva pestaña con tu sesión activa.
          </p>
        </div>
      </div>

      <div className="modulos-grid">
        {(Object.keys(MODULOS) as Modulo[]).map((modulo) => {
          const config = MODULOS[modulo];
          const acceso = usuario.modulos.includes(modulo);
          return (
            <button
              key={modulo}
              type="button"
              onClick={() => acceso && abrirModulo(modulo)}
              disabled={!acceso}
              className={"modulo-card" + (!acceso ? " modulo-card--bloqueado" : "")}
            >
              <div className={"modulo-card__icono" + (!acceso ? " modulo-card__icono--bloqueado" : "")}>
                <svg width="24" height="24" fill="none" stroke="#fff" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round"
                    d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <h3>{config.label}</h3>
              <p>{config.descripcion}</p>
              <span className={"modulo-card__badge" + (acceso ? " modulo-card__badge--acceso" : " modulo-card__badge--bloqueado")}>
                {acceso ? "Acceso" : "Sin acceso"}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
