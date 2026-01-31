import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  CalendarCheck, 
  CalendarX, 
  BedDouble, 
  IndianRupee,
  ArrowRight,
  TrendingUp
} from 'lucide-react';
import { format } from 'date-fns';
import { dashboardApi } from '@/services/api';
import { DashboardStats } from '@/types';
import { PageLoader } from '@/components/ui/LoadingSpinner';
import { StatusBadge } from '@/components/ui/StatusBadge';

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadStats = async () => {
      try {
        const data = await dashboardApi.getStats();
        setStats(data);
      } catch (error) {
        console.error('Failed to load dashboard stats:', error);
      } finally {
        setLoading(false);
      }
    };
    loadStats();
  }, []);

  if (loading) return <PageLoader />;
  if (!stats) return <div>Failed to load dashboard</div>;

  const occupancyRate = Math.round((stats.currentOccupancy / stats.totalRooms) * 100);
  const totalTodayRevenue = stats.todayRevenueCash + stats.todayRevenueOnline;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="font-display text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome back! Here's what's happening today.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Today's Check-ins</p>
                <p className="text-3xl font-display font-bold">{stats.todayCheckins.length}</p>
              </div>
              <div className="w-12 h-12 rounded-lg bg-success/10 flex items-center justify-center">
                <CalendarCheck className="h-6 w-6 text-success" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Today's Check-outs</p>
                <p className="text-3xl font-display font-bold">{stats.todayCheckouts.length}</p>
              </div>
              <div className="w-12 h-12 rounded-lg bg-warning/10 flex items-center justify-center">
                <CalendarX className="h-6 w-6 text-warning" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Occupancy</p>
                <p className="text-3xl font-display font-bold">
                  {stats.currentOccupancy}/{stats.totalRooms}
                </p>
                <p className="text-xs text-muted-foreground">{occupancyRate}% occupied</p>
              </div>
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                <BedDouble className="h-6 w-6 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Today's Revenue</p>
                <p className="text-3xl font-display font-bold">
                  ₹{totalTodayRevenue.toLocaleString()}
                </p>
                <div className="text-xs text-muted-foreground space-x-2">
                  <span>Cash: ₹{stats.todayRevenueCash.toLocaleString()}</span>
                  <span>•</span>
                  <span>Online: ₹{stats.todayRevenueOnline.toLocaleString()}</span>
                </div>
              </div>
              <div className="w-12 h-12 rounded-lg bg-hotel-gold/20 flex items-center justify-center">
                <IndianRupee className="h-6 w-6 text-hotel-gold" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Today's Activity */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Check-ins */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-lg font-semibold">Today's Check-ins</CardTitle>
            <CalendarCheck className="h-5 w-5 text-success" />
          </CardHeader>
          <CardContent>
            {stats.todayCheckins.length === 0 ? (
              <p className="text-muted-foreground text-sm py-4 text-center">
                No check-ins scheduled for today
              </p>
            ) : (
              <div className="space-y-3">
                {stats.todayCheckins.map((booking) => (
                  <div
                    key={booking.id}
                    className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
                  >
                    <div>
                      <p className="font-medium">{booking.guest?.name}</p>
                      <p className="text-sm text-muted-foreground">
                        Room {booking.room?.number} • {booking.bookingCode}
                      </p>
                    </div>
                    <StatusBadge status={booking.status} type="booking" />
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Check-outs */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-lg font-semibold">Today's Check-outs</CardTitle>
            <CalendarX className="h-5 w-5 text-warning" />
          </CardHeader>
          <CardContent>
            {stats.todayCheckouts.length === 0 ? (
              <p className="text-muted-foreground text-sm py-4 text-center">
                No check-outs scheduled for today
              </p>
            ) : (
              <div className="space-y-3">
                {stats.todayCheckouts.map((booking) => (
                  <div
                    key={booking.id}
                    className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
                  >
                    <div>
                      <p className="font-medium">{booking.guest?.name}</p>
                      <p className="text-sm text-muted-foreground">
                        Room {booking.room?.number} • {booking.bookingCode}
                      </p>
                    </div>
                    <StatusBadge status={booking.status} type="booking" />
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent Bookings */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg font-semibold">Recent Bookings</CardTitle>
          <Button variant="ghost" size="sm" asChild>
            <Link to="/admin/bookings">
              View All
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b text-left">
                  <th className="pb-3 font-medium text-muted-foreground">Booking Code</th>
                  <th className="pb-3 font-medium text-muted-foreground">Guest</th>
                  <th className="pb-3 font-medium text-muted-foreground">Room</th>
                  <th className="pb-3 font-medium text-muted-foreground">Dates</th>
                  <th className="pb-3 font-medium text-muted-foreground">Status</th>
                  <th className="pb-3 font-medium text-muted-foreground text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {stats.recentBookings.map((booking) => (
                  <tr key={booking.id} className="hover:bg-muted/30">
                    <td className="py-3 font-mono text-sm">{booking.bookingCode}</td>
                    <td className="py-3">{booking.guest?.name}</td>
                    <td className="py-3">Room {booking.room?.number}</td>
                    <td className="py-3 text-sm text-muted-foreground">
                      {format(new Date(booking.checkIn), 'MMM d')} -{' '}
                      {format(new Date(booking.checkOut), 'MMM d')}
                    </td>
                    <td className="py-3">
                      <StatusBadge status={booking.status} type="booking" />
                    </td>
                    <td className="py-3 text-right font-medium">
                      ₹{booking.totalAmount.toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Button variant="outline" className="h-auto py-4 flex-col gap-2" asChild>
              <Link to="/admin/bookings">
                <CalendarCheck className="h-5 w-5" />
                <span>Manage Bookings</span>
              </Link>
            </Button>
            <Button variant="outline" className="h-auto py-4 flex-col gap-2" asChild>
              <Link to="/admin/rooms">
                <BedDouble className="h-5 w-5" />
                <span>Manage Rooms</span>
              </Link>
            </Button>
            <Button variant="outline" className="h-auto py-4 flex-col gap-2" asChild>
              <Link to="/admin/reports">
                <TrendingUp className="h-5 w-5" />
                <span>View Reports</span>
              </Link>
            </Button>
            <Button variant="outline" className="h-auto py-4 flex-col gap-2" asChild>
              <Link to="/booking" target="_blank">
                <CalendarCheck className="h-5 w-5" />
                <span>New Booking</span>
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
