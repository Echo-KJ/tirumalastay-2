import { Badge } from '@/components/ui/badge';
import { RoomStatus, BookingStatus, PaymentStatus } from '@/types';
import { cn } from '@/lib/utils';

interface StatusBadgeProps {
  status: RoomStatus | BookingStatus | PaymentStatus;
  type: 'room' | 'booking' | 'payment';
  className?: string;
}

const roomStatusConfig: Record<RoomStatus, { label: string; className: string }> = {
  AVAILABLE: { label: 'Available', className: 'status-available' },
  OCCUPIED: { label: 'Occupied', className: 'status-occupied' },
  CLEANING: { label: 'Cleaning', className: 'status-cleaning' },
  MAINTENANCE: { label: 'Maintenance', className: 'status-maintenance' },
};

const bookingStatusConfig: Record<BookingStatus, { label: string; className: string }> = {
  PENDING: { label: 'Pending', className: 'booking-pending' },
  CONFIRMED: { label: 'Confirmed', className: 'booking-confirmed' },
  CHECKED_IN: { label: 'Checked In', className: 'booking-checked-in' },
  CHECKED_OUT: { label: 'Checked Out', className: 'booking-checked-out' },
  CANCELLED: { label: 'Cancelled', className: 'booking-cancelled' },
};

const paymentStatusConfig: Record<PaymentStatus, { label: string; className: string }> = {
  PAID: { label: 'Paid', className: 'payment-paid' },
  PAY_AT_HOTEL: { label: 'Pay at Hotel', className: 'booking-confirmed' },
  PENDING: { label: 'Pending', className: 'payment-pending' },
  FAILED: { label: 'Failed', className: 'payment-failed' },
};

export function StatusBadge({ status, type, className }: StatusBadgeProps) {
  let config: { label: string; className: string };

  switch (type) {
    case 'room':
      config = roomStatusConfig[status as RoomStatus];
      break;
    case 'booking':
      config = bookingStatusConfig[status as BookingStatus];
      break;
    case 'payment':
      config = paymentStatusConfig[status as PaymentStatus];
      break;
    default:
      config = { label: status, className: '' };
  }

  return (
    <Badge variant="outline" className={cn('font-medium border', config.className, className)}>
      {config.label}
    </Badge>
  );
}
