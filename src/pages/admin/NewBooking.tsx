 // ============================================
 // NEW BOOKING / WALK-IN PAGE
 // Create reservations or walk-in stays
 // ============================================
 
 import { useState, useEffect } from 'react';
 import { useNavigate } from 'react-router-dom';
 import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
 import { Button } from '@/components/ui/button';
 import { Input } from '@/components/ui/input';
 import { Label } from '@/components/ui/label';
 import { Textarea } from '@/components/ui/textarea';
 import { Calendar } from '@/components/ui/calendar';
 import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
 import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
 import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
 import {
   ArrowLeft,
   CalendarIcon,
   User,
   BedDouble,
   Users,
   Loader2,
 } from 'lucide-react';
 import { format, addDays } from 'date-fns';
 import { cn } from '@/lib/utils';
 import { roomsApiV2, frontDeskApi } from '@/services/hmsApi';
 import { Room, RoomType, BookingType } from '@/types';
 import { PageLoader } from '@/components/ui/LoadingSpinner';
 import { toast } from 'sonner';
 
 export default function NewBooking() {
   const navigate = useNavigate();
   
   const [loading, setLoading] = useState(true);
   const [submitting, setSubmitting] = useState(false);
   const [roomTypes, setRoomTypes] = useState<RoomType[]>([]);
   const [availableRooms, setAvailableRooms] = useState<(Room & { type: RoomType })[]>([]);
   
   // Form state
   const [bookingType, setBookingType] = useState<BookingType>('WALK_IN');
   const [checkIn, setCheckIn] = useState<Date>(new Date());
   const [checkOut, setCheckOut] = useState<Date>(addDays(new Date(), 1));
   const [selectedRoomId, setSelectedRoomId] = useState<string>('');
   const [guestsCount, setGuestsCount] = useState(1);
   const [dailyRate, setDailyRate] = useState(0);
   const [notes, setNotes] = useState('');
   
   // Guest info
   const [guestName, setGuestName] = useState('');
   const [guestPhone, setGuestPhone] = useState('');
   const [guestEmail, setGuestEmail] = useState('');
   const [guestCity, setGuestCity] = useState('');
   const [guestIdProof, setGuestIdProof] = useState('');
 
   useEffect(() => {
     loadRoomTypes();
   }, []);
 
   useEffect(() => {
     if (checkIn && checkOut) {
       loadAvailableRooms();
     }
   }, [checkIn, checkOut]);
 
   const loadRoomTypes = async () => {
     try {
       const types = await roomsApiV2.getRoomTypes();
       setRoomTypes(types);
     } catch (error) {
       toast.error('Failed to load room types');
     } finally {
       setLoading(false);
     }
   };
 
   const loadAvailableRooms = async () => {
     try {
       const rooms = await roomsApiV2.getAvailableRooms(checkIn, checkOut);
       setAvailableRooms(rooms);
       // Reset selection if current room is not available
       if (selectedRoomId && !rooms.find(r => r.id === selectedRoomId)) {
         setSelectedRoomId('');
         setDailyRate(0);
       }
     } catch (error) {
       console.error('Failed to load rooms:', error);
     }
   };
 
   const handleRoomSelect = (roomId: string) => {
     setSelectedRoomId(roomId);
     const room = availableRooms.find(r => r.id === roomId);
     if (room) {
       setDailyRate(room.type.basePrice);
     }
   };
 
   const calculateNights = () => {
     const diffTime = Math.abs(checkOut.getTime() - checkIn.getTime());
     return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
   };
 
   const handleSubmit = async () => {
     // Validation
     if (!guestName.trim()) {
       toast.error('Please enter guest name');
       return;
     }
     if (!guestPhone.trim()) {
       toast.error('Please enter guest phone');
       return;
     }
     if (!selectedRoomId) {
       toast.error('Please select a room');
       return;
     }
 
     setSubmitting(true);
     try {
       const booking = await frontDeskApi.createStay({
         roomId: selectedRoomId,
         checkIn,
         checkOut,
         guestsCount,
         guest: {
           name: guestName,
           phone: guestPhone,
           email: guestEmail || undefined,
           city: guestCity || undefined,
           idProof: guestIdProof || undefined,
         },
         bookingType,
         dailyRate,
         notes: notes || undefined,
       });
       
       toast.success(`Booking ${booking.bookingCode} created successfully`);
       navigate(`/admin/bookings/${booking.id}`);
     } catch (error: any) {
       toast.error(error.message || 'Failed to create booking');
     } finally {
       setSubmitting(false);
     }
   };
 
   if (loading) return <PageLoader />;
 
   const nights = calculateNights();
   const totalAmount = dailyRate * nights;
 
   // Group available rooms by type
   const roomsByType = roomTypes.map(type => ({
     type,
     rooms: availableRooms.filter(r => r.typeId === type.id),
   })).filter(g => g.rooms.length > 0);
 
   return (
     <div className="space-y-6 max-w-4xl mx-auto">
       {/* Header */}
       <div className="flex items-center gap-4">
         <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
           <ArrowLeft className="h-5 w-5" />
         </Button>
         <div>
           <h1 className="font-display text-2xl font-bold">New Booking</h1>
           <p className="text-muted-foreground">Create a new reservation or walk-in</p>
         </div>
       </div>
 
       {/* Booking Type */}
       <Card>
         <CardHeader className="pb-3">
           <CardTitle className="text-lg">Booking Type</CardTitle>
         </CardHeader>
         <CardContent>
           <RadioGroup 
             value={bookingType} 
             onValueChange={(v) => setBookingType(v as BookingType)}
             className="flex gap-4"
           >
             <div className="flex items-center space-x-2">
               <RadioGroupItem value="WALK_IN" id="walk_in" />
               <Label htmlFor="walk_in" className="cursor-pointer">Walk-in (Today)</Label>
             </div>
             <div className="flex items-center space-x-2">
               <RadioGroupItem value="RESERVATION" id="reservation" />
               <Label htmlFor="reservation" className="cursor-pointer">Reservation (Future)</Label>
             </div>
           </RadioGroup>
         </CardContent>
       </Card>
 
       {/* Dates & Room */}
       <Card>
         <CardHeader className="pb-3">
           <CardTitle className="text-lg flex items-center gap-2">
             <BedDouble className="h-5 w-5" />
             Stay Details
           </CardTitle>
         </CardHeader>
         <CardContent className="space-y-4">
           {/* Date Selection */}
           <div className="grid sm:grid-cols-3 gap-4">
             <div>
               <Label>Check-in Date</Label>
               <Popover>
                 <PopoverTrigger asChild>
                   <Button variant="outline" className="w-full justify-start">
                     <CalendarIcon className="mr-2 h-4 w-4" />
                     {format(checkIn, 'MMM d, yyyy')}
                   </Button>
                 </PopoverTrigger>
                 <PopoverContent className="w-auto p-0" align="start">
                   <Calendar
                     mode="single"
                     selected={checkIn}
                     onSelect={(date) => {
                       if (date) {
                         setCheckIn(date);
                         if (date >= checkOut) {
                           setCheckOut(addDays(date, 1));
                         }
                       }
                     }}
                     initialFocus
                   />
                 </PopoverContent>
               </Popover>
             </div>
             
             <div>
               <Label>Check-out Date</Label>
               <Popover>
                 <PopoverTrigger asChild>
                   <Button variant="outline" className="w-full justify-start">
                     <CalendarIcon className="mr-2 h-4 w-4" />
                     {format(checkOut, 'MMM d, yyyy')}
                   </Button>
                 </PopoverTrigger>
                 <PopoverContent className="w-auto p-0" align="start">
                   <Calendar
                     mode="single"
                     selected={checkOut}
                     onSelect={(date) => date && setCheckOut(date)}
                     disabled={(date) => date <= checkIn}
                     initialFocus
                   />
                 </PopoverContent>
               </Popover>
             </div>
 
             <div>
               <Label>Number of Guests</Label>
               <Select value={String(guestsCount)} onValueChange={(v) => setGuestsCount(parseInt(v))}>
                 <SelectTrigger>
                   <Users className="h-4 w-4 mr-2" />
                   <SelectValue />
                 </SelectTrigger>
                 <SelectContent>
                   {[1, 2, 3, 4, 5, 6].map(n => (
                     <SelectItem key={n} value={String(n)}>{n} Guest{n > 1 ? 's' : ''}</SelectItem>
                   ))}
                 </SelectContent>
               </Select>
             </div>
           </div>
 
           <p className="text-sm text-muted-foreground">
             {nights} night{nights > 1 ? 's' : ''} stay
           </p>
 
           {/* Room Selection */}
           <div>
             <Label className="mb-3 block">Select Room</Label>
             {roomsByType.length === 0 ? (
               <p className="text-muted-foreground text-sm py-4 text-center border rounded-lg">
                 No rooms available for selected dates
               </p>
             ) : (
               <div className="space-y-4">
                 {roomsByType.map(({ type, rooms }) => (
                   <div key={type.id}>
                     <p className="text-sm font-medium mb-2">{type.name} - ₹{type.basePrice}/night</p>
                     <div className="flex flex-wrap gap-2">
                       {rooms.map(room => (
                         <Button
                           key={room.id}
                           variant={selectedRoomId === room.id ? 'default' : 'outline'}
                           size="sm"
                           onClick={() => handleRoomSelect(room.id)}
                           className={cn(
                             selectedRoomId === room.id && 'bg-success hover:bg-success/90'
                           )}
                         >
                           Room {room.number}
                         </Button>
                       ))}
                     </div>
                   </div>
                 ))}
               </div>
             )}
           </div>
 
           {/* Rate Override */}
           {selectedRoomId && (
             <div className="grid sm:grid-cols-2 gap-4">
               <div>
                 <Label>Daily Rate (₹)</Label>
                 <Input 
                   type="number" 
                   min={0}
                   value={dailyRate} 
                   onChange={(e) => setDailyRate(parseFloat(e.target.value) || 0)}
                 />
               </div>
               <div className="flex items-end">
                 <div className="p-3 bg-muted rounded-lg w-full text-center">
                   <p className="text-sm text-muted-foreground">Estimated Total</p>
                   <p className="text-xl font-bold">₹{totalAmount.toLocaleString()}</p>
                 </div>
               </div>
             </div>
           )}
         </CardContent>
       </Card>
 
       {/* Guest Information */}
       <Card>
         <CardHeader className="pb-3">
           <CardTitle className="text-lg flex items-center gap-2">
             <User className="h-5 w-5" />
             Guest Information
           </CardTitle>
         </CardHeader>
         <CardContent className="space-y-4">
           <div className="grid sm:grid-cols-2 gap-4">
             <div>
               <Label>Name *</Label>
               <Input 
                 value={guestName} 
                 onChange={(e) => setGuestName(e.target.value)}
                 placeholder="Full name"
               />
             </div>
             <div>
               <Label>Phone *</Label>
               <Input 
                 value={guestPhone} 
                 onChange={(e) => setGuestPhone(e.target.value)}
                 placeholder="10-digit mobile"
               />
             </div>
           </div>
           <div className="grid sm:grid-cols-2 gap-4">
             <div>
               <Label>Email (optional)</Label>
               <Input 
                 type="email"
                 value={guestEmail} 
                 onChange={(e) => setGuestEmail(e.target.value)}
                 placeholder="email@example.com"
               />
             </div>
             <div>
               <Label>City (optional)</Label>
               <Input 
                 value={guestCity} 
                 onChange={(e) => setGuestCity(e.target.value)}
                 placeholder="City name"
               />
             </div>
           </div>
           <div>
             <Label>ID Proof (optional)</Label>
             <Input 
               value={guestIdProof} 
               onChange={(e) => setGuestIdProof(e.target.value)}
               placeholder="Aadhar / Passport / Driving License number"
             />
           </div>
           <div>
             <Label>Notes (optional)</Label>
             <Textarea 
               value={notes} 
               onChange={(e) => setNotes(e.target.value)}
               placeholder="Any special requests or notes"
             />
           </div>
         </CardContent>
       </Card>
 
       {/* Submit */}
       <div className="flex justify-end gap-4">
         <Button variant="outline" onClick={() => navigate(-1)}>
           Cancel
         </Button>
         <Button onClick={handleSubmit} disabled={submitting} size="lg">
           {submitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
           Create Booking
         </Button>
       </div>
     </div>
   );
 }