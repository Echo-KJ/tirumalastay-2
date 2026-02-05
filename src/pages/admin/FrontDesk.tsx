// ============================================
// FRONT DESK DASHBOARD
// Clean, operational view for hotel reception
// ============================================

import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  CalendarCheck, 
  CalendarX, 
  BedDouble, 
  IndianRupee,
  Users,
  AlertTriangle,
  LogIn,
  LogOut,
  FileText,
  Plus,
  RefreshCw,
  Clock,
  TrendingUp,
} from 'lucide-react';
import { format } from 'date-fns';
import { frontDeskApi } from '@/services/hmsApi';
import { DashboardStats, Booking, Guest, Room, RoomType } from '@/types';
import { PageLoader } from '@/components/ui/LoadingSpinner';
import { PageHeader } from '@/components/admin/ui/PageHeader';
import { MetricCard, MetricCardCompact } from '@/components/admin/ui/MetricCard';
import { StatusBadge } from '@/components/admin/ui/StatusBadge';
import { toast } from 'sonner';
import { formatCurrency } from '@/config/hotel';

type BookingWithDetails = Booking & { guest: Guest; room: Room & { type: RoomType } };

export default function FrontDesk() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const navigate = useNavigate();

  const loadStats = async () => {
    try {
      const data = await frontDeskApi.getDashboardStats();
      setStats(data);
    } catch (error) {
      console.error('Failed to load dashboard stats:', error);
      toast.error('Failed to load dashboard');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadStats();
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    loadStats();
  };

  const handleCheckIn = async (bookingId: string) => {
    setActionLoading(bookingId);
    try {
      await frontDeskApi.checkIn(bookingId);
      toast.success('Guest checked in successfully');
      loadStats();
    } catch (error: any) {
      toast.error(error.message || 'Failed to check in');
    } finally {
      setActionLoading(null);
    }
  };

  const handleCheckOut = async (bookingId: string) => {
    setActionLoading(bookingId);
    try {
      await frontDeskApi.checkOut(bookingId);
      toast.success('Guest checked out successfully');
      loadStats();
    } catch (error: any) {
      toast.error(error.message || 'Failed to check out');
    } finally {
      setActionLoading(null);
    }
  };

  if (loading) return <PageLoader />;
  if (!stats) return <div className="text-center py-8 text-muted-foreground">Failed to load dashboard</div>;

  const occupancyRate = Math.round((stats.currentOccupancy / stats.totalRooms) * 100);
  const totalTodayRevenue = stats.todayRevenueCash + stats.todayRevenueOnline + stats.todayRevenueUPI + stats.todayRevenueCard;
  const hasPendingActions = stats.pendingArrivals.length > 0 || stats.overdueCheckouts.length > 0;

  return (
    <div className="space-y-5">
      {/* Header */}
      <PageHeader
        title="Front Desk"
        subtitle={format(new Date(), 'EEEE, MMMM d, yyyy')}
        onRefresh={handleRefresh}
        refreshing={refreshing}
        actions={
          <Button asChild>
            <Link to="/admin/bookings/new">
              <Plus className="h-4 w-4 mr-2" />
              New Booking
            </Link>
          </Button>
        }
      />

      {/* Top Metrics - Responsive Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        <MetricCardCompact
          title="Check-ins"
          value={stats.todayCheckins.length}
          icon={<CalendarCheck className="h-4 w-4 text-success" />}
          iconBg="bg-success/10"
        />
        <MetricCardCompact
          title="Check-outs"
          value={stats.todayCheckouts.length}
          icon={<CalendarX className="h-4 w-4 text-warning" />}
          iconBg="bg-warning/10"
        />
        <MetricCardCompact
          title="In-House"
          value={stats.inHouseGuests.length}
          icon={<Users className="h-4 w-4 text-primary" />}
          iconBg="bg-primary/10"
        />
        <MetricCardCompact
          title="Occupancy"
          value={`${occupancyRate}%`}
          icon={<BedDouble className="h-4 w-4 text-info" />}
          iconBg="bg-info/10"
        />
        <MetricCardCompact
          title="Unpaid"
          value={stats.unpaidCount}
          icon={<IndianRupee className="h-4 w-4 text-destructive" />}
          iconBg="bg-destructive/10"
          className={stats.unpaidCount > 0 ? 'border-destructive/50' : ''}
        />
        <MetricCardCompact
          title="Today"
          value={formatCurrency(totalTodayRevenue)}
          icon={<TrendingUp className="h-4 w-4 text-hotel-gold" />}
          iconBg="bg-hotel-gold/20"
        />
      </div>

      {/* Pending Actions Alert */}
      {hasPendingActions && (
        <Card className="border-warning/50 bg-warning/5">
          <CardHeader className="pb-2 pt-4">
            <CardTitle className="text-base flex items-center gap-2 text-warning">
              <AlertTriangle className="h-4 w-4" />
              Action Required ({stats.pendingArrivals.length + stats.overdueCheckouts.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="pb-4">
            <div className="space-y-2">
              {stats.pendingArrivals.slice(0, 3).map((booking) => {
                const b = booking as BookingWithDetails;
                return (
                  <div key={b.id} className="flex items-center justify-between p-2 rounded-lg bg-background text-sm">
                    <div className="flex items-center gap-2 min-w-0">
                      <Clock className="h-4 w-4 text-warning flex-shrink-0" />
                      <span className="truncate">
                        <strong>{b.guest?.name}</strong> – Expected {format(new Date(b.checkIn), 'MMM d')}
                      </span>
                    </div>
                    <div className="flex gap-2 flex-shrink-0 ml-2">
                      <Button 
                        size="sm" 
                        variant="outline"
                        className="h-7 px-2"
                        onClick={() => navigate(`/admin/bookings/${b.id}`)}
                      >
                        View
                      </Button>
                      <Button 
                        size="sm"
                        className="h-7 px-2 bg-success hover:bg-success/90"
                        onClick={() => handleCheckIn(b.id)}
                        disabled={actionLoading === b.id}
                      >
                        Check In
                      </Button>
                    </div>
                  </div>
                );
              })}
              {stats.overdueCheckouts.slice(0, 3).map((booking) => {
                const b = booking as BookingWithDetails;
                return (
                  <div key={b.id} className="flex items-center justify-between p-2 rounded-lg bg-background text-sm">
                    <div className="flex items-center gap-2 min-w-0">
                      <AlertTriangle className="h-4 w-4 text-destructive flex-shrink-0" />
                      <span className="truncate">
                        <strong>{b.guest?.name}</strong> – Overstay (Room {b.room?.number})
                      </span>
                    </div>
                    <div className="flex gap-2 flex-shrink-0 ml-2">
                      <Button 
                        size="sm" 
                        variant="outline"
                        className="h-7 px-2"
                        onClick={() => navigate(`/admin/bookings/${b.id}`)}
                      >
                        View
                      </Button>
                      <Button 
                        size="sm"
                        variant="secondary"
                        className="h-7 px-2"
                        onClick={() => handleCheckOut(b.id)}
                        disabled={actionLoading === b.id}
                      >
                        Check Out
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Main Operational Grid */}
      <div className="grid lg:grid-cols-3 gap-5">
        {/* Today's Check-ins */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 pt-4">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <CalendarCheck className="h-4 w-4 text-success" />
              Check-ins Today
            </CardTitle>
            <Badge variant="secondary" className="text-xs">{stats.todayCheckins.length}</Badge>
          </CardHeader>
          <CardContent className="max-h-80 overflow-y-auto pb-4">
            {stats.todayCheckins.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-6">
                No check-ins scheduled
              </p>
            ) : (
              <div className="space-y-2">
                {stats.todayCheckins.map((booking) => {
                  const b = booking as BookingWithDetails;
                  const isCheckedIn = b.status === 'IN_HOUSE' || b.status === 'CHECKED_IN';
                  return (
                    <div
                      key={b.id}
                      className="p-3 rounded-lg border bg-card hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div className="min-w-0">
                          <p className="font-medium text-sm truncate">{b.guest?.name}</p>
                          <p className="text-xs text-muted-foreground">
                            Room {b.room?.number} • {b.bookingCode}
                          </p>
                        </div>
                        <StatusBadge status={b.status} type="booking" size="sm" />
                      </div>
                      <div className="flex gap-2">
                        {!isCheckedIn && (
                          <Button 
                            size="sm" 
                            className="flex-1 h-8 bg-success hover:bg-success/90"
                            onClick={() => handleCheckIn(b.id)}
                            disabled={actionLoading === b.id}
                          >
                            <LogIn className="h-3.5 w-3.5 mr-1" />
                            Check In
                          </Button>
                        )}
                        <Button 
                          size="sm" 
                          variant="outline"
                          className="h-8 px-2"
                          onClick={() => navigate(`/admin/bookings/${b.id}`)}
                        >
                          <FileText className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Today's Check-outs */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 pt-4">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <CalendarX className="h-4 w-4 text-warning" />
              Check-outs Today
            </CardTitle>
            <Badge variant="secondary" className="text-xs">{stats.todayCheckouts.length}</Badge>
          </CardHeader>
          <CardContent className="max-h-80 overflow-y-auto pb-4">
            {stats.todayCheckouts.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-6">
                No check-outs scheduled
              </p>
            ) : (
              <div className="space-y-2">
                {stats.todayCheckouts.map((booking) => {
                  const b = booking as BookingWithDetails;
                  const isCheckedOut = b.status === 'CHECKED_OUT';
                  return (
                    <div
                      key={b.id}
                      className="p-3 rounded-lg border bg-card hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div className="min-w-0">
                          <p className="font-medium text-sm truncate">{b.guest?.name}</p>
                          <p className="text-xs text-muted-foreground">
                            Room {b.room?.number} • {b.bookingCode}
                          </p>
                        </div>
                        <StatusBadge status={b.status} type="booking" size="sm" />
                      </div>
                      <div className="flex gap-2">
                        {!isCheckedOut && (
                          <Button 
                            size="sm" 
                            variant="secondary"
                            className="flex-1 h-8"
                            onClick={() => handleCheckOut(b.id)}
                            disabled={actionLoading === b.id}
                          >
                            <LogOut className="h-3.5 w-3.5 mr-1" />
                            Check Out
                          </Button>
                        )}
                        <Button 
                          size="sm" 
                          variant="outline"
                          className="h-8 px-2"
                          onClick={() => navigate(`/admin/bookings/${b.id}`)}
                        >
                          <FileText className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* In-House Guests */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 pt-4">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <Users className="h-4 w-4 text-primary" />
              In-House Guests
            </CardTitle>
            <Badge variant="secondary" className="text-xs">{stats.inHouseGuests.length}</Badge>
          </CardHeader>
          <CardContent className="max-h-80 overflow-y-auto pb-4">
            {stats.inHouseGuests.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-6">
                No guests currently in house
              </p>
            ) : (
              <div className="space-y-2">
                {stats.inHouseGuests.map((booking) => {
                  const b = booking as BookingWithDetails;
                  return (
                    <div
                      key={b.id}
                      className="p-3 rounded-lg border bg-card hover:bg-muted/50 transition-colors cursor-pointer"
                      onClick={() => navigate(`/admin/bookings/${b.id}`)}
                    >
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <p className="font-medium text-sm truncate">{b.guest?.name}</p>
                        <Badge variant="outline" className="text-xs flex-shrink-0">
                          {b.room?.number}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground mb-2">
                        Checkout: {format(new Date(b.checkOut), 'MMM d')}
                      </p>
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">
                          {formatCurrency(b.totalAmount)}
                        </span>
                        <StatusBadge status={b.paymentStatus} type="payment" size="sm" />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Revenue Breakdown */}
      <Card>
        <CardHeader className="pb-2 pt-4">
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <IndianRupee className="h-4 w-4" />
            Today's Revenue
          </CardTitle>
        </CardHeader>
        <CardContent className="pb-4">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="text-center p-3 rounded-lg bg-muted/50">
              <p className="text-xs text-muted-foreground mb-1">Cash</p>
              <p className="text-lg font-bold">{formatCurrency(stats.todayRevenueCash)}</p>
            </div>
            <div className="text-center p-3 rounded-lg bg-muted/50">
              <p className="text-xs text-muted-foreground mb-1">UPI</p>
              <p className="text-lg font-bold">{formatCurrency(stats.todayRevenueUPI)}</p>
            </div>
            <div className="text-center p-3 rounded-lg bg-muted/50">
              <p className="text-xs text-muted-foreground mb-1">Card</p>
              <p className="text-lg font-bold">{formatCurrency(stats.todayRevenueCard)}</p>
            </div>
            <div className="text-center p-3 rounded-lg bg-muted/50">
              <p className="text-xs text-muted-foreground mb-1">Online</p>
              <p className="text-lg font-bold">{formatCurrency(stats.todayRevenueOnline)}</p>
            </div>
          </div>
          {stats.unpaidAmount > 0 && (
            <div className="mt-4 p-3 rounded-lg bg-destructive/10 border border-destructive/30">
              <div className="flex items-center justify-between">
                <span className="text-sm text-destructive font-medium">
                  Outstanding Balance ({stats.unpaidCount} bookings)
                </span>
                <span className="text-lg font-bold text-destructive">
                  {formatCurrency(stats.unpaidAmount)}
                </span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
