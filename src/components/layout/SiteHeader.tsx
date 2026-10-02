import { useState } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import { paths } from '../../routes/paths'
import { DemoActor, DemoModeTag } from '../demo/DemoActor'
import Icon from '../ui/Icon'
import { workspaceForPath, workspaces, type WorkspaceId } from './navigation'

function Logo({ withTagline }: { withTagline: boolean }) {
  return (
    <Link to={paths.landing} className="flex items-center gap-2.5 rounded-lg">
      <span className="grid size-9 place-items-center rounded-lg bg-brand-600 text-white">
        <Icon name="leaf" className="size-5" />
      </span>
      <span className="leading-tight">
        <span className="block font-display text-lg font-bold tracking-tight">GreenStay</span>
        {withTagline && <span className="block text-xs text-muted">Hotel Waste Management</span>}
      </span>
    </Link>
  )
}

/** Staff | Waste Manager switch. */
function WorkspaceSwitch({ active, onNavigate }: { active: WorkspaceId | null; onNavigate?: () => void }) {
  return (
    <nav aria-label="Workspace" className="inline-flex rounded-lg bg-canvas p-1 ring-1 ring-line ring-inset">
      {Object.values(workspaces).map((ws) => {
        const isActive = ws.id === active
        return (
          <Link
            key={ws.id}
            to={ws.home}
            aria-current={isActive ? 'page' : undefined}
            onClick={onNavigate}
            className={[
              'inline-flex items-center gap-2 rounded-md px-3 py-1.5 text-sm font-semibold transition-colors',
              isActive ? 'bg-surface text-brand-700 shadow-card' : 'text-muted hover:text-ink',
            ].join(' ')}
          >
            <Icon name={ws.icon} className="size-4" />
            {ws.label}
          </Link>
        )
      })}
    </nav>
  )
}

const sectionLinkClass = ({ isActive }: { isActive: boolean }) =>
  [
    'inline-flex items-center gap-2 border-b-2 px-1 py-3 text-sm font-semibold transition-colors',
    isActive ? 'border-brand-600 text-brand-700' : 'border-transparent text-muted hover:border-line-strong hover:text-ink',
  ].join(' ')

export default function SiteHeader() {
  const { pathname } = useLocation()
  const active = workspaceForPath(pathname)
  const [menuOpen, setMenuOpen] = useState(false)
  const workspace = active ? workspaces[active] : null

  return (
    <header className="sticky top-0 z-30 border-b border-line bg-surface/95 backdrop-blur supports-[backdrop-filter]:bg-surface/85">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <Logo withTagline={!workspace} />

        {workspace && (
          <div className="hidden md:block">
            <WorkspaceSwitch active={active} />
          </div>
        )}

        <div className="flex items-center gap-3">
          {workspace && (
            <div className="hidden lg:block">
              <DemoActor workspace={workspace.id} idPrefix="header" />
            </div>
          )}
          <DemoModeTag />
          {workspace && (
            <button
              type="button"
              className="grid size-10 place-items-center rounded-lg text-ink hover:bg-canvas lg:hidden"
              aria-expanded={menuOpen}
              aria-controls="workspace-menu"
              onClick={() => setMenuOpen((open) => !open)}
            >
              <Icon name={menuOpen ? 'x' : 'menu'} />
              <span className="sr-only">{menuOpen ? 'Close menu' : 'Open menu'}</span>
            </button>
          )}
        </div>
      </div>

      {workspace && menuOpen && (
        <div id="workspace-menu" className="space-y-4 border-t border-line px-4 py-4 sm:px-6 lg:hidden">
          <div className="md:hidden">
            <p className="mb-2 text-xs font-semibold tracking-wider text-muted uppercase">Workspace</p>
            <WorkspaceSwitch active={active} onNavigate={() => setMenuOpen(false)} />
          </div>
          <div>
            <p className="mb-2 text-xs font-semibold tracking-wider text-muted uppercase">Acting as</p>
            <DemoActor workspace={workspace.id} idPrefix="menu" />
          </div>
        </div>
      )}

      {workspace && (
        <div className="border-t border-line">
          <nav aria-label={`${workspace.label} sections`} className="mx-auto flex max-w-7xl gap-6 px-4 sm:px-6 lg:px-8">
            {workspace.items.map((item) => (
              <NavLink key={item.to} to={item.to} end={item.end} className={sectionLinkClass} onClick={() => setMenuOpen(false)}>
                <Icon name={item.icon} className="hidden size-4 sm:block" />
                {item.label}
              </NavLink>
            ))}
          </nav>
        </div>
      )}
    </header>
  )
}
