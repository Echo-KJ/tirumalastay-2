// ============================================
// METRIC CARD COMPONENT
// Consistent KPI display for dashboards
// ============================================

import { ReactNode } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface MetricCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: ReactNode;
  iconBg?: string;
  trend?: {
    value: number;
    label: string;
    isPositive: boolean;
  };
  className?: string;
  onClick?: () => void;
  highlight?: boolean;
}

export function MetricCard({
  title,
  value,
  subtitle,
  icon,
  iconBg = 'bg-primary/10',
  trend,
  className,
  onClick,
  highlight = false,
}: MetricCardProps) {
  return (
    <Card 
      className={cn(
        'transition-all',
        onClick && 'cursor-pointer hover:shadow-md hover:-translate-y-0.5',
        highlight && 'border-warning bg-warning/5',
        className
      )}
      onClick={onClick}
    >
      <CardContent className="p-4 sm:p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <p className="text-xs sm:text-sm font-medium text-muted-foreground truncate">
              {title}
            </p>
            <p className="text-xl sm:text-2xl lg:text-3xl font-display font-bold mt-1 truncate">
              {value}
            </p>
            {subtitle && (
              <p className="text-xs text-muted-foreground mt-0.5 truncate">
                {subtitle}
              </p>
            )}
            {trend && (
              <div className="flex items-center gap-1 mt-1">
                <span className={cn(
                  'text-xs font-medium',
                  trend.isPositive ? 'text-success' : 'text-destructive'
                )}>
                  {trend.isPositive ? '↑' : '↓'} {trend.value}%
                </span>
                <span className="text-xs text-muted-foreground">
                  {trend.label}
                </span>
              </div>
            )}
          </div>
          <div className={cn(
            'w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center flex-shrink-0',
            iconBg
          )}>
            {icon}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Compact version for tighter layouts
export function MetricCardCompact({
  title,
  value,
  icon,
  iconBg = 'bg-primary/10',
  className,
}: Pick<MetricCardProps, 'title' | 'value' | 'icon' | 'iconBg' | 'className'>) {
  return (
    <Card className={className}>
      <CardContent className="p-3">
        <div className="flex items-center gap-3">
          <div className={cn(
            'w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0',
            iconBg
          )}>
            {icon}
          </div>
          <div className="min-w-0">
            <p className="text-lg sm:text-xl font-bold truncate">{value}</p>
            <p className="text-xs text-muted-foreground truncate">{title}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
