import { useState } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons'

export function Input({ label, hint, as = 'input', className = '', ...props }) {
  const isPassword = props.type === 'password'
  const [show, setShow] = useState(false)
  const Control = as

  return (
    <label className={`flex flex-col gap-2 ${className}`.trim()}>
      {label ? <span className="text-sm text-neutral-200">{label}</span> : null}
      <div className="relative">
        <Control
          className={`w-full rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-sm text-neutral-100 placeholder:text-neutral-500 outline-none focus:ring-2 focus:ring-indigo-500/50${isPassword ? ' pr-10' : ''}`}
          {...props}
          type={isPassword ? (show ? 'text' : 'password') : props.type}
        />
        {isPassword ? (
          <button
            type="button"
            tabIndex={-1}
            onClick={() => setShow((s) => !s)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-200 transition-colors"
            aria-label={show ? 'Ocultar contraseña' : 'Mostrar contraseña'}
          >
            <FontAwesomeIcon icon={show ? faEyeSlash : faEye} />
          </button>
        ) : null}
      </div>
      {hint ? <span className="text-sm text-neutral-400">{hint}</span> : null}
    </label>
  )
}
