import { ScanLine, Search, Zap, Users, Wifi, AlertCircle } from "lucide-react";

const features = [
  { icon: ScanLine,     title: "Escáner QR",           desc: "Activa la cámara del dispositivo. Escanea el QR del invitado y confirma entrada al instante." },
  { icon: Search,       title: "Búsqueda manual",      desc: "Si el invitado olvidó su QR, búscalo por nombre o familia y registra entrada manualmente." },
  { icon: Wifi,         title: "Multi-dispositivo",    desc: "Múltiples recepcionistas pueden escanear simultáneamente. Todos ven el mismo contador en tiempo real." },
  { icon: Zap,          title: "Respuesta instantánea",desc: "El estado del invitado cambia a 'Presente' y su invitación se convierte en modo post-evento." },
  { icon: Users,        title: "Historial de ingresos",desc: "Lista en vivo de los últimos check-ins: quién entró, a qué hora y cuántos pases." },
  { icon: AlertCircle,  title: "Manejo de edge cases", desc: "QR duplicado, token inválido u override manual para casos especiales en la entrada." },
];

export default function CheckinPage() {
  return (
    <div className="p-8 max-w-4xl">
      <div className="mb-8">
        <div
          className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold border mb-4"
          style={{ backgroundColor: "var(--surface)", borderColor: "var(--border)", color: "var(--fg-muted)" }}
        >
          Fase 5 · En desarrollo
        </div>
        <h1 className="font-outfit font-bold text-3xl mb-2" style={{ color: "var(--fg)" }}>
          Check-in
        </h1>
        <p className="text-sm" style={{ color: "var(--fg-muted)" }}>
          Interfaz simplificada para la persona en la entrada. Un botón grande para escanear. Diseñada para que cualquier persona la pueda usar sin capacitación.
        </p>
      </div>

      {/* Mockup of the check-in UI */}
      <div
        className="p-5 rounded-2xl border mb-6"
        style={{ backgroundColor: "var(--surface)", borderColor: "var(--border)" }}
      >
        <p className="text-xs font-bold uppercase tracking-widest mb-4" style={{ color: "var(--fg-muted)" }}>
          Vista de recepcionista (mockup)
        </p>
        <div className="flex flex-col items-center gap-4">
          <div
            className="w-full max-w-xs py-5 rounded-2xl border-2 border-dashed flex flex-col items-center gap-2 cursor-not-allowed"
            style={{ borderColor: "var(--border)" }}
          >
            <ScanLine className="w-10 h-10" style={{ color: "var(--fg-muted)" }} />
            <span className="text-sm font-semibold" style={{ color: "var(--fg-muted)" }}>ESCANEAR QR</span>
          </div>
          <div
            className="w-full max-w-xs p-4 rounded-xl border text-center"
            style={{ backgroundColor: "var(--surface-2)", borderColor: "var(--border)" }}
          >
            <p className="text-2xl font-bold font-outfit mb-0.5" style={{ color: "var(--fg)" }}>— / 200</p>
            <p className="text-xs" style={{ color: "var(--fg-muted)" }}>invitados presentes</p>
          </div>
        </div>
      </div>

      {/* Confirmed response mockup */}
      <div
        className="p-4 rounded-xl border border-emerald-500/20 bg-emerald-500/5 mb-6"
      >
        <p className="text-xs font-bold uppercase tracking-widest text-emerald-600 mb-2">Respuesta al escanear</p>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold" style={{ color: "var(--fg)" }}>✅ BIENVENIDO — Familia García</p>
            <p className="text-xs mt-0.5" style={{ color: "var(--fg-muted)" }}>3 pases · Mesa 5</p>
          </div>
          <span className="text-xs px-2 py-1 rounded-full bg-emerald-500/10 text-emerald-600 font-semibold">
            Confirmado
          </span>
        </div>
      </div>

      {/* Features grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {features.map(({ icon: Icon, title, desc }) => (
          <div
            key={title}
            className="flex items-start gap-4 p-4 rounded-xl border"
            style={{ backgroundColor: "var(--surface)", borderColor: "var(--border)" }}
          >
            <div className="p-2 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex-shrink-0">
              <Icon className="w-4 h-4 text-indigo-500" />
            </div>
            <div>
              <p className="text-sm font-semibold mb-0.5" style={{ color: "var(--fg)" }}>{title}</p>
              <p className="text-xs leading-relaxed" style={{ color: "var(--fg-muted)" }}>{desc}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
