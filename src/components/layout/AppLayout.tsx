import { Outlet } from 'react-router-dom'
import SiteHeader from './SiteHeader'
import SiteFooter from './SiteFooter'
import DemoStaffProvider from '../demo/DemoStaffProvider'

export default function AppLayout() {
  return (
    // The provider wraps the header too, so it can show and switch the demo staff member.
    <DemoStaffProvider>
      <div className="flex min-h-svh flex-col">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:absolute focus:top-3 focus:left-3 focus:z-50 focus:rounded-lg focus:bg-surface focus:px-3 focus:py-2 focus:shadow-raised"
        >
          Skip to content
        </a>
        <SiteHeader />
        <main id="main" className="mx-auto w-full max-w-7xl flex-1 px-4 py-6 sm:px-6 sm:py-8 lg:px-8 lg:py-10">
          <Outlet />
        </main>
        <SiteFooter />
      </div>
    </DemoStaffProvider>
  )
}
