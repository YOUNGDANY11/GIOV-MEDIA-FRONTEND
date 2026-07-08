import { useEffect, useRef, useState } from 'react'
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faArrowUpFromBracket,
  faBars,
  faCalendarDays,
  faChevronDown,
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
  faXmark,
} from '@fortawesome/free-solid-svg-icons'

import logo from '../../assets/logo.png'
import { useAuth } from '../../context/AuthContext'
import { isAdmin, isAthlete } from '../../utils/roles'

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
  const [mobileSection, setMobileSection] = useState(null)

  const role = user?.id_role

  const closeMenus = () => {
    setOpenMenu(null)
    setMobileSection(null)
  }
  const toggleMenu = (id) => setOpenMenu((prev) => (prev === id ? null : id))
  const toggleMobileSection = (id) => setMobileSection((prev) => (prev === id ? null : id))
  const mobileMenuOpen = openMenu === 'mobile'

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
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-[#070a12] via-[#0b1020] to-[#070a12] text-neutral-100">
      <header ref={headerRef} className="sticky top-0 z-10 border-b border-white/10 bg-black/20 backdrop-blur-xl supports-[backdrop-filter]:bg-black/20 shadow-[0_12px_30px_-22px_rgba(0,0,0,0.9)]">
        <div className="h-[2px] w-full bg-gradient-to-r from-indigo-500/0 via-indigo-500/60 to-fuchsia-500/0" />

        <div className="mx-auto max-w-6xl px-4 py-3 flex items-center justify-between gap-4">
          {/* Logo */}
          <Link to="/dashboard" className="font-semibold tracking-wide inline-flex items-center gap-2 shrink-0">
            <img src={logo} alt="G10V Media" className="h-8 w-8 lg:h-10 lg:w-10 rounded-xl object-contain" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-neutral-100 via-neutral-100 to-neutral-300">VERA FUTBOL CLUB</span>
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

          {/* Mobile menu toggle */}
          <button
            type="button"
            className={`lg:hidden inline-flex h-11 w-11 items-center justify-center rounded-xl border transition focus:outline-none focus:ring-2 focus:ring-indigo-500/45 ${mobileMenuOpen ? 'border-white/15 bg-white/10 text-white' : 'border-white/10 bg-black/20 text-neutral-200 hover:bg-white/5'}`}
            aria-haspopup="menu"
            aria-expanded={mobileMenuOpen}
            aria-label={mobileMenuOpen ? 'Cerrar menú' : 'Abrir menú'}
            data-menu-root="mobile"
            onClick={() => { toggleMenu('mobile'); setMobileSection(null) }}
          >
            <FontAwesomeIcon icon={mobileMenuOpen ? faXmark : faBars} />
          </button>
        </div>

        {/* Mobile nav */}
        {mobileMenuOpen ? (
          <div className="border-t border-white/10 lg:hidden" data-menu-root="mobile">
            <nav
              className="mx-auto grid max-w-6xl gap-1 px-4 py-3"
              onClick={(e) => {
                const target = e.target
                if (target instanceof Element && target.closest('a, button[data-mobile-action]')) closeMenus()
              }}
            >
              <MenuLink to="/dashboard" icon={faHouse}>Dashboard</MenuLink>

              {isAdmin(role) ? (
                <div className="mt-1">
                  <button
                    type="button"
                    className="flex w-full items-center justify-between gap-2 rounded-xl px-3 py-2 text-sm text-neutral-200 transition hover:bg-white/5"
                    aria-expanded={mobileSection === 'management'}
                    onClick={() => toggleMobileSection('management')}
                  >
                    <span className="inline-flex items-center gap-2">
                      <FontAwesomeIcon icon={faUsers} className="opacity-80" />
                      <span>Gestión</span>
                    </span>
                    <FontAwesomeIcon icon={faChevronDown} className={`text-[0.85em] opacity-70 transition ${mobileSection === 'management' ? 'rotate-180' : ''}`} />
                  </button>

                  {mobileSection === 'management' ? (
                    <div className="grid gap-1 pl-3 mt-1">
                      <MenuLink to="/users"            icon={faUsers}>Usuarios</MenuLink>
                      <MenuLink to="/trainings"        icon={faDumbbell}>Entrenamientos</MenuLink>
                      <MenuLink to="/weeks"            icon={faCalendarDays}>Semanas</MenuLink>
                      <MenuLink to="/agenda"           icon={faQrcode}>Agenda QR</MenuLink>
                      <MenuLink to="/attendances/list" icon={faClipboardList}>Asistencias</MenuLink>
                      <MenuLink to="/media"            icon={faVideo}>Media</MenuLink>
                    </div>
                  ) : null}
                </div>
              ) : null}

              {isAthlete(role) ? (
                <div className="mt-1">
                  <button
                    type="button"
                    className="flex w-full items-center justify-between gap-2 rounded-xl px-3 py-2 text-sm text-neutral-200 transition hover:bg-white/5"
                    aria-expanded={mobileSection === 'athlete'}
                    onClick={() => toggleMobileSection('athlete')}
                  >
                    <span className="inline-flex items-center gap-2">
                      <FontAwesomeIcon icon={faClipboardCheck} className="opacity-80" />
                      <span>Mi actividad</span>
                    </span>
                    <FontAwesomeIcon icon={faChevronDown} className={`text-[0.85em] opacity-70 transition ${mobileSection === 'athlete' ? 'rotate-180' : ''}`} />
                  </button>

                  {mobileSection === 'athlete' ? (
                    <div className="grid gap-1 pl-3 mt-1">
                      <MenuLink to="/attendance/scan"    icon={faQrcode}>Escanear QR</MenuLink>
                      <MenuLink to="/my-attendances"     icon={faClipboardCheck}>Mis asistencias</MenuLink>
                      <MenuLink to="/media/submit"       icon={faArrowUpFromBracket}>Subir video</MenuLink>
                      <MenuLink to="/media/mine"         icon={faFilm}>Mis videos</MenuLink>
                    </div>
                  ) : null}
                </div>
              ) : null}

              {user ? (
                <div className="mt-2 border-t border-white/10 pt-2">
                  <MenuLink to="/me" icon={faUser}>{user.name} {user.lastname}</MenuLink>
                  <button
                    type="button"
                    data-mobile-action="logout"
                    className="mt-1 flex w-full items-center gap-2 rounded-xl border border-transparent px-3 py-2 text-left text-sm text-neutral-200 transition hover:border-red-400/20 hover:bg-white/5 hover:text-red-400"
                    onClick={logout}
                  >
                    <FontAwesomeIcon icon={faRightFromBracket} className="opacity-80" />
                    <span>Salir</span>
                  </button>
                </div>
              ) : null}
            </nav>
          </div>
        ) : null}
      </header>

      <main className="flex-1 mx-auto w-full max-w-6xl px-4 py-6">
        <Outlet />
      </main>

      <footer className="border-t border-white/10 bg-black/20 backdrop-blur-xl supports-[backdrop-filter]:bg-black/20">
        <div className="h-[2px] w-full bg-gradient-to-r from-indigo-500/0 via-indigo-500/60 to-fuchsia-500/0" />

        <div className="mx-auto max-w-6xl px-4 py-10 grid gap-8 sm:grid-cols-3">
          <div>
            <div className="inline-flex items-center gap-2">
              <img src={logo} alt="VERA FUTBOL CLUB" className="h-9 w-9 rounded-xl object-contain" />
              <span className="font-semibold tracking-wide text-transparent bg-clip-text bg-gradient-to-r from-neutral-100 via-neutral-100 to-neutral-300">VERA FUTBOL CLUB</span>
            </div>
            <p className="mt-3 max-w-xs text-sm text-neutral-400">
              Plataforma de gestión deportiva enfocada al fútbol y al fútbol sala, con planificación integral de entrenamientos y analítica de rendimiento.
            </p>
          </div>

          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-neutral-400">Síguenos</h3>
            <div className="mt-3 flex items-center gap-3">
              <a
                href="https://web.facebook.com/verafc"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Facebook de Vera Futbol Club"
                className="h-10 w-10 rounded-xl border border-white/10 bg-white/5 flex items-center justify-center text-neutral-300 transition hover:border-white/20 hover:bg-white/10 hover:text-white"
              >
                <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor" aria-hidden="true">
                  <path d="M22 12.06C22 6.505 17.523 2 12 2S2 6.505 2 12.06c0 5.02 3.657 9.184 8.438 9.94v-7.03H7.898v-2.91h2.54V9.797c0-2.507 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.631.772-1.631 1.563v1.876h2.773l-.443 2.91h-2.33V22c4.78-.756 8.438-4.92 8.438-9.94Z" />
                </svg>
              </a>

              <a
                href="https://www.instagram.com/verafutbolclub/"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram de Vera Futbol Club"
                className="h-10 w-10 rounded-xl border border-white/10 bg-white/5 flex items-center justify-center text-neutral-300 transition hover:border-white/20 hover:bg-white/10 hover:text-white"
              >
                <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor" aria-hidden="true">
                  <path d="M12 2c2.717 0 3.056.01 4.122.06 1.065.05 1.79.217 2.428.465a4.9 4.9 0 0 1 1.771 1.153 4.9 4.9 0 0 1 1.153 1.771c.248.637.415 1.363.465 2.428.05 1.066.06 1.405.06 4.122s-.01 3.056-.06 4.122c-.05 1.065-.217 1.79-.465 2.428a4.9 4.9 0 0 1-1.153 1.771 4.9 4.9 0 0 1-1.771 1.153c-.637.248-1.363.415-2.428.465-1.066.05-1.405.06-4.122.06s-3.056-.01-4.122-.06c-1.065-.05-1.79-.217-2.428-.465a4.9 4.9 0 0 1-1.771-1.153 4.9 4.9 0 0 1-1.153-1.771c-.248-.637-.415-1.363-.465-2.428C2.01 15.056 2 14.717 2 12s.01-3.056.06-4.122c.05-1.065.217-1.79.465-2.428A4.9 4.9 0 0 1 3.68 3.68 4.9 4.9 0 0 1 5.45 2.525c.637-.248 1.363-.415 2.428-.465C8.944 2.01 9.283 2 12 2Zm0 1.802c-2.67 0-2.986.01-4.04.059-.976.045-1.505.207-1.858.344-.467.182-.8.399-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.858-.05 1.054-.059 1.37-.059 4.04s.01 2.986.059 4.04c.045.976.207 1.505.344 1.858.182.467.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.858.344 1.054.05 1.37.059 4.04.059s2.986-.01 4.04-.059c.976-.045 1.505-.207 1.858-.344.467-.182.8-.399 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.858.05-1.054.059-1.37.059-4.04s-.01-2.986-.059-4.04c-.045-.976-.207-1.505-.344-1.858a3.1 3.1 0 0 0-.748-1.15 3.1 3.1 0 0 0-1.15-.748c-.353-.137-.882-.3-1.858-.344-1.054-.05-1.37-.059-4.04-.059Zm0 4.595a5.603 5.603 0 1 1 0 11.206 5.603 5.603 0 0 1 0-11.206Zm0 1.802a3.8 3.8 0 1 0 0 7.601 3.8 3.8 0 0 0 0-7.601Zm5.838-1.997a1.31 1.31 0 1 1-2.618 0 1.31 1.31 0 0 1 2.618 0Z" />
                </svg>
              </a>

              <a
                href="https://www.tiktok.com/@verafutbolclub"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="TikTok de Vera Futbol Club"
                className="h-10 w-10 rounded-xl border border-white/10 bg-white/5 flex items-center justify-center text-neutral-300 transition hover:border-white/20 hover:bg-white/10 hover:text-white"
              >
                <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor" aria-hidden="true">
                  <path d="M16.6 2h-3.2v13.4c0 1.5-1.22 2.72-2.72 2.72a2.72 2.72 0 0 1-2.72-2.72 2.72 2.72 0 0 1 2.72-2.72c.28 0 .55.04.8.12v-3.28a5.9 5.9 0 0 0-.8-.06A6 6 0 0 0 4.68 15.4a6 6 0 0 0 6 6 6 6 0 0 0 6-6V9.07a7.3 7.3 0 0 0 4.24 1.36V7.2a4.1 4.1 0 0 1-4.32-4.09V2Z" />
                </svg>
              </a>
            </div>
          </div>

          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-neutral-400">Desarrollado por</h3>
            <div className="mt-3 text-sm">
              <div className="font-medium text-neutral-100">Daniel Jose Morales Teatino</div>
              <a href="mailto:danielmoralesteatino2004@gmail.com" className="text-neutral-400 transition hover:text-neutral-200">
                danielmoralesteatino2004@gmail.com
              </a>
            </div>
          </div>
        </div>

        <div className="border-t border-white/10">
          <div className="mx-auto max-w-6xl px-4 py-4 text-xs text-neutral-500 flex flex-col sm:flex-row items-center justify-between gap-2">
            <span>© {new Date().getFullYear()} VERA FUTBOL CLUB. Todos los derechos reservados.</span>
            <span>Ingeniería de software: Daniel Jose Morales Teatino</span>
          </div>
        </div>
      </footer>
    </div>
  )
}
