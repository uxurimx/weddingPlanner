import { Image, Video, Download, Filter, FolderOpen, Heart } from "lucide-react";

const folders = [
  { icon: "📸", name: "Fotos Oficiales",    count: "—",  desc: "Subidas por el fotógrafo contratado" },
  { icon: "🤳", name: "Fotos Invitados",    count: "—",  desc: "Fotos compartidas por los invitados" },
  { icon: "🎥", name: "Videos Invitados",   count: "—",  desc: "Videos cortos del evento" },
  { icon: "💌", name: "Mensajes de Video",  count: "—",  desc: "Mensajes privados para los novios" },
];

const features = [
  { icon: FolderOpen, title: "Carpetas organizadas",  desc: "Fotos del fotógrafo, invitados y mensajes privados en carpetas separadas." },
  { icon: Filter,     title: "Filtros inteligentes",  desc: "Filtra por invitado, mesa, fecha o tipo de archivo." },
  { icon: Download,   title: "Descarga masiva",       desc: "Descarga todo o una selección como ZIP con un clic." },
  { icon: Heart,      title: "Mensajes privados",     desc: "Videos de 60 seg grabados por los invitados. Badge de no vistos." },
];

export default function SocialPage() {
  return (
    <div className="p-8 max-w-4xl">
      <div className="mb-8">
        <div
          className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold border mb-4"
          style={{ backgroundColor: "var(--surface)", borderColor: "var(--border)", color: "var(--fg-muted)" }}
        >
          Fase 6 · En desarrollo
        </div>
        <h1 className="font-outfit font-bold text-3xl mb-2" style={{ color: "var(--fg)" }}>
          Galería Social
        </h1>
        <p className="text-sm" style={{ color: "var(--fg-muted)" }}>
          Cuando 200 invitados suben sus fotos, la pareja tendrá miles de recuerdos desde ángulos que ningún fotógrafo podría capturar solo.
        </p>
      </div>

      {/* Folders preview */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        {folders.map((folder) => (
          <div
            key={folder.name}
            className="p-4 rounded-xl border text-center"
            style={{ backgroundColor: "var(--surface)", borderColor: "var(--border)" }}
          >
            <span className="text-3xl block mb-2">{folder.icon}</span>
            <p className="text-xs font-semibold mb-1" style={{ color: "var(--fg)" }}>{folder.name}</p>
            <p className="font-outfit font-bold text-xl mb-1" style={{ color: "var(--fg)" }}>{folder.count}</p>
            <p className="text-[10px] leading-tight" style={{ color: "var(--fg-muted)" }}>{folder.desc}</p>
          </div>
        ))}
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
