"use client";

import React, { useState, useEffect } from "react";
import { db, Servicio, Cita, EstadoCita, Perfil } from "@/lib/supabase";
import {
  Calendar,
  Check,
  X,
  Phone,
  Clock,
  DollarSign,
  Scissors,
  Plus,
  Trash2,
  RefreshCw,
  TrendingUp,
} from "lucide-react";

interface BarberViewProps {
  onMutationTrigger: () => void;
  mutationKey: number;
}

export default function BarberView({ onMutationTrigger, mutationKey }: BarberViewProps) {
  const [citas, setCitas] = useState<Cita[]>([]);
  const [servicios, setServicios] = useState<Servicio[]>([]);
  const [loading, setLoading] = useState(true);
  const [citasLoadingMap, setCitasLoadingMap] = useState<Record<string, boolean>>({});
  const [perfil, setPerfil] = useState<Perfil | null>(null);

  // Estados para Edición de Servicios
  const [editingServicioId, setEditingServicioId] = useState<string | null>(null);
  const [editNombre, setEditNombre] = useState("");
  const [editPrecio, setEditPrecio] = useState(0);
  const [editDuracion, setEditDuracion] = useState(30);
  const [editDescripcion, setEditDescripcion] = useState("");

  // Estado para Crear Nuevo Servicio
  const [showAddForm, setShowAddForm] = useState(false);
  const [newNombre, setNewNombre] = useState("");
  const [newPrecio, setNewPrecio] = useState("");
  const [newDuracion, setNewDuracion] = useState("30");
  const [newDescripcion, setNewDescripcion] = useState("");

  const cargarDatos = async () => {
    setLoading(true);
    try {
      const perfilDemo = await db.getPerfilActual("barbero");
      setPerfil(perfilDemo);
      const dataCitas = await db.getCitas("barbero", perfilDemo.id);
      const dataServicios = await db.getServicios();
      setCitas(dataCitas);
      setServicios(dataServicios);
    } catch (error) {
      console.error("Error cargando panel de barbero:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarDatos();
  }, [mutationKey]);

  // Cambiar estado de cita (Aceptar/Rechazar)
  const handleCambiarEstado = async (citaId: string, nuevoEstado: EstadoCita) => {
    setCitasLoadingMap((prev) => ({ ...prev, [citaId]: true }));
    try {
      await db.actualizarEstadoCita(citaId, nuevoEstado);
      // Disparar refresh global
      onMutationTrigger();
    } catch (error) {
      console.error("Error al actualizar cita:", error);
    } finally {
      setCitasLoadingMap((prev) => ({ ...prev, [citaId]: false }));
    }
  };

  // Guardar Edición de Servicio
  const handleGuardarServicio = async (servicioId: string) => {
    if (!editNombre || editPrecio <= 0) return;

    const nuevosServicios = servicios.map((s) => {
      if (s.id === servicioId) {
        return {
          ...s,
          nombre: editNombre,
          precio: Number(editPrecio),
          duracion_estimada: Number(editDuracion),
          descripcion: editDescripcion,
        };
      }
      return s;
    });

    try {
      await db.guardarServicios(nuevosServicios);
      setEditingServicioId(null);
      onMutationTrigger();
    } catch (error) {
      console.error("Error guardando servicios:", error);
    }
  };

  // Crear Nuevo Servicio
  const handleCrearServicio = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNombre || !newPrecio) return;

    const nuevo: Servicio = {
      id: "mock-" + Math.random().toString(36).substr(2, 9),
      nombre: newNombre,
      precio: parseFloat(newPrecio),
      duracion_estimada: parseInt(newDuracion),
      descripcion: newDescripcion,
    };

    const nuevosServicios = [...servicios, nuevo];

    try {
      await db.guardarServicios(nuevosServicios);
      setShowAddForm(false);
      // Limpiar campos
      setNewNombre("");
      setNewPrecio("");
      setNewDuracion("30");
      setNewDescripcion("");
      onMutationTrigger();
    } catch (error) {
      console.error("Error creando servicio:", error);
    }
  };

  // Eliminar Servicio
  const handleEliminarServicio = async (servicioId: string) => {
    const confirmacion = confirm("¿Estás seguro de que deseas eliminar este servicio del catálogo?");
    if (!confirmacion) return;

    const nuevosServicios = servicios.filter((s) => s.id !== servicioId);
    try {
      await db.guardarServicios(nuevosServicios);
      onMutationTrigger();
    } catch (error) {
      console.error("Error eliminando servicio:", error);
    }
  };

  // Iniciar edición de servicio
  const startEdit = (s: Servicio) => {
    setEditingServicioId(s.id);
    setEditNombre(s.nombre);
    setEditPrecio(Number(s.precio));
    setEditDuracion(s.duracion_estimada);
    setEditDescripcion(s.descripcion);
  };

  // Formatear fecha y hora para mostrar
  const formatearFechaHora = (fechaHoraStr: string) => {
    try {
      const fecha = new Date(fechaHoraStr);
      return fecha.toLocaleDateString("es-ES", {
        weekday: "short",
        day: "numeric",
        month: "short",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return fechaHoraStr;
    }
  };

  // Contadores métricos
  const totalCitas = citas.length;
  const pendientes = citas.filter((c) => c.estado === "pendiente").length;
  const aceptadas = citas.filter((c) => c.estado === "aceptada").length;
  const ingresosEstimados = citas
    .filter((c) => c.estado === "aceptada")
    .reduce((acc, curr) => acc + Number(curr.servicio_precio || 0), 0);

  return (
    <div className="flex flex-col gap-8 w-full max-w-md mx-auto px-4 pb-24 animate-fade-in">
      {/* Header Barbero */}
      <div className="flex justify-between items-center bg-dark-900/60 p-4 rounded-2xl border border-dark-800">
        <div>
          <p className="text-gold-400 text-xs tracking-wider uppercase font-semibold">Barbero Administrador</p>
          <h2 className="text-xl font-bold text-white font-outfit mt-0.5">{perfil?.nombre || "Cargando..."} 💈</h2>
        </div>
        <button
          onClick={cargarDatos}
          className="p-2.5 rounded-xl bg-dark-800 text-zinc-400 hover:text-gold-400 border border-dark-700 transition"
          aria-label="Actualizar citas"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin text-gold-400" : ""}`} />
        </button>
      </div>

      {/* Tarjetas de Métricas Rápidas */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-dark-900/40 border border-dark-800 rounded-xl p-3 flex flex-col gap-1 items-center justify-center text-center">
          <span className="text-zinc-500 text-[9px] font-extrabold uppercase tracking-wide">Pendientes</span>
          <span className="text-xl font-black text-amber-400 font-outfit">{pendientes}</span>
        </div>
        <div className="bg-dark-900/40 border border-dark-800 rounded-xl p-3 flex flex-col gap-1 items-center justify-center text-center">
          <span className="text-zinc-500 text-[9px] font-extrabold uppercase tracking-wide">Aceptadas</span>
          <span className="text-xl font-black text-emerald-400 font-outfit">{aceptadas}</span>
        </div>
        <div className="bg-dark-900/40 border border-dark-800 rounded-xl p-3 flex flex-col gap-1 items-center justify-center text-center">
          <span className="text-zinc-500 text-[9px] font-extrabold uppercase tracking-wide">Caja Hoy</span>
          <span className="text-lg font-black text-gold-400 font-outfit">${ingresosEstimados.toFixed(0)}</span>
        </div>
      </div>

      {/* 1. DASHBOARD DE CITAS SOLICITADAS */}
      <section className="flex flex-col gap-4">
        <h3 className="text-lg font-bold text-white tracking-wide font-cinzel flex items-center gap-2">
          <Calendar className="w-5 h-5 text-gold-400" />
          Solicitudes de Citas
        </h3>

        <div className="flex flex-col gap-3.5">
          {loading && citas.length === 0 ? (
            <div className="py-8 text-center text-zinc-500">Cargando solicitudes...</div>
          ) : citas.length === 0 ? (
            <div className="border border-dashed border-dark-850 p-8 rounded-2xl text-center text-zinc-500 text-xs">
              No tienes solicitudes de turnos registradas.
            </div>
          ) : (
            citas.map((c) => (
              <div
                key={c.id}
                className="glass-panel p-4.5 rounded-2xl flex flex-col gap-3.5 relative overflow-hidden"
              >
                {/* Indicador del estado en el lateral */}
                <div className={`absolute left-0 top-0 bottom-0 w-1 ${
                  c.estado === "pendiente"
                    ? "bg-amber-500"
                    : c.estado === "aceptada"
                    ? "bg-emerald-500"
                    : "bg-rose-500"
                }`}></div>

                {/* Encabezado Cita */}
                <div className="flex justify-between items-start gap-4">
                  <div className="flex flex-col gap-0.5">
                    <span className="text-xs text-zinc-400 font-extrabold uppercase tracking-wider">
                      Cita de: {c.cliente_nombre}
                    </span>
                    <h4 className="font-bold text-white font-outfit text-sm">
                      {c.servicio_nombre}
                    </h4>
                  </div>
                  <span className="text-sm font-extrabold text-gold-400 font-outfit">
                    ${c.servicio_precio ? Number(c.servicio_precio).toFixed(2) : "0.00"}
                  </span>
                </div>

                {/* Detalles del Cliente y Tiempo */}
                <div className="flex flex-col gap-1.5 text-xs text-zinc-400 border-t border-b border-dark-800/80 py-2.5">
                  <div className="flex items-center gap-2">
                    <Clock className="w-3.5 h-3.5 text-gold-400 shrink-0" />
                    <span>{formatearFechaHora(c.fecha_hora)} hs</span>
                  </div>
                  
                  {c.cliente_telefono && (
                    <a
                      href={`tel:${c.cliente_telefono}`}
                      className="flex items-center gap-2 hover:text-gold-400 transition"
                    >
                      <Phone className="w-3.5 h-3.5 text-gold-400 shrink-0" />
                      <span>Contacto: {c.cliente_telefono}</span>
                    </a>
                  )}
                </div>

                {/* Acciones Rápidas (Un solo click) */}
                <div className="flex justify-between items-center gap-3">
                  <div className="text-[10px] font-bold text-zinc-500">
                    ID: {c.id.substring(0, 8)}...
                  </div>

                  {c.estado === "pendiente" ? (
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleCambiarEstado(c.id, "rechazada")}
                        disabled={citasLoadingMap[c.id]}
                        className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold bg-rose-500/10 text-rose-400 border border-rose-500/30 hover:bg-rose-500/20 active:scale-95 transition cursor-pointer"
                      >
                        <X className="w-3.5 h-3.5 shrink-0" />
                        Rechazar
                      </button>
                      <button
                        onClick={() => handleCambiarEstado(c.id, "aceptada")}
                        disabled={citasLoadingMap[c.id]}
                        className="flex items-center gap-1 px-3.5 py-1.5 rounded-lg text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/20 active:scale-95 transition cursor-pointer"
                      >
                        <Check className="w-3.5 h-3.5 shrink-0" />
                        Aceptar
                      </button>
                    </div>
                  ) : (
                    <span className={`text-xs font-bold px-2.5 py-1 rounded-md ${
                      c.estado === "aceptada"
                        ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/15"
                        : "bg-rose-500/10 text-rose-400 border border-rose-500/15"
                    }`}>
                      {c.estado === "aceptada" ? "Aceptado" : "Rechazado"}
                    </span>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </section>

      {/* 2. GESTIÓN DE SERVICIOS Y PRECIOS */}
      <section className="flex flex-col gap-4">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-bold text-white tracking-wide font-cinzel flex items-center gap-2">
            <Scissors className="w-5 h-5 text-gold-400" />
            Catálogo & Precios
          </h3>
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gold-500 hover:bg-gold-600 text-black font-extrabold text-[11px] uppercase tracking-wider transition active:scale-95 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5 shrink-0" />
            Añadir
          </button>
        </div>

        {/* Formulario de Agregar Servicio */}
        {showAddForm && (
          <form onSubmit={handleCrearServicio} className="glass-panel p-4.5 rounded-xl flex flex-col gap-4.5 border-dashed border-gold-500/40 animate-fade-in">
            <div className="flex items-center justify-between border-b border-dark-850 pb-2">
              <span className="text-xs font-bold text-gold-400 font-outfit uppercase">Nuevo Servicio</span>
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="text-zinc-500 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-extrabold tracking-wider uppercase text-zinc-500">Nombre del Servicio</label>
              <input
                type="text"
                required
                value={newNombre}
                onChange={(e) => setNewNombre(e.target.value)}
                placeholder="Ej. Corte Clásico"
                className="w-full bg-dark-900 border border-dark-800 focus:border-gold-500/80 rounded-lg p-2.5 text-xs text-white outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-extrabold tracking-wider uppercase text-zinc-500">Precio ($)</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={newPrecio}
                  onChange={(e) => setNewPrecio(e.target.value)}
                  placeholder="12.00"
                  className="w-full bg-dark-900 border border-dark-800 focus:border-gold-500/80 rounded-lg p-2.5 text-xs text-white outline-none"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-extrabold tracking-wider uppercase text-zinc-500">Duración (min)</label>
                <input
                  type="number"
                  required
                  value={newDuracion}
                  onChange={(e) => setNewDuracion(e.target.value)}
                  placeholder="30"
                  className="w-full bg-dark-900 border border-dark-800 focus:border-gold-500/80 rounded-lg p-2.5 text-xs text-white outline-none"
                />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-extrabold tracking-wider uppercase text-zinc-500">Descripción</label>
              <textarea
                value={newDescripcion}
                onChange={(e) => setNewDescripcion(e.target.value)}
                placeholder="Breve descripción del servicio..."
                rows={2}
                className="w-full bg-dark-900 border border-dark-800 focus:border-gold-500/80 rounded-lg p-2.5 text-xs text-white outline-none resize-none"
              />
            </div>

            <button
              type="submit"
              className="w-full py-2.5 bg-gold-500 hover:bg-gold-600 text-black font-extrabold text-xs uppercase tracking-widest rounded-lg transition active:scale-98 cursor-pointer"
            >
              Guardar Nuevo Servicio
            </button>
          </form>
        )}

        {/* Lista de Servicios Editables */}
        <div className="flex flex-col gap-3">
          {servicios.map((s) => (
            <div
              key={s.id}
              className="glass-panel p-4 rounded-xl flex flex-col gap-3"
            >
              {editingServicioId === s.id ? (
                // Modo Edición
                <div className="flex flex-col gap-3.5">
                  <div className="flex flex-col gap-1">
                    <input
                      type="text"
                      value={editNombre}
                      onChange={(e) => setEditNombre(e.target.value)}
                      className="bg-dark-900 border border-dark-800 focus:border-gold-500/80 rounded-md p-1.5 text-xs text-white outline-none"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div className="flex items-center gap-1.5 bg-dark-900 border border-dark-800 rounded-md px-2 py-1">
                      <DollarSign className="w-3.5 h-3.5 text-gold-400 shrink-0" />
                      <input
                        type="number"
                        step="0.01"
                        value={editPrecio}
                        onChange={(e) => setEditPrecio(Number(e.target.value))}
                        className="bg-transparent text-xs text-white outline-none w-full"
                      />
                    </div>

                    <div className="flex items-center gap-1.5 bg-dark-900 border border-dark-800 rounded-md px-2 py-1">
                      <Clock className="w-3.5 h-3.5 text-gold-400 shrink-0" />
                      <input
                        type="number"
                        value={editDuracion}
                        onChange={(e) => setEditDuracion(Number(e.target.value))}
                        className="bg-transparent text-xs text-white outline-none w-full"
                      />
                      <span className="text-[10px] text-zinc-500">min</span>
                    </div>
                  </div>

                  <textarea
                    value={editDescripcion}
                    onChange={(e) => setEditDescripcion(e.target.value)}
                    rows={2}
                    className="w-full bg-dark-900 border border-dark-800 focus:border-gold-500/80 rounded-md p-2 text-xs text-white outline-none resize-none"
                  />

                  <div className="flex justify-end gap-2 border-t border-dark-800/80 pt-2.5">
                    <button
                      onClick={() => setEditingServicioId(null)}
                      className="px-3 py-1.5 text-xs font-bold text-zinc-400 bg-dark-850 rounded hover:bg-dark-800 active:scale-95 transition cursor-pointer"
                    >
                      Cancelar
                    </button>
                    <button
                      onClick={() => handleGuardarServicio(s.id)}
                      className="px-3.5 py-1.5 text-xs font-black text-black bg-gold-500 rounded hover:bg-gold-600 active:scale-95 transition cursor-pointer"
                    >
                      Guardar
                    </button>
                  </div>
                </div>
              ) : (
                // Modo Lectura
                <div className="flex justify-between items-start gap-4">
                  <div className="flex flex-col gap-1.5">
                    <h4 className="font-bold text-white text-[13px] font-outfit">
                      {s.nombre}
                    </h4>
                    <p className="text-zinc-500 text-xs line-clamp-2 leading-relaxed">
                      {s.descripcion}
                    </p>
                    <div className="flex items-center gap-2 text-[10px] text-zinc-400 font-bold">
                      <Clock className="w-3.5 h-3.5 text-zinc-500" />
                      <span>{s.duracion_estimada} min</span>
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-3.5 shrink-0">
                    <span className="text-sm font-black text-gold-400 font-outfit">
                      ${Number(s.precio).toFixed(2)}
                    </span>
                    <div className="flex gap-1.5">
                      <button
                        onClick={() => handleEliminarServicio(s.id)}
                        className="p-1.5 rounded bg-rose-500/10 text-rose-400 border border-rose-500/20 hover:bg-rose-500/20 transition active:scale-90 cursor-pointer"
                        title="Eliminar servicio"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => startEdit(s)}
                        className="px-2 py-1.5 rounded bg-dark-800 text-gold-400 border border-dark-700 hover:border-gold-500/30 text-[10px] font-bold tracking-wider uppercase transition active:scale-90 cursor-pointer"
                      >
                        Editar
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
