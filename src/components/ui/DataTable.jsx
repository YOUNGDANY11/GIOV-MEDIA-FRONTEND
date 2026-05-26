export function DataTable({ rows = [], columns = [], getRowKey, rowActions, emptyText = 'Sin resultados' }) {
  return (
    <div className="overflow-auto rounded-2xl border border-white/10 bg-black/20 backdrop-blur-xl">
      <table className="w-full min-w-[720px] table-auto border-collapse">
        <thead className="bg-black/20">
          <tr>
            {columns.map((column) => (
              <th key={column.key || column.label} className="text-xs text-neutral-300 uppercase font-medium p-3 text-left">{column.label}</th>
            ))}
            {rowActions ? <th className="text-xs text-neutral-300 uppercase font-medium p-3 text-left">Acciones</th> : null}
          </tr>
        </thead>
        <tbody className="divide-y divide-white/10">
          {rows.length === 0 ? (
            <tr>
              <td colSpan={columns.length + (rowActions ? 1 : 0)} className="p-4 text-neutral-400">{emptyText}</td>
            </tr>
          ) : rows.map((row, index) => (
            <tr key={getRowKey ? getRowKey(row) : index} className="hover:bg-white/5">
              {columns.map((column) => (
                <td key={column.key || column.label} data-label={column.label} className="p-3 align-top">
                  {column.render ? column.render(row) : String(row?.[column.key] ?? '')}
                </td>
              ))}
              {rowActions ? <td data-label="Acciones" className="p-3 align-top">{rowActions(row)}</td> : null}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
