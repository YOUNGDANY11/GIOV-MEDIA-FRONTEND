import { useEffect, useRef, useState } from 'react'
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faArrowUpFromBracket,
  faCalendarDays,
  faChevronDown,
  faCircleCheck,
  faClipboardCheck,
  faClipboardList,
  faDumbbell,
  faFilm,
  faHouse,
  faPlus,
  faQrcode,
  faRightFromBracket,
  faUser,
  faUsers,
  faVideo,
} from '@fortawesome/free-solid-svg-icons'

import { useAuth } from '../../context/AuthContext'
import { isAdmin, isAthlete } from '../../utils/roles'

const navItem = (to, label, icon) => ({ to, label, icon })

const navTriggerClass = 'px-3 py-2 rounded-xl text-sm border transition border-white/0 text-neutral-200 hover:bg-white/5 hover:border-white/10 inline-flex items-center gap-2 focus:outline-none focus:ring-2 focus:ring-indigo-500/45'
const topLinkClass = ({ isActive }) => `${navTriggerClass} ${isActive ? 'bg-white/10 text-white border-white/15 shadow-[0_10px_30px_-20px_rgba(99,102,241,0.7)]' : ''}`
const menuItemClass = ({ isActive }) => `block w-full rounded-xl px-3 py-2 text-sm border transition text-left ${isActive ? 'bg-white/10 text-white border-white/15' : 'border-transparent text-neutral-200 hover:bg-white/5 hover:border-white/10'}`

function MenuLink({ to, icon, children }) {
  return (
    <NavLink className={menuItemClass} to={to}>
      <span className="inline-flex items-center gap-2">
        {icon ? <FontAwesomeIcon icon={icon} className="opacity-80" /> : null}
        <span>{children}</span>
      </span>
    </NavLink>
  )
}

function DropdownMenu({ id, label, icon, open, onToggle, onClose, align = 'left', children }) {
  return (
    <div className="relative" data-menu-root={id}>
      <button
        type="button"
        className={`${navTriggerClass} ${open ? 'bg-white/10 text-white border-white/15 shadow-[0_10px_30px_-20px_rgba(99,102,241,0.7)]' : ''}`}
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={onToggle}
      >
        <span className="inline-flex items-center gap-2">
          {icon ? <FontAwesomeIcon icon={icon} className="opacity-80" /> : null}
          <span>{label}</span>
        </span>
        <FontAwesomeIcon icon={faChevronDown} className={`text-[0.85em] opacity-70 transition ${open ? 'rotate-180' : ''}`} />
      </button>

      {open ? (
        <div className={`mt-2 sm:mt-0 sm:absolute sm:top-[calc(100%+10px)] sm:z-20 sm:min-w-64 ${align === 'right' ? 'sm:right-0' : 'sm:left-0'}`} role="menu" onClick={(e) => {
          const target = e.target
          if (target instanceof Element && target.closest('a')) onClose()
        }}>
          <div className="rounded-2xl border border-white/10 bg-black/65 backdrop-blur-xl p-2 shadow-2xl shadow-black/50">
            <div className="grid gap-1">{children}</div>
          </div>
        </div>
      ) : null}
    </div>
  )
}

export function AppLayout() {
  const { user, logout } = useAuth()
  const location = useLocation()
  const headerRef = useRef(null)
  const [openMenu, setOpenMenu] = useState(null)

  const role = user?.id_role

  const closeMenus = () => setOpenMenu(null)
  const toggleMenu = (id) => setOpenMenu((prev) => (prev === id ? null : id))

  // Mobile nav links (Dashboard is always shown separately as the first item)
  const links = [
    navItem('/me', 'Mi perfil', faUser),
    navItem('/trainings', 'Entrenamientos', faDumbbell),
  ]

  if (isAdmin(role)) {
    links.push(navItem('/agenda',            'Agenda QR',    faQrcode))
    links.push(navItem('/attendances/list',  'Asistencias',  faClipboardList))
    links.push(navItem('/users',             'Usuarios',     faUsers))
    links.push(navItem('/weeks',             'Semanas',      faCalendarDays))
    links.push(navItem('/media',             'Media',        faVideo))
  }

  if (isAthlete(role)) {
    links.push(navItem('/attendance/scan',    'Escanear QR',        faQrcode))
    links.push(navItem('/my-attendances',     'Mis asistencias',    faClipboardCheck))
    links.push(navItem('/my-attendances/new', 'Registrar',          faCircleCheck))
    links.push(navItem('/media/submit',       'Subir video',        faArrowUpFromBracket))
    links.push(navItem('/media/mine',         'Mis videos',         faFilm))
  }

  useEffect(() => {
    if (!openMenu) return undefined

    const onPointerDown = (event) => {
      const target = event.target
      if (!(target instanceof Element)) return
      if (!target.closest('[data-menu-root]')) closeMenus()
    }

    const onKeyDown = (event) => {
      if (event.key === 'Escape') closeMenus()
    }

    document.addEventListener('pointerdown', onPointerDown)
    document.addEventListener('keydown', onKeyDown)

    return () => {
      document.removeEventListener('pointerdown', onPointerDown)
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [openMenu])

  useEffect(() => {
    closeMenus()
  }, [location.pathname])

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#070a12] via-[#0b1020] to-[#070a12] text-neutral-100">
      <header ref={headerRef} className="sticky top-0 z-10 border-b border-white/10 bg-black/20 backdrop-blur-xl supports-[backdrop-filter]:bg-black/20 shadow-[0_12px_30px_-22px_rgba(0,0,0,0.9)]">
        <div className="h-[2px] w-full bg-gradient-to-r from-indigo-500/0 via-indigo-500/60 to-fuchsia-500/0" />

        <div className="mx-auto max-w-6xl px-4 py-3 flex items-center justify-between gap-4">
          {/* Logo */}
          <Link to="/dashboard" className="font-semibold tracking-wide inline-flex items-center gap-2 shrink-0">
            <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-transparent bg-clip-text bg-gradient-to-r from-neutral-100 via-neutral-100 to-neutral-300">G</span>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-neutral-100 via-neutral-100 to-neutral-300">G10V MEDIA</span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden lg:flex items-center gap-2 flex-wrap justify-end">
            <NavLink className={topLinkClass} to="/dashboard">
              <FontAwesomeIcon icon={faHouse} className="opacity-80" />
              <span>Dashboard</span>
            </NavLink>

            {isAdmin(role) ? (
              <DropdownMenu id="management" label="Gestión" icon={faUsers} open={openMenu === 'management'} onToggle={() => toggleMenu('management')} onClose={closeMenus}>
                <MenuLink to="/users"            icon={faUsers}>Usuarios</MenuLink>
                <MenuLink to="/trainings"        icon={faDumbbell}>Entrenamientos</MenuLink>
                <MenuLink to="/weeks"            icon={faCalendarDays}>Semanas</MenuLink>
                <MenuLink to="/agenda"           icon={faQrcode}>Agenda QR</MenuLink>
                <MenuLink to="/attendances/list" icon={faClipboardList}>Asistencias</MenuLink>
                <MenuLink to="/media"            icon={faVideo}>Media</MenuLink>
              </DropdownMenu>
            ) : null}

            {isAthlete(role) ? (
              <DropdownMenu id="athlete" label="Mi actividad" icon={faClipboardCheck} open={openMenu === 'athlete'} onToggle={() => toggleMenu('athlete')} onClose={closeMenus} align="right">
                <MenuLink to="/attendance/scan"    icon={faQrcode}>Escanear QR</MenuLink>
                <MenuLink to="/my-attendances"     icon={faClipboardCheck}>Mis asistencias</MenuLink>
                <MenuLink to="/my-attendances/new" icon={faCircleCheck}>Registrar asistencia</MenuLink>
                <MenuLink to="/media/submit"       icon={faArrowUpFromBracket}>Subir video</MenuLink>
                <MenuLink to="/media/mine"         icon={faFilm}>Mis videos</MenuLink>
              </DropdownMenu>
            ) : null}

            {/* Avatar / perfil */}
            {user ? (
              <NavLink className={topLinkClass} to="/me">
                <span className="h-7 w-7 rounded-full border border-white/10 bg-white/5 flex items-center justify-center">
                  <FontAwesomeIcon icon={faUser} className="opacity-80" />
                </span>
                <span className="hidden sm:inline">{user.name} {user.lastname}</span>
              </NavLink>
            ) : null}

            {/* Botón cerrar sesión */}
            {user ? (
              <button
                type="button"
                className={`${navTriggerClass} hover:text-red-400 hover:border-red-400/20`}
                onClick={logout}
                title="Cerrar sesión"
              >
                <FontAwesomeIcon icon={faRightFromBracket} className="opacity-80" />
                <span>Salir</span>
              </button>
            ) : null}
          </div>
        </div>

        {/* Mobile nav */}
        <div className="border-t border-white/10 lg:hidden">
          <nav className="mx-auto max-w-6xl px-4 py-2 flex flex-wrap gap-2">
            <NavLink className={topLinkClass} to="/dashboard">
              <FontAwesomeIcon icon={faHouse} className="opacity-80" />
              <span>Dashboard</span>
            </NavLink>

            {links.slice(0, 3).map((item) => (
              <NavLink key={item.to} className={topLinkClass} to={item.to}>
                <FontAwesomeIcon icon={item.icon} className="opacity-80" />
                <span>{item.label}</span>
              </NavLink>
            ))}

            {/* Logout móvil */}
            {user ? (
              <button
                type="button"
                className={`${navTriggerClass} hover:text-red-400 hover:border-red-400/20`}
                onClick={logout}
                title="Cerrar sesión"
              >
                <FontAwesomeIcon icon={faRightFromBracket} className="opacity-80" />
                <span>Salir</span>
              </button>
            ) : null}
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-6">
        <Outlet />
      </main>
    </div>
  )
}
