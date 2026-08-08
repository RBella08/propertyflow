import { useState } from 'react';
import { toast } from 'sonner';
import { Upload, Download, CheckCircle, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  parseImportFile,
  downloadSampleTemplate,
  type ParsedRow,
  type ImportRowResult,
} from '@/features/bulk-import/services/bulkImportService';
import { useBulkImport } from '@/features/bulk-import/hooks/useBulkImport';
import { useMyPlan } from '@/features/plans/hooks/useMyPlan';
import { hasFeatureAccess, FEATURE_MIN_PLAN } from '@/features/plans/planFeatures';
import { UpgradeRequiredCard } from '@/features/plans/components/UpgradeRequiredCard';

export function BulkImportPage() {
  const [parsedRows, setParsedRows] = useState<ParsedRow[]>([]);
  const [fileName, setFileName] = useState('');
  const [parseError, setParseError] = useState<string | null>(null);
  const [results, setResults] = useState<ImportRowResult[] | null>(null);
  const bulkImport = useBulkImport();
  const { data: myPlan } = useMyPlan();

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setResults(null);
    setParseError(null);
    setFileName(file.name);

    try {
      const rows = await parseImportFile(file);
      setParsedRows(rows);
    } catch (error) {
      setParsedRows([]);
      setParseError(error instanceof Error ? error.message : 'Could not read this file');
    }
  };

  const handleImport = async () => {
    try {
      const result = await bulkImport.mutateAsync(parsedRows);
      setResults(result);
      const successCount = result.filter((r) => r.status === 'success').length;
      toast.success(`Imported ${successCount} of ${result.length} units`, {
        description: 'Review any errors below. New properties were created as Drafts.',
      });
    } catch (error) {
      toast.error('Import failed', {
        description: error instanceof Error ? error.message : 'Something went wrong',
      });
    }
  };

  if (myPlan && !hasFeatureAccess(myPlan, 'bulkImport')) {
    return (
      <UpgradeRequiredCard
        featureName="Bulk Import"
        requiredPlanName={FEATURE_MIN_PLAN.bulkImport}
      />
    );
  }

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-6">
      <div>
        <h1 className="text-h4 text-foreground">Bulk Import</h1>
        <p className="text-muted-foreground">
          Upload a spreadsheet to add multiple properties and units at once.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-h6">1. Download the Template</CardTitle>
          <CardDescription>
            Start from our template so your columns match exactly what we expect.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button variant="outline" onClick={downloadSampleTemplate}>
            <Download className="mr-2 h-4 w-4" /> Download Template (.xlsx)
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-h6">2. Upload Your File</CardTitle>
          <CardDescription>
            Multiple rows with the same property name are grouped as units under one property.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <label className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-card border-2 border-dashed border-input p-8 text-center hover:bg-accent">
            <Upload className="h-8 w-8 text-muted-foreground" />
            <p className="text-small font-medium text-foreground">
              {fileName || 'Click to select a .csv or .xlsx file'}
            </p>
            <input
              type="file"
              accept=".csv,.xlsx,.xls"
              className="hidden"
              onChange={handleFileChange}
            />
          </label>

          {parseError && <p className="text-caption text-destructive">{parseError}</p>}

          {parsedRows.length > 0 && !results && (
            <div className="flex flex-col gap-3">
              <p className="text-small text-muted-foreground">
                Found <strong>{parsedRows.length}</strong> row(s) ready to import.
              </p>
              <Button onClick={handleImport} loading={bulkImport.isPending}>
                Import {parsedRows.length} Units
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {results && (
        <Card>
          <CardHeader>
            <CardTitle className="text-h6">Import Results</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col divide-y">
            {results.map((r, i) => (
              <div key={i} className="flex items-center justify-between gap-3 py-3">
                <div>
                  <p className="text-small font-medium text-foreground">
                    Row {r.row}: {r.propertyName} — Unit {r.unitNumber}
                  </p>
                  <p className="text-caption text-muted-foreground">{r.message}</p>
                </div>
                {r.status === 'success' ? (
                  <Badge variant="success" className="flex items-center gap-1">
                    <CheckCircle className="h-3 w-3" /> Success
                  </Badge>
                ) : (
                  <Badge variant="destructive" className="flex items-center gap-1">
                    <XCircle className="h-3 w-3" /> Error
                  </Badge>
                )}
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
