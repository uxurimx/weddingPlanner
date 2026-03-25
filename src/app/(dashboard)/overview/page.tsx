import { currentUser } from "@clerk/nextjs/server";
import Link from "next/link";
import {
  Heart,
  Users,
  CheckCircle,
  Clock,
  Camera,
  BookOpen,
  Gift,
  ScanLine,
  Image,
  ShieldCheck,
  Settings,
  ArrowRight,
} from "lucide-react";
import { siteConfig } from "@/config/site";

function getDaysUntilWedding() {
  const wedding = new Date(siteConfig.weddingDate);
  const now = new Date();
  const diff = wedding.getTime() - now.getTime();
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
}

const modules = [
  {
    name: "Información",
    href: "/information",
    icon: BookOpen,
    phase: 2,
    status: "pending" as const,
    desc: "Datos del evento, novios y padres",
  },
  {
    name: "Invitados",
    href: "/guests",
    icon: Users,
    phase: 3,
    status: "pending" as const,
    desc: "Gestión de invitados, mesas y QR",
  },
  {
    name: "Itinerario",
    href: "/itinerary",
    icon: Clock,
    phase: 2,
    status: "pending" as const,
    desc: "Fases y horarios del evento",
  },
  {
    name: "Regalos",
    href: "/gifts",
    icon: Gift,
    phase: 2,
    status: "pending" as const,
    desc: "Mesa de regalos y transferencias",
  },
  {
    name: "Social",
    href: "/social",
    icon: Image,
    phase: 6,
    status: "pending" as const,
    desc: "Galería de fotos y videos",
  },
  {
    name: "Fotógrafo",
    href: "/photographer",
    icon: Camera,
    phase: 6,
    status: "pending" as const,
    desc: "Subida masiva del fotógrafo",
  },
  {
    name: "Check-in",
    href: "/checkin",
    icon: ScanLine,
    phase: 5,
    status: "pending" as const,
    desc: "Scanner QR entrada al evento",
  },
  {
    name: "Usuarios",
    href: "/users",
    icon: ShieldCheck,
    phase: 8,
    status: "pending" as const,
    desc: "Roles y permisos del panel",
  },
  {
    name: "Configuración",
    href: "/settings",
    icon: Settings,
    phase: 1,
    status: "ready" as const,
    desc: "Ajustes del sistema",
  },
];

export default async function OverviewPage() {
  const user = await currentUser();
  const greeting = user?.firstName ? `Hola, ${user.firstName}.` : "Bienvenido.";
  const daysLeft = getDaysUntilWedding();

  const stats = [
    { label: "Invitados",    value: "—",  icon: Users,        hint: "Disponible en Fase 3", color: "indigo"  },
    { label: "Confirmados",  value: "—",  icon: CheckCircle,  hint: "Disponible en Fase 3", color: "emerald" },
    { label: "Presentes",    value: "—",  icon: ScanLine,     hint: "Disponible en Fase 5", color: "violet"  },
    { label: "Fotos",        value: "—",  icon: Camera,       hint: "Disponible en Fase 6", color: "rose"    },
  ];

  return (
    <div className="p-8 max-w-5xl">
      {/* Header */}
      <div className="mb-10">
        <p className="text-xs font-semibold uppercase tracking-widest mb-1" style={{ color: "var(--fg-muted)" }}>
          Dashboard
        </p>
        <h1 className="font-outfit font-bold text-3xl" style={{ color: "var(--fg)" }}>
          {greeting}
        </h1>
        <p className="mt-1 text-sm" style={{ color: "var(--fg-muted)" }}>
          Sistema de gestión · {siteConfig.name} · {siteConfig.tagline}
        </p>
      </div>

      {/* Countdown banner */}
      <div
        className="flex items-center gap-4 p-5 rounded-2xl border mb-8"
        style={{ backgroundColor: "var(--surface)", borderColor: "var(--border)" }}
      >
        <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20">
          <Heart className="w-6 h-6 text-rose-500" />
        </div>
        <div className="flex-1">
          <p className="font-outfit font-bold text-2xl" style={{ color: "var(--fg)" }}>
            {daysLeft} días para la boda
          </p>
          <p className="text-sm" style={{ color: "var(--fg-muted)" }}>
            Sábado 6 de junio, 2026 · Discurso Bíblico 2:30 PM · Recepción 5:00 PM
          </p>
        </div>
        <Link
          href="/information"
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold border transition-colors hover:bg-[var(--surface-2)]"
          style={{ borderColor: "var(--border)", color: "var(--fg-muted)" }}
        >
          Ver detalles <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-10">
        {stats.map(({ label, value, icon: Icon, hint, color }) => (
          <div
            key={label}
            className="p-5 rounded-2xl border"
            style={{ backgroundColor: "var(--surface)", borderColor: "var(--border)" }}
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold uppercase tracking-widest" style={{ color: "var(--fg-muted)" }}>
                {label}
              </span>
              <div className={`p-1.5 rounded-lg bg-${color}-500/10 border border-${color}-500/20`}>
                <Icon className={`w-3.5 h-3.5 text-${color}-500`} />
              </div>
            </div>
            <p className="font-outfit font-bold text-3xl mb-1" style={{ color: "var(--fg)" }}>{value}</p>
            <p className="text-[11px]" style={{ color: "var(--fg-muted)" }}>{hint}</p>
          </div>
        ))}
      </div>

      {/* Modules grid */}
      <div>
        <h2 className="font-outfit font-bold text-lg mb-4" style={{ color: "var(--fg)" }}>
          Módulos del sistema
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {modules.map(({ name, href, icon: Icon, phase, status, desc }) => (
            <Link
              key={href}
              href={href}
              className="flex items-start gap-3 p-4 rounded-xl border transition-all hover:border-indigo-500/30 hover:bg-[var(--surface-2)] group"
              style={{ backgroundColor: "var(--surface)", borderColor: "var(--border)" }}
            >
              <div className="p-2 rounded-lg bg-indigo-500/10 border border-indigo-500/20 mt-0.5 flex-shrink-0">
                <Icon className="w-4 h-4 text-indigo-500" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="text-sm font-semibold" style={{ color: "var(--fg)" }}>{name}</span>
                  <span
                    className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                      status === "ready"
                        ? "bg-emerald-500/10 text-emerald-500"
                        : "bg-[var(--surface-2)] text-[var(--fg-muted)]"
                    }`}
                  >
                    {status === "ready" ? "Listo" : `F${phase}`}
                  </span>
                </div>
                <p className="text-xs truncate" style={{ color: "var(--fg-muted)" }}>{desc}</p>
              </div>
              <ArrowRight className="w-3.5 h-3.5 mt-1 opacity-0 group-hover:opacity-60 transition-opacity flex-shrink-0" style={{ color: "var(--fg-muted)" }} />
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
