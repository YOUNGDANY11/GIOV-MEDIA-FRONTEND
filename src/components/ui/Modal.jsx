export function Modal({ open, title, children, footer, onClose }) {
  if (!open) return null

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-md grid place-items-center p-5 z-50" onMouseDown={onClose}>
      <div className="relative w-full max-w-3xl overflow-hidden rounded-2xl border border-white/10 bg-black/65 p-4 shadow-2xl shadow-black/50 backdrop-blur-xl" onMouseDown={(event) => event.stopPropagation()}>
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/15 via-fuchsia-500/10 to-cyan-500/10" />
        <div className="relative">
        <div className="flex items-center justify-between mb-4">
          <div className="text-lg font-semibold text-neutral-100">{title}</div>
          <button type="button" className="h-9 px-3 rounded-xl border border-white/10 bg-black/20 text-neutral-200 hover:bg-white/5" onClick={onClose}>Cerrar</button>
        </div>
        {children}
        {footer ? <div className="mt-4">{footer}</div> : null}
        </div>
      </div>
    </div>
  )
}
