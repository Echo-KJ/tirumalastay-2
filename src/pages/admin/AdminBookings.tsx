// ============================================
// BOOKINGS LIST PAGE
// Enhanced booking list with filters
// ============================================

import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Filter, Plus, Eye, Calendar, ChevronRight } from 'lucide-react';
import { format } from 'date-fns';
import { bookingsApi } from '@/services/api';
import { Booking, Guest, Room, BookingStatus, RoomType } from '@/types';
import { PageLoader } from '@/components/ui/LoadingSpinner';
import { PageHeader } from '@/components/admin/ui/PageHeader';
import { StatusBadge } from '@/components/admin/ui/StatusBadge';
import { toast } from 'sonner';
import { formatCurrency } from '@/config/hotel';

type BookingWithDetails = Booking & { guest: Guest; room: Room & { type?: RoomType } };

export default function AdminBookings() {
  const [bookings, setBookings] = useState<BookingWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<BookingStatus | 'ALL'>('ALL');
  const navigate = useNavigate();

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
    setLoading(true);
    loadBookings();
  };

  if (loading) return <PageLoader />;

  return (
    <div className="space-y-5">
      {/* Header */}
      <PageHeader
        title="Bookings"
        subtitle={`${bookings.length} booking${bookings.length !== 1 ? 's' : ''}`}
        actions={
          <Button asChild>
            <Link to="/admin/bookings/new">
              <Plus className="h-4 w-4 mr-2" />
              New Booking
            </Link>
          </Button>
        }
      />

      {/* Filters */}
      <Card>
        <CardContent className="p-3">
          <div className="flex flex-col sm:flex-row gap-3">
            <form onSubmit={handleSearch} className="flex-1 flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search booking code, guest name, phone..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
              <Button type="submit" variant="secondary" size="sm" className="px-4">
                Search
              </Button>
            </form>
            <Select
              value={statusFilter}
              onValueChange={(v) => setStatusFilter(v as BookingStatus | 'ALL')}
            >
              <SelectTrigger className="w-full sm:w-44">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Statuses</SelectItem>
                <SelectItem value="RESERVED">Reserved</SelectItem>
                <SelectItem value="CONFIRMED">Confirmed</SelectItem>
                <SelectItem value="IN_HOUSE">In House</SelectItem>
                <SelectItem value="CHECKED_OUT">Checked Out</SelectItem>
                <SelectItem value="CANCELLED">Cancelled</SelectItem>
                <SelectItem value="NO_SHOW">No Show</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Bookings List */}
      <Card>
        <CardContent className="p-0">
          {bookings.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">
              <Calendar className="h-10 w-10 mx-auto mb-3 opacity-50" />
              <p>No bookings found</p>
              <Button variant="link" asChild className="mt-2">
                <Link to="/admin/bookings/new">Create a new booking</Link>
              </Button>
            </div>
          ) : (
            <>
              {/* Mobile view - Cards */}
              <div className="block md:hidden divide-y">
                {bookings.map((booking) => (
                  <div 
                    key={booking.id} 
                    className="p-4 active:bg-muted/30 cursor-pointer"
                    onClick={() => navigate(`/admin/bookings/${booking.id}`)}
                  >
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div className="min-w-0">
                        <p className="font-mono text-sm font-medium">{booking.bookingCode}</p>
                        <p className="text-sm truncate">{booking.guest?.name}</p>
                      </div>
                      <StatusBadge status={booking.status} type="booking" size="sm" />
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <div className="text-muted-foreground">
                        <p>Room {booking.room?.number}</p>
                        <p className="text-xs">
                          {format(new Date(booking.checkIn), 'MMM d')} - {format(new Date(booking.checkOut), 'MMM d')}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">{formatCurrency(booking.totalAmount)}</p>
                        <StatusBadge status={booking.paymentStatus} type="payment" size="sm" />
                      </div>
                    </div>
                    <ChevronRight className="h-4 w-4 text-muted-foreground absolute right-4 top-1/2 -translate-y-1/2 hidden" />
                  </div>
                ))}
              </div>

              {/* Desktop view - Table */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b bg-muted/50">
                      <th className="text-left p-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">Booking</th>
                      <th className="text-left p-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">Guest</th>
                      <th className="text-left p-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">Room</th>
                      <th className="text-left p-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">Dates</th>
                      <th className="text-left p-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">Status</th>
                      <th className="text-left p-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">Payment</th>
                      <th className="text-right p-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">Amount</th>
                      <th className="text-right p-3 text-xs font-medium text-muted-foreground uppercase tracking-wider w-10"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {bookings.map((booking) => (
                      <tr 
                        key={booking.id} 
                        className="hover:bg-muted/30 cursor-pointer transition-colors"
                        onClick={() => navigate(`/admin/bookings/${booking.id}`)}
                      >
                        <td className="p-3">
                          <p className="font-mono text-sm">{booking.bookingCode}</p>
                          <p className="text-xs text-muted-foreground">
                            {format(new Date(booking.createdAt), 'MMM d, yyyy')}
                          </p>
                        </td>
                        <td className="p-3">
                          <p className="font-medium text-sm">{booking.guest?.name}</p>
                          <p className="text-xs text-muted-foreground">{booking.guest?.phone}</p>
                        </td>
                        <td className="p-3">
                          <p className="text-sm">{booking.room?.number}</p>
                          <p className="text-xs text-muted-foreground">
                            {booking.room?.type?.name}
                          </p>
                        </td>
                        <td className="p-3 text-sm">
                          <p>{format(new Date(booking.checkIn), 'MMM d')}</p>
                          <p className="text-muted-foreground">
                            → {format(new Date(booking.checkOut), 'MMM d')}
                          </p>
                        </td>
                        <td className="p-3">
                          <StatusBadge status={booking.status} type="booking" size="sm" />
                        </td>
                        <td className="p-3">
                          <StatusBadge status={booking.paymentStatus} type="payment" size="sm" />
                        </td>
                        <td className="p-3 text-right">
                          <p className="font-medium">{formatCurrency(booking.totalAmount)}</p>
                        </td>
                        <td className="p-3 text-right">
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <Eye className="h-4 w-4" />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
