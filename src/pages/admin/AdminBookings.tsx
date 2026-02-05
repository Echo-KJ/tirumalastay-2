import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Search, Filter, Eye, LogIn, LogOut, XCircle, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { bookingsApi } from '@/services/api';
import { Booking, Guest, Room, BookingStatus } from '@/types';
import { PageLoader } from '@/components/ui/LoadingSpinner';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { toast } from 'sonner';

export default function AdminBookings() {
  const [bookings, setBookings] = useState<(Booking & { guest: Guest; room: Room })[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<BookingStatus | 'ALL'>('ALL');
  const [selectedBooking, setSelectedBooking] = useState<(Booking & { guest: Guest; room: Room }) | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);

  const loadBookings = async () => {
    try {
      const filters = {
        status: statusFilter !== 'ALL' ? statusFilter : undefined,
        search: searchQuery || undefined,
      };
      const data = await bookingsApi.getBookings(filters);
      setBookings(data);
    } catch (error) {
      console.error('Failed to load bookings:', error);
      toast.error('Failed to load bookings');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBookings();
  }, [statusFilter]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    loadBookings();
  };

  const updateStatus = async (bookingId: string, newStatus: BookingStatus) => {
    setActionLoading(true);
    try {
      await bookingsApi.updateBookingStatus(bookingId, newStatus);
      toast.success(`Booking ${newStatus.toLowerCase().replace('_', ' ')}`);
      loadBookings();
      setSelectedBooking(null);
    } catch (error) {
      toast.error('Failed to update booking');
    } finally {
      setActionLoading(false);
    }
  };

  const handleCancel = async () => {
    if (!selectedBooking) return;
    setActionLoading(true);
    try {
      await bookingsApi.cancelBooking(selectedBooking.id);
      toast.success('Booking cancelled');
      loadBookings();
      setSelectedBooking(null);
      setCancelDialogOpen(false);
    } catch (error: any) {
      toast.error(error.message || 'Failed to cancel booking');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) return <PageLoader />;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold">Bookings</h1>
          <p className="text-muted-foreground">
            Manage all hotel bookings and reservations
          </p>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <form onSubmit={handleSearch} className="flex-1 flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by booking code, guest name, or phone..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Button type="submit" variant="secondary">
                Search
              </Button>
            </form>
            <Select
              value={statusFilter}
              onValueChange={(v) => setStatusFilter(v as BookingStatus | 'ALL')}
            >
              <SelectTrigger className="w-full sm:w-48">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Statuses</SelectItem>
                <SelectItem value="PENDING">Pending</SelectItem>
                <SelectItem value="CONFIRMED">Confirmed</SelectItem>
                <SelectItem value="CHECKED_IN">Checked In</SelectItem>
                <SelectItem value="CHECKED_OUT">Checked Out</SelectItem>
                <SelectItem value="CANCELLED">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Bookings List - Mobile responsive */}
      <Card>
        <CardContent className="p-0">
          {/* Mobile view - Cards */}
          <div className="block sm:hidden divide-y">
            {bookings.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground">
                No bookings found
              </div>
            ) : (
              bookings.map((booking) => (
                <div 
                  key={booking.id} 
                  className="p-4 space-y-3 touch-manipulation active:bg-muted/30"
                  onClick={() => setSelectedBooking(booking)}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="font-mono text-sm font-medium">{booking.bookingCode}</p>
                      <p className="text-sm text-muted-foreground">{booking.guest?.name}</p>
                    </div>
                    <StatusBadge status={booking.status} type="booking" />
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <div>
                      <p className="text-muted-foreground">Room {booking.room?.number}</p>
                      <p className="text-xs text-muted-foreground">
                        {format(new Date(booking.checkIn), 'MMM d')} - {format(new Date(booking.checkOut), 'MMM d')}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">₹{booking.totalAmount.toLocaleString()}</p>
                      <StatusBadge status={booking.paymentStatus} type="payment" />
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Desktop view - Table */}
          <div className="hidden sm:block overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="text-left p-4 font-medium text-muted-foreground">Booking</th>
                  <th className="text-left p-4 font-medium text-muted-foreground">Guest</th>
                  <th className="text-left p-4 font-medium text-muted-foreground">Room</th>
                  <th className="text-left p-4 font-medium text-muted-foreground">Dates</th>
                  <th className="text-left p-4 font-medium text-muted-foreground">Status</th>
                  <th className="text-left p-4 font-medium text-muted-foreground">Payment</th>
                  <th className="text-right p-4 font-medium text-muted-foreground">Amount</th>
                  <th className="text-right p-4 font-medium text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {bookings.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="p-8 text-center text-muted-foreground">
                      No bookings found
                    </td>
                  </tr>
                ) : (
                  bookings.map((booking) => (
                    <tr key={booking.id} className="hover:bg-muted/30">
                      <td className="p-4">
                        <p className="font-mono text-sm">{booking.bookingCode}</p>
                        <p className="text-xs text-muted-foreground">
                          {format(new Date(booking.createdAt), 'MMM d, yyyy')}
                        </p>
                      </td>
                      <td className="p-4">
                        <p className="font-medium">{booking.guest?.name}</p>
                        <p className="text-sm text-muted-foreground">{booking.guest?.phone}</p>
                      </td>
                      <td className="p-4">
                        <p>Room {booking.room?.number}</p>
                        <p className="text-sm text-muted-foreground">
                          {booking.room?.type?.name}
                        </p>
                      </td>
                      <td className="p-4 text-sm">
                        <p>{format(new Date(booking.checkIn), 'MMM d')}</p>
                        <p className="text-muted-foreground">
                          to {format(new Date(booking.checkOut), 'MMM d')}
                        </p>
                      </td>
                      <td className="p-4">
                        <StatusBadge status={booking.status} type="booking" />
                      </td>
                      <td className="p-4">
                        <StatusBadge status={booking.paymentStatus} type="payment" />
                      </td>
                      <td className="p-4 text-right font-medium">
                        ₹{booking.totalAmount.toLocaleString()}
                      </td>
                      <td className="p-4 text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setSelectedBooking(booking)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Booking Details Dialog */}
      <Dialog open={!!selectedBooking && !cancelDialogOpen} onOpenChange={() => setSelectedBooking(null)}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto mx-4 sm:mx-auto">
          <DialogHeader>
            <DialogTitle className="text-lg">Booking Details</DialogTitle>
            <DialogDescription className="font-mono">
              {selectedBooking?.bookingCode}
            </DialogDescription>
          </DialogHeader>

          {selectedBooking && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Status</p>
                  <StatusBadge status={selectedBooking.status} type="booking" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Payment</p>
                  <StatusBadge status={selectedBooking.paymentStatus} type="payment" />
                </div>
              </div>

              <div className="border-t pt-4">
                <h4 className="font-semibold mb-2">Guest Information</h4>
                <div className="text-sm space-y-1">
                  <p><span className="text-muted-foreground">Name:</span> {selectedBooking.guest?.name}</p>
                  <p><span className="text-muted-foreground">Phone:</span> {selectedBooking.guest?.phone}</p>
                  {selectedBooking.guest?.email && (
                    <p><span className="text-muted-foreground">Email:</span> {selectedBooking.guest.email}</p>
                  )}
                  {selectedBooking.guest?.city && (
                    <p><span className="text-muted-foreground">City:</span> {selectedBooking.guest.city}</p>
                  )}
                </div>
              </div>

              <div className="border-t pt-4">
                <h4 className="font-semibold mb-2">Stay Details</h4>
                <div className="text-sm space-y-1">
                  <p><span className="text-muted-foreground">Room:</span> {selectedBooking.room?.number} ({selectedBooking.room?.type?.name})</p>
                  <p><span className="text-muted-foreground">Check-in:</span> {format(new Date(selectedBooking.checkIn), 'EEE, MMM d, yyyy')}</p>
                  <p><span className="text-muted-foreground">Check-out:</span> {format(new Date(selectedBooking.checkOut), 'EEE, MMM d, yyyy')}</p>
                  <p><span className="text-muted-foreground">Guests:</span> {selectedBooking.guestsCount}</p>
                  <p className="text-lg font-semibold mt-2">
                    Total: ₹{selectedBooking.totalAmount.toLocaleString()}
                  </p>
                </div>
              </div>
            </div>
          )}

          <DialogFooter className="flex-col sm:flex-row gap-2 pt-4">
            {selectedBooking?.status === 'CONFIRMED' && (
              <Button
                onClick={() => updateStatus(selectedBooking.id, 'CHECKED_IN')}
                disabled={actionLoading}
                className="w-full sm:w-auto bg-success hover:bg-success/90 h-12 sm:h-10"
              >
                {actionLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <LogIn className="h-4 w-4 mr-2" />}
                Check In
              </Button>
            )}
            {selectedBooking?.status === 'CHECKED_IN' && (
              <Button
                onClick={() => updateStatus(selectedBooking.id, 'CHECKED_OUT')}
                disabled={actionLoading}
                variant="secondary"
                className="w-full sm:w-auto h-12 sm:h-10"
              >
                {actionLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <LogOut className="h-4 w-4 mr-2" />}
                Check Out
              </Button>
            )}
            {(selectedBooking?.status === 'RESERVED' || selectedBooking?.status === 'CONFIRMED') && (
              <Button
                variant="destructive"
                onClick={() => setCancelDialogOpen(true)}
                disabled={actionLoading}
                className="w-full sm:w-auto h-12 sm:h-10"
              >
                <XCircle className="h-4 w-4 mr-2" />
                Cancel Booking
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Cancel Confirmation Dialog */}
      <Dialog open={cancelDialogOpen} onOpenChange={setCancelDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cancel Booking</DialogTitle>
            <DialogDescription>
              Are you sure you want to cancel booking {selectedBooking?.bookingCode}?
              This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCancelDialogOpen(false)}>
              Keep Booking
            </Button>
            <Button variant="destructive" onClick={handleCancel} disabled={actionLoading}>
              {actionLoading ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : null}
              Yes, Cancel Booking
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
