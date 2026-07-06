/**
 * Gestión de la cookie compartida en `.hospitalantoniolorena.gob.pe`.
 *
 * Al establecer el token aquí, el navegador lo enviará automáticamente a
 * todos los subdominios: citas., noticias., convocatorias., auth.
 * Esto permite SSO sin redirecciones adicionales.
 */

const COOKIE_NAME = "hal_token";
const COOKIE_DOMAIN =
  process.env.NEXT_PUBLIC_COOKIE_DOMAIN || ".hospitalantoniolorena.gob.pe";
const COOKIE_TTL = 28800; // 8 horas en segundos

/** Establece la cookie SSO en el dominio compartido. */
export function setAuthCookie(token: string): void {
  if (typeof document === "undefined") return;
  const secure = COOKIE_DOMAIN !== "localhost";
  const sameSite = secure ? "Lax" : "Lax";
  document.cookie = [
    `${COOKIE_NAME}=${encodeURIComponent(token)}`,
    `domain=${COOKIE_DOMAIN}`,
    `path=/`,
    `max-age=${COOKIE_TTL}`,
    sameSite ? `samesite=${sameSite}` : "",
    secure ? "secure" : "",
  ]
    .filter(Boolean)
    .join("; ");
}

/** Lee el token JWT de la cookie. Null si no existe. */
export function getAuthCookie(): string | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(
    new RegExp(`(?:^|;\\s*)${COOKIE_NAME}=([^;]+)`)
  );
  return match ? decodeURIComponent(match[1]) : null;
}

/** Elimina la cookie de todos los dominios posibles. */
export function clearAuthCookie(): void {
  if (typeof document === "undefined") return;
  const expired = `${COOKIE_NAME}=; domain=${COOKIE_DOMAIN}; path=/; max-age=0`;
  document.cookie = expired;
  // También intenta limpiar en localhost (desarrollo).
  document.cookie = `${COOKIE_NAME}=; domain=localhost; path=/; max-age=0`;
}

/** Decodifica el payload del JWT sin verificar la firma. Solo para lectura client-side. */
export function decodeJwtPayload(token: string): Record<string, unknown> | null {
  try {
    const [, payload] = token.split(".");
    const json = atob(payload.replace(/-/g, "+").replace(/_/g, "/"));
    return JSON.parse(json) as Record<string, unknown>;
  } catch {
    return null;
  }
}

/** Verifica si el token no ha expirado (comprueba el campo `exp`). */
export function isTokenValid(token: string): boolean {
  const payload = decodeJwtPayload(token);
  if (!payload || typeof payload.exp !== "number") return false;
  return payload.exp * 1000 > Date.now();
}
