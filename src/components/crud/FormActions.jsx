import { Link } from 'react-router-dom'

import { Button } from '../ui/Button'

export function FormActions({ submitting = false, cancelTo = '..', cancelLabel = 'Cancelar', submitLabel = 'Guardar' }) {
  return (
    <div className="flex items-center justify-end mt-2">
      <div className="flex items-center gap-3">
        <Link to={cancelTo} className="inline-flex items-center h-11 px-4 rounded-xl border border-white/10 bg-black/20 text-neutral-200 hover:bg-white/5">
          {cancelLabel}
        </Link>
        <Button type="submit" disabled={submitting}>
          {submitting ? 'Guardando...' : submitLabel}
        </Button>
      </div>
    </div>
  )
}
