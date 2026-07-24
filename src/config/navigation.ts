import type { LucideIcon } from 'lucide-react';
import {
  LayoutDashboard,
  Building2,
  DoorClosed,
  FileText,
  Users,
  Wallet,
  Wrench,
  BarChart3,
  Bell,
  Settings,
  Receipt,
  User,
  FileSignature,
  Shield,
  Megaphone,
} from 'lucide-react';
import type { UserRole } from '@/types/auth';

export interface NavItem {
  label: string;
  path: string;
  icon: LucideIcon;
}

export const sidebarNav: Record<UserRole, NavItem[]> = {
  tenant: [
    { label: 'Dashboard', path: '/tenant/dashboard', icon: LayoutDashboard },
    { label: 'Lease', path: '/tenant/lease', icon: FileSignature },
    { label: 'Payments', path: '/tenant/payments', icon: Wallet },
    { label: 'Receipts', path: '/tenant/receipts', icon: Receipt },
    { label: 'Maintenance', path: '/tenant/maintenance', icon: Wrench },
    { label: 'Notifications', path: '/notifications', icon: Bell },
    { label: 'Announcements', path: '/tenant/announcements', icon: Megaphone },
    { label: 'Profile', path: '/profile', icon: User },
    { label: 'Settings', path: '/settings', icon: Settings },
  ],
  landlord: [
    { label: 'Dashboard', path: '/landlord/dashboard', icon: LayoutDashboard },
    { label: 'Properties', path: '/landlord/properties', icon: Building2 },
    { label: 'Units', path: '/landlord/units', icon: DoorClosed },
    { label: 'Leases', path: '/landlord/leases', icon: FileText },
    { label: 'Tenants', path: '/landlord/tenants', icon: Users },
    { label: 'Payments', path: '/landlord/payments', icon: Wallet },
    { label: 'Vendors', path: '/landlord/vendors', icon: Wrench },
    { label: 'Maintenance', path: '/landlord/maintenance', icon: Wrench },
    { label: 'Reports', path: '/landlord/reports', icon: BarChart3 },
    { label: 'Payout Settings', path: '/landlord/payout-settings', icon: Wallet },
    { label: 'Notifications', path: '/notifications', icon: Bell },
    { label: 'Settings', path: '/settings', icon: Settings },
  ],
  manager: [
    { label: 'Dashboard', path: '/manager/dashboard', icon: LayoutDashboard },
    { label: 'Properties', path: '/manager/properties', icon: Building2 },
    { label: 'Units', path: '/manager/units', icon: DoorClosed },
    { label: 'Tenants', path: '/manager/tenants', icon: Users },
    { label: 'Payments', path: '/manager/payments', icon: Wallet },
    { label: 'Leases', path: '/manager/leases', icon: FileText },
    { label: 'Maintenance', path: '/manager/maintenance', icon: Wrench },
    { label: 'Reports', path: '/manager/reports', icon: BarChart3 },
    { label: 'Notifications', path: '/notifications', icon: Bell },
    { label: 'Profile', path: '/profile', icon: User },
  ],
  admin: [
    { label: 'Dashboard', path: '/admin/dashboard', icon: LayoutDashboard },
    { label: 'Users', path: '/admin/users', icon: Users },
    { label: 'Properties', path: '/admin/properties', icon: Building2 },
    { label: 'Units', path: '/admin/units', icon: DoorClosed },
    { label: 'Leases', path: '/admin/leases', icon: FileText },
    { label: 'Payments', path: '/admin/payments', icon: Wallet },
    { label: 'Maintenance', path: '/admin/maintenance', icon: Wrench },
    { label: 'Reports', path: '/admin/reports', icon: BarChart3 },
    { label: 'CMS', path: '/admin/cms', icon: FileSignature },
    { label: 'Notifications', path: '/notifications', icon: Bell },
    { label: 'Audit Logs', path: '/admin/audit-logs', icon: Shield },
    { label: 'Settings', path: '/admin/settings', icon: Settings },
  ],
  super_admin: [
    { label: 'Dashboard', path: '/admin/dashboard', icon: LayoutDashboard },
    { label: 'Users', path: '/admin/users', icon: Users },
    { label: 'Properties', path: '/admin/properties', icon: Building2 },
    { label: 'Reports', path: '/admin/reports', icon: BarChart3 },
    { label: 'CMS', path: '/admin/cms', icon: FileSignature },
    { label: 'Audit Logs', path: '/admin/audit-logs', icon: Shield },
    { label: 'Settings', path: '/admin/settings', icon: Settings },
    { label: 'Super Admin', path: '/super-admin/dashboard', icon: Shield },
  ],
};

export const publicNav: { label: string; path: string }[] = [
  { label: 'Home', path: '/' },
  { label: 'Properties', path: '/properties' },
  { label: 'Guide', path: '/guide' },
  { label: 'About', path: '/about' },
  { label: 'Contact', path: '/contact' },
  { label: 'FAQ', path: '/faq' },
];
