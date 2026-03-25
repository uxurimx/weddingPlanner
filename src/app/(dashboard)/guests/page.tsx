import { Users, QrCode, Table2, FileDown, UserPlus, Filter } from "lucide-react";

const features = [
  { icon: UserPlus, title: "Crear invitaciones",   desc: "Por familia o individuo. Asigna pases (1–10) y mesa. Auto-genera QR y token único." },
  { icon: QrCode,   title: "QR personalizado",     desc: "Cada invitación genera un QR único. Descarga individual o en lote como ZIP." },
  { icon: Table2,   title: "Gestión de mesas",     desc: "Asigna invitados a mesas, visualiza ocupación y reordena con drag & drop." },
  { icon: Filter,   title: "Filtros avanzados",    desc: "Filtra por estado (confirmado, pendiente, cancelado, presente), mesa o búsqueda libre." },
  { icon: FileDown, title: "Exportar datos",       desc: "Exporta la lista completa a CSV/Excel para el coordinador del salón o el chef." },
  { icon: Users,    title: "Estado en tiempo real",desc: "Ve quién confirmó, canceló o ya llegó al evento en tiempo real con Pusher." },
];

const statusColors: Record<string, string> = {
  "Creado":     "bg-gray-500/10 text-gray-500",
  "Enviado":    "bg-blue-500/10 text-blue-500",
  "Visto":      "bg-yellow-500/10 text-yellow-500",
  "Confirmado": "bg-emerald-500/10 text-emerald-500",
  "Cancelado":  "bg-red-500/10 text-red-500",
  "Presente":   "bg-violet-500/10 text-violet-500",
};

export default function GuestsPage() {
  return (
    <div className="p-8 max-w-4xl">
      <div className="mb-8">
        <div
          className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold border mb-4"
          style={{ backgroundColor: "var(--surface)", borderColor: "var(--border)", color: "var(--fg-muted)" }}
        >
          Fase 3 · En desarrollo
        </div>
        <h1 className="font-outfit font-bold text-3xl mb-2" style={{ color: "var(--fg)" }}>
          Invitados
        </h1>
        <p className="text-sm" style={{ color: "var(--fg-muted)" }}>
          Centro de control de invitaciones. Crea, gestiona y rastrea cada invitado desde que se envía el link hasta que entra al evento.
        </p>
      </div>

      {/* Status flow */}
      <div
        className="p-5 rounded-2xl border mb-6"
        style={{ backgroundColor: "var(--surface)", borderColor: "var(--border)" }}
      >
        <p className="text-xs font-bold uppercase tracking-widest mb-4" style={{ color: "var(--fg-muted)" }}>
          Flujo de estados
        </p>
        <div className="flex flex-wrap items-center gap-2">
          {Object.entries(statusColors).map(([label, classes], i, arr) => (
            <div key={label} className="flex items-center gap-2">
              <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${classes}`}>{label}</span>
              {i < arr.length - 1 && (
                <span style={{ color: "var(--fg-muted)" }}>→</span>
              )}
            </div>
          ))}
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
