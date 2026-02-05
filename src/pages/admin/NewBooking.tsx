// ============================================
// NEW BOOKING WIZARD
// 3-step wizard: Guest → Room → Confirm
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
import { Separator } from '@/components/ui/separator';
import {
  CalendarIcon,
  User,
  BedDouble,
  Users,
  Loader2,
  Check,
  ArrowRight,
  ArrowLeft,
  CreditCard,
  Phone,
  Mail,
  MapPin,
  MessageCircle,
  Copy,
} from 'lucide-react';
import { format, addDays } from 'date-fns';
import { cn } from '@/lib/utils';
import { roomsApiV2, frontDeskApi } from '@/services/hmsApi';
import { Room, RoomType, BookingType } from '@/types';
import { PageLoader } from '@/components/ui/LoadingSpinner';
import { PageHeader } from '@/components/admin/ui/PageHeader';
import { toast } from 'sonner';
import { 
  hotelConfig, 
  idProofTypes, 
  formatCurrency,
  IdProofType,
} from '@/config/hotel';

const STEPS = [
  { id: 1, name: 'Guest Details', icon: User },
  { id: 2, name: 'Room Selection', icon: BedDouble },
  { id: 3, name: 'Confirm & Payment', icon: CreditCard },
];

export default function NewBooking() {
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [roomTypes, setRoomTypes] = useState<RoomType[]>([]);
  const [availableRooms, setAvailableRooms] = useState<(Room & { type: RoomType })[]>([]);
  
  // Form state
  const [bookingType, setBookingType] = useState<BookingType>('WALK_IN');
  const [checkIn, setCheckIn] = useState<Date>(new Date());
  const [checkOut, setCheckOut] = useState<Date>(addDays(new Date(), 1));
  const [selectedRoomId, setSelectedRoomId] = useState<string>('');
  const [guestsCount, setGuestsCount] = useState(2);
  const [dailyRate, setDailyRate] = useState(0);
  const [notes, setNotes] = useState('');
  
  // Guest info
  const [guestName, setGuestName] = useState('');
  const [guestPhone, setGuestPhone] = useState('');
  const [guestEmail, setGuestEmail] = useState('');
  const [guestCity, setGuestCity] = useState('');
  const [idProofType, setIdProofType] = useState<IdProofType>('AADHAR');
  const [idProofNumber, setIdProofNumber] = useState('');

  // Validation errors
  const [errors, setErrors] = useState<Record<string, string>>({});

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

  const validatePhone = (phone: string): boolean => {
    const cleaned = phone.replace(/\D/g, '');
    return cleaned.length === 10;
  };

  const validateStep1 = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    if (!guestName.trim()) newErrors.guestName = 'Name is required';
    if (!guestPhone.trim()) {
      newErrors.guestPhone = 'Phone is required';
    } else if (!validatePhone(guestPhone)) {
      newErrors.guestPhone = 'Enter valid 10-digit phone';
    }
    if (!idProofNumber.trim()) newErrors.idProofNumber = 'ID number is required';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep2 = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    if (!selectedRoomId) newErrors.selectedRoom = 'Please select a room';
    if (checkOut <= checkIn) newErrors.dates = 'Check-out must be after check-in';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (currentStep === 1 && validateStep1()) {
      setCurrentStep(2);
    } else if (currentStep === 2 && validateStep2()) {
      setCurrentStep(3);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async () => {
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
          idProof: `${idProofType}: ${idProofNumber}`,
        },
        bookingType,
        dailyRate,
        notes: notes || undefined,
      });
      
      toast.success(`Booking ${booking.bookingCode} created!`);
      navigate(`/admin/bookings/${booking.id}`);
    } catch (error: any) {
      toast.error(error.message || 'Failed to create booking');
    } finally {
      setSubmitting(false);
    }
  };

  const generateWhatsAppMessage = (): string => {
    const room = availableRooms.find(r => r.id === selectedRoomId);
    const nights = calculateNights();
    const total = dailyRate * nights;
    
    return encodeURIComponent(
`Dear ${guestName},

Thank you for choosing ${hotelConfig.name}!

Your booking details:
🏨 Room: ${room?.number} (${room?.type.name})
📅 Check-in: ${format(checkIn, 'EEE, MMM d, yyyy')} at ${hotelConfig.checkInTime}
📅 Check-out: ${format(checkOut, 'EEE, MMM d, yyyy')} at ${hotelConfig.checkOutTime}
👥 Guests: ${guestsCount}
💰 Amount: ${formatCurrency(total)}

Address:
${hotelConfig.address}
${hotelConfig.city}, ${hotelConfig.state} - ${hotelConfig.pincode}

For any queries, call: ${hotelConfig.phone}

We look forward to hosting you!
Team ${hotelConfig.name}`
    );
  };

  if (loading) return <PageLoader />;

  const nights = calculateNights();
  const totalAmount = dailyRate * nights;
  const roomsByType = roomTypes.map(type => ({
    type,
    rooms: availableRooms.filter(r => r.typeId === type.id),
  })).filter(g => g.rooms.length > 0);

  const selectedRoom = availableRooms.find(r => r.id === selectedRoomId);

  return (
    <div className="space-y-5 max-w-3xl mx-auto">
      {/* Header */}
      <PageHeader
        title="New Booking"
        subtitle={bookingType === 'WALK_IN' ? 'Walk-in guest' : 'Future reservation'}
        showBack
      />

      {/* Progress Steps */}
      <div className="flex items-center justify-between mb-6">
        {STEPS.map((step, index) => (
          <div key={step.id} className="flex items-center flex-1">
            <div className="flex flex-col items-center flex-1">
              <div className={cn(
                'w-10 h-10 rounded-full flex items-center justify-center transition-colors',
                currentStep > step.id && 'bg-success text-success-foreground',
                currentStep === step.id && 'bg-primary text-primary-foreground',
                currentStep < step.id && 'bg-muted text-muted-foreground'
              )}>
                {currentStep > step.id ? (
                  <Check className="h-5 w-5" />
                ) : (
                  <step.icon className="h-5 w-5" />
                )}
              </div>
              <span className={cn(
                'text-xs mt-1 font-medium hidden sm:block',
                currentStep >= step.id ? 'text-foreground' : 'text-muted-foreground'
              )}>
                {step.name}
              </span>
            </div>
            {index < STEPS.length - 1 && (
              <div className={cn(
                'h-0.5 flex-1 mx-2',
                currentStep > step.id ? 'bg-success' : 'bg-muted'
              )} />
            )}
          </div>
        ))}
      </div>

      {/* Booking Type Toggle (Step 1 only) */}
      {currentStep === 1 && (
        <Card>
          <CardContent className="p-4">
            <RadioGroup 
              value={bookingType} 
              onValueChange={(v) => setBookingType(v as BookingType)}
              className="flex gap-4"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="WALK_IN" id="walk_in" />
                <Label htmlFor="walk_in" className="cursor-pointer text-sm">Walk-in (Today)</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="RESERVATION" id="reservation" />
                <Label htmlFor="reservation" className="cursor-pointer text-sm">Reservation (Future)</Label>
              </div>
            </RadioGroup>
          </CardContent>
        </Card>
      )}

      {/* Step 1: Guest Details */}
      {currentStep === 1 && (
        <Card>
          <CardHeader className="pb-3 pt-4">
            <CardTitle className="text-lg flex items-center gap-2">
              <User className="h-5 w-5" />
              Guest Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 pb-5">
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <Label className="text-sm">Full Name *</Label>
                <Input 
                  value={guestName} 
                  onChange={(e) => setGuestName(e.target.value)}
                  placeholder="Enter guest name"
                  className={errors.guestName ? 'border-destructive' : ''}
                />
                {errors.guestName && <p className="text-xs text-destructive mt-1">{errors.guestName}</p>}
              </div>
              <div>
                <Label className="text-sm">Phone Number *</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input 
                    value={guestPhone} 
                    onChange={(e) => setGuestPhone(e.target.value)}
                    placeholder="10-digit mobile"
                    className={cn('pl-9', errors.guestPhone && 'border-destructive')}
                    maxLength={12}
                  />
                </div>
                {errors.guestPhone && <p className="text-xs text-destructive mt-1">{errors.guestPhone}</p>}
              </div>
            </div>
            
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <Label className="text-sm">Email (optional)</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input 
                    type="email"
                    value={guestEmail} 
                    onChange={(e) => setGuestEmail(e.target.value)}
                    placeholder="email@example.com"
                    className="pl-9"
                  />
                </div>
              </div>
              <div>
                <Label className="text-sm">City (optional)</Label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input 
                    value={guestCity} 
                    onChange={(e) => setGuestCity(e.target.value)}
                    placeholder="City name"
                    className="pl-9"
                  />
                </div>
              </div>
            </div>
            
            <Separator />
            
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <Label className="text-sm">ID Proof Type *</Label>
                <Select value={idProofType} onValueChange={(v) => setIdProofType(v as IdProofType)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {idProofTypes.map(type => (
                      <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-sm">ID Number *</Label>
                <Input 
                  value={idProofNumber} 
                  onChange={(e) => setIdProofNumber(e.target.value)}
                  placeholder="Enter ID number"
                  className={errors.idProofNumber ? 'border-destructive' : ''}
                />
                {errors.idProofNumber && <p className="text-xs text-destructive mt-1">{errors.idProofNumber}</p>}
              </div>
            </div>
            
            <div>
              <Label className="text-sm">Number of Guests</Label>
              <Select value={String(guestsCount)} onValueChange={(v) => setGuestsCount(parseInt(v))}>
                <SelectTrigger className="w-full sm:w-40">
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
          </CardContent>
        </Card>
      )}

      {/* Step 2: Room Selection */}
      {currentStep === 2 && (
        <Card>
          <CardHeader className="pb-3 pt-4">
            <CardTitle className="text-lg flex items-center gap-2">
              <BedDouble className="h-5 w-5" />
              Select Room
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 pb-5">
            {/* Date Selection */}
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <Label className="text-sm">Check-in Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-start">
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {format(checkIn, 'EEE, MMM d, yyyy')}
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
                      disabled={(date) => date < new Date(new Date().setHours(0,0,0,0))}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
              
              <div>
                <Label className="text-sm">Check-out Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-start">
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {format(checkOut, 'EEE, MMM d, yyyy')}
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
            </div>
            
            <p className="text-sm text-muted-foreground">
              {nights} night{nights > 1 ? 's' : ''} stay
            </p>
            
            {errors.dates && <p className="text-sm text-destructive">{errors.dates}</p>}
            
            <Separator />

            {/* Room Selection */}
            {roomsByType.length === 0 ? (
              <div className="text-center py-6 text-muted-foreground">
                <BedDouble className="h-10 w-10 mx-auto mb-2 opacity-50" />
                <p>No rooms available for selected dates</p>
              </div>
            ) : (
              <div className="space-y-4">
                {roomsByType.map(({ type, rooms }) => (
                  <div key={type.id}>
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-sm font-medium">{type.name}</p>
                      <p className="text-sm text-muted-foreground">{formatCurrency(type.basePrice)}/night</p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {rooms.map(room => (
                        <Button
                          key={room.id}
                          variant={selectedRoomId === room.id ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => handleRoomSelect(room.id)}
                          className={cn(
                            'min-w-16',
                            selectedRoomId === room.id && 'bg-success hover:bg-success/90'
                          )}
                        >
                          {room.number}
                        </Button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
            
            {errors.selectedRoom && <p className="text-sm text-destructive">{errors.selectedRoom}</p>}

            {/* Rate Override */}
            {selectedRoomId && (
              <>
                <Separator />
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm">Daily Rate (₹)</Label>
                    <Input 
                      type="number" 
                      min={0}
                      value={dailyRate} 
                      onChange={(e) => setDailyRate(parseFloat(e.target.value) || 0)}
                    />
                  </div>
                  <div className="flex items-end">
                    <div className="p-3 bg-muted rounded-lg w-full text-center">
                      <p className="text-xs text-muted-foreground">Estimated Total</p>
                      <p className="text-xl font-bold">{formatCurrency(totalAmount)}</p>
                    </div>
                  </div>
                </div>
              </>
            )}
            
            <div>
              <Label className="text-sm">Notes (optional)</Label>
              <Textarea 
                value={notes} 
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Special requests or notes"
                rows={2}
              />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 3: Confirmation */}
      {currentStep === 3 && (
        <Card>
          <CardHeader className="pb-3 pt-4">
            <CardTitle className="text-lg flex items-center gap-2">
              <Check className="h-5 w-5" />
              Booking Summary
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 pb-5">
            {/* Guest Summary */}
            <div className="p-3 rounded-lg bg-muted/50">
              <p className="text-xs text-muted-foreground mb-1">Guest</p>
              <p className="font-medium">{guestName}</p>
              <p className="text-sm text-muted-foreground">{guestPhone}</p>
              {guestEmail && <p className="text-sm text-muted-foreground">{guestEmail}</p>}
              <p className="text-xs text-muted-foreground mt-1">{idProofType}: {idProofNumber}</p>
            </div>
            
            {/* Stay Summary */}
            <div className="p-3 rounded-lg bg-muted/50">
              <p className="text-xs text-muted-foreground mb-1">Stay Details</p>
              <p className="font-medium">Room {selectedRoom?.number} ({selectedRoom?.type.name})</p>
              <p className="text-sm">
                {format(checkIn, 'EEE, MMM d')} → {format(checkOut, 'EEE, MMM d, yyyy')}
              </p>
              <p className="text-sm text-muted-foreground">{nights} night{nights > 1 ? 's' : ''} • {guestsCount} guest{guestsCount > 1 ? 's' : ''}</p>
            </div>
            
            {/* Amount Summary */}
            <div className="p-4 rounded-lg border-2 border-primary/20 bg-primary/5">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm text-muted-foreground">Total Amount</p>
                  <p className="text-2xl font-bold">{formatCurrency(totalAmount)}</p>
                </div>
                <div className="text-right text-sm text-muted-foreground">
                  <p>{formatCurrency(dailyRate)}/night × {nights} nights</p>
                </div>
              </div>
            </div>
            
            {notes && (
              <div className="p-3 rounded-lg bg-muted/50">
                <p className="text-xs text-muted-foreground mb-1">Notes</p>
                <p className="text-sm">{notes}</p>
              </div>
            )}
            
            <Separator />
            
            {/* WhatsApp Message */}
            <div>
              <p className="text-sm font-medium mb-2">Send Confirmation (optional)</p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => {
                    const message = generateWhatsAppMessage();
                    const url = `https://wa.me/91${guestPhone.replace(/\D/g, '')}?text=${message}`;
                    window.open(url, '_blank');
                  }}
                >
                  <MessageCircle className="h-4 w-4 mr-2" />
                  WhatsApp
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    navigator.clipboard.writeText(decodeURIComponent(generateWhatsAppMessage()));
                    toast.success('Message copied!');
                  }}
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Navigation Buttons */}
      <div className="flex justify-between gap-4">
        <Button 
          variant="outline" 
          onClick={currentStep === 1 ? () => navigate(-1) : handleBack}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          {currentStep === 1 ? 'Cancel' : 'Back'}
        </Button>
        
        {currentStep < 3 ? (
          <Button onClick={handleNext}>
            Next
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        ) : (
          <Button onClick={handleSubmit} disabled={submitting} size="lg">
            {submitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            Create Booking
          </Button>
        )}
      </div>
    </div>
  );
}
