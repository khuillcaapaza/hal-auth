"use client";

import { useEffect, useState } from "react";
import { useUsers } from "@/hooks/useUsers";
import type { Modulo, UsuarioAdmin, UsuarioInput } from "@/lib/types";
import { MODULOS } from "@/lib/types";

const TODOS_MODULOS = Object.keys(MODULOS) as Modulo[];

interface Props {
  onVolver: () => void;
}

export default function UsersPanel({ onVolver }: Props) {
  const {
    items, total, pagina, totalPaginas, cargando, error,
    cargar, crear, actualizar, eliminar, reiniciarPassword, asignarModulos, setPagina,
  } = useUsers();

  const [vista, setVista] = useState<"lista" | "nuevo" | "editar">("lista");
  const [editando, setEditando] = useState<UsuarioAdmin | null>(null);
  const [msg, setMsg] = useState<string | null>(null);

  useEffect(() => { cargar(); }, [cargar]);

  async function handleCrear(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const modulos = TODOS_MODULOS.filter((m) => form.get(`modulo_${m}`) === "on");
    const input: UsuarioInput = {
      usuario:  String(form.get("usuario")),
      email:    String(form.get("email")),
      nombre:   String(form.get("nombre")),
      password: String(form.get("password")),
      rol:      form.get("rol") === "admin" ? "admin" : "usuario",
      modulos,
    };
    try {
      await crear(input);
      setMsg("Usuario creado correctamente.");
      setVista("lista");
    } catch (err) {
      setMsg((err as Error).message);
    }
  }

  async function handleResetPassword(id: number) {
    const password = window.prompt("Nueva contraseña (mínimo 8 caracteres):");
    if (!password || password.length < 8) return;
    try {
      await reiniciarPassword(id, password);
      setMsg("Contraseña reseteada correctamente.");
    } catch (err) {
      setMsg((err as Error).message);
    }
  }

  async function handleEliminar(u: UsuarioAdmin) {
    if (!window.confirm(`¿Eliminar al usuario "${u.nombre}"? Esta acción no se puede deshacer.`)) return;
    try {
      await eliminar(u.id);
      setMsg("Usuario eliminado.");
    } catch (err) {
      setMsg((err as Error).message);
    }
  }

  async function handleModulos(u: UsuarioAdmin) {
    const actuales = u.modulos ?? [];
    const nuevos = TODOS_MODULOS.filter((m) => {
      const tiene = actuales.includes(m);
      return window.confirm(`¿Dar acceso a ${MODULOS[m].label}?`) !== tiene
        ? !tiene
        : tiene;
    });
    // Simplificado: en producción usar un modal/checkbox
    await asignarModulos(u.id, nuevos);
    setMsg("Módulos actualizados.");
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-green-800 text-white px-6 py-4 flex items-center gap-4">
        <button type="button" onClick={onVolver} className="text-green-200 hover:text-white text-sm">
          ← Volver al dashboard
        </button>
        <h1 className="text-lg font-bold">Gestión de usuarios</h1>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-8">
        {msg && (
          <div className="mb-4 p-3 bg-green-50 border border-green-200 text-green-800 rounded-lg text-sm flex justify-between">
            {msg}
            <button type="button" onClick={() => setMsg(null)} className="text-green-600 font-bold">×</button>
          </div>
        )}
        {error && <p className="mb-4 text-red-600 text-sm">{error}</p>}

        {vista === "lista" && (
          <>
            <div className="flex justify-between items-center mb-6">
              <p className="text-gray-600 text-sm">{total} usuarios registrados</p>
              <button
                type="button"
                onClick={() => setVista("nuevo")}
                className="bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-green-800"
              >
                + Nuevo usuario
              </button>
            </div>

            {cargando ? (
              <p className="text-gray-500">Cargando…</p>
            ) : (
              <div className="bg-white rounded-xl shadow overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 text-gray-600 uppercase text-xs">
                    <tr>
                      <th className="text-left px-4 py-3">Nombre</th>
                      <th className="text-left px-4 py-3">Email</th>
                      <th className="text-left px-4 py-3">Rol</th>
                      <th className="text-left px-4 py-3">Módulos</th>
                      <th className="text-left px-4 py-3">Estado</th>
                      <th className="px-4 py-3"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {items.map((u) => (
                      <tr key={u.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3 font-medium text-gray-900">{u.nombre}</td>
                        <td className="px-4 py-3 text-gray-500">{u.email}</td>
                        <td className="px-4 py-3">
                          <span className={`text-xs px-2 py-0.5 rounded-full ${u.rol === "admin" ? "bg-purple-100 text-purple-700" : "bg-gray-100 text-gray-600"}`}>
                            {u.es_superadmin ? "superadmin" : u.rol}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex gap-1 flex-wrap">
                            {(u.modulos ?? []).map((m) => (
                              <span key={m} className="text-xs bg-green-50 text-green-700 px-1.5 py-0.5 rounded">
                                {m}
                              </span>
                            ))}
                            {(u.modulos ?? []).length === 0 && (
                              <span className="text-xs text-gray-400">sin acceso</span>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`text-xs px-2 py-0.5 rounded-full ${u.activo ? "bg-green-100 text-green-700" : "bg-red-100 text-red-600"}`}>
                            {u.activo ? "activo" : "inactivo"}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex gap-2 justify-end">
                            <button type="button" onClick={() => handleResetPassword(u.id)}
                              className="text-xs text-amber-600 hover:underline">Reset pwd</button>
                            <button type="button" onClick={() => handleEliminar(u)}
                              className="text-xs text-red-500 hover:underline">Eliminar</button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {totalPaginas > 1 && (
              <div className="flex gap-2 mt-4 justify-center">
                {Array.from({ length: totalPaginas }, (_, i) => i + 1).map((p) => (
                  <button key={p} type="button" onClick={() => setPagina(p)}
                    className={`w-8 h-8 rounded-full text-sm ${p === pagina ? "bg-green-700 text-white" : "bg-white text-gray-600 hover:bg-gray-100"}`}>
                    {p}
                  </button>
                ))}
              </div>
            )}
          </>
        )}

        {vista === "nuevo" && (
          <form onSubmit={handleCrear} className="bg-white rounded-xl shadow p-6 max-w-lg">
            <h2 className="text-lg font-bold text-gray-900 mb-6">Nuevo usuario</h2>
            <div className="space-y-4">
              {[
                { name: "usuario",  label: "Usuario",    type: "text",     ph: "ej: jperez" },
                { name: "nombre",   label: "Nombre completo", type: "text", ph: "Juan Pérez" },
                { name: "email",    label: "Email",      type: "email",    ph: "j.perez@hospital.gob.pe" },
                { name: "password", label: "Contraseña (mín. 8 chars)", type: "password", ph: "" },
              ].map(({ name, label, type, ph }) => (
                <div key={name}>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
                  <input name={name} type={type} required placeholder={ph}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
                </div>
              ))}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Rol</label>
                <select name="rol" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm">
                  <option value="usuario">Usuario</option>
                  <option value="admin">Administrador</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Módulos con acceso</label>
                <div className="space-y-2">
                  {TODOS_MODULOS.map((m) => (
                    <label key={m} className="flex items-center gap-2 text-sm cursor-pointer">
                      <input type="checkbox" name={`modulo_${m}`} className="rounded text-green-600" />
                      <span className="font-medium">{MODULOS[m].label}</span>
                      <span className="text-gray-400 text-xs">— {MODULOS[m].descripcion}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button type="submit" className="flex-1 bg-green-700 text-white py-2 rounded-lg font-semibold hover:bg-green-800">
                Crear usuario
              </button>
              <button type="button" onClick={() => setVista("lista")}
                className="flex-1 bg-gray-100 text-gray-700 py-2 rounded-lg font-semibold hover:bg-gray-200">
                Cancelar
              </button>
            </div>
          </form>
        )}
      </main>
    </div>
  );
}
