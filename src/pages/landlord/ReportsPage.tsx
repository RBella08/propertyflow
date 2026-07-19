import { useState } from 'react';
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { DateRangeFilter } from '@/features/reports/components/DateRangeFilter';
import { ExportMenu } from '@/features/reports/components/ExportMenu';
import {
  useRevenueReport,
  useOccupancyReport,
  usePaymentSummaryReport,
} from '@/features/reports/hooks/useReports';

function formatNaira(amount: number) {
  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
    maximumFractionDigits: 0,
  }).format(amount);
}

function getDefaultStartDate() {
  const d = new Date();
  d.setMonth(d.getMonth() - 6);
  return d.toISOString().slice(0, 10);
}

function getTodayDate() {
  return new Date().toISOString().slice(0, 10);
}

const statusVariant: Record<string, 'success' | 'warning' | 'destructive' | 'secondary'> = {
  successful: 'success',
  pending: 'warning',
  processing: 'warning',
  failed: 'destructive',
  refunded: 'secondary',
};

export function ReportsPage() {
  const [startDate, setStartDate] = useState(getDefaultStartDate());
  const [endDate, setEndDate] = useState(getTodayDate());

  const { data: revenue, isLoading: revenueLoading } = useRevenueReport(startDate, endDate);
  const { data: occupancy, isLoading: occupancyLoading } = useOccupancyReport();
  const { data: payments, isLoading: paymentsLoading } = usePaymentSummaryReport(
    startDate,
    endDate
  );

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-h4 text-foreground">Reports</h1>
        <p className="text-muted-foreground">
          Revenue, occupancy, and payment insights for your portfolio.
        </p>
      </div>

      <DateRangeFilter
        startDate={startDate}
        endDate={endDate}
        onStartDateChange={setStartDate}
        onEndDateChange={setEndDate}
      />

      <Tabs defaultValue="revenue">
        <TabsList>
          <TabsTrigger value="revenue">Revenue</TabsTrigger>
          <TabsTrigger value="occupancy">Occupancy</TabsTrigger>
          <TabsTrigger value="payments">Payment Summary</TabsTrigger>
        </TabsList>

        <TabsContent value="revenue">
          <Card>
            <CardContent className="flex flex-col gap-4 p-6">
              <div className="flex items-center justify-between">
                <h2 className="text-h6 text-foreground">Revenue by Month</h2>
                <ExportMenu
                  title="Revenue Report"
                  headers={['Month', 'Revenue (NGN)']}
                  rows={(revenue ?? []).map((r) => [r.month, r.revenue])}
                />
              </div>

              {revenueLoading ? (
                <Skeleton className="h-72" />
              ) : revenue && revenue.length > 0 ? (
                <>
                  <div className="h-72">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={revenue}>
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                        <XAxis
                          dataKey="month"
                          stroke="hsl(var(--muted-foreground))"
                          fontSize={12}
                        />
                        <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                        <Tooltip
                          formatter={(value) => {
                            const amount = Number(value ?? 0);
                            return formatNaira(amount);
                          }}
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
                  <div className="flex flex-col divide-y">
                    {revenue.map((r) => (
                      <div
                        key={r.month}
                        className="flex items-center justify-between py-2 text-small"
                      >
                        <span className="text-muted-foreground">{r.month}</span>
                        <span className="font-medium text-foreground">
                          {formatNaira(r.revenue)}
                        </span>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <p className="text-muted-foreground">No revenue data for this period.</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="occupancy">
          <Card>
            <CardContent className="flex flex-col gap-4 p-6">
              <div className="flex items-center justify-between">
                <h2 className="text-h6 text-foreground">Occupancy by Property</h2>
                <ExportMenu
                  title="Occupancy Report"
                  headers={['Property', 'Total Units', 'Occupied', 'Vacant', 'Occupancy Rate']}
                  rows={(occupancy ?? []).map((o) => [
                    o.propertyName,
                    o.totalUnits,
                    o.occupiedUnits,
                    o.vacantUnits,
                    `${o.occupancyRate}%`,
                  ])}
                />
              </div>

              {occupancyLoading ? (
                <Skeleton className="h-40" />
              ) : occupancy && occupancy.length > 0 ? (
                <div className="flex flex-col divide-y">
                  {occupancy.map((o) => (
                    <div key={o.propertyName} className="flex items-center justify-between py-3">
                      <div>
                        <p className="font-medium text-foreground">{o.propertyName}</p>
                        <p className="text-small text-muted-foreground">
                          {o.occupiedUnits} of {o.totalUnits} units occupied
                        </p>
                      </div>
                      <Badge variant={o.occupancyRate >= 70 ? 'success' : 'warning'}>
                        {o.occupancyRate}%
                      </Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground">No properties with units yet.</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="payments">
          <Card>
            <CardContent className="flex flex-col gap-4 p-6">
              <div className="flex items-center justify-between">
                <h2 className="text-h6 text-foreground">Payment Summary</h2>
                <ExportMenu
                  title="Payment Summary Report"
                  headers={['Reference', 'Tenant', 'Property', 'Amount (NGN)', 'Status', 'Paid At']}
                  rows={(payments ?? []).map((p) => [
                    p.reference,
                    p.tenantName,
                    p.propertyName,
                    p.amount,
                    p.status,
                    p.paidAt ? new Date(p.paidAt).toLocaleDateString() : '-',
                  ])}
                />
              </div>

              {paymentsLoading ? (
                <Skeleton className="h-40" />
              ) : payments && payments.length > 0 ? (
                <div className="flex flex-col divide-y">
                  {payments.map((p) => (
                    <div
                      key={p.reference}
                      className="flex flex-wrap items-center justify-between gap-2 py-3"
                    >
                      <div>
                        <p className="text-small font-medium text-foreground">{p.tenantName}</p>
                        <p className="text-caption text-muted-foreground">
                          {p.propertyName} · {p.reference}
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-small font-semibold text-foreground">
                          {formatNaira(p.amount)}
                        </span>
                        <Badge
                          variant={statusVariant[p.status] ?? 'secondary'}
                          className="capitalize"
                        >
                          {p.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground">No payments for this period.</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
