import { useState } from 'react';
import { Plus } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { DateRangeFilter } from '@/features/reports/components/DateRangeFilter';
import { ExportMenu } from '@/features/reports/components/ExportMenu';
import {
  useManagerLedger,
  useManagerPropertyOptionsForAccounting,
} from '@/features/accounting/hooks/useAccounting';
import { AddExpenseDialog } from '@/features/accounting/components/AddExpenseDialog';

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

export function ManagerLedgerPage() {
  const [startDate, setStartDate] = useState(getDefaultStartDate());
  const [endDate, setEndDate] = useState(getTodayDate());
  const [expenseDialogOpen, setExpenseDialogOpen] = useState(false);
  const [visibleCount, setVisibleCount] = useState(15);
  const { data: entries, isLoading } = useManagerLedger(startDate, endDate);
  const { data: properties } = useManagerPropertyOptionsForAccounting();

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-h4 text-foreground">Accounting Ledger</h1>
          <p className="text-muted-foreground">Transactions across your assigned properties.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setExpenseDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" /> Record Expense
          </Button>
          <ExportMenu
            title="Accounting Ledger"
            headers={[
              'Date',
              'Type',
              'Category',
              'Property',
              'Description',
              'Amount (NGN)',
              'Running Balance',
            ]}
            rows={(entries ?? []).map((e) => [
              e.date,
              e.type,
              e.category,
              e.propertyName,
              e.description,
              e.type === 'income' ? e.amount : -e.amount,
              e.runningBalance,
            ])}
          />
        </div>
      </div>

      <DateRangeFilter
        startDate={startDate}
        endDate={endDate}
        onStartDateChange={setStartDate}
        onEndDateChange={setEndDate}
      />

      {isLoading ? (
        <Skeleton className="h-64" />
      ) : entries && entries.length > 0 ? (
        <div className="flex flex-col gap-2">
          {entries.slice(0, visibleCount).map((entry) => (
            <Card key={`${entry.type}-${entry.id}`}>
              <CardContent className="flex flex-wrap items-center justify-between gap-3 p-4">
                <div>
                  {entries.length > visibleCount && (
                    <div className="flex justify-center pt-2">
                      <Button variant="outline" onClick={() => setVisibleCount((c) => c + 15)}>
                        Load More
                      </Button>
                    </div>
                  )}
                  <p className="text-small font-medium text-foreground">
                    {entry.description || entry.category}
                  </p>
                  <p className="text-caption text-muted-foreground">
                    {entry.propertyName} · {new Date(entry.date).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  <Badge
                    variant={entry.type === 'income' ? 'success' : 'destructive'}
                    className="capitalize"
                  >
                    {entry.type}
                  </Badge>
                  <span
                    className={`text-small font-semibold ${entry.type === 'income' ? 'text-success' : 'text-destructive'}`}
                  >
                    {entry.type === 'income' ? '+' : '-'}
                    {formatNaira(entry.amount)}
                  </span>
                  <span className="text-caption text-muted-foreground">
                    Bal: {formatNaira(entry.runningBalance)}
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <p className="text-muted-foreground">No transactions in this period.</p>
      )}

      <AddExpenseDialog
        open={expenseDialogOpen}
        onClose={() => setExpenseDialogOpen(false)}
        properties={properties}
      />
    </div>
  );
}
