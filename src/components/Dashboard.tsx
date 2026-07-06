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
    const config = MODULOS[modulo];
    // La cookie ya está establecida en .hospitalantoniolorena.gob.pe.
    // Simplemente abrimos el módulo en nueva pestaña — el navegador enviará
    // la cookie automáticamente y el módulo reconocerá la sesión.
    window.open(config.url, "_blank", "noopener");
  }

  const esAdmin = usuario.rol === "admin" || usuario.es_superadmin;
  const modulosAccesibles = usuario.modulos;
  const modulosTodos = Object.keys(MODULOS) as Modulo[];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Topbar */}
      <header className="bg-green-800 text-white px-6 py-4 flex items-center justify-between shadow-md">
        <div>
          <h1 className="text-lg font-bold">Sistema HAL</h1>
          <p className="text-green-200 text-xs">Hospital Antonio Lorena del Cusco</p>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm">
            Hola, <strong>{usuario.nombre || usuario.usuario}</strong>
          </span>
          {esAdmin && (
            <button
              type="button"
              onClick={onAdmin}
              className="text-xs bg-green-700 hover:bg-green-600 border border-green-500 px-3 py-1.5 rounded-lg transition-colors"
            >
              Gestión de usuarios
            </button>
          )}
          <button
            type="button"
            onClick={onLogout}
            className="text-xs bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded-lg transition-colors"
          >
            Cerrar sesión
          </button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Módulos disponibles</h2>
        <p className="text-gray-500 mb-8">
          Selecciona el módulo al que deseas acceder. Se abrirá en una nueva pestaña con tu sesión activa.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {modulosTodos.map((modulo) => {
            const config  = MODULOS[modulo];
            const acceso  = modulosAccesibles.includes(modulo);
            return (
              <button
                key={modulo}
                type="button"
                onClick={() => acceso && abrirModulo(modulo)}
                disabled={!acceso}
                className={[
                  "group relative rounded-2xl p-6 text-left transition-all duration-200",
                  acceso
                    ? "bg-white shadow-md hover:shadow-lg hover:-translate-y-1 cursor-pointer"
                    : "bg-gray-100 opacity-50 cursor-not-allowed",
                ].join(" ")}
              >
                {acceso && (
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${config.color} mb-4 flex items-center justify-center`}>
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                  </div>
                )}
                {!acceso && (
                  <div className="w-12 h-12 rounded-xl bg-gray-300 mb-4 flex items-center justify-center">
                    <svg className="w-6 h-6 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </div>
                )}
                <h3 className="font-bold text-gray-900 mb-1">{config.label}</h3>
                <p className="text-sm text-gray-500">{config.descripcion}</p>
                {acceso && (
                  <span className="absolute top-4 right-4 text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
                    Acceso
                  </span>
                )}
                {!acceso && (
                  <span className="absolute top-4 right-4 text-xs bg-gray-200 text-gray-500 px-2 py-0.5 rounded-full">
                    Sin acceso
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </main>
    </div>
  );
}
