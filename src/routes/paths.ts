// Single source of truth for URLs, so links and routes never drift apart.
export const paths = {
  landing: '/',
  staff: {
    dashboard: '/staff',
    report: '/staff/report',
    requests: '/staff/requests',
    requestDetails: (id: string) => `/staff/requests/${id}`,
  },
  manager: {
    dashboard: '/manager',
    requests: '/manager/requests',
    requestDetails: (id: string) => `/manager/requests/${id}`,
    analytics: '/manager/analytics',
  },
} as const
