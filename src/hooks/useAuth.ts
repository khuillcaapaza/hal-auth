"use client";

import { useState, useEffect, useCallback } from "react";
import { login, verifyCode, fetchMe, clearToken, setToken, getToken } from "@/lib/api";
import { setAuthCookie, clearAuthCookie, isTokenValid, getAuthCookie } from "@/lib/cookie";
import type { LoginChallenge, Usuario } from "@/lib/types";

type AuthState =
  | { fase: "idle" }
  | { fase: "challenge"; challenge: LoginChallenge }
  | { fase: "authenticated"; usuario: Usuario; token: string }
  | { fase: "error"; mensaje: string };

export function useAuth() {
  const [state, setState] = useState<AuthState>({ fase: "idle" });
  const [cargando, setCargando] = useState(false);

  // Al montar: verificar si ya hay cookie/token válido
  useEffect(() => {
    const cookie = getAuthCookie();
    const session = getToken();
    const cookieValida = cookie && isTokenValid(cookie) ? cookie : null;
    const sessionValida = session && isTokenValid(session) ? session : null;
    const token = cookieValida ?? sessionValida;

    if (!token) {
      setState({ fase: "idle" });
      return;
    }

    // Sincroniza ambos almacenes para evitar falsos 401 al abrir pestañas nuevas.
    if (cookieValida && !sessionValida) {
      setToken(cookieValida);
    }
    if (sessionValida && !cookieValida) {
      setAuthCookie(sessionValida);
    }

    setCargando(true);
    fetchMe()
      .then((claims) => {
        // claims viene del JWT decodificado en el servidor
        setState({ fase: "authenticated", usuario: claims as unknown as Usuario, token });
      })
      .catch(() => {
        clearAuthCookie();
        clearToken();
        setState({ fase: "idle" });
      })
      .finally(() => setCargando(false));
  }, []);

  // Escuchar evento de logout (401 automático)
  useEffect(() => {
    const handler = () => {
      clearAuthCookie();
      setState({ fase: "idle" });
    };
    window.addEventListener("auth:logout", handler);
    return () => window.removeEventListener("auth:logout", handler);
  }, []);

  const iniciarLogin = useCallback(async (email: string, password: string) => {
    setCargando(true);
    setState({ fase: "idle" });
    try {
      const challenge = await login(email, password);
      setState({ fase: "challenge", challenge });
    } catch (err) {
      setState({ fase: "error", mensaje: (err as Error).message });
    } finally {
      setCargando(false);
    }
  }, []);

  const verificarCodigo = useCallback(async (email: string, codigo: string) => {
    setCargando(true);
    try {
      const { token, usuario } = await verifyCode(email, codigo);
      // Guardar en sesión del portal
      setToken(token);
      // Establecer cookie compartida cross-subdomain (SSO)
      setAuthCookie(token);
      setState({ fase: "authenticated", usuario, token });
    } catch (err) {
      setState({ fase: "error", mensaje: (err as Error).message });
    } finally {
      setCargando(false);
    }
  }, []);

  const cerrarSesion = useCallback(() => {
    clearToken();
    clearAuthCookie();
    setState({ fase: "idle" });
  }, []);

  const limpiarError = useCallback(() => {
    setState({ fase: "idle" });
  }, []);

  return {
    state,
    cargando,
    iniciarLogin,
    verificarCodigo,
    cerrarSesion,
    limpiarError,
    estaAutenticado: state.fase === "authenticated",
    usuario: state.fase === "authenticated" ? state.usuario : null,
    token: state.fase === "authenticated" ? state.token : null,
  };
}
