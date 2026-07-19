import { Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { exportToCSV, exportToPDF, exportToExcel } from '@/lib/export';

interface ExportMenuProps {
  title: string;
  headers: string[];
  rows: (string | number)[][];
}

export function ExportMenu({ title, headers, rows }: ExportMenuProps) {
  const filename = title.replace(/\s+/g, '_').toLowerCase();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" disabled={rows.length === 0}>
          <Download className="mr-2 h-4 w-4" /> Export
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => exportToPDF(title, headers, rows)}>
          Export as PDF
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => exportToCSV(filename, headers, rows)}>
          Export as CSV
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => exportToExcel(filename, title, headers, rows)}>
          Export as Excel
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
