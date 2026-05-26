export function Select({ label, hint, children, className = '', ...props }) {
  return (
    <label className={`flex flex-col gap-2 ${className}`.trim()}>
      {label ? <span className="text-sm text-neutral-200">{label}</span> : null}
      <div>
        <select className="w-full rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-sm text-neutral-100 outline-none focus:ring-2 focus:ring-indigo-500/50" {...props}>{children}</select>
      </div>
      {hint ? <span className="text-sm text-neutral-400">{hint}</span> : null}
    </label>
  )
}
