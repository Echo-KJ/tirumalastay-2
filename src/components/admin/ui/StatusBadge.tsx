// ============================================
// ENHANCED STATUS BADGE COMPONENT
// Consistent status display across admin panel
// ============================================

import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { 
  bookingStatusConfig, 
  roomStatusConfig, 
  paymentStatusConfig 
} from '@/config/hotel';
import { BookingStatus, RoomStatus, PaymentStatus } from '@/types';

type StatusType = 'booking' | 'room' | 'payment';

interface StatusBadgeProps {
  status: BookingStatus | RoomStatus | PaymentStatus;
  type: StatusType;
  size?: 'sm' | 'md' | 'lg';
  showDot?: boolean;
  className?: string;
}

export function StatusBadge({ 
  status, 
  type, 
  size = 'md',
  showDot = false,
  className 
}: StatusBadgeProps) {
  let config: { label: string; color: string; bgClass: string };

  switch (type) {
    case 'booking':
      config = bookingStatusConfig[status as BookingStatus] || {
        label: status,
        color: 'muted',
        bgClass: 'bg-muted text-muted-foreground border-border',
      };
      break;
    case 'room':
      config = roomStatusConfig[status as RoomStatus] || {
        label: status,
        color: 'muted',
        bgClass: 'bg-muted text-muted-foreground border-border',
      };
      break;
    case 'payment':
      config = paymentStatusConfig[status as PaymentStatus] || {
        label: status,
        color: 'muted',
        bgClass: 'bg-muted text-muted-foreground border-border',
      };
      break;
    default:
      config = {
        label: String(status),
        color: 'muted',
        bgClass: 'bg-muted text-muted-foreground border-border',
      };
  }

  const sizeClasses = {
    sm: 'text-[10px] px-1.5 py-0.5',
    md: 'text-xs px-2 py-0.5',
    lg: 'text-sm px-2.5 py-1',
  };

  return (
    <Badge 
      variant="outline"
      className={cn(
        'font-medium border rounded-full',
        config.bgClass,
        sizeClasses[size],
        className
      )}
    >
      {showDot && (
        <span className={cn(
          'w-1.5 h-1.5 rounded-full mr-1.5',
          config.color === 'success' && 'bg-success',
          config.color === 'warning' && 'bg-warning',
          config.color === 'destructive' && 'bg-destructive',
          config.color === 'info' && 'bg-info',
          config.color === 'muted' && 'bg-muted-foreground',
        )} />
      )}
      {config.label}
    </Badge>
  );
}

// Room status indicator (just a colored dot with tooltip)
interface StatusDotProps {
  status: RoomStatus;
  size?: 'sm' | 'md' | 'lg';
}

export function RoomStatusDot({ status, size = 'md' }: StatusDotProps) {
  const config = roomStatusConfig[status];
  
  const sizeClasses = {
    sm: 'w-2 h-2',
    md: 'w-3 h-3',
    lg: 'w-4 h-4',
  };

  const colorClasses = {
    AVAILABLE: 'bg-success',
    OCCUPIED: 'bg-destructive',
    CLEANING: 'bg-warning',
    MAINTENANCE: 'bg-muted-foreground',
  };

  return (
    <span 
      className={cn(
        'rounded-full inline-block',
        sizeClasses[size],
        colorClasses[status]
      )}
      title={config.label}
    />
  );
}

// Quick status pills for lists
interface StatusPillProps {
  children: React.ReactNode;
  variant: 'success' | 'warning' | 'error' | 'info' | 'muted';
  className?: string;
}

export function StatusPill({ children, variant, className }: StatusPillProps) {
  const variantClasses = {
    success: 'bg-success/10 text-success',
    warning: 'bg-warning/10 text-warning',
    error: 'bg-destructive/10 text-destructive',
    info: 'bg-info/10 text-info',
    muted: 'bg-muted text-muted-foreground',
  };

  return (
    <span className={cn(
      'inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium',
      variantClasses[variant],
      className
    )}>
      {children}
    </span>
  );
}
