import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import { AppLayout } from '@/components/layout/AppLayout'
import { RequireAuth } from '@/components/auth/RequireAuth'
import { AccountPage } from '@/pages/AccountPage'
import { DashboardPage } from '@/pages/DashboardPage'
import { HomePage } from '@/pages/HomePage'
import { PlanDetailPage } from '@/pages/PlanDetailPage'
import { PlanWizardPage } from '@/pages/PlanWizardPage'
import { SignInPage } from '@/pages/SignInPage'

const router = createBrowserRouter([
  {
    path: '/',
    element: <AppLayout />,
    children: [
      { index: true, element: <HomePage /> },
      { path: 'sign-in/*', element: <SignInPage /> },
      {
        element: <RequireAuth />,
        children: [
          { path: 'plans', element: <DashboardPage /> },
          { path: 'plans/:planId', element: <PlanDetailPage /> },
          { path: 'plan/new', element: <PlanWizardPage /> },
          { path: 'account', element: <AccountPage /> },
        ],
      },
    ],
  },
])

export default function App() {
  return <RouterProvider router={router} />
}
