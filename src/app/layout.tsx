import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "HAL — Portal de acceso · Hospital Antonio Lorena",
  description: "Portal de autenticación unificado del Hospital Antonio Lorena del Cusco",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
