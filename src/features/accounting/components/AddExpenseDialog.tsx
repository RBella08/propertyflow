import { useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { EXPENSE_CATEGORIES, type PropertyOption } from '../services/accountingService';
import { useAddExpense } from '../hooks/useAccounting';

interface AddExpenseDialogProps {
  open: boolean;
  onClose: () => void;
  properties: PropertyOption[] | undefined;
}

export function AddExpenseDialog({ open, onClose, properties }: AddExpenseDialogProps) {
  const addExpense = useAddExpense();
  const [propertyId, setPropertyId] = useState('');
  const [category, setCategory] = useState('maintenance');
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [expenseDate, setExpenseDate] = useState(new Date().toISOString().slice(0, 10));

  const handleSubmit = async () => {
    if (!propertyId || !amount || Number(amount) <= 0) {
      toast.error('Select a property and enter a valid amount');
      return;
    }
    try {
      await addExpense.mutateAsync({
        propertyId,
        category,
        description,
        amount: Number(amount),
        expenseDate,
      });
      toast.success('Expense recorded');
      setPropertyId('');
      setDescription('');
      setAmount('');
      onClose();
    } catch {
      toast.error('Could not record expense');
    }
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Record Expense</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-4 pt-2">
          <div className="flex flex-col gap-2">
            <Label htmlFor="expProperty">Property</Label>
            <select
              id="expProperty"
              value={propertyId}
              onChange={(e) => setPropertyId(e.target.value)}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            >
              <option value="">Select a property...</option>
              {(properties ?? []).map((p) => (
                <option key={p.id} value={p.id}>
                  {p.propertyName}
                </option>
              ))}
            </select>
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="expCategory">Category</Label>
            <select
              id="expCategory"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm capitalize"
            >
              {EXPENSE_CATEGORIES.map((c) => (
                <option key={c} value={c} className="capitalize">
                  {c.replace('_', ' ')}
                </option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="expAmount">Amount (₦)</Label>
              <Input
                id="expAmount"
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="expDate">Date</Label>
              <Input
                id="expDate"
                type="date"
                value={expenseDate}
                onChange={(e) => setExpenseDate(e.target.value)}
              />
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="expDescription">Description (optional)</Label>
            <Textarea
              id="expDescription"
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
          <Button onClick={handleSubmit} loading={addExpense.isPending}>
            Record Expense
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
