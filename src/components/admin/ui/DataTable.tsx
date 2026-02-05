// ============================================
// DATA TABLE COMPONENT
// Reusable table with mobile responsiveness
// ============================================

import { ReactNode } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

// Column definition
export interface Column<T> {
  key: string;
  header: string;
  cell: (row: T) => ReactNode;
  className?: string;
  hideOnMobile?: boolean;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  keyExtractor: (row: T) => string;
  onRowClick?: (row: T) => void;
  emptyMessage?: string;
  mobileCard?: (row: T) => ReactNode;
  className?: string;
}

export function DataTable<T>({
  columns,
  data,
  keyExtractor,
  onRowClick,
  emptyMessage = 'No data available',
  mobileCard,
  className,
}: DataTableProps<T>) {
  if (data.length === 0) {
    return (
      <Card className={className}>
        <CardContent className="p-8 text-center text-muted-foreground">
          {emptyMessage}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardContent className="p-0">
        {/* Mobile view - Cards */}
        {mobileCard && (
          <div className="block md:hidden divide-y">
            {data.map((row) => (
              <div
                key={keyExtractor(row)}
                onClick={() => onRowClick?.(row)}
                className={cn(
                  'p-4',
                  onRowClick && 'cursor-pointer active:bg-muted/30'
                )}
              >
                {mobileCard(row)}
              </div>
            ))}
          </div>
        )}

        {/* Desktop view - Table */}
        <div className={cn('overflow-x-auto', mobileCard && 'hidden md:block')}>
          <table className="w-full">
            <thead>
              <tr className="border-b bg-muted/50">
                {columns.map((col) => (
                  <th
                    key={col.key}
                    className={cn(
                      'text-left p-4 font-medium text-sm text-muted-foreground',
                      col.hideOnMobile && 'hidden lg:table-cell',
                      col.className
                    )}
                  >
                    {col.header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y">
              {data.map((row) => (
                <tr
                  key={keyExtractor(row)}
                  onClick={() => onRowClick?.(row)}
                  className={cn(
                    'hover:bg-muted/30 transition-colors',
                    onRowClick && 'cursor-pointer'
                  )}
                >
                  {columns.map((col) => (
                    <td
                      key={col.key}
                      className={cn(
                        'p-4',
                        col.hideOnMobile && 'hidden lg:table-cell',
                        col.className
                      )}
                    >
                      {col.cell(row)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}

// Simple list variant for quick lists
interface SimpleListProps<T> {
  items: T[];
  keyExtractor: (item: T) => string;
  renderItem: (item: T) => ReactNode;
  onItemClick?: (item: T) => void;
  emptyMessage?: string;
  className?: string;
}

export function SimpleList<T>({
  items,
  keyExtractor,
  renderItem,
  onItemClick,
  emptyMessage = 'No items',
  className,
}: SimpleListProps<T>) {
  if (items.length === 0) {
    return (
      <p className="text-sm text-muted-foreground text-center py-4">
        {emptyMessage}
      </p>
    );
  }

  return (
    <div className={cn('space-y-2', className)}>
      {items.map((item) => (
        <div
          key={keyExtractor(item)}
          onClick={() => onItemClick?.(item)}
          className={cn(
            'p-3 rounded-lg border bg-card hover:bg-muted/50 transition-colors',
            onItemClick && 'cursor-pointer'
          )}
        >
          {renderItem(item)}
        </div>
      ))}
    </div>
  );
}
