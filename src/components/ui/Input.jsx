export function Input({ label, hint, as = 'input', className = '', ...props }) {
  const Control = as

  return (
    <label className={`flex flex-col gap-2 ${className}`.trim()}>
      {label ? <span className="text-sm text-neutral-200">{label}</span> : null}
      <div>
        <Control
          className="w-full rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-sm text-neutral-100 placeholder:text-neutral-500 outline-none focus:ring-2 focus:ring-indigo-500/50"
          {...props}
        />
      </div>
      {hint ? <span className="text-sm text-neutral-400">{hint}</span> : null}
    </label>
  )
}
