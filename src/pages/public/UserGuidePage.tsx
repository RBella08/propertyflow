import { useState } from 'react';
import { Link } from 'react-router';
import { UserCircle, Home, Building2, Shield, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

const ROLES = [
  { id: 'visitor', label: 'Visitor', icon: UserCircle },
  { id: 'tenant', label: 'Tenant', icon: Home },
  { id: 'landlord', label: 'Landlord', icon: Building2 },
  { id: 'admin', label: 'Admin', icon: Shield },
] as const;

type RoleId = (typeof ROLES)[number]['id'];

const CONTENT: Record<RoleId, { title: string; steps: { heading: string; body: string }[] }> = {
  visitor: {
    title: 'Browsing as a Visitor',
    steps: [
      {
        heading: '1. Explore properties without an account',
        body: 'Visit the Properties page to browse verified listings. Use the filters (city, property type, bedrooms, price) to narrow your search — no login required.',
      },
      {
        heading: '2. View full property details',
        body: 'Click any listing to see the photo gallery, amenities, description, and available units with pricing.',
      },
      {
        heading: '3. Book an inspection or contact the manager',
        body: 'On any property page, use "Book Inspection" to request a viewing, or "Contact Manager" to send a direct message — both work without creating an account.',
      },
      {
        heading: '4. Create an account when ready',
        body: 'Click Register in the top-right corner. Choose "Tenant" if you\'re looking to rent, or "Landlord" if you want to list your own properties.',
      },
      {
        heading: '5. Want to become an Estate Manager?',
        body: 'Register as a Tenant first, then contact PropertyFlow support and ask to have your role changed to "Manager." A landlord can then assign you to manage their properties on their behalf.',
      },
    ],
  },
  tenant: {
    title: 'Using PropertyFlow as a Tenant',
    steps: [
      {
        heading: '1. Register and verify your email',
        body: 'Sign up with your email, choose "Tenant," and click the confirmation link sent to your inbox before logging in.',
      },
      {
        heading: '2. Your Dashboard',
        body: 'After logging in, your dashboard shows your active lease, outstanding balance, recent payments, and open maintenance requests at a glance.',
      },
      {
        heading: '3. Paying Rent',
        body: "Go to Payments → Pay Rent to see any outstanding invoices. Payment is processed securely through Paystack, and a receipt is generated automatically the moment it's confirmed.",
      },
      {
        heading: '4. Reporting Maintenance Issues',
        body: 'Go to Maintenance → New Request, describe the issue, and attach photos if helpful. You can track its status from Submitted through to Closed.',
      },
      {
        heading: '5. Notifications',
        body: "You'll be notified in real time (and by email) for payment confirmations, maintenance updates, and lease changes — check the bell icon anytime.",
      },
      {
        heading: '6. Managing your Profile',
        body: 'Update your contact details, upload a profile photo, or change your password from Profile and Settings in the sidebar.',
      },
      {
        heading: '7. Messaging & Announcements',
        body: 'Message your landlord or estate manager directly under Messages — separate conversations for each. Check Announcements for property-wide updates.',
      },
    ],
  },
  landlord: {
    title: 'Using PropertyFlow as a Landlord',
    steps: [
      {
        heading: '1. Register as a Landlord',
        body: 'Sign up choosing "Landlord," verify your email, then log in to reach your dashboard.',
      },
      {
        heading: '2. Add a Property',
        body: 'Go to Properties → Add Property. Fill in details, select amenities, and upload photos. New properties start as a Draft — publish them from the Properties list when ready to go live.',
      },
      {
        heading: '3. Setting Up Payouts',
        body: 'Before you can receive rent payments, go to Payout Settings and connect your bank account. Once verified, every rent payment automatically splits — your share goes straight to your bank, and PropertyFlow keeps a small percentage as its platform fee. This is fully automatic; you never need to request a transfer.',
      },
      {
        heading: '4. Add Units',
        body: 'Each property can have multiple units (e.g. apartments within a building). Go to Units → Add Unit to set bedrooms, bathrooms, rent, and status.',
      },
      {
        heading: '5. Create a Lease',
        body: 'Go to Leases → Create Lease. Select an available unit, look up the tenant by their registered email, and set the lease terms. The unit is automatically marked occupied and a first invoice is generated.',
      },
      {
        heading: '6. Track Payments and Revenue',
        body: 'Payments and Reports show real-time revenue, occupancy, and payment history — exportable as PDF, CSV, or Excel.',
      },
      {
        heading: '7. Managing Maintenance',
        body: 'Maintenance requests from your tenants appear automatically. Advance each request through its status stages and optionally assign a vendor from your Vendors directory.',
      },
      {
        heading: '8. Assigning an Estate Manager',
        body: "To have someone manage a property on your behalf: they first register normally as a Tenant (the only public option besides Landlord). Then, contact PropertyFlow support/admin and ask them to change that account's role to \"Manager.\" Once that's done, go to your Properties list and click the manager icon on any property to look them up by email and assign them. A Manager can then handle that property's units, leases, tenants, maintenance, and reports on your behalf — but only for properties you've specifically assigned to them.",
      },
      {
        heading: '9.  Messaging Your Tenants',
        body: "Go to Messages for real conversations with each tenant — send text, photos, or voice notes, and see when they're typing.",
      },
      {
        heading: '10. Recording Cash Payments',
        body: 'If a tenant pays you outside the app, use Record Payment on the Tenants page — it saves as Pending until you confirm it, then automatically updates their balance and sends them a receipt.',
      },
      {
        heading: '11. Tenancy Agreements & ID Verification',
        body: 'Every new lease automatically generates a Tenancy Agreement for the tenant to sign, including guarantor details and a digital signature. Review submitted ID documents from the Tenants page before approving.',
      },
      {
        heading: '12. Serving Notices & Screening Tenants',
        body: 'Use Serve Notice to Quit if you need to formally end a tenancy early. After a lease ends, leave a screening review — this builds a shared rental history other landlords can check before leasing to the same tenant.',
      },
      {
        heading: '13. Accounting, Owner Statements & ROI',
        body: "Ledger shows every dollar in and out. Owner Statement summarizes one property's income and expenses for any period. ROI Tracking shows your real annual return once you enter what you paid for a property.",
      },
      {
        heading: '14. Plans & Billing',
        body: 'Every plan includes 100% direct payouts — PropertyFlow never takes a cut of your rent. Upgrading your Plan raises how many properties you can list and unlocks features like the Ledger and Tenant Screening.',
      },
    ],
  },
  admin: {
    title: 'Using PropertyFlow as an Administrator',
    steps: [
      {
        heading: '1. Managing Users',
        body: "Go to Users to view every account, search by name or email, change a user's role, or suspend/reactivate an account.",
      },
      {
        heading: '2. Reviewing Audit Logs',
        body: 'Audit Logs shows every sensitive action taken across the platform — filterable by action type (Insert/Update/Delete) and searchable by user or table.',
      },
      {
        heading: '3. Managing Public Content',
        body: 'CMS lets you edit the Home, About, FAQ, Contact, Privacy Policy, and Terms of Service pages directly — no code changes needed, with a Published/Draft toggle.',
      },
      {
        heading: '4. Platform Settings',
        body: 'Settings holds system-wide configuration grouped by category (branding, payments, security, and more).',
      },
    ],
  },
};

export function UserGuidePage() {
  const [activeRole, setActiveRole] = useState<RoleId>('visitor');
  const content = CONTENT[activeRole];

  return (
    <div className="container py-12">
      <div className="mx-auto mb-10 max-w-2xl text-center">
        <h1 className="text-h3 text-foreground">User Guide</h1>
        <p className="mt-2 text-muted-foreground">
          Everything you need to know to get the most out of PropertyFlow, organized by how you use
          it.
        </p>
      </div>

      <div className="mx-auto mb-8 flex max-w-2xl flex-wrap justify-center gap-2">
        {ROLES.map((role) => (
          <button
            key={role.id}
            onClick={() => setActiveRole(role.id)}
            className={cn(
              'flex items-center gap-2 rounded-md border px-4 py-2 text-small font-medium transition-colors',
              activeRole === role.id
                ? 'border-primary bg-primary text-primary-foreground'
                : 'border-input text-muted-foreground hover:bg-accent'
            )}
          >
            <role.icon className="h-4 w-4" />
            {role.label}
          </button>
        ))}
      </div>

      <div className="mx-auto max-w-2xl">
        <h2 className="mb-4 text-h5 text-foreground">{content.title}</h2>
        <div className="flex flex-col gap-4">
          {content.steps.map((step, i) => (
            <Card key={i}>
              <CardContent className="p-5">
                <h3 className="mb-1 font-semibold text-foreground">{step.heading}</h3>
                <p className="text-small text-muted-foreground">{step.body}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mt-8 flex flex-col items-center gap-3 rounded-card border bg-card p-6 text-center">
          <p className="font-medium text-foreground">Ready to get started?</p>
          <Button asChild>
            <Link to="/register">
              Create an Account <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
