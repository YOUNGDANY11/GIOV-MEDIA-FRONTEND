export function Button({ children, variant = 'primary', className = '', icon, ...props }) {
  const base = 'inline-flex items-center gap-2 rounded-xl font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/45'
  const primary = 'h-10 px-4 btn-minimal btn-neon'
  const secondary = 'h-10 px-4 btn-minimal btn-ghost'
  const ghost = 'h-10 px-4 btn-minimal border-transparent text-neutral-200 hover:bg-white/5'

  const variantClass = variant === 'primary' ? primary : variant === 'ghost' ? ghost : secondary
  const classes = [base, variantClass, className].filter(Boolean).join(' ')

  return (
    <button className={classes} {...props}>
      {icon ? <span>{icon}</span> : null}
      <span>{children}</span>
    </button>
  )
}
