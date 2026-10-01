import { useState } from 'react'
import { Link, NavLink } from 'react-router-dom'
import { paths } from '../../routes/paths'
import { navGroups } from './navigation'

const linkClass = ({ isActive }: { isActive: boolean }) =>
  [
    'block rounded-md px-3 py-2 text-sm transition-colors',
    isActive ? 'bg-white/15 text-white' : 'text-white/75 hover:bg-white/10 hover:text-white',
  ].join(' ')

export default function SiteHeader() {
  const [menuOpen, setMenuOpen] = useState(false)
  return (
    <header className="bg-forest text-white">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
        <Link to={paths.landing} className="flex items-center gap-2">
          <img src="/favicon.svg" alt="" className="size-8" />
          <span className="font-display text-lg font-bold">GreenStay</span>
        </Link>

        <nav aria-label="Main" className="hidden items-center gap-6 lg:flex">
          {navGroups.map((group) => (
            <div key={group.heading} className="flex items-center gap-1">
              <span className="mr-1 text-xs text-sage">{group.heading}</span>
              {group.items.map((item) => (
                <NavLink key={item.to} to={item.to} end className={linkClass}>
                  {item.label}
                </NavLink>
              ))}
            </div>
          ))}
        </nav>

        <button
          type="button"
          className="rounded-md px-3 py-2 text-sm text-white/90 hover:bg-white/10 lg:hidden"
          aria-expanded={menuOpen}
          aria-controls="mobile-nav"
          onClick={() => setMenuOpen((open) => !open)}
        >
          {menuOpen ? 'Close' : 'Menu'}
        </button>
      </div>

      {menuOpen && (
        <nav id="mobile-nav" aria-label="Main" className="border-t border-white/10 px-4 pb-4 lg:hidden">
          {navGroups.map((group) => (
            <div key={group.heading} className="mt-3">
              <p className="px-3 pb-1 text-xs text-sage">{group.heading}</p>
              {group.items.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end
                  className={linkClass}
                  onClick={() => setMenuOpen(false)}
                >
                  {item.label}
                </NavLink>
              ))}
            </div>
          ))}
        </nav>
      )}
    </header>
  )
}
