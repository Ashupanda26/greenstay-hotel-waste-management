import { lazy, Suspense } from 'react'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import AppLayout from './components/layout/AppLayout'
import { paths } from './routes/paths'
import LandingPage from './pages/LandingPage'
import NotFoundPage from './pages/NotFoundPage'
import StaffDashboardPage from './pages/staff/StaffDashboardPage'
import ReportWastePage from './pages/staff/ReportWastePage'
import MyRequestsPage from './pages/staff/MyRequestsPage'
import RequestDetailsPage from './pages/shared/RequestDetailsPage'
import ManagerDashboardPage from './pages/manager/ManagerDashboardPage'
import RequestManagementPage from './pages/manager/RequestManagementPage'
import StateMessage from './components/ui/StateMessage'

// Loaded only when opened, so the charting library isn't in the main bundle.
const AnalyticsPage = lazy(() => import('./pages/manager/AnalyticsPage'))

const router = createBrowserRouter([
  {
    element: <AppLayout />,
    children: [
      { path: paths.landing, element: <LandingPage /> },

      // Staff (Housekeeping, Kitchen, Front Desk)
      { path: paths.staff.dashboard, element: <StaffDashboardPage /> },
      { path: paths.staff.report, element: <ReportWastePage /> },
      { path: paths.staff.requests, element: <MyRequestsPage /> },
      { path: `${paths.staff.requests}/:requestId`, element: <RequestDetailsPage /> },

      // Waste Manager
      { path: paths.manager.dashboard, element: <ManagerDashboardPage /> },
      { path: paths.manager.requests, element: <RequestManagementPage /> },
      { path: `${paths.manager.requests}/:requestId`, element: <RequestDetailsPage /> },
      {
        path: paths.manager.analytics,
        element: (
          <Suspense fallback={<StateMessage kind="loading" title="Loading analytics…" />}>
            <AnalyticsPage />
          </Suspense>
        ),
      },

      { path: '*', element: <NotFoundPage /> },
    ],
  },
])

export default function App() {
  return <RouterProvider router={router} />
}
