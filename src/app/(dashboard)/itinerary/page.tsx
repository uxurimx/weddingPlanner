import { Clock, GripVertical, Eye, Plus } from "lucide-react";

const previewItems = [
  { time: "2:30 PM", icon: "🕍", title: "Discurso Bíblico",  venue: "Salón del Reino de los Testigos de Jehová" },
  { time: "4:00 PM", icon: "📸", title: "Sesión de fotos",   venue: "Exterior · Jardín" },
  { time: "5:00 PM", icon: "🥂", title: "Recepción",         venue: "Salón de Eventos Queen Palace" },
  { time: "6:00 PM", icon: "🍽️", title: "Cena",             venue: "Salón Principal" },
  { time: "8:00 PM", icon: "💃", title: "Primer baile",      venue: "" },
  { time: "9:00 PM", icon: "🎂", title: "Pastel",            venue: "" },
  { time: "9:30 PM", icon: "🎉", title: "Fiesta",            venue: "" },
];

export default function ItineraryPage() {
  return (
    <div className="p-8 max-w-3xl">
      <div className="mb-8">
        <div
          className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold border mb-4"
          style={{ backgroundColor: "var(--surface)", borderColor: "var(--border)", color: "var(--fg-muted)" }}
        >
          Fase 2 · En desarrollo
        </div>
        <h1 className="font-outfit font-bold text-3xl mb-2" style={{ color: "var(--fg)" }}>
          Itinerario
        </h1>
        <p className="text-sm" style={{ color: "var(--fg-muted)" }}>
          Define las fases del evento con horarios e iconos. Arrastra para reordenar. Cada item puede mostrarse u ocultarse en la invitación.
        </p>
      </div>

      {/* Preview of how it'll look */}
      <div
        className="rounded-2xl border overflow-hidden mb-4"
        style={{ backgroundColor: "var(--surface)", borderColor: "var(--border)" }}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b" style={{ borderColor: "var(--border)" }}>
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4" style={{ color: "var(--fg-muted)" }} />
            <span className="text-sm font-semibold" style={{ color: "var(--fg)" }}>Vista previa del itinerario</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs" style={{ color: "var(--fg-muted)" }}>
            <Eye className="w-3.5 h-3.5" /> Vista de invitación
          </div>
        </div>
        <div className="p-5 space-y-0">
          {previewItems.map((item, i) => (
            <div key={i} className="flex items-start gap-4 group">
              <div className="flex flex-col items-center">
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center text-sm border flex-shrink-0"
                  style={{ backgroundColor: "var(--surface-2)", borderColor: "var(--border)" }}
                >
                  {item.icon}
                </div>
                {i < previewItems.length - 1 && (
                  <div className="w-px h-8 mt-1" style={{ backgroundColor: "var(--border)" }} />
                )}
              </div>
              <div className="pt-1.5 pb-6">
                <div className="flex items-center gap-3">
                  <span className="text-xs font-bold" style={{ color: "var(--fg-muted)" }}>{item.time}</span>
                  <span className="text-sm font-semibold" style={{ color: "var(--fg)" }}>{item.title}</span>
                </div>
                {item.venue && (
                  <p className="text-xs mt-0.5" style={{ color: "var(--fg-muted)" }}>{item.venue}</p>
                )}
              </div>
              <div className="ml-auto pt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <GripVertical className="w-4 h-4" style={{ color: "var(--fg-muted)" }} />
              </div>
            </div>
          ))}
        </div>
        <div
          className="flex items-center gap-2 px-5 py-3 border-t text-sm cursor-not-allowed"
          style={{ borderColor: "var(--border)", color: "var(--fg-muted)" }}
        >
          <Plus className="w-4 h-4" /> Agregar fase
        </div>
      </div>
    </div>
  );
}
