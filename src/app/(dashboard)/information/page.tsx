import { BookOpen, Users, MapPin, Music, Heart, Quote } from "lucide-react";

const features = [
  { icon: Heart,   title: "Novios y padres",     desc: "Nombres completos de Jahir, Gilliane y sus 4 padres." },
  { icon: Quote,   title: "Cita bíblica",         desc: "Versículo personalizado — Oseas 2:19." },
  { icon: MapPin,  title: "Venues",               desc: "Discurso Bíblico y Recepción con dirección, mapa y horarios." },
  { icon: Music,   title: "Canción y fotos",      desc: "Canción de YouTube/Spotify y galería de fotos de la pareja." },
  { icon: Users,   title: "Texto de invitación",  desc: "Mensaje personalizado que aparece en todas las invitaciones." },
  { icon: BookOpen, title: "Dress code",          desc: "Indicaciones de vestimenta con descripción y notas." },
];

export default function InformationPage() {
  return (
    <div className="p-8 max-w-4xl">
      <div className="mb-8">
        <div
          className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold border mb-4"
          style={{ backgroundColor: "var(--surface)", borderColor: "var(--border)", color: "var(--fg-muted)" }}
        >
          Fase 2 · En desarrollo
        </div>
        <h1 className="font-outfit font-bold text-3xl mb-2" style={{ color: "var(--fg)" }}>
          Información del Evento
        </h1>
        <p className="text-sm" style={{ color: "var(--fg-muted)" }}>
          Gestiona todos los datos del evento. Todo lo que ingreses aquí se refleja automáticamente en la invitación pública y en las invitaciones personalizadas.
        </p>
      </div>

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
