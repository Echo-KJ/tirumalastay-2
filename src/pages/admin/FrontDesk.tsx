 // ============================================
 // FRONT DESK DASHBOARD
 // Operational view for hotel reception staff
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
 } from 'lucide-react';
 import { format } from 'date-fns';
 import { frontDeskApi } from '@/services/hmsApi';
 import { DashboardStats, Booking, Guest, Room, RoomType } from '@/types';
 import { PageLoader } from '@/components/ui/LoadingSpinner';
 import { StatusBadge } from '@/components/ui/StatusBadge';
 import { toast } from 'sonner';
 
 type BookingWithDetails = Booking & { guest: Guest; room: Room & { type: RoomType } };
 
 export default function FrontDesk() {
   const [stats, setStats] = useState<DashboardStats | null>(null);
   const [loading, setLoading] = useState(true);
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
     }
   };
 
   useEffect(() => {
     loadStats();
   }, []);
 
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
   if (!stats) return <div>Failed to load dashboard</div>;
 
   const occupancyRate = Math.round((stats.currentOccupancy / stats.totalRooms) * 100);
   const totalTodayRevenue = stats.todayRevenueCash + stats.todayRevenueOnline + stats.todayRevenueUPI + stats.todayRevenueCard;
 
   return (
     <div className="space-y-6">
       {/* Header */}
       <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
         <div>
           <h1 className="font-display text-3xl font-bold">Front Desk</h1>
           <p className="text-muted-foreground">
             {format(new Date(), 'EEEE, MMMM d, yyyy')}
           </p>
         </div>
         <div className="flex gap-2">
           <Button variant="outline" size="sm" onClick={loadStats}>
             <RefreshCw className="h-4 w-4 mr-2" />
             Refresh
           </Button>
           <Button asChild>
             <Link to="/admin/bookings/new">
               <Plus className="h-4 w-4 mr-2" />
               New Booking
             </Link>
           </Button>
         </div>
       </div>
 
       {/* Top Metrics */}
       <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
         <Card>
           <CardContent className="p-4">
             <div className="flex items-center gap-3">
               <div className="w-10 h-10 rounded-lg bg-success/10 flex items-center justify-center">
                 <CalendarCheck className="h-5 w-5 text-success" />
               </div>
               <div>
                 <p className="text-2xl font-bold">{stats.todayCheckins.length}</p>
                 <p className="text-xs text-muted-foreground">Check-ins</p>
               </div>
             </div>
           </CardContent>
         </Card>
 
         <Card>
           <CardContent className="p-4">
             <div className="flex items-center gap-3">
               <div className="w-10 h-10 rounded-lg bg-warning/10 flex items-center justify-center">
                 <CalendarX className="h-5 w-5 text-warning" />
               </div>
               <div>
                 <p className="text-2xl font-bold">{stats.todayCheckouts.length}</p>
                 <p className="text-xs text-muted-foreground">Check-outs</p>
               </div>
             </div>
           </CardContent>
         </Card>
 
         <Card>
           <CardContent className="p-4">
             <div className="flex items-center gap-3">
               <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                 <Users className="h-5 w-5 text-primary" />
               </div>
               <div>
                 <p className="text-2xl font-bold">{stats.inHouseGuests.length}</p>
                 <p className="text-xs text-muted-foreground">In-House</p>
               </div>
             </div>
           </CardContent>
         </Card>
 
         <Card>
           <CardContent className="p-4">
             <div className="flex items-center gap-3">
               <div className="w-10 h-10 rounded-lg bg-info/10 flex items-center justify-center">
                 <BedDouble className="h-5 w-5 text-info" />
               </div>
               <div>
                 <p className="text-2xl font-bold">{occupancyRate}%</p>
                 <p className="text-xs text-muted-foreground">{stats.currentOccupancy}/{stats.totalRooms} Rooms</p>
               </div>
             </div>
           </CardContent>
         </Card>
 
         <Card className={stats.unpaidCount > 0 ? 'border-destructive/50' : ''}>
           <CardContent className="p-4">
             <div className="flex items-center gap-3">
               <div className="w-10 h-10 rounded-lg bg-destructive/10 flex items-center justify-center">
                 <IndianRupee className="h-5 w-5 text-destructive" />
               </div>
               <div>
                 <p className="text-2xl font-bold">{stats.unpaidCount}</p>
                 <p className="text-xs text-muted-foreground">₹{stats.unpaidAmount.toLocaleString()}</p>
               </div>
             </div>
           </CardContent>
         </Card>
 
         <Card>
           <CardContent className="p-4">
             <div className="flex items-center gap-3">
               <div className="w-10 h-10 rounded-lg bg-hotel-gold/20 flex items-center justify-center">
                 <IndianRupee className="h-5 w-5 text-hotel-gold" />
               </div>
               <div>
                 <p className="text-2xl font-bold">₹{totalTodayRevenue.toLocaleString()}</p>
                 <p className="text-xs text-muted-foreground">Today</p>
               </div>
             </div>
           </CardContent>
         </Card>
       </div>
 
       {/* Pending Actions Alert */}
       {(stats.pendingArrivals.length > 0 || stats.overdueCheckouts.length > 0) && (
         <Card className="border-warning bg-warning/5">
           <CardHeader className="pb-2">
             <CardTitle className="text-lg flex items-center gap-2 text-warning">
               <AlertTriangle className="h-5 w-5" />
               Pending Actions
             </CardTitle>
           </CardHeader>
           <CardContent>
             <div className="space-y-2">
               {stats.pendingArrivals.map((booking) => (
                 <div key={booking.id} className="flex items-center justify-between p-2 rounded bg-background">
                   <div className="flex items-center gap-2">
                     <Clock className="h-4 w-4 text-warning" />
                     <span className="text-sm">
                       <strong>{(booking as BookingWithDetails).guest?.name}</strong> - Not checked in (expected {format(new Date(booking.checkIn), 'MMM d')})
                     </span>
                   </div>
                   <div className="flex gap-2">
                     <Button 
                       size="sm" 
                       variant="outline"
                       onClick={() => navigate(`/admin/bookings/${booking.id}`)}
                     >
                       View
                     </Button>
                     <Button 
                       size="sm"
                       onClick={() => handleCheckIn(booking.id)}
                       disabled={actionLoading === booking.id}
                     >
                       Check In
                     </Button>
                   </div>
                 </div>
               ))}
               {stats.overdueCheckouts.map((booking) => (
                 <div key={booking.id} className="flex items-center justify-between p-2 rounded bg-background">
                   <div className="flex items-center gap-2">
                     <AlertTriangle className="h-4 w-4 text-destructive" />
                     <span className="text-sm">
                       <strong>{(booking as BookingWithDetails).guest?.name}</strong> - Overstay (expected checkout {format(new Date(booking.checkOut), 'MMM d')})
                     </span>
                   </div>
                   <div className="flex gap-2">
                     <Button 
                       size="sm" 
                       variant="outline"
                       onClick={() => navigate(`/admin/bookings/${booking.id}`)}
                     >
                       View
                     </Button>
                     <Button 
                       size="sm"
                       variant="secondary"
                       onClick={() => handleCheckOut(booking.id)}
                       disabled={actionLoading === booking.id}
                     >
                       Check Out
                     </Button>
                   </div>
                 </div>
               ))}
             </div>
           </CardContent>
         </Card>
       )}
 
       {/* Operational Lists */}
       <div className="grid lg:grid-cols-3 gap-6">
         {/* Today's Check-ins */}
         <Card>
           <CardHeader className="flex flex-row items-center justify-between pb-2">
             <CardTitle className="text-lg font-semibold flex items-center gap-2">
               <CalendarCheck className="h-5 w-5 text-success" />
               Today's Check-ins
             </CardTitle>
             <Badge variant="secondary">{stats.todayCheckins.length}</Badge>
           </CardHeader>
           <CardContent className="max-h-80 overflow-y-auto">
             {stats.todayCheckins.length === 0 ? (
               <p className="text-muted-foreground text-sm py-4 text-center">
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
                       <div className="flex items-center justify-between mb-2">
                         <p className="font-medium">{b.guest?.name}</p>
                         <StatusBadge status={b.status} type="booking" />
                       </div>
                       <p className="text-sm text-muted-foreground mb-2">
                         Room {b.room?.number} • {b.bookingCode}
                       </p>
                       <div className="flex gap-2">
                         {!isCheckedIn && (
                           <Button 
                             size="sm" 
                             className="flex-1 bg-success hover:bg-success/90"
                             onClick={() => handleCheckIn(b.id)}
                             disabled={actionLoading === b.id}
                           >
                             <LogIn className="h-4 w-4 mr-1" />
                             Check In
                           </Button>
                         )}
                         <Button 
                           size="sm" 
                           variant="outline"
                           onClick={() => navigate(`/admin/bookings/${b.id}`)}
                         >
                           <FileText className="h-4 w-4" />
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
           <CardHeader className="flex flex-row items-center justify-between pb-2">
             <CardTitle className="text-lg font-semibold flex items-center gap-2">
               <CalendarX className="h-5 w-5 text-warning" />
               Today's Check-outs
             </CardTitle>
             <Badge variant="secondary">{stats.todayCheckouts.length}</Badge>
           </CardHeader>
           <CardContent className="max-h-80 overflow-y-auto">
             {stats.todayCheckouts.length === 0 ? (
               <p className="text-muted-foreground text-sm py-4 text-center">
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
                       <div className="flex items-center justify-between mb-2">
                         <p className="font-medium">{b.guest?.name}</p>
                         <StatusBadge status={b.status} type="booking" />
                       </div>
                       <p className="text-sm text-muted-foreground mb-2">
                         Room {b.room?.number} • {b.bookingCode}
                       </p>
                       <div className="flex gap-2">
                         {!isCheckedOut && (
                           <Button 
                             size="sm" 
                             variant="secondary"
                             className="flex-1"
                             onClick={() => handleCheckOut(b.id)}
                             disabled={actionLoading === b.id}
                           >
                             <LogOut className="h-4 w-4 mr-1" />
                             Check Out
                           </Button>
                         )}
                         <Button 
                           size="sm" 
                           variant="outline"
                           onClick={() => navigate(`/admin/bookings/${b.id}`)}
                         >
                           <FileText className="h-4 w-4" />
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
           <CardHeader className="flex flex-row items-center justify-between pb-2">
             <CardTitle className="text-lg font-semibold flex items-center gap-2">
               <Users className="h-5 w-5 text-primary" />
               In-House Guests
             </CardTitle>
             <Badge variant="secondary">{stats.inHouseGuests.length}</Badge>
           </CardHeader>
           <CardContent className="max-h-80 overflow-y-auto">
             {stats.inHouseGuests.length === 0 ? (
               <p className="text-muted-foreground text-sm py-4 text-center">
                 No guests in house
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
                       <div className="flex items-center justify-between mb-1">
                         <p className="font-medium">{b.guest?.name}</p>
                         <Badge variant="outline">Room {b.room?.number}</Badge>
                       </div>
                       <p className="text-sm text-muted-foreground">
                         Checkout: {format(new Date(b.checkOut), 'MMM d')}
                       </p>
                       <div className="flex items-center justify-between mt-2">
                         <span className="text-sm">₹{b.totalAmount.toLocaleString()}</span>
                         <StatusBadge status={b.paymentStatus} type="payment" />
                       </div>
                     </div>
                   );
                 })}
               </div>
             )}
           </CardContent>
         </Card>
       </div>
 
       {/* Quick Actions */}
       <Card>
         <CardHeader>
           <CardTitle className="text-lg font-semibold">Quick Actions</CardTitle>
         </CardHeader>
         <CardContent>
           <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
             <Button variant="outline" className="h-auto py-4 flex-col gap-2" asChild>
               <Link to="/admin/bookings/new">
                 <Plus className="h-5 w-5" />
                 <span className="text-xs">Walk-in</span>
               </Link>
             </Button>
             <Button variant="outline" className="h-auto py-4 flex-col gap-2" asChild>
               <Link to="/admin/bookings">
                 <CalendarCheck className="h-5 w-5" />
                 <span className="text-xs">Bookings</span>
               </Link>
             </Button>
             <Button variant="outline" className="h-auto py-4 flex-col gap-2" asChild>
               <Link to="/admin/rooms">
                 <BedDouble className="h-5 w-5" />
                 <span className="text-xs">Rooms</span>
               </Link>
             </Button>
             <Button variant="outline" className="h-auto py-4 flex-col gap-2" asChild>
               <Link to="/admin/reports">
                 <FileText className="h-5 w-5" />
                 <span className="text-xs">Reports</span>
               </Link>
             </Button>
             <Button variant="outline" className="h-auto py-4 flex-col gap-2" asChild>
               <Link to="/admin/audit">
                 <Clock className="h-5 w-5" />
                 <span className="text-xs">Audit Log</span>
               </Link>
             </Button>
           </div>
         </CardContent>
       </Card>
 
       {/* Revenue Breakdown */}
       <Card>
         <CardHeader>
           <CardTitle className="text-lg font-semibold">Today's Revenue Breakdown</CardTitle>
         </CardHeader>
         <CardContent>
           <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
             <div className="p-4 rounded-lg bg-muted/50 text-center">
               <p className="text-2xl font-bold">₹{stats.todayRevenueCash.toLocaleString()}</p>
               <p className="text-sm text-muted-foreground">Cash</p>
             </div>
             <div className="p-4 rounded-lg bg-muted/50 text-center">
               <p className="text-2xl font-bold">₹{stats.todayRevenueUPI.toLocaleString()}</p>
               <p className="text-sm text-muted-foreground">UPI</p>
             </div>
             <div className="p-4 rounded-lg bg-muted/50 text-center">
               <p className="text-2xl font-bold">₹{stats.todayRevenueCard.toLocaleString()}</p>
               <p className="text-sm text-muted-foreground">Card</p>
             </div>
             <div className="p-4 rounded-lg bg-muted/50 text-center">
               <p className="text-2xl font-bold">₹{stats.todayRevenueOnline.toLocaleString()}</p>
               <p className="text-sm text-muted-foreground">Online</p>
             </div>
           </div>
         </CardContent>
       </Card>
     </div>
   );
 }