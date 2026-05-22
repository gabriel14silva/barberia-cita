"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { db } from "@/lib/supabase";
import {
  Scissors,
  Mail,
  Lock,
  User,
  Phone,
  ArrowRight,
  AlertCircle,
  CheckCircle,
  ChevronLeft,
} from "lucide-react";

export default function Login() {
  const router = useRouter();

  // Estados del Formulario
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [nombre, setNombre] = useState("");
  const [telefono, setTelefono] = useState("");

  // Estados de Carga y Mensajes
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  // Manejar Login o Registro
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");
    setLoading(true);

    try {
      if (isRegister) {
        // Validación básica
        if (!email || !password || !nombre || !telefono) {
          setErrorMsg("Por favor, completa todos los campos.");
          setLoading(false);
          return;
        }

        const { profile, error } = await db.registrarUsuario(
          email,
          password,
          nombre,
          telefono
        );

        if (error) {
          setErrorMsg(error);
        } else if (profile) {
          setSuccessMsg("¡Registro exitoso! Iniciando sesión...");
          setTimeout(() => {
            router.push("/");
          }, 1500);
        }
      } else {
        // Iniciar Sesión
        if (!email || !password) {
          setErrorMsg("Por favor, ingresa tu correo y contraseña.");
          setLoading(false);
          return;
        }

        const { profile, error } = await db.iniciarSesion(email, password);

        if (error) {
          setErrorMsg(error);
        } else if (profile) {
          setSuccessMsg(`¡Bienvenido de nuevo, ${profile.nombre}!`);
          setTimeout(() => {
            router.push("/");
          }, 1500);
        }
      }
    } catch (err: any) {
      setErrorMsg("Ocurrió un error inesperado. Inténtalo de nuevo.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-zinc-950 flex flex-col justify-center items-center py-0 sm:py-8 px-0 sm:px-4 selection:bg-gold-500/30 overflow-y-auto">
      
      {/* Smartphone Wrapper en Escritorios */}
      <div className="w-full sm:max-w-md bg-dark-950 sm:rounded-[40px] sm:shadow-2xl sm:border-8 sm:border-dark-800 sm:aspect-9/19.5 sm:max-h-[900px] flex flex-col overflow-hidden sm:relative relative BarberíaLaChata-device">
        
        {/* Notch Bocina Virtual */}
        <div className="hidden sm:block absolute top-0 left-1/2 -translate-x-1/2 w-32 h-6 bg-dark-800 rounded-b-2xl z-50"></div>
        
        {/* Botón de Atrás */}
        <div className="pt-8 px-5 flex items-center justify-between shrink-0 z-40">
          <button
            onClick={() => router.push("/")}
            className="flex items-center gap-1.5 text-xs font-bold text-zinc-500 hover:text-gold-400 transition cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4" />
            Volver a Inicio
          </button>
        </div>

        <main className="flex-1 overflow-y-auto px-6 py-6 flex flex-col justify-center gap-7">
          {/* Logo y Branding */}
          <div className="flex flex-col items-center gap-1 text-center">
            <div className="w-11 h-11 rounded-full bg-gold-500 flex items-center justify-center shadow-lg shadow-gold-500/10 mb-2">
              <Scissors className="w-5 h-5 text-black shrink-0" />
            </div>
            <h1 className="text-xl font-black tracking-[4px] font-cinzel text-white">
              LA CHATA
            </h1>
            <p className="text-[9px] uppercase tracking-[3px] font-semibold text-gold-500">
              BARBERÍA PREMIUM
            </p>
            <h2 className="text-lg font-bold text-zinc-300 font-outfit mt-4">
              {isRegister ? "Crear Cuenta" : "Acceso de Clientes"}
            </h2>
            <p className="text-zinc-500 text-xs">
              {isRegister 
                ? "Regístrate para agendar turnos en segundos" 
                : "Ingresa tus credenciales para administrar tus citas"}
            </p>
          </div>

          {/* Alertas */}
          {errorMsg && (
            <div className="flex gap-2.5 bg-rose-500/10 border border-rose-500/30 text-rose-400 p-4 rounded-xl text-xs items-start animate-fade-in shadow-lg">
              <AlertCircle className="w-4.5 h-4.5 shrink-0 mt-0.5" />
              <p className="font-medium">{errorMsg}</p>
            </div>
          )}

          {successMsg && (
            <div className="flex gap-2.5 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 p-4 rounded-xl text-xs items-start animate-fade-in shadow-lg">
              <CheckCircle className="w-4.5 h-4.5 shrink-0 mt-0.5" />
              <p className="font-medium">{successMsg}</p>
            </div>
          )}

          {/* Formulario */}
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            
            {/* Input Nombre (Solo en Registro) */}
            {isRegister && (
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-extrabold tracking-wider uppercase text-zinc-500">
                  Nombre Completo
                </label>
                <div className="flex items-center gap-2.5 bg-dark-900 border border-dark-800 focus-within:border-gold-500/80 rounded-xl px-3.5 py-2.5 transition">
                  <User className="w-4 h-4 text-zinc-500 shrink-0" />
                  <input
                    type="text"
                    required
                    value={nombre}
                    onChange={(e) => setNombre(e.target.value)}
                    placeholder="Ej. Mateo Pérez"
                    className="w-full bg-transparent text-xs text-white outline-none"
                  />
                </div>
              </div>
            )}

            {/* Input Teléfono (Solo en Registro) */}
            {isRegister && (
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-extrabold tracking-wider uppercase text-zinc-500">
                  Teléfono Móvil
                </label>
                <div className="flex items-center gap-2.5 bg-dark-900 border border-dark-800 focus-within:border-gold-500/80 rounded-xl px-3.5 py-2.5 transition">
                  <Phone className="w-4 h-4 text-zinc-500 shrink-0" />
                  <input
                    type="tel"
                    required
                    value={telefono}
                    onChange={(e) => setTelefono(e.target.value)}
                    placeholder="Ej. +1 555-0144"
                    className="w-full bg-transparent text-xs text-white outline-none"
                  />
                </div>
              </div>
            )}

            {/* Input Email */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-extrabold tracking-wider uppercase text-zinc-500">
                Correo Electrónico
              </label>
              <div className="flex items-center gap-2.5 bg-dark-900 border border-dark-800 focus-within:border-gold-500/80 rounded-xl px-3.5 py-2.5 transition">
                <Mail className="w-4 h-4 text-zinc-500 shrink-0" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="ejemplo@lachata.com"
                  className="w-full bg-transparent text-xs text-white outline-none"
                />
              </div>
            </div>

            {/* Input Contraseña */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-extrabold tracking-wider uppercase text-zinc-500">
                Contraseña
              </label>
              <div className="flex items-center gap-2.5 bg-dark-900 border border-dark-800 focus-within:border-gold-500/80 rounded-xl px-3.5 py-2.5 transition">
                <Lock className="w-4 h-4 text-zinc-500 shrink-0" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-transparent text-xs text-white outline-none"
                />
              </div>
            </div>

            {/* Guía rápida de credenciales en modo Demo */}
            {!isRegister && (
              <div className="bg-dark-900/30 border border-dark-850 p-3 rounded-xl flex flex-col gap-1 text-[10px] text-zinc-500">
                <span className="font-bold text-gold-500 uppercase tracking-wide">Credenciales Demo Rápidas:</span>
                <span>• Para Barbero: <strong>barbero@lachata.com</strong> (clave cualquiera)</span>
                <span>• Para Cliente: <strong>cliente@lachata.com</strong> (clave cualquiera)</span>
              </div>
            )}

            {/* Botón Submit */}
            <button
              type="submit"
              disabled={loading}
              className={`w-full py-3.5 rounded-xl font-bold font-outfit text-xs tracking-widest uppercase transition flex items-center justify-center gap-2 cursor-pointer mt-2 ${
                loading
                  ? "bg-dark-850 text-zinc-650 cursor-not-allowed border border-dark-800"
                  : "bg-gold-500 hover:bg-gold-600 text-black shadow-lg shadow-gold-500/10 active:scale-98"
              }`}
            >
              {loading ? "Cargando..." : isRegister ? "Registrar Cuenta" : "Entrar a la Barbería"}
              {!loading && <ArrowRight className="w-4 h-4 shrink-0" />}
            </button>
          </form>

          {/* Selector de alternar Registro / Login */}
          <div className="text-center text-xs">
            <span className="text-zinc-500">
              {isRegister ? "¿Ya tienes una cuenta?" : "¿No tienes cuenta aún?"}{" "}
            </span>
            <button
              onClick={() => {
                setIsRegister(!isRegister);
                setErrorMsg("");
                setSuccessMsg("");
              }}
              className="text-gold-400 hover:text-gold-500 font-bold underline cursor-pointer transition"
            >
              {isRegister ? "Inicia Sesión" : "Regístrate gratis"}
            </button>
          </div>
        </main>
        
        {/* Footer Indicador Táctil */}
        <div className="hidden sm:flex py-2.5 bg-dark-950 border-t border-dark-900 justify-center items-center shrink-0">
          <div className="w-32 h-1 bg-dark-800 rounded-full"></div>
        </div>
      </div>
    </div>
  );
}
