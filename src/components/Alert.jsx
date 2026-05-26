export function Alert({ type = 'info', children }) {
  const styles = {
    info: 'border-cyan-500/20 bg-cyan-500/10 text-cyan-100',
    error: 'border-red-500/20 bg-red-500/10 text-red-100',
    success: 'border-emerald-500/20 bg-emerald-500/10 text-emerald-100',
    warning: 'border-amber-500/20 bg-amber-500/10 text-amber-100',
  }

  return <div className={`rounded-xl border px-3 py-2 text-sm ${styles[type] ?? styles.info}`}>{children}</div>
}
