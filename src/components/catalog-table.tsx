import { AppTopbar } from "@/components/app-topbar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Pencil, Plus, Trash2 } from "lucide-react";

export type CatalogColumn<T> = {
  key: keyof T;
  label: string;
  className?: string;
  render?: (row: T) => React.ReactNode;
};

export function CatalogTable<T extends { id: string }>({
  title,
  description,
  addLabel,
  columns,
  rows,
}: {
  title: string;
  description: string;
  addLabel: string;
  columns: CatalogColumn<T>[];
  rows: T[];
}) {
  return (
    <>
      <AppTopbar title={title} description={description} />
      <div className="flex-1 space-y-4 p-6">
        <div className="flex items-center justify-end">
          <Button size="sm">
            <Plus className="h-4 w-4" />
            {addLabel}
          </Button>
        </div>

        <Card className="border-border/60 overflow-hidden py-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/40 hover:bg-muted/40">
                  {columns.map((col) => (
                    <TableHead key={String(col.key)} className={col.className}>
                      {col.label}
                    </TableHead>
                  ))}
                  <TableHead className="w-20 text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((row) => (
                  <TableRow key={row.id}>
                    {columns.map((col) => (
                      <TableCell key={String(col.key)} className={col.className}>
                        {col.render ? col.render(row) : String(row[col.key] ?? "")}
                      </TableCell>
                    ))}
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <Pencil className="h-3.5 w-3.5" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive">
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </Card>
      </div>
    </>
  );
}
