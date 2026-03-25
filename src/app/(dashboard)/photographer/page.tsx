import { Camera, Link2, Upload, Images, RefreshCw } from "lucide-react";

const features = [
  { icon: Link2,     title: "Token único",          desc: "Genera un link especial para el fotógrafo. Sin cuenta, sin contraseña. Solo el link." },
  { icon: Upload,    title: "Subida masiva",         desc: "Drag & drop o selección múltiple de archivos. Sube cientos de fotos en lote." },
  { icon: Images,    title: "Vista de progreso",     desc: "Miniaturas en tiempo real mientras se suben. Ve qué ya está guardado." },
  { icon: RefreshCw, title: "Regenerar token",       desc: "Si el link se compromete, regenera un nuevo token con un clic desde el admin." },
];

export default function PhotographerPage() {
  return (
    <div className="p-8 max-w-3xl">
      <div className="mb-8">
        <div
          className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold border mb-4"
          style={{ backgroundColor: "var(--surface)", borderColor: "var(--border)", color: "var(--fg-muted)" }}
        >
          Fase 6 · En desarrollo
        </div>
        <h1 className="font-outfit font-bold text-3xl mb-2" style={{ color: "var(--fg)" }}>
          Módulo Fotógrafo
        </h1>
        <p className="text-sm" style={{ color: "var(--fg-muted)" }}>
          El fotógrafo recibe un link especial para subir las fotos oficiales del evento. Sin necesidad de cuenta. Las fotos van directo a la carpeta "Fotos Oficiales".
        </p>
      </div>

      {/* How it works */}
      <div
        className="p-5 rounded-2xl border mb-6"
        style={{ backgroundColor: "var(--surface)", borderColor: "var(--border)" }}
      >
        <p className="text-xs font-bold uppercase tracking-widest mb-4" style={{ color: "var(--fg-muted)" }}>
          Flujo de uso
        </p>
        <div className="space-y-3">
          {[
            { step: "1", text: "Admin genera el token del fotógrafo desde este módulo." },
            { step: "2", text: "Se envía el link único al fotógrafo: domain.com/foto/[token]" },
            { step: "3", text: "El fotógrafo sube fotos desde su computadora o teléfono." },
            { step: "4", text: "Las fotos aparecen en la galería bajo 'Fotos Oficiales'." },
          ].map(({ step, text }) => (
            <div key={step} className="flex items-start gap-3">
              <span
                className="w-6 h-6 rounded-full bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-xs font-bold text-indigo-500 flex-shrink-0 mt-0.5"
              >
                {step}
              </span>
              <p className="text-sm" style={{ color: "var(--fg-muted)" }}>{text}</p>
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
