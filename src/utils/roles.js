const ROLE_LABELS = {
  1: 'Administrador',
  2: 'Deportista',
  3: 'Técnico',
  4: 'Staff',
  5: 'Médico',
  6: 'Fisioterapeuta',
  7: 'Nutrición',
}

export const roleName = (role) => ROLE_LABELS[Number(role)] || `Rol ${role ?? '—'}`

export const isAdmin = (role) => Number(role) === 1
export const isAthlete = (role) => Number(role) === 2
