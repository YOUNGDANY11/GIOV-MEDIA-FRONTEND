import { Link } from 'react-router-dom'

export function PageHeader({ title, subtitle, icon = '◆', actions }) {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-4 shadow-[0_12px_30px_-24px_rgba(0,0,0,0.9)] backdrop-blur-xl">
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/15 via-fuchsia-500/10 to-cyan-500/10" />
      <div className="relative flex items-start justify-between gap-4">
      <div className="min-w-0">
        <div className="inline-flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl grid place-items-center border border-white/10 bg-black/25 text-neutral-100">{icon}</div>
          <div>
            <h1 className="m-0 text-[clamp(1.2rem,3vw,2.1rem)] font-semibold tracking-tight text-neutral-100">{title}</h1>
            {subtitle ? <p className="mt-2 text-sm text-neutral-300">{subtitle}</p> : null}
          </div>
        </div>
      </div>
      {actions ? <div className="flex items-center gap-2">{actions}</div> : null}
      </div>
    </div>
  )
}

export function HeaderLink({ to, children, className = '' }) {
  return (
    <Link to={to} className={`inline-flex items-center h-11 px-4 rounded-xl border border-white/10 bg-black/20 text-neutral-200 hover:bg-white/5 ${className}`.trim()}>
      {children}
    </Link>
  )
}
