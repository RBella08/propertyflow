import { createBrowserRouter } from 'react-router';
import type { RouteObject } from 'react-router';
import { PublicLayout } from '@/layouts/PublicLayout';
import { AuthLayout } from '@/layouts/AuthLayout';
import { DashboardLayout } from '@/layouts/DashboardLayout';
import { ProtectedRoute } from './ProtectedRoute';
import { PlaceholderPage } from '@/components/PlaceholderPage';
import { HomePage } from '@/pages/public/HomePage';
import { NotFoundPage } from '@/pages/errors/NotFoundPage';
import { UnauthorizedPage } from '@/pages/errors/UnauthorizedPage';
import { ForbiddenPage } from '@/pages/errors/ForbiddenPage';
import { ServerErrorPage } from '@/pages/errors/ServerErrorPage';
import type { UserRole } from '@/types/auth';
import { GuestRoute } from './GuestRoute';
import { LoginPage } from '@/pages/auth/LoginPage';
import { RegisterPage } from '@/pages/auth/RegisterPage';
import { VerifyEmailPage } from '@/pages/auth/VerifyEmailPage';
import { ForgotPasswordPage } from '@/pages/auth/ForgotPasswordPage';
import { ResetPasswordPage } from '@/pages/auth/ResetPasswordPage';
import { LandlordPropertiesPage } from '@/pages/landlord/LandlordPropertiesPage';
import { CreatePropertyPage } from '@/pages/landlord/CreatePropertyPage';
import { EditPropertyPage } from '@/pages/landlord/EditPropertyPage';
import { LandlordUnitsPage } from '@/pages/landlord/LandlordUnitsPage';
import { CreateUnitPage } from '@/pages/landlord/CreateUnitPage';
import { EditUnitPage } from '@/pages/landlord/EditUnitPage';
import { LandlordLeasesPage } from '@/pages/landlord/LandlordLeasesPage';
import { CreateLeasePage } from '@/pages/landlord/CreateLeasePage';
import { LandlordDashboardPage } from '@/pages/landlord/LandlordDashboardPage';
import { TenantDashboardPage } from '@/pages/tenant/TenantDashboardPage';
import { PropertyListingsPage } from '@/pages/public/PropertyListingsPage';
import { PropertyDetailsPage } from '@/pages/public/PropertyDetailsPage';

/** Shorthand: render a titled placeholder for pages not yet built. */
function page(title: string) {
  return <PlaceholderPage title={title} />;
}

/** Generates a set of role-guarded routes from a simple {path, title} list. */
function roleRoutes(
  roles: UserRole[],
  routes: {
    path: string;
    title?: string;
    element?: React.ReactNode;
  }[]
): RouteObject[] {
  return routes.map(({ path, title, element }) => ({
    path,
    element: <ProtectedRoute allowedRoles={roles}>{element ?? page(title!)}</ProtectedRoute>,
  }));
}

export const router = createBrowserRouter([
  // ---------- PUBLIC ----------
  {
    element: <PublicLayout />,
    children: [
      { index: true, element: <HomePage /> },
      { path: 'properties', element: <PropertyListingsPage /> },
      { path: 'properties/:slug', element: <PropertyDetailsPage /> },
      { path: 'about', element: page('About') },
      { path: 'contact', element: page('Contact') },
      { path: 'faq', element: page('FAQ') },
      { path: 'privacy-policy', element: page('Privacy Policy') },
      { path: 'terms-of-service', element: page('Terms of Service') },
      { path: 'search', element: page('Search Results') },
      { path: 'favorites', element: page('Favorite Properties') },
      { path: 'inspection/:propertyId', element: page('Book Inspection') },
    ],
  },

  // ---------- AUTHENTICATION ----------
  {
    element: <GuestRoute />,
    children: [
      {
        element: <AuthLayout />,
        children: [
          { path: 'login', element: <LoginPage /> },
          { path: 'register', element: <RegisterPage /> },
          { path: 'verify-email', element: <VerifyEmailPage /> },
          { path: 'forgot-password', element: <ForgotPasswordPage /> },
          { path: 'reset-password', element: <ResetPasswordPage /> },
        ],
      },
    ],
  },

  // ---------- AUTHENTICATED DASHBOARD AREA ----------
  {
    element: (
      <ProtectedRoute allowedRoles={['tenant', 'landlord', 'manager', 'admin', 'super_admin']}>
        <DashboardLayout />
      </ProtectedRoute>
    ),
    children: [
      // Shared routes — any authenticated role
      { path: 'profile', element: page('My Profile') },
      { path: 'settings', element: page('Account Settings') },
      { path: 'notifications', element: page('Notifications') },
      { path: 'change-password', element: page('Change Password') },
      {
        path: 'tenant/dashboard',
        element: (
          <ProtectedRoute allowedRoles={['tenant']}>
            <TenantDashboardPage />
          </ProtectedRoute>
        ),
      },

      // Tenant
      ...roleRoutes(
        ['tenant'],
        [
          { path: 'tenant/dashboard', title: 'Tenant Dashboard' },
          { path: 'tenant/lease', title: 'Lease' },
          { path: 'tenant/payments', title: 'Payments' },
          { path: 'tenant/payments/pay', title: 'Pay Rent' },
          { path: 'tenant/receipts', title: 'Receipts' },
          { path: 'tenant/maintenance', title: 'Maintenance' },
          { path: 'tenant/maintenance/new', title: 'Create Maintenance Request' },
          { path: 'tenant/maintenance/:id', title: 'Maintenance Details' },
          { path: 'tenant/profile', title: 'Tenant Profile' },
        ]
      ),

      // Landlord
      ...roleRoutes(
        ['landlord'],
        [
          {
            path: 'landlord/dashboard',
            element: (
              <ProtectedRoute allowedRoles={['landlord']}>
                {' '}
                <LandlordDashboardPage />{' '}
              </ProtectedRoute>
            ),
          },
          {
            path: 'landlord/properties',
            element: (
              <ProtectedRoute allowedRoles={['landlord']}>
                {' '}
                <LandlordPropertiesPage />{' '}
              </ProtectedRoute>
            ),
          },
          {
            path: 'landlord/properties/new',
            element: (
              <ProtectedRoute allowedRoles={['landlord']}>
                {' '}
                <CreatePropertyPage />{' '}
              </ProtectedRoute>
            ),
          },
          { path: 'landlord/properties/:id', title: 'Property Details' },
          {
            path: 'landlord/properties/:id/edit',
            element: (
              <ProtectedRoute allowedRoles={['landlord']}>
                {' '}
                <EditPropertyPage />{' '}
              </ProtectedRoute>
            ),
          },
          {
            path: 'landlord/units',
            element: (
              <ProtectedRoute allowedRoles={['landlord']}>
                {' '}
                <LandlordUnitsPage />{' '}
              </ProtectedRoute>
            ),
          },
          {
            path: 'landlord/units/new',
            element: (
              <ProtectedRoute allowedRoles={['landlord']}>
                {' '}
                <CreateUnitPage />{' '}
              </ProtectedRoute>
            ),
          },
          {
            path: 'landlord/units/:id/edit',
            element: (
              <ProtectedRoute allowedRoles={['landlord']}>
                {' '}
                <EditUnitPage />{' '}
              </ProtectedRoute>
            ),
          },
          {
            path: 'landlord/leases',
            element: (
              <ProtectedRoute allowedRoles={['landlord']}>
                {' '}
                <LandlordLeasesPage />{' '}
              </ProtectedRoute>
            ),
          },
          {
            path: 'landlord/leases/new',
            element: (
              <ProtectedRoute allowedRoles={['landlord']}>
                <CreateLeasePage />{' '}
              </ProtectedRoute>
            ),
          },
          { path: 'landlord/leases/:id', title: 'Lease Details' },
          { path: 'landlord/tenants', title: 'Tenants' },
          { path: 'landlord/reports', title: 'Reports' },
          { path: 'landlord/reports/revenue', title: 'Revenue Report' },
          { path: 'landlord/reports/occupancy', title: 'Occupancy Report' },
          { path: 'landlord/payments', title: 'Payments' },
          { path: 'landlord/maintenance', title: 'Maintenance' },
          { path: 'landlord/notifications', title: 'Notifications' },
          { path: 'landlord/settings', title: 'Settings' },
        ]
      ),

      // Estate Manager
      ...roleRoutes(
        ['manager'],
        [
          { path: 'manager/dashboard', title: 'Manager Dashboard' },
          { path: 'manager/properties', title: 'Assigned Properties' },
          { path: 'manager/properties/:id', title: 'Property Details' },
          { path: 'manager/units', title: 'Units' },
          { path: 'manager/tenants', title: 'Tenants' },
          { path: 'manager/leases', title: 'Leases' },
          { path: 'manager/maintenance', title: 'Maintenance' },
          { path: 'manager/reports', title: 'Reports' },
          { path: 'manager/notifications', title: 'Notifications' },
          { path: 'manager/profile', title: 'Manager Profile' },
        ]
      ),

      // Administrator (super_admin can access everything admin can)
      ...roleRoutes(
        ['admin', 'super_admin'],
        [
          { path: 'admin/dashboard', title: 'Admin Dashboard' },
          { path: 'admin/users', title: 'Users' },
          { path: 'admin/users/new', title: 'Create User' },
          { path: 'admin/users/:id', title: 'User Details' },
          { path: 'admin/users/:id/edit', title: 'Edit User' },
          { path: 'admin/properties', title: 'Properties' },
          { path: 'admin/units', title: 'Units' },
          { path: 'admin/leases', title: 'Leases' },
          { path: 'admin/payments', title: 'Payments' },
          { path: 'admin/maintenance', title: 'Maintenance' },
          { path: 'admin/reports', title: 'Reports' },
          { path: 'admin/reports/revenue', title: 'Revenue Report' },
          { path: 'admin/reports/occupancy', title: 'Occupancy Report' },
          { path: 'admin/reports/payments', title: 'Payments Report' },
          { path: 'admin/reports/maintenance', title: 'Maintenance Report' },
          { path: 'admin/reports/users', title: 'Users Report' },
          { path: 'admin/cms', title: 'CMS' },
          { path: 'admin/cms/homepage', title: 'CMS — Homepage' },
          { path: 'admin/cms/about', title: 'CMS — About' },
          { path: 'admin/cms/contact', title: 'CMS — Contact' },
          { path: 'admin/cms/faq', title: 'CMS — FAQ' },
          { path: 'admin/cms/privacy', title: 'CMS — Privacy Policy' },
          { path: 'admin/cms/terms', title: 'CMS — Terms of Service' },
          { path: 'admin/notifications', title: 'Notifications' },
          { path: 'admin/audit-logs', title: 'Audit Logs' },
          { path: 'admin/settings', title: 'Platform Settings' },
        ]
      ),

      // Super Administrator
      ...roleRoutes(
        ['super_admin'],
        [
          { path: 'super-admin/dashboard', title: 'Super Admin Dashboard' },
          { path: 'super-admin/system-config', title: 'System Configuration' },
          { path: 'super-admin/database-monitoring', title: 'Database Monitoring' },
          { path: 'super-admin/feature-flags', title: 'Feature Flags' },
          { path: 'super-admin/maintenance', title: 'Platform Maintenance' },
          { path: 'super-admin/environment', title: 'Environment Management' },
          { path: 'super-admin/roles', title: 'Role Management' },
          { path: 'super-admin/audit-logs', title: 'Global Audit Logs' },
        ]
      ),
    ],
  },

  // ---------- ERROR ROUTES ----------
  { path: '/401', element: <UnauthorizedPage /> },
  { path: '/403', element: <ForbiddenPage /> },
  { path: '/500', element: <ServerErrorPage /> },
  { path: '*', element: <NotFoundPage /> },
]);
