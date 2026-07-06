"use client";

import { useState } from "react";
import type { LoginChallenge, Mensaje } from "@/lib/types";

interface Props {
  onLogin: (email: string, password: string) => Promise<void>;
  onVerify: (email: string, codigo: string) => Promise<void>;
  challenge: LoginChallenge | null;
  cargando: boolean;
  error: string | null;
}

export default function LoginView({ onLogin, onVerify, challenge, cargando, error }: Props) {
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [codigo, setCodigo]     = useState(challenge?.dev_codigo ?? "");

  // Autocompletar código en modo dev
  if (challenge?.dev_codigo && codigo === "" ) {
    setCodigo(challenge.dev_codigo);
  }

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    await onLogin(email.trim(), password);
  }

  async function handleVerify(e: React.FormEvent) {
    e.preventDefault();
    if (!challenge) return;
    await onVerify(challenge.email, codigo.trim());
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-8">
        {/* Logo / Cabecera */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-green-700 rounded-full mx-auto mb-4 flex items-center justify-center">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Sistema HAL</h1>
          <p className="text-gray-500 text-sm mt-1">Hospital Antonio Lorena del Cusco</p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
            {error}
          </div>
        )}

        {!challenge ? (
          // Paso 1: Email + Contraseña
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Correo institucional</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="usuario@hospital.gob.pe"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Contraseña</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
            <button
              type="submit"
              disabled={cargando}
              className="w-full bg-green-700 text-white py-2.5 rounded-lg font-semibold hover:bg-green-800 disabled:opacity-50 transition-colors"
            >
              {cargando ? "Verificando…" : "Ingresar"}
            </button>
          </form>
        ) : (
          // Paso 2: Código 2FA
          <form onSubmit={handleVerify} className="space-y-4">
            <div className="text-center text-sm text-gray-600 mb-4">
              <p>{challenge.mensaje}</p>
              <p className="font-medium mt-1">{challenge.email}</p>
              {challenge.dev_codigo && (
                <p className="mt-2 text-xs bg-yellow-50 border border-yellow-200 rounded px-2 py-1 text-yellow-800">
                  Dev · código: <strong>{challenge.dev_codigo}</strong>
                </p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Código de verificación
              </label>
              <input
                type="text"
                inputMode="numeric"
                pattern="[0-9]{6}"
                maxLength={6}
                value={codigo}
                onChange={(e) => setCodigo(e.target.value.replace(/\D/g, ""))}
                required
                autoFocus
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-center tracking-widest text-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="000000"
              />
            </div>
            <button
              type="submit"
              disabled={cargando || codigo.length !== 6}
              className="w-full bg-green-700 text-white py-2.5 rounded-lg font-semibold hover:bg-green-800 disabled:opacity-50 transition-colors"
            >
              {cargando ? "Verificando…" : "Confirmar acceso"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
