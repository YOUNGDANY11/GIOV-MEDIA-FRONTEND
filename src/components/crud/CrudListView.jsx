import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'

import { Alert } from '../Alert'
import { Button } from '../ui/Button'
import { Card } from '../ui/Card'
import { DataTable } from '../ui/DataTable'
import { Input } from '../ui/Input'
import { icons } from '../ui/icons'

const flatten = (value) => {
  if (value == null) return ''
  if (Array.isArray(value)) return value.map(flatten).join(' ')
  if (typeof value === 'object') return Object.values(value).map(flatten).join(' ')
  return String(value)
}

export function CrudListView({
  title,
  subtitle,
  load,
  columns,
  getRowKey,
  createPath,
  rowActions,
  onDelete,
  emptyText = 'No hay registros',
}) {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [rows, setRows] = useState([])
  const [query, setQuery] = useState('')

  useEffect(() => {
    let alive = true

    const boot = async () => {
      setLoading(true)
      setError('')
      try {
        const data = await load()
        if (!alive) return
        setRows(Array.isArray(data) ? data : [])
      } catch (err) {
        if (!alive) return
        setError(err?.message || 'No se pudieron cargar los datos')
        setRows([])
      } finally {
        if (alive) setLoading(false)
      }
    }

    boot()
    return () => {
      alive = false
    }
  }, [load])

  const filtered = useMemo(() => {
    const normalized = query.trim().toLowerCase()
    if (!normalized) return rows
    return rows.filter((row) => flatten(row).toLowerCase().includes(normalized))
  }, [query, rows])

  const actions = []
  if (createPath) {
    actions.push(
      <Link key="create" to={createPath} className="inline-flex items-center h-11 px-4 rounded-lg bg-gradient-to-r from-accent to-accent-2 text-black">
        <span>{icons.plus}</span>
        <span>Nuevo</span>
      </Link>,
    )
  }

  return (
    <div className="flex flex-col gap-4">
      <Card>
        <div className="flex items-center justify-between gap-4">
          <div>
            <div className="text-lg font-semibold tracking-tight">{title}</div>
            {subtitle ? <div className="text-neutral-300 mt-1">{subtitle}</div> : null}
          </div>
          <div className="flex items-center gap-3">
            <Input
              className="max-w-xs"
              placeholder="Buscar"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            {actions}
          </div>
        </div>
      </Card>

      {error ? <Alert type="error">{error}</Alert> : null}

      <Card>
        {loading ? (
          <div className="text-neutral-400">Cargando...</div>
        ) : (
          <DataTable
            rows={filtered}
            columns={columns}
            getRowKey={getRowKey}
            rowActions={rowActions}
            emptyText={emptyText}
          />
        )}
      </Card>

      {onDelete ? <div className="text-neutral-400">Los registros se eliminan de forma permanente.</div> : null}
    </div>
  )
}
