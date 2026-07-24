import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { ExportMenu } from '@/features/reports/components/ExportMenu';
import {
  useAdminAllPayments,
  useAdminAllProperties,
} from '@/features/admin/hooks/useAdminOversight';

function formatNaira(amount: number) {
  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
    maximumFractionDigits: 0,
  }).format(amount);
}

export function AdminReportsPage() {
  const { data: payments, isLoading: paymentsLoading } = useAdminAllPayments();
  const { data: properties, isLoading: propertiesLoading } = useAdminAllProperties();

  const revenueByMonth = payments
    ?.filter((p) => p.status === 'successful' && p.paidAt)
    .reduce<Record<string, number>>((acc, p) => {
      const key = new Date(p.paidAt as string).toLocaleString('en-US', {
        month: 'short',
        year: 'numeric',
      });
      acc[key] = (acc[key] ?? 0) + p.amount;
      return acc;
    }, {});

  const chartData = Object.entries(revenueByMonth ?? {})
    .map(([month, revenue]) => ({ month, revenue }))
    .reverse();

  const propertiesByState = properties?.reduce<Record<string, number>>((acc, p) => {
    acc[p.state] = (acc[p.state] ?? 0) + 1;
    return acc;
  }, {});

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-h4 text-foreground">Platform Reports</h1>
        <p className="text-muted-foreground">
          Aggregate revenue and property distribution across all landlords.
        </p>
      </div>

      <Card>
        <CardContent className="flex flex-col gap-4 p-6">
          <div className="flex items-center justify-between">
            <h2 className="text-h6 text-foreground">Platform Revenue</h2>
            <ExportMenu
              title="Platform Revenue"
              headers={['Month', 'Revenue (NGN)']}
              rows={chartData.map((d) => [d.month, d.revenue])}
            />
          </div>
          {paymentsLoading ? (
            <Skeleton className="h-72" />
          ) : chartData.length > 0 ? (
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <Tooltip
                    formatter={(value) =>
                      formatNaira(typeof value === 'number' ? value : Number(value ?? 0))
                    }
                    contentStyle={{
                      backgroundColor: 'hsl(var(--popover))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                    }}
                  />
                  <Bar dataKey="revenue" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <p className="text-muted-foreground">No revenue data yet.</p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardContent className="flex flex-col gap-4 p-6">
          <div className="flex items-center justify-between">
            <h2 className="text-h6 text-foreground">Properties by State</h2>
            <ExportMenu
              title="Properties by State"
              headers={['State', 'Property Count']}
              rows={Object.entries(propertiesByState ?? {})}
            />
          </div>
          {propertiesLoading ? (
            <Skeleton className="h-40" />
          ) : (
            <div className="flex flex-col divide-y">
              {Object.entries(propertiesByState ?? {}).map(([state, count]) => (
                <div key={state} className="flex items-center justify-between py-2 text-small">
                  <span className="text-muted-foreground">{state}</span>
                  <span className="font-medium text-foreground">{count}</span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
