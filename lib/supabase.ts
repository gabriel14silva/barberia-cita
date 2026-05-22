import { createClient } from "@supabase/supabase-js";

// Tipos compartidos
export type RolUsuario = "cliente" | "barbero";
export type EstadoCita = "pendiente" | "aceptada" | "rechazada";

export interface Perfil {
  id: string;
  nombre: string;
  telefono: string;
  rol: RolUsuario;
  updated_at?: string;
}

export interface Servicio {
  id: string;
  nombre: string;
  precio: number;
  duracion_estimada: number; // en minutos
  descripcion: string;
  created_at?: string;
}

export interface Cita {
  id: string;
  cliente_id: string;
  cliente_nombre?: string;
  cliente_telefono?: string;
  barbero_id: string;
  barbero_nombre?: string;
  servicio_id: string;
  servicio_nombre?: string;
  servicio_precio?: number;
  fecha_hora: string;
  estado: EstadoCita;
  created_at?: string;
}

// Variables de entorno
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

export const isSupabaseConfigured =
  SUPABASE_URL.length > 0 && SUPABASE_ANON_KEY.length > 0;

// Cliente de Supabase (solo se inicializa si están las credenciales)
export const supabase = isSupabaseConfigured
  ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
  : null;

// ==========================================
// CONFIGURACIÓN DE BASE DE DATOS MOCK (LOCALSTORAGE)
// ==========================================

const DEFAULT_SERVICIOS: Servicio[] = [
  {
    id: "1",
    nombre: "Corte Premium + Lavado",
    precio: 15.0,
    duracion_estimada: 30,
    descripcion:
      "Corte estilizado con asesoría de imagen, lavado con shampoo premium y acabado con pomada.",
  },
  {
    id: "2",
    nombre: "Barba Esculpida & Ritual",
    precio: 10.0,
    duracion_estimada: 25,
    descripcion:
      "Perfilado de barba con navaja libre, toalla caliente y aceites hidratantes.",
  },
  {
    id: "3",
    nombre: "Combo La Chata (Corte + Barba)",
    precio: 22.0,
    duracion_estimada: 50,
    descripcion:
      "El servicio completo de la casa. Incluye exfoliación facial rápida.",
  },
];

const DEFAULT_BARBEROS: Perfil[] = [
  {
    id: "barbero-1",
    nombre: "Carlos Gómez (Barbero Senior)",
    telefono: "+1 555-0199",
    rol: "barbero",
  },
  {
    id: "barbero-2",
    nombre: "Manuel Ruiz (Experto en Barbas)",
    telefono: "+1 555-0122",
    rol: "barbero",
  },
];

const DEFAULT_CLIENTE: Perfil = {
  id: "cliente-demo",
  nombre: "Mateo Pérez",
  telefono: "+1 555-0144",
  rol: "cliente",
};

const DEFAULT_CITAS: Cita[] = [
  {
    id: "cita-1",
    cliente_id: "cliente-demo",
    cliente_nombre: "Mateo Pérez",
    cliente_telefono: "+1 555-0144",
    barbero_id: "barbero-1",
    barbero_nombre: "Carlos Gómez (Barbero Senior)",
    servicio_id: "1",
    servicio_nombre: "Corte Premium + Lavado",
    servicio_precio: 15.0,
    fecha_hora: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split("T")[0] + "T10:00:00", // Mañana a las 10:00
    estado: "pendiente",
    created_at: new Date().toISOString(),
  },
  {
    id: "cita-2",
    cliente_id: "cliente-demo",
    cliente_nombre: "Mateo Pérez",
    cliente_telefono: "+1 555-0144",
    barbero_id: "barbero-2",
    barbero_nombre: "Manuel Ruiz (Experto en Barbas)",
    servicio_id: "2",
    servicio_nombre: "Barba Esculpida & Ritual",
    servicio_precio: 10.0,
    fecha_hora: new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString().split("T")[0] + "T16:30:00", // Pasado mañana
    estado: "aceptada",
    created_at: new Date().toISOString(),
  },
];

// Helpers de Inicialización
const getStorageItem = <T>(key: string, defaultValue: T): T => {
  if (typeof window === "undefined") return defaultValue;
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (error) {
    console.error(`Error leyendo localStorage[${key}]:`, error);
    return defaultValue;
  }
};

const setStorageItem = <T>(key: string, value: T): void => {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error(`Error guardando localStorage[${key}]:`, error);
  }
};

// ==========================================
// INTERFAZ DE API INTELIGENTE (SUPABASE / LOCALSTORAGE)
// ==========================================

export const db = {
  // --- SERVICIOS ---
  async getServicios(): Promise<Servicio[]> {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from("cortes_servicios")
        .select("*")
        .order("id", { ascending: true });
      if (!error && data) return data as Servicio[];
      console.warn("Error en Supabase, recurriendo a mock:", error);
    }
    return getStorageItem<Servicio[]>("chata_servicios", DEFAULT_SERVICIOS);
  },

  async guardarServicios(servicios: Servicio[]): Promise<void> {
    setStorageItem("chata_servicios", servicios);
    if (isSupabaseConfigured && supabase) {
      // Intentar actualizar en Supabase individualmente o bulk
      for (const s of servicios) {
        await supabase
          .from("cortes_servicios")
          .upsert({
            id: s.id.includes("mock-") ? undefined : parseInt(s.id),
            nombre: s.nombre,
            precio: s.precio,
            duracion_estimada: s.duracion_estimada,
            descripcion: s.descripcion,
          });
      }
    }
  },

  // --- BARBEROS ---
  async getBarberos(): Promise<Perfil[]> {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from("perfiles")
        .select("*")
        .eq("rol", "barbero");
      if (!error && data) return data as Perfil[];
    }
    return getStorageItem<Perfil[]>("chata_barbereros", DEFAULT_BARBEROS);
  },

  // --- CITAS ---
  async getCitas(rol: RolUsuario, usuarioId: string): Promise<Cita[]> {
    if (isSupabaseConfigured && supabase) {
      let query = supabase
        .from("citas")
        .select(`
          *,
          cliente:perfiles!cliente_id(nombre, telefono),
          barbero:perfiles!barbero_id(nombre),
          servicio:cortes_servicios(nombre, precio)
        `);

      if (rol === "cliente") {
        query = query.eq("cliente_id", usuarioId);
      }

      const { data, error } = await query.order("fecha_hora", { ascending: true });
      if (!error && data) {
        return data.map((item: any) => ({
          id: item.id,
          cliente_id: item.cliente_id,
          cliente_nombre: item.cliente?.nombre,
          cliente_telefono: item.cliente?.telefono,
          barbero_id: item.barbero_id,
          barbero_nombre: item.barbero?.nombre,
          servicio_id: item.servicio_id.toString(),
          servicio_nombre: item.servicio?.nombre,
          servicio_precio: item.servicio?.precio,
          fecha_hora: item.fecha_hora,
          estado: item.estado,
          created_at: item.created_at,
        }));
      }
      console.warn("Error en Supabase getCitas:", error);
    }
    
    // Fallback Mock
    const citas = getStorageItem<Cita[]>("chata_citas", DEFAULT_CITAS);
    if (rol === "barbero") {
      return citas.sort((a, b) => new Date(a.fecha_hora).getTime() - new Date(b.fecha_hora).getTime());
    }
    return citas
      .filter((c) => c.cliente_id === usuarioId)
      .sort((a, b) => new Date(a.fecha_hora).getTime() - new Date(b.fecha_hora).getTime());
  },

  async crearCita(cita: Omit<Cita, "id" | "created_at">): Promise<Cita> {
    const nuevaCita: Cita = {
      ...cita,
      id: "cita-" + Math.random().toString(36).substr(2, 9),
      created_at: new Date().toISOString(),
    };

    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from("citas")
        .insert({
          cliente_id: cita.cliente_id,
          barbero_id: cita.barbero_id,
          servicio_id: parseInt(cita.servicio_id),
          fecha_hora: cita.fecha_hora,
          estado: cita.estado,
        })
        .select()
        .single();
        
      if (!error && data) {
        return {
          ...nuevaCita,
          id: data.id,
        };
      }
      console.warn("Error al crear cita en Supabase:", error);
    }

    // Guardar en Mock
    const citas = getStorageItem<Cita[]>("chata_citas", DEFAULT_CITAS);
    citas.push(nuevaCita);
    setStorageItem("chata_citas", citas);
    return nuevaCita;
  },

  async actualizarEstadoCita(citaId: string, nuevoEstado: EstadoCita): Promise<boolean> {
    if (isSupabaseConfigured && supabase) {
      const { error } = await supabase
        .from("citas")
        .update({ estado: nuevoEstado })
        .eq("id", citaId);
      if (!error) return true;
      console.warn("Error al actualizar cita en Supabase:", error);
    }

    // Mock
    const citas = getStorageItem<Cita[]>("chata_citas", DEFAULT_CITAS);
    const index = citas.findIndex((c) => c.id === citaId);
    if (index !== -1) {
      citas[index].estado = nuevoEstado;
      setStorageItem("chata_citas", citas);
      return true;
    }
    return false;
  },

  // --- OBTENER PERFIL DE PRUEBA ---
  async getPerfilActual(rol: RolUsuario): Promise<Perfil> {
    if (rol === "cliente") {
      return DEFAULT_CLIENTE;
    } else {
      return DEFAULT_BARBEROS[0];
    }
  }
};
