import { Gift, CreditCard, ExternalLink, Heart } from "lucide-react";

const previewRegistries = [
  {
    type: "registry" as const,
    icon: "🏬",
    name: "Sears",
    detail: "Lista #234094",
    action: "Ver lista",
  },
  {
    type: "registry" as const,
    icon: "🛍️",
    name: "Liverpool",
    detail: "Lista #51947675",
    action: "Ver lista",
  },
  {
    type: "bank" as const,
    icon: "🏦",
    name: "BBVA · Gilliane Aréchiga",
    detail: "4152 2929 2680 6136",
    action: "Copiar número",
  },
  {
    type: "honeymoon" as const,
    icon: "✈️",
    name: "Luna de miel",
    detail: "Contribuye a su viaje soñado",
    action: "Ver link",
  },
];

export default function GiftsPage() {
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
          Mesa de Regalos
        </h1>
        <p className="text-sm" style={{ color: "var(--fg-muted)" }}>
          Administra tiendas de regalos, datos bancarios para transferencias y el fondo para la luna de miel. Todo aparece al final de la invitación.
        </p>
      </div>

      <div className="space-y-3 mb-6">
        {previewRegistries.map((item, i) => (
          <div
            key={i}
            className="flex items-center gap-4 p-4 rounded-xl border"
            style={{ backgroundColor: "var(--surface)", borderColor: "var(--border)" }}
          >
            <span className="text-2xl w-10 text-center">{item.icon}</span>
            <div className="flex-1">
              <p className="text-sm font-semibold" style={{ color: "var(--fg)" }}>{item.name}</p>
              <p className="text-xs" style={{ color: "var(--fg-muted)" }}>{item.detail}</p>
            </div>
            <div
              className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg border cursor-not-allowed"
              style={{ borderColor: "var(--border)", color: "var(--fg-muted)", backgroundColor: "var(--surface-2)" }}
            >
              {item.type === "registry" ? <ExternalLink className="w-3 h-3" /> : <CreditCard className="w-3 h-3" />}
              {item.action}
            </div>
          </div>
        ))}
      </div>

      <div
        className="flex items-start gap-3 p-4 rounded-xl border"
        style={{ backgroundColor: "var(--surface)", borderColor: "var(--border)" }}
      >
        <div className="p-2 rounded-lg bg-rose-500/10 border border-rose-500/20">
          <Heart className="w-4 h-4 text-rose-500" />
        </div>
        <div>
          <p className="text-sm font-semibold mb-0.5" style={{ color: "var(--fg)" }}>Frase de la invitación</p>
          <p className="text-xs italic" style={{ color: "var(--fg-muted)" }}>
            "Tu presencia es nuestro mejor regalo, pero si deseas añadir algo más:"
          </p>
        </div>
      </div>
    </div>
  );
}
