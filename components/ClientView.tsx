"use client";

import React, { useState, useEffect } from "react";
import { db, Servicio, Perfil, Cita, EstadoCita } from "@/lib/supabase";
import {
  Scissors,
  Clock,
  User,
  Calendar as CalendarIcon,
  CheckCircle,
  AlertCircle,
  HelpCircle,
  Plus,
  RefreshCw,
} from "lucide-react";

interface ClientViewProps {
  onMutationTrigger: () => void;
  mutationKey: number;
}

export default function ClientView({ onMutationTrigger, mutationKey }: ClientViewProps) {
  // Estados
  const [servicios, setServicios] = useState<Servicio[]>([]);
  const [barberos, setBarberos] = useState<Perfil[]>([]);
  const [citas, setCitas] = useState<Cita[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [perfil, setPerfil] = useState<Perfil | null>(null);

  // Estado del Formulario de Agendamiento
  const [selectedServicio, setSelectedServicio] = useState<Servicio | null>(null);
  const [selectedBarbero, setSelectedBarbero] = useState<Perfil | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [selectedTime, setSelectedTime] = useState<string>("");

  // Generar siguientes 6 días para reservar
  const [fechasDisponibles, setFechasDisponibles] = useState<{ label: string; value: string; diaSemana: string }[]>([]);
  const horasDisponibles = [
    "09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00", "17:00", "18:00", "19:00"
  ];

  // Cargar información inicial
  const cargarDatos = async () => {
    setLoading(true);
    setErrorMsg("");
    try {
      const dataServicios = await db.getServicios();
      const dataBarberos = await db.getBarberos();
      const perfilDemo = await db.getPerfilActual("cliente");
      setPerfil(perfilDemo);
      const dataCitas = await db.getCitas("cliente", perfilDemo.id);

      setServicios(dataServicios);
      setBarberos(dataBarberos);
      setCitas(dataCitas);

      // Auto-seleccionar barbero por defecto
      if (dataBarberos.length > 0 && !selectedBarbero) {
        setSelectedBarbero(dataBarberos[0]);
      }
    } catch (err: any) {
      setErrorMsg("Ocurrió un error al cargar la información.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarDatos();
  }, [mutationKey]);

  useEffect(() => {
    // Generar días disponibles
    const dias = [];
    const opciones: Intl.DateTimeFormatOptions = { weekday: "short", day: "numeric", month: "short" };
    const diasSemana = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];
    
    for (let i = 0; i < 7; i++) {
      const d = new Date();
      d.setDate(d.getDate() + i);
      
      // Saltarse domingos
      if (d.getDay() === 0) continue;

      const formatted = d.toLocaleDateString("es-ES", opciones);
      const parts = formatted.split(" ");
      const label = parts[1] || `${d.getDate()}`;
      const diaSemana = diasSemana[d.getDay()];
      
      // Formato YYYY-MM-DD
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, "0");
      const day = String(d.getDate()).padStart(2, "0");
      const value = `${year}-${month}-${day}`;

      dias.push({ label, value, diaSemana });
    }
    setFechasDisponibles(dias);
    if (dias.length > 0) {
      setSelectedDate(dias[0].value);
    }
  }, []);

  // Manejar reserva
  const handleReservar = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedServicio || !selectedBarbero || !selectedDate || !selectedTime) {
      setErrorMsg("Por favor, completa todos los campos del agendamiento.");
      return;
    }

    try {
      const perfilDemo = await db.getPerfilActual("cliente");
      const fechaHoraIso = `${selectedDate}T${selectedTime}:00`;

      await db.crearCita({
        cliente_id: perfilDemo.id,
        cliente_nombre: perfilDemo.nombre,
        cliente_telefono: perfilDemo.telefono,
        barbero_id: selectedBarbero.id,
        barbero_nombre: selectedBarbero.nombre,
        servicio_id: selectedServicio.id,
        servicio_nombre: selectedServicio.nombre,
        servicio_precio: selectedServicio.precio,
        fecha_hora: fechaHoraIso,
        estado: "pendiente",
      });

      setSuccessMsg("¡Tu cita ha sido solicitada con éxito! Esperando confirmación.");
      // Limpiar selección de servicio
      setSelectedServicio(null);
      setSelectedTime("");
      
      // Recargar citas
      onMutationTrigger();

      // Limpiar mensaje de éxito en 4 segundos
      setTimeout(() => setSuccessMsg(""), 4500);
    } catch (err: any) {
      setErrorMsg("No se pudo agendar la cita. Inténtalo de nuevo.");
      console.error(err);
    }
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

  // Obtener badge del estado
  const renderEstadoBadge = (estado: EstadoCita) => {
    switch (estado) {
      case "pendiente":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/25">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse"></span>
            Pendiente
          </span>
        );
      case "aceptada":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/25">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
            Aceptada
          </span>
        );
      case "rechazada":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-rose-500/10 text-rose-400 border border-rose-500/25">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-400"></span>
            Rechazada
          </span>
        );
    }
  };

  return (
    <div className="flex flex-col gap-8 w-full max-w-md mx-auto px-4 pb-24 animate-fade-in">
      {/* Header Cliente */}
      <div className="flex justify-between items-center bg-dark-900/60 p-4 rounded-2xl border border-dark-800">
        <div>
          <p className="text-zinc-400 text-xs tracking-wider uppercase font-semibold">Cliente Premium</p>
          <h2 className="text-xl font-bold text-white font-outfit mt-0.5">{perfil?.nombre || "Cargando..."}</h2>
        </div>
        <button
          onClick={cargarDatos}
          className="p-2.5 rounded-xl bg-dark-800 text-zinc-400 hover:text-gold-400 border border-dark-700 transition"
          aria-label="Actualizar datos"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin text-gold-400" : ""}`} />
        </button>
      </div>

      {/* Alertas */}
      {successMsg && (
        <div className="flex gap-3 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 p-4 rounded-xl text-sm items-start animate-fade-in shadow-lg">
          <CheckCircle className="w-5 h-5 shrink-0 mt-0.5" />
          <p>{successMsg}</p>
        </div>
      )}

      {errorMsg && (
        <div className="flex gap-3 bg-rose-500/10 border border-rose-500/30 text-rose-400 p-4 rounded-xl text-sm items-start animate-fade-in shadow-lg">
          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
          <p>{errorMsg}</p>
        </div>
      )}

      {/* 1. CATÁLOGO DE SERVICIOS */}
      <section className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-white tracking-wide font-cinzel flex items-center gap-2">
            <Scissors className="w-5 h-5 text-gold-400" />
            Nuestros Servicios
          </h3>
          <span className="text-zinc-500 text-xs font-semibold">{servicios.length} disponibles</span>
        </div>

        <div className="grid gap-3.5">
          {loading && servicios.length === 0 ? (
            <div className="py-8 text-center text-zinc-500">Cargando catálogo...</div>
          ) : (
            servicios.map((s) => (
              <div
                key={s.id}
                onClick={() => setSelectedServicio(s)}
                className={`glass-panel p-4.5 rounded-2xl flex flex-col gap-2 transition cursor-pointer select-none relative overflow-hidden group ${
                  selectedServicio?.id === s.id
                    ? "border-gold-500/80 bg-gold-950/20 ring-1 ring-gold-500/30"
                    : "hover:border-gold-500/20"
                }`}
              >
                {selectedServicio?.id === s.id && (
                  <div className="absolute top-0 right-0 w-12 h-12 bg-gold-500/10 rounded-bl-full flex items-center justify-end pr-2.5 pb-2.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-gold-400"></span>
                  </div>
                )}
                
                <div className="flex justify-between items-start gap-4">
                  <h4 className="font-bold text-white group-hover:text-gold-400 transition font-outfit text-[15px]">
                    {s.nombre}
                  </h4>
                  <span className="text-[17px] font-extrabold text-gold-400 shrink-0 font-outfit">
                    ${Number(s.precio).toFixed(2)}
                  </span>
                </div>

                <p className="text-zinc-400 text-xs leading-relaxed pr-6">
                  {s.descripcion}
                </p>

                <div className="flex items-center gap-1.5 text-zinc-500 text-[11px] font-bold mt-1">
                  <Clock className="w-3.5 h-3.5 text-zinc-500" />
                  <span>Duración estimada: {s.duracion_estimada} min</span>
                </div>
              </div>
            ))
          )}
        </div>
      </section>

      {/* 2. MÓDULO DE RESERVA */}
      <section className="flex flex-col gap-4">
        <h3 className="text-lg font-bold text-white tracking-wide font-cinzel flex items-center gap-2">
          <CalendarIcon className="w-5 h-5 text-gold-400" />
          Agendar Cita
        </h3>

        <form onSubmit={handleReservar} className="glass-panel p-5 rounded-2xl flex flex-col gap-5">
          {/* Muestra el servicio seleccionado */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-extrabold tracking-wider uppercase text-zinc-500">
              Servicio Seleccionado
            </label>
            {selectedServicio ? (
              <div className="flex justify-between items-center bg-dark-900/60 p-3 rounded-xl border border-gold-500/20">
                <span className="font-semibold text-white text-xs">{selectedServicio.nombre}</span>
                <button
                  type="button"
                  onClick={() => setSelectedServicio(null)}
                  className="text-zinc-500 hover:text-rose-400 text-[11px] font-bold"
                >
                  Cambiar
                </button>
              </div>
            ) : (
              <div className="border border-dashed border-dark-700 p-4 rounded-xl text-center text-zinc-500 text-xs">
                Selecciona un servicio en el catálogo superior
              </div>
            )}
          </div>

          {/* Selector de Barbero */}
          <div className="flex flex-col gap-2">
            <label className="text-[11px] font-extrabold tracking-wider uppercase text-zinc-500">
              Elige tu Barbero
            </label>
            <div className="flex gap-3 overflow-x-auto pb-1">
              {barberos.map((b) => (
                <div
                  key={b.id}
                  onClick={() => setSelectedBarbero(b)}
                  className={`flex flex-col items-center gap-2 p-3 rounded-xl border shrink-0 w-28 cursor-pointer transition ${
                    selectedBarbero?.id === b.id
                      ? "border-gold-500 bg-gold-950/15"
                      : "border-dark-800 bg-dark-900/40 hover:border-dark-700"
                  }`}
                >
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-xs font-cinzel ${
                    selectedBarbero?.id === b.id
                      ? "bg-gold-500 text-black"
                      : "bg-dark-800 text-gold-400 border border-gold-500/10"
                  }`}>
                    {b.nombre.split(" ").map(w => w[0]).join("").substring(0, 2)}
                  </div>
                  <span className="text-[10px] font-bold text-center text-white line-clamp-2 leading-tight">
                    {b.nombre.split(" ")[0]} {b.nombre.split(" ")[1]}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Selector de Fecha (Grid Horizontal) */}
          <div className="flex flex-col gap-2">
            <label className="text-[11px] font-extrabold tracking-wider uppercase text-zinc-500">
              Selecciona Fecha
            </label>
            <div className="flex gap-2.5 overflow-x-auto pb-1">
              {fechasDisponibles.map((f, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setSelectedDate(f.value)}
                  className={`flex flex-col items-center gap-1 py-3 px-3.5 rounded-xl border shrink-0 w-[68px] transition calendar-grid-btn ${
                    selectedDate === f.value
                      ? "border-gold-500 bg-gold-500 text-black"
                      : "border-dark-800 bg-dark-900/40 text-zinc-400 hover:border-dark-700"
                  }`}
                >
                  <span className="text-[9px] font-extrabold uppercase tracking-wide opacity-80">
                    {f.diaSemana}
                  </span>
                  <span className="text-sm font-black leading-none font-outfit">
                    {f.label}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Selector de Hora */}
          <div className="flex flex-col gap-2">
            <label className="text-[11px] font-extrabold tracking-wider uppercase text-zinc-500 flex justify-between">
              <span>Selecciona Hora</span>
              {selectedTime && <span className="text-gold-400 font-bold">{selectedTime} hs</span>}
            </label>
            <div className="grid grid-cols-4 gap-2">
              {horasDisponibles.map((h, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setSelectedTime(h)}
                  className={`py-2 text-[11px] font-extrabold rounded-lg border text-center transition ${
                    selectedTime === h
                      ? "border-gold-500 bg-gold-500/10 text-gold-400 font-black"
                      : "border-dark-800 bg-dark-900/40 text-zinc-400 hover:border-dark-700"
                  }`}
                >
                  {h}
                </button>
              ))}
            </div>
          </div>

          {/* Botón de Confirmación */}
          <button
            type="submit"
            disabled={!selectedServicio || !selectedTime}
            className={`w-full py-3.5 rounded-xl font-bold font-outfit text-xs tracking-widest uppercase transition flex items-center justify-center gap-2 cursor-pointer ${
              selectedServicio && selectedTime
                ? "bg-gold-500 hover:bg-gold-600 text-black shadow-lg shadow-gold-500/10 active:scale-98"
                : "bg-dark-800 text-zinc-600 border border-dark-700 cursor-not-allowed"
            }`}
          >
            <Plus className="w-4 h-4 shrink-0" />
            Solicitar Turno
          </button>
        </form>
      </section>

      {/* 3. HISTORIAL DE CITAS (MIS CITAS) */}
      <section className="flex flex-col gap-4">
        <h3 className="text-lg font-bold text-white tracking-wide font-cinzel flex items-center gap-2">
          <HelpCircle className="w-5 h-5 text-gold-400" />
          Mis Citas
        </h3>

        <div className="flex flex-col gap-3">
          {citas.length === 0 ? (
            <div className="border border-dashed border-dark-850 p-8 rounded-2xl text-center text-zinc-500 text-xs">
              No tienes citas registradas. ¡Agenda tu primer corte arriba!
            </div>
          ) : (
            citas.map((c) => (
              <div
                key={c.id}
                className="glass-panel p-4 rounded-xl flex justify-between items-start gap-4"
              >
                <div className="flex flex-col gap-1">
                  <span className="text-[13px] font-bold text-white font-outfit">
                    {c.servicio_nombre}
                  </span>
                  
                  <div className="flex items-center gap-1.5 text-zinc-400 text-xs">
                    <User className="w-3.5 h-3.5 text-gold-400" />
                    <span>Barbero: {c.barbero_nombre?.split(" ")[0]}</span>
                  </div>

                  <div className="flex items-center gap-1.5 text-zinc-400 text-xs">
                    <Clock className="w-3.5 h-3.5 text-gold-400" />
                    <span>{formatearFechaHora(c.fecha_hora)} hs</span>
                  </div>
                </div>

                <div className="flex flex-col items-end gap-2.5">
                  <span className="text-xs font-black text-white shrink-0">
                    ${c.servicio_precio ? Number(c.servicio_precio).toFixed(2) : "0.00"}
                  </span>
                  {renderEstadoBadge(c.estado)}
                </div>
              </div>
            ))
          )}
        </div>
      </section>
    </div>
  );
}
