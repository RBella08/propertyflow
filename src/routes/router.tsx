import { createBrowserRouter } from 'react-router';
import type { RouteObject } from 'react-router';
import { PublicLayout } from '@/layouts/PublicLayout';
import { AuthLayout } from '@/layouts/AuthLayout';
import { DashboardLayout } from '@/layouts/DashboardLayout';
import { ProtectedRoute } from './ProtectedRoute';
import { PlaceholderPage } from '@/components/PlaceholderPage';
import { AdminCmsPage } from '@/pages/admin/AdminCmsPage';
import { AdminDashboardPage } from '@/pages/admin/AdminDashboardPage';
import { AdminPropertiesPage } from '@/pages/admin/AdminPropertiesPage';
import { AdminUnitsPage } from '@/pages/admin/AdminUnitsPage';
import { AdminLeasesPage } from '@/pages/admin/AdminLeasesPage';
import { AdminPaymentsPage } from '@/pages/admin/AdminPaymentsPage';
import { AdminMaintenancePage } from '@/pages/admin/AdminMaintenancePage';
import { AdminReportsPage } from '@/pages/admin/AdminReportsPage';
import { AdminCmsEditPage } from '@/pages/admin/AdminCmsEditPage';
import { AdminSettingsPage } from '@/pages/admin/AdminSettingsPage';
import { HomePage } from '@/pages/public/HomePage';
import { AboutPage } from '@/pages/public/AboutPage';
import { ContactPage } from '@/pages/public/ContactPage';
import { FaqPage } from '@/pages/public/FaqPage';
import { ManagerDashboardPage } from '@/pages/manager/ManagerDashboardPage';
import { ManagerPropertiesPage } from '@/pages/manager/ManagerPropertiesPage';
import { ManagerTenantsPage } from '@/pages/manager/ManagerTenantsPage';
import { ManagerMaintenancePage } from '@/pages/manager/ManagerMaintenancePage';
import { ManagerUnitsPage } from '@/pages/manager/ManagerUnitsPage';
import { ManagerCreateUnitPage } from '@/pages/manager/ManagerCreateUnitPage';
import { ManagerEditUnitPage } from '@/pages/manager/ManagerEditUnitPage';
import { ManagerLeasesPage } from '@/pages/manager/ManagerLeasesPage';
import { ManagerCreateLeasePage } from '@/pages/manager/ManagerCreateLeasePage';
import { ManagerPaymentsPage } from '@/pages/manager/ManagerPaymentsPage';
import { ManagerReportsPage } from '@/pages/manager/ManagerReportsPage';
import { InspectionBookingPage } from '@/pages/public/InspectionBookingPage';
import { PrivacyPolicyPage } from '@/pages/public/PrivacyPolicyPage';
import { TermsPage } from '@/pages/public/TermsPage';
import { NotFoundPage } from '@/pages/errors/NotFoundPage';
import { UnauthorizedPage } from '@/pages/errors/UnauthorizedPage';
import { ForbiddenPage } from '@/pages/errors/ForbiddenPage';
import { ServerErrorPage } from '@/pages/errors/ServerErrorPage';
import { UserGuidePage } from '@/pages/public/UserGuidePage';
import type { UserRole } from '@/types/auth';
import { GuestRoute } from './GuestRoute';
import { LoginPage } from '@/pages/auth/LoginPage';
import { VendorsPage } from '@/pages/landlord/VendorsPage';
import { RegisterPage } from '@/pages/auth/RegisterPage';
import { VerifyEmailPage } from '@/pages/auth/VerifyEmailPage';
import { ForgotPasswordPage } from '@/pages/auth/ForgotPasswordPage';
import { ResetPasswordPage } from '@/pages/auth/ResetPasswordPage';
import { FavoritesPage } from '@/pages/public/FavoritesPage';
import { AdminUsersPage } from '@/pages/admin/AdminUsersPage';
import { AdminAuditLogsPage } from '@/pages/admin/AdminAuditLogsPage';
import { LandlordPropertiesPage } from '@/pages/landlord/LandlordPropertiesPage';
import { CreatePropertyPage } from '@/pages/landlord/CreatePropertyPage';
import { EditPropertyPage } from '@/pages/landlord/EditPropertyPage';
import { LandlordUnitsPage } from '@/pages/landlord/LandlordUnitsPage';
import { CreateUnitPage } from '@/pages/landlord/CreateUnitPage';
import { EditUnitPage } from '@/pages/landlord/EditUnitPage';
import { LandlordLeasesPage } from '@/pages/landlord/LandlordLeasesPage';
import { CreateLeasePage } from '@/pages/landlord/CreateLeasePage';
import { ReportsPage } from '@/pages/landlord/ReportsPage';
import { LandlordDashboardPage } from '@/pages/landlord/LandlordDashboardPage';
import { LandlordTenantsPage } from '@/pages/landlord/LandlordTenantsPage';
import { LandlordPaymentsPage } from '@/pages/landlord/LandlordPaymentsPage';
import { ProfilePage } from '@/pages/shared/ProfilePage';
import { SettingsPage } from '@/pages/shared/SettingsPage';
import { PayRentPage } from '@/pages/tenant/PayRentPage';
import { PaymentsPage } from '@/pages/tenant/PaymentsPage';
import { PayoutSettingsPage } from '@/pages/landlord/PayoutSettingsPage';
import { ReceiptsPage } from '@/pages/tenant/ReceiptsPage';
import { TenantAnnouncementsPage } from '@/pages/tenant/TenantAnnouncementsPage';
import { TenantLeasePage } from '@/pages/tenant/TenantLeasePage';
import { TenantMaintenancePage } from '@/pages/tenant/TenantMaintenancePage';
import { CreateMaintenancePage } from '@/pages/tenant/CreateMaintenancePage';
import { MaintenanceDetailsPage } from '@/pages/tenant/MaintenanceDetailsPage';
import { LandlordMaintenancePage } from '@/pages/landlord/LandlordMaintenancePage';
import { TenantDashboardPage } from '@/pages/tenant/TenantDashboardPage';
import { NotificationsPage } from '@/pages/shared/NotificationsPage';
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
      { path: 'about', element: <AboutPage /> },
      { path: 'contact', element: <ContactPage /> },
      { path: 'faq', element: <FaqPage /> },
      { path: 'privacy-policy', element: <PrivacyPolicyPage /> },
      { path: 'terms-of-service', element: <TermsPage /> },
      { path: 'guide', element: <UserGuidePage /> },
      { path: 'search', element: page('Search Results') },
      { path: 'favorites', element: <FavoritesPage /> },
      { path: 'inspection/:propertyId', element: <InspectionBookingPage /> },
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
        {' '}
        <DashboardLayout />{' '}
      </ProtectedRoute>
    ),
    children: [
      // Shared routes — any authenticated role
      { path: 'profile', element: <ProfilePage /> },
      { path: 'settings', element: <SettingsPage /> },
      {
        path: 'notifications',
        element: (
          <ProtectedRoute allowedRoles={['tenant', 'landlord', 'manager', 'admin', 'super_admin']}>
            {' '}
            <NotificationsPage />{' '}
          </ProtectedRoute>
        ),
      },
      { path: 'change-password', element: page('Change Password') },
      {
        path: 'tenant/dashboard',
        element: (
          <ProtectedRoute allowedRoles={['tenant']}>
            {' '}
            <TenantDashboardPage />{' '}
          </ProtectedRoute>
        ),
      },

      // Tenant
      ...roleRoutes(
        ['tenant'],
        [
          { path: 'tenant/dashboard', title: 'Tenant Dashboard' },
          {
            path: 'tenant/lease',
            element: (
              <ProtectedRoute allowedRoles={['tenant']}>
                {' '}
                <TenantLeasePage />{' '}
              </ProtectedRoute>
            ),
          },
          {
            path: 'tenant/payments',
            element: (
              <ProtectedRoute allowedRoles={['tenant']}>
                {' '}
                <PaymentsPage />{' '}
              </ProtectedRoute>
            ),
          },
          {
            path: 'tenant/payments/pay',
            element: (
              <ProtectedRoute allowedRoles={['tenant']}>
                {' '}
                <PayRentPage />{' '}
              </ProtectedRoute>
            ),
          },
          {
            path: 'tenant/receipts',
            element: (
              <ProtectedRoute allowedRoles={['tenant']}>
                {' '}
                <ReceiptsPage />{' '}
              </ProtectedRoute>
            ),
          },
          {
            path: 'tenant/maintenance',
            element: (
              <ProtectedRoute allowedRoles={['tenant']}>
                {' '}
                <TenantMaintenancePage />{' '}
              </ProtectedRoute>
            ),
          },
          {
            path: 'tenant/maintenance/new',
            element: (
              <ProtectedRoute allowedRoles={['tenant']}>
                {' '}
                <CreateMaintenancePage />{' '}
              </ProtectedRoute>
            ),
          },
          {
            path: 'tenant/maintenance/:id',
            element: (
              <ProtectedRoute allowedRoles={['tenant']}>
                {' '}
                <MaintenanceDetailsPage />{' '}
              </ProtectedRoute>
            ),
          },
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
          {
            path: 'landlord/payout-settings',
            element: (
              <ProtectedRoute allowedRoles={['landlord']}>
                <PayoutSettingsPage />
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
                {' '}
                <CreateLeasePage />{' '}
              </ProtectedRoute>
            ),
          },
          {
            path: 'landlord/vendors',
            element: (
              <ProtectedRoute allowedRoles={['landlord']}>
                {' '}
                <VendorsPage />{' '}
              </ProtectedRoute>
            ),
          },
          { path: 'landlord/leases/:id', title: 'Lease Details' },
          {
            path: 'landlord/tenants',
            element: (
              <ProtectedRoute allowedRoles={['landlord']}>
                {' '}
                <LandlordTenantsPage />{' '}
              </ProtectedRoute>
            ),
          },
          {
            path: 'landlord/reports',
            element: (
              <ProtectedRoute allowedRoles={['landlord']}>
                {' '}
                <ReportsPage />{' '}
              </ProtectedRoute>
            ),
          },
          {
            path: 'tenant/announcements',
            element: (
              <ProtectedRoute allowedRoles={['tenant']}>
                <TenantAnnouncementsPage />
              </ProtectedRoute>
            ),
          },
          { path: 'landlord/reports/revenue', title: 'Revenue Report' },
          { path: 'landlord/reports/occupancy', title: 'Occupancy Report' },
          {
            path: 'landlord/payments',
            element: (
              <ProtectedRoute allowedRoles={['landlord']}>
                {' '}
                <LandlordPaymentsPage />{' '}
              </ProtectedRoute>
            ),
          },
          {
            path: 'landlord/maintenance',
            element: (
              <ProtectedRoute allowedRoles={['landlord']}>
                {' '}
                <LandlordMaintenancePage />{' '}
              </ProtectedRoute>
            ),
          },
          { path: 'landlord/notifications', title: 'Notifications' },
          { path: 'landlord/settings', title: 'Settings' },
        ]
      ),

      // Estate Manager
      ...roleRoutes(
        ['manager'],
        [
          {
            path: 'manager/dashboard',
            element: (
              <ProtectedRoute allowedRoles={['manager']}>
                {' '}
                <ManagerDashboardPage />{' '}
              </ProtectedRoute>
            ),
          },
          {
            path: 'manager/properties',
            element: (
              <ProtectedRoute allowedRoles={['manager']}>
                {' '}
                <ManagerPropertiesPage />{' '}
              </ProtectedRoute>
            ),
          },
          {
            path: 'manager/tenants',
            element: (
              <ProtectedRoute allowedRoles={['manager']}>
                {' '}
                <ManagerTenantsPage />{' '}
              </ProtectedRoute>
            ),
          },
          {
            path: 'manager/payments',
            element: (
              <ProtectedRoute allowedRoles={['manager']}>
                {' '}
                <ManagerPaymentsPage />{' '}
              </ProtectedRoute>
            ),
          },
          {
            path: 'manager/maintenance',
            element: (
              <ProtectedRoute allowedRoles={['manager']}>
                {' '}
                <ManagerMaintenancePage />{' '}
              </ProtectedRoute>
            ),
          },
          { path: 'manager/properties/:id', title: 'Property Details' },
          {
            path: 'manager/units',
            element: (
              <ProtectedRoute allowedRoles={['manager']}>
                {' '}
                <ManagerUnitsPage />{' '}
              </ProtectedRoute>
            ),
          },
          {
            path: 'manager/units/new',
            element: (
              <ProtectedRoute allowedRoles={['manager']}>
                {' '}
                <ManagerCreateUnitPage />{' '}
              </ProtectedRoute>
            ),
          },
          {
            path: 'manager/units/:id/edit',
            element: (
              <ProtectedRoute allowedRoles={['manager']}>
                {' '}
                <ManagerEditUnitPage />{' '}
              </ProtectedRoute>
            ),
          },
          {
            path: 'manager/leases',
            element: (
              <ProtectedRoute allowedRoles={['manager']}>
                {' '}
                <ManagerLeasesPage />{' '}
              </ProtectedRoute>
            ),
          },
          {
            path: 'manager/leases/new',
            element: (
              <ProtectedRoute allowedRoles={['manager']}>
                {' '}
                <ManagerCreateLeasePage />{' '}
              </ProtectedRoute>
            ),
          },
          {
            path: 'manager/reports',
            element: (
              <ProtectedRoute allowedRoles={['manager']}>
                {' '}
                <ManagerReportsPage />{' '}
              </ProtectedRoute>
            ),
          },
          { path: 'manager/notifications', title: 'Notifications' },
          { path: 'manager/profile', title: 'Manager Profile' },
        ]
      ),

      // Administrator (super_admin can access everything admin can)
      ...roleRoutes(
        ['admin', 'super_admin'],
        [
          {
            path: 'admin/dashboard',
            element: (
              <ProtectedRoute allowedRoles={['admin', 'super_admin']}>
                <AdminDashboardPage />
              </ProtectedRoute>
            ),
          },
          {
            path: 'admin/properties',
            element: (
              <ProtectedRoute allowedRoles={['admin', 'super_admin']}>
                <AdminPropertiesPage />
              </ProtectedRoute>
            ),
          },
          {
            path: 'admin/units',
            element: (
              <ProtectedRoute allowedRoles={['admin', 'super_admin']}>
                <AdminUnitsPage />
              </ProtectedRoute>
            ),
          },
          {
            path: 'admin/leases',
            element: (
              <ProtectedRoute allowedRoles={['admin', 'super_admin']}>
                <AdminLeasesPage />
              </ProtectedRoute>
            ),
          },
          {
            path: 'admin/payments',
            element: (
              <ProtectedRoute allowedRoles={['admin', 'super_admin']}>
                <AdminPaymentsPage />
              </ProtectedRoute>
            ),
          },
          {
            path: 'admin/maintenance',
            element: (
              <ProtectedRoute allowedRoles={['admin', 'super_admin']}>
                <AdminMaintenancePage />
              </ProtectedRoute>
            ),
          },
          {
            path: 'admin/reports',
            element: (
              <ProtectedRoute allowedRoles={['admin', 'super_admin']}>
                <AdminReportsPage />
              </ProtectedRoute>
            ),
          },
          {
            path: 'admin/users',
            element: (
              <ProtectedRoute allowedRoles={['admin', 'super_admin']}>
                {' '}
                <AdminUsersPage />{' '}
              </ProtectedRoute>
            ),
          },
          { path: 'admin/users/new', title: 'Create User' },
          { path: 'admin/users/:id', title: 'User Details' },
          { path: 'admin/users/:id/edit', title: 'Edit User' },
          { path: 'admin/reports/revenue', title: 'Revenue Report' },
          { path: 'admin/reports/occupancy', title: 'Occupancy Report' },
          { path: 'admin/reports/payments', title: 'Payments Report' },
          { path: 'admin/reports/maintenance', title: 'Maintenance Report' },
          { path: 'admin/reports/users', title: 'Users Report' },
          {
            path: 'admin/cms',
            element: (
              <ProtectedRoute allowedRoles={['admin', 'super_admin']}>
                {' '}
                <AdminCmsPage />{' '}
              </ProtectedRoute>
            ),
          },
          {
            path: 'admin/cms/:slug',
            element: (
              <ProtectedRoute allowedRoles={['admin', 'super_admin']}>
                {' '}
                <AdminCmsEditPage />{' '}
              </ProtectedRoute>
            ),
          },
          {
            path: 'admin/settings',
            element: (
              <ProtectedRoute allowedRoles={['admin', 'super_admin']}>
                {' '}
                <AdminSettingsPage />{' '}
              </ProtectedRoute>
            ),
          },
          { path: 'admin/notifications', title: 'Notifications' },
          {
            path: 'admin/audit-logs',
            element: (
              <ProtectedRoute allowedRoles={['admin', 'super_admin']}>
                {' '}
                <AdminAuditLogsPage />{' '}
              </ProtectedRoute>
            ),
          },
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
