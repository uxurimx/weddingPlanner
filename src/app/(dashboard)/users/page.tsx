import { ShieldCheck, UserPlus, Lock, Eye } from "lucide-react";

const roles = [
  { name: "super_admin",  label: "Super Admin",  color: "text-violet-500 bg-violet-500/10 border-violet-500/20", access: "Todo el sistema, incluyendo usuarios y roles." },
  { name: "admin",        label: "Admin",         color: "text-indigo-500 bg-indigo-500/10 border-indigo-500/20", access: "Todo excepto gestión de usuarios." },
  { name: "planner",      label: "Planner",       color: "text-blue-500   bg-blue-500/10   border-blue-500/20",   access: "Dashboard, invitados, información, itinerario, regalos." },
  { name: "receptionist", label: "Recepcionista", color: "text-emerald-500 bg-emerald-500/10 border-emerald-500/20", access: "Solo módulo Check-in." },
  { name: "photographer", label: "Fotógrafo",     color: "text-amber-500  bg-amber-500/10  border-amber-500/20",  access: "Solo su página de subida de fotos." },
  { name: "viewer",       label: "Viewer",        color: "text-gray-500   bg-gray-500/10   border-gray-500/20",   access: "Solo lectura — Dashboard y galería." },
];

const features = [
  { icon: UserPlus,    title: "Invitar usuarios",      desc: "Invita por email (via Clerk). El usuario crea su cuenta y recibe el rol asignado." },
  { icon: Lock,        title: "Permisos granulares",   desc: "Además del rol, override módulo por módulo para casos especiales." },
  { icon: Eye,         title: "Auditoría",             desc: "Última conexión y actividad de cada usuario del panel." },
  { icon: ShieldCheck, title: "Activar / Desactivar",  desc: "Desactiva el acceso sin eliminar la cuenta. Útil para coordinadores temporales." },
];

export default function UsersPage() {
  return (
    <div className="p-8 max-w-4xl">
      <div className="mb-8">
        <div
          className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold border mb-4"
          style={{ backgroundColor: "var(--surface)", borderColor: "var(--border)", color: "var(--fg-muted)" }}
        >
          Fase 8 · En desarrollo
        </div>
        <h1 className="font-outfit font-bold text-3xl mb-2" style={{ color: "var(--fg)" }}>
          Usuarios y Roles
        </h1>
        <p className="text-sm" style={{ color: "var(--fg-muted)" }}>
          Control de acceso granular. Define quién puede ver qué. No todos necesitan acceso a todo — desde el administrador hasta el recepcionista.
        </p>
      </div>

      {/* Roles table */}
      <div
        className="rounded-2xl border overflow-hidden mb-6"
        style={{ backgroundColor: "var(--surface)", borderColor: "var(--border)" }}
      >
        <div className="px-5 py-4 border-b" style={{ borderColor: "var(--border)" }}>
          <p className="text-sm font-semibold" style={{ color: "var(--fg)" }}>Roles predefinidos</p>
        </div>
        <div className="divide-y" style={{ borderColor: "var(--border)" }}>
          {roles.map((role) => (
            <div key={role.name} className="flex items-center gap-4 px-5 py-3">
              <span className={`text-xs font-bold px-2.5 py-1 rounded-full border ${role.color}`}>
                {role.label}
              </span>
              <p className="text-sm flex-1" style={{ color: "var(--fg-muted)" }}>{role.access}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Features */}
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
