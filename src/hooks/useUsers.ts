"use client";

import { useState, useCallback } from "react";
import {
  fetchUsuarios,
  crearUsuario,
  actualizarUsuario,
  eliminarUsuario,
  resetPassword,
  setModulos,
} from "@/lib/api";
import type { Modulo, UsuarioAdmin, UsuarioInput, UsuarioUpdateInput } from "@/lib/types";

export function useUsers() {
  const [items, setItems]       = useState<UsuarioAdmin[]>([]);
  const [total, setTotal]       = useState(0);
  const [pagina, setPagina]     = useState(1);
  const [totalPaginas, setTotalPaginas] = useState(1);
  const [cargando, setCargando] = useState(false);
  const [error, setError]       = useState<string | null>(null);

  const cargar = useCallback(async (page = 1) => {
    setCargando(true);
    setError(null);
    try {
      const res = await fetchUsuarios({ page, perPage: 20 });
      setItems(res.items);
      setTotal(res.total);
      setPagina(res.page);
      setTotalPaginas(res.totalPages);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setCargando(false);
    }
  }, []);

  const crear = useCallback(async (input: UsuarioInput) => {
    await crearUsuario(input);
    await cargar(pagina);
  }, [cargar, pagina]);

  const actualizar = useCallback(async (id: number, input: UsuarioUpdateInput) => {
    await actualizarUsuario(id, input);
    await cargar(pagina);
  }, [cargar, pagina]);

  const eliminar = useCallback(async (id: number) => {
    await eliminarUsuario(id);
    if (items.length === 1 && pagina > 1) {
      await cargar(pagina - 1);
    } else {
      await cargar(pagina);
    }
  }, [cargar, items.length, pagina]);

  const reiniciarPassword = useCallback(async (id: number, password: string) => {
    await resetPassword(id, password);
  }, []);

  const asignarModulos = useCallback(async (id: number, modulos: Modulo[]) => {
    await setModulos(id, modulos);
    await cargar(pagina);
  }, [cargar, pagina]);

  return {
    items, total, pagina, totalPaginas, cargando, error,
    cargar, crear, actualizar, eliminar, reiniciarPassword, asignarModulos,
    setPagina: (p: number) => cargar(p),
  };
}
