"use client";

import React, { useState, useEffect } from "react";
import ClientView from "@/components/ClientView";
import BarberView from "@/components/BarberView";
import {
  Scissors,
  Sparkles,
  Smartphone,
  Download,
  Info,
  Check,
  LogIn,
} from "lucide-react";
import { isSupabaseConfigured } from "@/lib/supabase";

export default function Home() {
  // Estado para alternar entre roles de pruebas
  const [currentRole, setCurrentRole] = useState<"cliente" | "barbero">(
    "cliente",
  );

  // Sincronización de mutaciones de datos en tiempo real
  const [mutationKey, setMutationKey] = useState<number>(0);

  // Estados para la instalación de la PWA
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showInstallBanner, setShowInstallBanner] = useState(false);
  const [showIOSInstructions, setShowIOSInstructions] = useState(false);

  // Escuchar evento de instalación de PWA
  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowInstallBanner(true);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    // Detectar si ya está instalada o en standalone
    const isStandalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      (window.navigator as any).standalone ||
      document.referrer.includes("android-app://");

    // Si es iOS Safari y no está instalada, sugerir instrucciones
    const isIOS =
      /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
    if (isIOS && !isStandalone) {
      // Mostrar recordatorio de iOS de vez en cuando
      setShowInstallBanner(true);
    }

    return () => {
      window.removeEventListener(
        "beforeinstallprompt",
        handleBeforeInstallPrompt,
      );
    };
  }, []);

  const triggerMutation = () => {
    setMutationKey((prev) => prev + 1);
  };

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === "accepted") {
        console.log("El usuario aceptó la instalación de la PWA");
      }
      setDeferredPrompt(null);
      setShowInstallBanner(false);
    } else {
      // Mostrar instrucciones para iOS / navegadores que no soportan beforeinstallprompt directo
      setShowIOSInstructions(true);
    }
  };

  return (
    <div className="min-h-screen w-full bg-zinc-950 flex flex-col justify-center items-center py-0 sm:py-8 px-0 sm:px-4 selection:bg-gold-500/30 overflow-y-auto">
      {/* Wrapper Estilo Smartphone Premium en Escritorio */}
      <div className="w-full sm:max-w-md bg-dark-950 sm:rounded-[40px] sm:shadow-2xl sm:border-8 sm:border-dark-800 sm:aspect-9/19.5 sm:max-h-[900px] flex flex-col overflow-hidden sm:relative relative BarberíaLaChata-device">
        {/* Notch o Bocina Virtual en el Smartphone */}
        <div className="hidden sm:block absolute top-0 left-1/2 -translate-x-1/2 w-32 h-6 bg-dark-800 rounded-b-2xl z-50"></div>

        {/* Cabecera / Banner Estilo Barber Pole */}
        <header className="barber-pole-border pt-7 pb-4 bg-dark-900 border-b border-dark-800 flex flex-col items-center gap-1.5 shrink-0 z-40">
          <div className="flex items-center gap-2 mt-1">
            <div className="w-6 h-6 rounded-full bg-gold-500 flex items-center justify-center">
              <Scissors className="w-3.5 h-3.5 text-black shrink-0" />
            </div>
            <h1 className="text-lg font-black tracking-[4px] font-cinzel text-white">
              LA CHATA
            </h1>
          </div>
          <p className="text-[9px] uppercase tracking-[4px] font-semibold text-gold-500 flex items-center gap-1">
            <span>BARBERÍA PREMIUM</span>
            <Sparkles className="w-2.5 h-2.5" />
          </p>

          {/* Selector de Roles - Alta Fidelidad para Pruebas */}
          <div className="mt-4 flex bg-dark-950 p-1.5 rounded-xl border border-dark-800 w-11/12 max-w-[280px]">
            <button
              onClick={() => setCurrentRole("cliente")}
              className={`flex-1 py-1.5 text-[10px] font-black tracking-wider uppercase rounded-lg transition-all cursor-pointer ${
                currentRole === "cliente"
                  ? "bg-gold-500 text-black shadow-md font-extrabold"
                  : "text-zinc-500 hover:text-white"
              }`}
            >
              Cliente
            </button>
            <button
              onClick={() => setCurrentRole("barbero")}
              className={`flex-1 py-1.5 text-[10px] font-black tracking-wider uppercase rounded-lg transition-all cursor-pointer ${
                currentRole === "barbero"
                  ? "bg-gold-500 text-black shadow-md font-extrabold"
                  : "text-zinc-500 hover:text-white"
              }`}
            >
              Barbero (Admin)
            </button>
          </div>

          {/* Estado de Conexión Inteligente (Supabase vs Local Demo) */}
          <div className="mt-2.5">
            {isSupabaseConfigured ? (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[9px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/25">
                <span className="w-1 h-1 rounded-full bg-emerald-400"></span>
                Supabase Conectado
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[9px] font-bold bg-gold-500/10 text-gold-400 border border-gold-500/25">
                <span className="w-1.5 h-1.5 rounded-full bg-gold-400 animate-pulse"></span>
                Modo Demo LocalStorage
              </span>
            )}
          </div>
        </header>

        {/* Banner de Instalación PWA */}
        {showInstallBanner && (
          <div className="bg-gold-500 text-black px-4 py-3 flex items-center justify-between gap-3 text-xs z-30 shrink-0 shadow-lg animate-fade-in">
            <div className="flex items-center gap-2">
              <Download className="w-4 h-4 shrink-0" />
              <div>
                <p className="font-extrabold uppercase tracking-wide text-[10px]">
                  Instalar en tu Pantalla
                </p>
                <p className="text-[10px] opacity-90 leading-tight">
                  Accede rápido a Barbería La Chata
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setShowInstallBanner(false)}
                className="px-2.5 py-1 rounded text-[10px] font-bold hover:bg-black/5"
              >
                Quizás luego
              </button>
              <button
                onClick={handleInstallClick}
                className="bg-black text-white px-3 py-1 rounded text-[10px] font-black uppercase tracking-wider transition active:scale-95"
              >
                Instalar
              </button>
            </div>
          </div>
        )}

        {/* Modal Instrucciones iOS */}
        {showIOSInstructions && (
          <div className="absolute inset-0 bg-black/85 backdrop-blur-sm z-50 flex items-center justify-center p-6">
            <div className="glass-panel-heavy p-6 rounded-3xl flex flex-col gap-4 text-center max-w-[280px]">
              <div className="w-12 h-12 rounded-full bg-gold-500/10 text-gold-400 flex items-center justify-center mx-auto">
                <Smartphone className="w-6 h-6" />
              </div>

              <h3 className="font-bold text-white text-base font-outfit">
                Instalación en iOS (iPhone/iPad)
              </h3>

              <div className="text-left text-xs text-zinc-400 flex flex-col gap-3">
                <p className="flex gap-2">
                  <span className="font-bold text-gold-400">1.</span>
                  <span>
                    Pulsa el botón de <strong>Compartir</strong> en la barra
                    inferior de Safari.
                  </span>
                </p>
                <p className="flex gap-2">
                  <span className="font-bold text-gold-400">2.</span>
                  <span>
                    Desliza y selecciona la opción de{" "}
                    <strong>Añadir a la pantalla de inicio</strong>.
                  </span>
                </p>
                <p className="flex gap-2">
                  <span className="font-bold text-gold-400">3.</span>
                  <span>
                    Nombra el acceso directo y pulsa <strong>Añadir</strong> en
                    la esquina superior.
                  </span>
                </p>
              </div>

              <button
                onClick={() => setShowIOSInstructions(false)}
                className="w-full py-2.5 bg-gold-500 text-black font-extrabold text-xs tracking-wider uppercase rounded-xl transition mt-2 cursor-pointer"
              >
                Entendido
              </button>
            </div>
          </div>
        )}

        {/* Contenido Deslizable de la App (Vista del Cliente o Panel de Barbero) */}
        <main className="flex-1 overflow-y-auto pt-5 pb-8 relative custom-scrollbar">
          {currentRole === "cliente" ? (
            <ClientView
              onMutationTrigger={triggerMutation}
              mutationKey={mutationKey}
            />
          ) : (
            <BarberView
              onMutationTrigger={triggerMutation}
              mutationKey={mutationKey}
            />
          )}
        </main>

        {/* Footer Indicador Táctil estilo iOS en Escritorio */}
        <div className="hidden sm:flex py-2.5 bg-dark-950 border-t border-dark-900 justify-center items-center shrink-0">
          <div className="w-32 h-1 bg-dark-800 rounded-full"></div>
        </div>
      </div>

      {/* Mensaje Informativo Flotante para Escritorios */}
      <div className="hidden sm:flex items-center gap-2 mt-4 text-[10px] text-zinc-600 bg-zinc-900/40 px-3.5 py-1.5 rounded-full border border-zinc-900">
        <Info className="w-3.5 h-3.5 text-gold-500" />
        <span>
          Para la mejor experiencia PWA, inspecciona como dispositivo móvil en
          tu navegador.
        </span>
      </div>
    </div>
  );
}
