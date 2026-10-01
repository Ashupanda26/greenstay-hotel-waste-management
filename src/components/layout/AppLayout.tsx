import { Outlet } from 'react-router-dom'
import SiteHeader from './SiteHeader'
import SiteFooter from './SiteFooter'

export default function AppLayout() {
  return (
    <div className="flex min-h-svh flex-col">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded focus:bg-white focus:px-3 focus:py-2"
      >
        Skip to content
      </a>
      <SiteHeader />
      <main id="main" className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 sm:px-6 lg:py-12">
        <Outlet />
      </main>
      <SiteFooter />
    </div>
  )
}
