import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { BedDouble, Users, Loader2 } from 'lucide-react';
import { roomsApi } from '@/services/api';
import { Room, RoomType, RoomStatus } from '@/types';
import { PageLoader } from '@/components/ui/LoadingSpinner';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

export default function AdminRooms() {
  const [rooms, setRooms] = useState<(Room & { type: RoomType })[]>([]);
  const [roomTypes, setRoomTypes] = useState<RoomType[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRoom, setSelectedRoom] = useState<(Room & { type: RoomType }) | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  const loadData = async () => {
    try {
      const [roomsData, typesData] = await Promise.all([
        roomsApi.getRooms(),
        roomsApi.getRoomTypes(),
      ]);
      setRooms(roomsData);
      setRoomTypes(typesData);
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
      toast.success('Room status updated');
      loadData();
      setSelectedRoom(null);
    } catch (error) {
      toast.error('Failed to update room status');
    } finally {
      setActionLoading(false);
    }
  };

  const groupedRooms = roomTypes.map(type => ({
    type,
    rooms: rooms.filter(r => r.typeId === type.id),
  }));

  const statusCounts = {
    AVAILABLE: rooms.filter(r => r.status === 'AVAILABLE').length,
    OCCUPIED: rooms.filter(r => r.status === 'OCCUPIED').length,
    CLEANING: rooms.filter(r => r.status === 'CLEANING').length,
    MAINTENANCE: rooms.filter(r => r.status === 'MAINTENANCE').length,
  };

  if (loading) return <PageLoader />;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="font-display text-3xl font-bold">Rooms</h1>
        <p className="text-muted-foreground">
          Manage room status and availability
        </p>
      </div>

      {/* Status Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="border-l-4 border-l-success">
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Available</p>
            <p className="text-2xl font-bold text-success">{statusCounts.AVAILABLE}</p>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-destructive">
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Occupied</p>
            <p className="text-2xl font-bold text-destructive">{statusCounts.OCCUPIED}</p>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-warning">
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Cleaning</p>
            <p className="text-2xl font-bold text-warning">{statusCounts.CLEANING}</p>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-muted-foreground">
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Maintenance</p>
            <p className="text-2xl font-bold">{statusCounts.MAINTENANCE}</p>
          </CardContent>
        </Card>
      </div>

      {/* Rooms by Type */}
      {groupedRooms.map(({ type, rooms: typeRooms }) => (
        <Card key={type.id}>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg overflow-hidden">
                  <img src={type.images[0]} alt={type.name} className="w-full h-full object-cover" />
                </div>
                <div>
                  <CardTitle className="text-lg">{type.name}</CardTitle>
                  <p className="text-sm text-muted-foreground flex items-center gap-1">
                    <Users className="h-3 w-3" />
                    Up to {type.capacity} guests • ₹{type.basePrice}/night
                  </p>
                </div>
              </div>
              <p className="text-sm text-muted-foreground">
                {typeRooms.length} room{typeRooms.length !== 1 ? 's' : ''}
              </p>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
              {typeRooms.map((room) => (
                <button
                  key={room.id}
                  onClick={() => setSelectedRoom(room)}
                  className={cn(
                    'p-4 rounded-lg border text-center transition-all hover:shadow-md',
                    room.status === 'AVAILABLE' && 'bg-success/5 border-success/30 hover:border-success',
                    room.status === 'OCCUPIED' && 'bg-destructive/5 border-destructive/30 hover:border-destructive',
                    room.status === 'CLEANING' && 'bg-warning/5 border-warning/30 hover:border-warning',
                    room.status === 'MAINTENANCE' && 'bg-muted border-muted-foreground/30'
                  )}
                >
                  <BedDouble className={cn(
                    'h-6 w-6 mx-auto mb-2',
                    room.status === 'AVAILABLE' && 'text-success',
                    room.status === 'OCCUPIED' && 'text-destructive',
                    room.status === 'CLEANING' && 'text-warning',
                    room.status === 'MAINTENANCE' && 'text-muted-foreground'
                  )} />
                  <p className="font-semibold">{room.number}</p>
                  <p className="text-xs text-muted-foreground capitalize mt-1">
                    {room.status.toLowerCase()}
                  </p>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>
      ))}

      {/* Room Details Dialog */}
      <Dialog open={!!selectedRoom} onOpenChange={() => setSelectedRoom(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Room {selectedRoom?.number}</DialogTitle>
            <DialogDescription>
              {selectedRoom?.type?.name}
            </DialogDescription>
          </DialogHeader>

          {selectedRoom && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Current Status</span>
                <StatusBadge status={selectedRoom.status} type="room" />
              </div>

              <div className="border-t pt-4">
                <h4 className="font-semibold mb-3">Update Status</h4>
                <div className="grid grid-cols-2 gap-2">
                  {selectedRoom.status !== 'AVAILABLE' && (
                    <Button
                      variant="outline"
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
                      onClick={() => updateRoomStatus(selectedRoom.id, 'MAINTENANCE')}
                      disabled={actionLoading}
                    >
                      {actionLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Maintenance'}
                    </Button>
                  )}
                </div>
                {selectedRoom.status === 'OCCUPIED' && (
                  <p className="text-sm text-muted-foreground mt-3">
                    Room is currently occupied. Status will update after check-out.
                  </p>
                )}
              </div>

              <div className="border-t pt-4">
                <h4 className="font-semibold mb-2">Room Details</h4>
                <div className="text-sm space-y-1">
                  <p><span className="text-muted-foreground">Type:</span> {selectedRoom.type?.name}</p>
                  <p><span className="text-muted-foreground">Capacity:</span> Up to {selectedRoom.type?.capacity} guests</p>
                  <p><span className="text-muted-foreground">Rate:</span> ₹{selectedRoom.type?.basePrice}/night</p>
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setSelectedRoom(null)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
