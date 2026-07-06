"use client";

import { useState, type FormEvent } from "react";
import type { LoginChallenge } from "@/lib/types";

interface Props {
  onLogin: (email: string, password: string) => Promise<void>;
  onVerify: (email: string, codigo: string) => Promise<void>;
  challenge: LoginChallenge | null;
  cargando: boolean;
  error: string | null;
}

type Paso = "credenciales" | "codigo";

export default function LoginView({ onLogin, onVerify, challenge, cargando, error }: Props) {
  const [paso, setPaso]         = useState<Paso>("credenciales");
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [codigo, setCodigo]     = useState(challenge?.dev_codigo ?? "");
  const [mensaje, setMensaje]   = useState<{ texto: string; tipo?: "error" | "ok" }>({ texto: "" });

  // Cuando llega el challenge, avanzar al paso código
  if (challenge && paso === "credenciales") {
    setPaso("codigo");
    setPassword("");
    setCodigo(challenge.dev_codigo ?? "");
    setMensaje({ texto: challenge.mensaje ?? "Te enviamos un código a tu correo.", tipo: "ok" });
  }

  // Propagar error externo
  if (error && mensaje.tipo !== "error") {
    setMensaje({ texto: error, tipo: "error" });
  }

  async function onSubmitCredenciales(e: FormEvent) {
    e.preventDefault();
    const correo = email.trim().toLowerCase();
    if (!correo || !password) {
      setMensaje({ texto: "Ingresa tu email y contraseña.", tipo: "error" });
      return;
    }
    setMensaje({ texto: "Verificando…" });
    try {
      await onLogin(correo, password);
    } catch (err) {
      setMensaje({ texto: (err as Error).message, tipo: "error" });
    }
  }

  async function onSubmitCodigo(e: FormEvent) {
    e.preventDefault();
    const cod = codigo.replace(/\D/g, "");
    if (cod.length !== 6) {
      setMensaje({ texto: "Ingresa el código de 6 dígitos.", tipo: "error" });
      return;
    }
    // Usar el email que devolvió el servidor en el challenge (más fiable que el estado local).
    const emailVerify = challenge?.email || email.trim().toLowerCase();
    setMensaje({ texto: "Validando código…" });
    try {
      await onVerify(emailVerify, cod);
    } catch (err) {
      setMensaje({ texto: (err as Error).message, tipo: "error" });
    }
  }

  function volver() {
    setPaso("credenciales");
    setCodigo("");
    setMensaje({ texto: "" });
  }

  return (
    <div className="shell--login">
      <main className="card">
        <h1 className="titulo">Sistema HAL</h1>
        <p className="subtitulo">Hospital Antonio Lorena del Cusco</p>

        {paso === "credenciales" ? (
          <form onSubmit={onSubmitCredenciales} autoComplete="off" noValidate>
            <label className="campo">
              <span>Correo institucional</span>
              <input
                type="email"
                name="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoFocus
                autoComplete="username"
                placeholder="usuario@hospital.gob.pe"
              />
            </label>
            <label className="campo">
              <span>Contraseña</span>
              <input
                type="password"
                name="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
              />
            </label>
            <button type="submit" className="boton" disabled={cargando}>
              {cargando ? "Verificando…" : "Ingresar"}
            </button>
            <p className={"mensaje" + (mensaje.tipo ? " mensaje--" + mensaje.tipo : "")} role="alert">
              {mensaje.texto}
            </p>
          </form>
        ) : (
          <form onSubmit={onSubmitCodigo} autoComplete="off" noValidate>
            <p className="subtitulo">
              Ingresa el código de 6 dígitos que enviamos a<br />
              <strong>{email.trim().toLowerCase()}</strong>
            </p>
            {challenge?.dev_codigo && (
              <p className="mensaje mensaje--ok" style={{ marginBottom: "0.75rem" }}>
                Dev · código: <strong>{challenge.dev_codigo}</strong>
              </p>
            )}
            <label className="campo">
              <span>Código de verificación</span>
              <input
                type="text"
                name="codigo"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={6}
                value={codigo}
                onChange={(e) => setCodigo(e.target.value.replace(/\D/g, ""))}
                required
                autoFocus
                autoComplete="one-time-code"
                style={{ textAlign: "center", letterSpacing: "0.3em", fontSize: "1.3rem" }}
              />
            </label>
            <button type="submit" className="boton" disabled={cargando || codigo.length !== 6}>
              {cargando ? "Validando…" : "Entrar"}
            </button>
            <button type="button" className="boton boton--secundario" onClick={volver} disabled={cargando}>
              Volver
            </button>
            <p className={"mensaje" + (mensaje.tipo ? " mensaje--" + mensaje.tipo : "")} role="alert">
              {mensaje.texto}
            </p>
          </form>
        )}
      </main>
    </div>
  );
}


