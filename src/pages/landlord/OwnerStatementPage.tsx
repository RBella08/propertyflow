import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { DateRangeFilter } from '@/features/reports/components/DateRangeFilter';
import { ExportMenu } from '@/features/reports/components/ExportMenu';
import {
  useLandlordPropertyOptionsForAccounting,
  useOwnerStatement,
} from '@/features/accounting/hooks/useAccounting';

function formatNaira(amount: number) {
  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
    maximumFractionDigits: 0,
  }).format(amount);
}

function getDefaultStartDate() {
  const d = new Date();
  d.setFullYear(d.getFullYear() - 1);
  return d.toISOString().slice(0, 10);
}
function getTodayDate() {
  return new Date().toISOString().slice(0, 10);
}

export function OwnerStatementPage() {
  const { data: properties } = useLandlordPropertyOptionsForAccounting();
  const [propertyId, setPropertyId] = useState('');
  const [startDate, setStartDate] = useState(getDefaultStartDate());
  const [endDate, setEndDate] = useState(getTodayDate());
  const { data: statement, isLoading } = useOwnerStatement(propertyId, startDate, endDate);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-h4 text-foreground">Owner Statement</h1>
        <p className="text-muted-foreground">
          A period summary of income, expenses, and net for one property.
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <select
          value={propertyId}
          onChange={(e) => setPropertyId(e.target.value)}
          className="h-10 rounded-md border border-input bg-background px-3 text-small"
        >
          <option value="">Select a property...</option>
          {(properties ?? []).map((p) => (
            <option key={p.id} value={p.id}>
              {p.propertyName}
            </option>
          ))}
        </select>
        <DateRangeFilter
          startDate={startDate}
          endDate={endDate}
          onStartDateChange={setStartDate}
          onEndDateChange={setEndDate}
        />
      </div>

      {!propertyId ? (
        <p className="text-muted-foreground">Select a property to generate its statement.</p>
      ) : isLoading ? (
        <Skeleton className="h-96" />
      ) : statement ? (
        <>
          <div className="flex items-center justify-between">
            <h2 className="text-h5 text-foreground">{statement.propertyName}</h2>
            <ExportMenu
              title={`Owner Statement - ${statement.propertyName}`}
              headers={['Metric', 'Amount (NGN)']}
              rows={[
                ['Total Income', statement.totalIncome],
                ['Total Expenses', statement.totalExpenses],
                ['Net Income', statement.netIncome],
              ]}
            />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <Card>
              <CardContent className="p-5">
                <p className="text-caption text-muted-foreground">Total Income</p>
                <p className="text-h5 font-semibold text-success">
                  {formatNaira(statement.totalIncome)}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-5">
                <p className="text-caption text-muted-foreground">Total Expenses</p>
                <p className="text-h5 font-semibold text-destructive">
                  {formatNaira(statement.totalExpenses)}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-5">
                <p className="text-caption text-muted-foreground">Net Income</p>
                <p className="text-h5 font-semibold text-foreground">
                  {formatNaira(statement.netIncome)}
                </p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardContent className="p-5">
              <h3 className="mb-3 font-medium text-foreground">Income by Month</h3>
              {statement.incomeByMonth.length > 0 ? (
                <div className="flex flex-col divide-y">
                  {statement.incomeByMonth.map((m) => (
                    <div
                      key={m.month}
                      className="flex items-center justify-between py-2 text-small"
                    >
                      <span className="text-muted-foreground">{m.month}</span>
                      <span className="font-medium text-foreground">{formatNaira(m.amount)}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-small text-muted-foreground">No income this period.</p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-5">
              <h3 className="mb-3 font-medium text-foreground">Expenses by Category</h3>
              {statement.expensesByCategory.length > 0 ? (
                <div className="flex flex-col divide-y">
                  {statement.expensesByCategory.map((c) => (
                    <div
                      key={c.category}
                      className="flex items-center justify-between py-2 text-small capitalize"
                    >
                      <span className="text-muted-foreground">{c.category.replace('_', ' ')}</span>
                      <span className="font-medium text-foreground">{formatNaira(c.amount)}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-small text-muted-foreground">No expenses this period.</p>
              )}
            </CardContent>
          </Card>
        </>
      ) : null}
    </div>
  );
}
