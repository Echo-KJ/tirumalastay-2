// ============================================
// ROOMS MANAGEMENT PAGE
// Clean room status grid with guest info
// ============================================

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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
import { BedDouble, Users, Loader2, Search, Filter, CheckCircle, Wrench, SprayCanIcon } from 'lucide-react';
import { format } from 'date-fns';
import { roomsApi } from '@/services/api';
import { Room, RoomType, RoomStatus, Booking, Guest } from '@/types';
import { PageLoader } from '@/components/ui/LoadingSpinner';
import { PageHeader } from '@/components/admin/ui/PageHeader';
import { MetricCardCompact } from '@/components/admin/ui/MetricCard';
import { StatusBadge, RoomStatusDot } from '@/components/admin/ui/StatusBadge';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { store } from '@/services/store';
import { mockRoomTypes } from '@/services/mockData';

type RoomWithBooking = Room & { 
  type: RoomType; 
  currentBooking?: Booking & { guest: Guest };
};

export default function AdminRooms() {
  const [rooms, setRooms] = useState<RoomWithBooking[]>([]);
  const [roomTypes, setRoomTypes] = useState<RoomType[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRoom, setSelectedRoom] = useState<RoomWithBooking | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState<RoomStatus | 'ALL'>('ALL');
  const [typeFilter, setTypeFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  const loadData = async () => {
    try {
      // Get rooms from store
      const roomsData = store.getRooms();
      const bookings = store.getBookings();
      const guests = store.getGuests();
      
      // Enrich rooms with type and current booking info
      const enrichedRooms: RoomWithBooking[] = roomsData.map(room => {
        const type = mockRoomTypes.find(t => t.id === room.typeId)!;
        
        // Find current in-house booking for this room
        const currentBooking = bookings.find(b => 
          b.roomId === room.id && 
          (b.status === 'IN_HOUSE' || b.status === 'CHECKED_IN')
        );
        
        let bookingWithGuest: (Booking & { guest: Guest }) | undefined;
        if (currentBooking) {
          const guest = guests.find(g => g.id === currentBooking.guestId);
          if (guest) {
            bookingWithGuest = { ...currentBooking, guest };
          }
        }
        
        return { ...room, type, currentBooking: bookingWithGuest };
      });

      setRooms(enrichedRooms);
      setRoomTypes(mockRoomTypes);
    } catch (error) {
      console.error('Failed to load rooms:', error);
      toast.error('Failed to load rooms');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const updateRoomStatus = async (roomId: string, status: RoomStatus) => {
    setActionLoading(true);
    try {
      await roomsApi.updateRoomStatus(roomId, status);
      toast.success(`Room marked as ${status.toLowerCase()}`);
      loadData();
      setSelectedRoom(null);
    } catch (error) {
      toast.error('Failed to update room status');
    } finally {
      setActionLoading(false);
    }
  };

  // Filter rooms
  const filteredRooms = rooms.filter(room => {
    if (statusFilter !== 'ALL' && room.status !== statusFilter) return false;
    if (typeFilter !== 'ALL' && room.typeId !== typeFilter) return false;
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const matchRoom = room.number.toLowerCase().includes(query);
      const matchGuest = room.currentBooking?.guest?.name?.toLowerCase().includes(query);
      if (!matchRoom && !matchGuest) return false;
    }
    return true;
  });

  // Group by type
  const groupedRooms = roomTypes.map(type => ({
    type,
    rooms: filteredRooms.filter(r => r.typeId === type.id),
  })).filter(g => g.rooms.length > 0);

  // Status counts
  const statusCounts = {
    AVAILABLE: rooms.filter(r => r.status === 'AVAILABLE').length,
    OCCUPIED: rooms.filter(r => r.status === 'OCCUPIED').length,
    CLEANING: rooms.filter(r => r.status === 'CLEANING').length,
    MAINTENANCE: rooms.filter(r => r.status === 'MAINTENANCE').length,
  };

  if (loading) return <PageLoader />;

  return (
    <div className="space-y-5">
      {/* Header */}
      <PageHeader
        title="Rooms"
        subtitle={`${statusCounts.AVAILABLE} available of ${rooms.length} total`}
        onRefresh={loadData}
      />

      {/* Status Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <MetricCardCompact
          title="Available"
          value={statusCounts.AVAILABLE}
          icon={<CheckCircle className="h-4 w-4 text-success" />}
          iconBg="bg-success/10"
          className="border-l-4 border-l-success"
        />
        <MetricCardCompact
          title="Occupied"
          value={statusCounts.OCCUPIED}
          icon={<Users className="h-4 w-4 text-destructive" />}
          iconBg="bg-destructive/10"
          className="border-l-4 border-l-destructive"
        />
        <MetricCardCompact
          title="Cleaning"
          value={statusCounts.CLEANING}
          icon={<SprayCanIcon className="h-4 w-4 text-warning" />}
          iconBg="bg-warning/10"
          className="border-l-4 border-l-warning"
        />
        <MetricCardCompact
          title="Maintenance"
          value={statusCounts.MAINTENANCE}
          icon={<Wrench className="h-4 w-4 text-muted-foreground" />}
          iconBg="bg-muted"
          className="border-l-4 border-l-muted-foreground"
        />
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-3">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search room number or guest..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as RoomStatus | 'ALL')}>
              <SelectTrigger className="w-full sm:w-36">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Status</SelectItem>
                <SelectItem value="AVAILABLE">Available</SelectItem>
                <SelectItem value="OCCUPIED">Occupied</SelectItem>
                <SelectItem value="CLEANING">Cleaning</SelectItem>
                <SelectItem value="MAINTENANCE">Maintenance</SelectItem>
              </SelectContent>
            </Select>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-full sm:w-40">
                <SelectValue placeholder="Room Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Types</SelectItem>
                {roomTypes.map(type => (
                  <SelectItem key={type.id} value={type.id}>{type.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Rooms by Type */}
      {groupedRooms.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center text-muted-foreground">
            No rooms match your filters
          </CardContent>
        </Card>
      ) : (
        groupedRooms.map(({ type, rooms: typeRooms }) => (
          <Card key={type.id}>
            <CardHeader className="pb-3 pt-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <CardTitle className="text-base">{type.name}</CardTitle>
                  <span className="text-sm text-muted-foreground">
                    ₹{type.basePrice}/night • {type.capacity} guests
                  </span>
                </div>
                <span className="text-sm text-muted-foreground">
                  {typeRooms.length} room{typeRooms.length !== 1 ? 's' : ''}
                </span>
              </div>
            </CardHeader>
            <CardContent className="pb-4">
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2">
                {typeRooms.map((room) => (
                  <button
                    key={room.id}
                    onClick={() => setSelectedRoom(room)}
                    className={cn(
                      'p-3 rounded-lg border text-left transition-all hover:shadow-md relative',
                      room.status === 'AVAILABLE' && 'bg-success/5 border-success/30 hover:border-success',
                      room.status === 'OCCUPIED' && 'bg-destructive/5 border-destructive/30 hover:border-destructive',
                      room.status === 'CLEANING' && 'bg-warning/5 border-warning/30 hover:border-warning',
                      room.status === 'MAINTENANCE' && 'bg-muted border-muted-foreground/30'
                    )}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-lg">{room.number}</span>
                      <RoomStatusDot status={room.status} size="sm" />
                    </div>
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wide mb-1">
                      {room.status.toLowerCase()}
                    </p>
                    {room.currentBooking && (
                      <div className="mt-2 pt-2 border-t border-current/10">
                        <p className="text-xs font-medium truncate">
                          {room.currentBooking.guest.name}
                        </p>
                        <p className="text-[10px] text-muted-foreground">
                          Out: {format(new Date(room.currentBooking.checkOut), 'MMM d')}
                        </p>
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>
        ))
      )}

      {/* Room Details Dialog */}
      <Dialog open={!!selectedRoom} onOpenChange={() => setSelectedRoom(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              Room {selectedRoom?.number}
              <StatusBadge status={selectedRoom?.status || 'AVAILABLE'} type="room" size="sm" />
            </DialogTitle>
            <DialogDescription>
              {selectedRoom?.type?.name} • Up to {selectedRoom?.type?.capacity} guests
            </DialogDescription>
          </DialogHeader>

          {selectedRoom && (
            <div className="space-y-4">
              {/* Current Guest */}
              {selectedRoom.currentBooking && (
                <div className="p-3 rounded-lg bg-muted/50">
                  <p className="text-xs text-muted-foreground mb-1">Current Guest</p>
                  <p className="font-medium">{selectedRoom.currentBooking.guest.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {selectedRoom.currentBooking.guest.phone}
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Checkout: {format(new Date(selectedRoom.currentBooking.checkOut), 'EEE, MMM d')}
                  </p>
                  <Button 
                    size="sm" 
                    variant="outline" 
                    className="mt-2 w-full"
                    onClick={() => {
                      navigate(`/admin/bookings/${selectedRoom.currentBooking?.id}`);
                      setSelectedRoom(null);
                    }}
                  >
                    View Booking
                  </Button>
                </div>
              )}

              {/* Status Actions */}
              <div>
                <p className="text-sm font-medium mb-2">Update Status</p>
                <div className="grid grid-cols-2 gap-2">
                  {selectedRoom.status !== 'AVAILABLE' && selectedRoom.status !== 'OCCUPIED' && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => updateRoomStatus(selectedRoom.id, 'AVAILABLE')}
                      disabled={actionLoading}
                      className="border-success text-success hover:bg-success/10"
                    >
                      {actionLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Available'}
                    </Button>
                  )}
                  {selectedRoom.status !== 'CLEANING' && selectedRoom.status !== 'OCCUPIED' && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => updateRoomStatus(selectedRoom.id, 'CLEANING')}
                      disabled={actionLoading}
                      className="border-warning text-warning hover:bg-warning/10"
                    >
                      {actionLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Cleaning'}
                    </Button>
                  )}
                  {selectedRoom.status !== 'MAINTENANCE' && selectedRoom.status !== 'OCCUPIED' && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => updateRoomStatus(selectedRoom.id, 'MAINTENANCE')}
                      disabled={actionLoading}
                    >
                      {actionLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Maintenance'}
                    </Button>
                  )}
                </div>
                {selectedRoom.status === 'OCCUPIED' && (
                  <p className="text-xs text-muted-foreground mt-2">
                    Room status will update after check-out.
                  </p>
                )}
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setSelectedRoom(null)} className="w-full">
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
