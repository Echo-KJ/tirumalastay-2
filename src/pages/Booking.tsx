import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CalendarIcon, Users, Check, ArrowRight, Loader2 } from 'lucide-react';
import { format, addDays, differenceInDays } from 'date-fns';
import { cn } from '@/lib/utils';
import { availabilityApi, bookingsApi, roomsApi } from '@/services/api';
import { RoomType, Room, CreateBookingRequest } from '@/types';
import { PageLoader } from '@/components/ui/LoadingSpinner';

type Step = 'dates' | 'room' | 'guest' | 'confirm';

export default function Booking() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const preselectedRoom = searchParams.get('room');

  const [step, setStep] = useState<Step>('dates');
  const [loading, setLoading] = useState(false);
  const [checkingAvailability, setCheckingAvailability] = useState(false);

  // Form state
  const [checkIn, setCheckIn] = useState<Date>();
  const [checkOut, setCheckOut] = useState<Date>();
  const [guestsCount, setGuestsCount] = useState(2);
  const [availableRoomTypes, setAvailableRoomTypes] = useState<(RoomType & { availableRooms: Room[]; totalPrice: number })[]>([]);
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [selectedRoomType, setSelectedRoomType] = useState<RoomType | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<'ONLINE' | 'PAY_AT_HOTEL'>('PAY_AT_HOTEL');

  // Guest info
  const [guestName, setGuestName] = useState('');
  const [guestPhone, setGuestPhone] = useState('');
  const [guestEmail, setGuestEmail] = useState('');
  const [guestCity, setGuestCity] = useState('');

  // Errors
  const [error, setError] = useState('');

  // Load room types for preselection
  useEffect(() => {
    if (preselectedRoom) {
      roomsApi.getRoomTypes().then(types => {
        const found = types.find(t => t.id === preselectedRoom);
        if (found) {
          setSelectedRoomType(found);
          setGuestsCount(found.capacity);
        }
      });
    }
  }, [preselectedRoom]);

  const nights = checkIn && checkOut ? differenceInDays(checkOut, checkIn) : 0;
  const totalAmount = selectedRoomType && nights > 0 ? selectedRoomType.basePrice * nights : 0;

  const checkAvailability = async () => {
    if (!checkIn || !checkOut) {
      setError('Please select check-in and check-out dates');
      return;
    }
    if (checkIn >= checkOut) {
      setError('Check-out must be after check-in');
      return;
    }

    setError('');
    setCheckingAvailability(true);

    try {
      const result = await availabilityApi.checkAvailability({
        checkIn,
        checkOut,
        guestsCount,
      });
      setAvailableRoomTypes(result.roomTypes);
      
      if (result.roomTypes.length === 0) {
        setError('No rooms available for the selected dates. Please try different dates.');
      } else {
        setStep('room');
      }
    } catch (err) {
      setError('Failed to check availability. Please try again.');
    } finally {
      setCheckingAvailability(false);
    }
  };

  const selectRoom = (roomType: RoomType & { availableRooms: Room[]; totalPrice: number }) => {
    setSelectedRoomType(roomType);
    setSelectedRoom(roomType.availableRooms[0]); // Auto-select first available room
    setStep('guest');
  };

  const validateGuestInfo = (): boolean => {
    if (!guestName.trim()) {
      setError('Please enter your name');
      return false;
    }
    if (!guestPhone.trim() || !/^[6-9]\d{9}$/.test(guestPhone)) {
      setError('Please enter a valid 10-digit phone number');
      return false;
    }
    if (guestEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(guestEmail)) {
      setError('Please enter a valid email address');
      return false;
    }
    setError('');
    return true;
  };

  const proceedToConfirm = () => {
    if (validateGuestInfo()) {
      setStep('confirm');
    }
  };

  const submitBooking = async () => {
    if (!selectedRoom || !checkIn || !checkOut) return;

    setLoading(true);
    setError('');

    try {
      const bookingData: CreateBookingRequest = {
        roomId: selectedRoom.id,
        checkIn,
        checkOut,
        guestsCount,
        guest: {
          name: guestName.trim(),
          phone: guestPhone.trim(),
          email: guestEmail.trim() || undefined,
          city: guestCity.trim() || undefined,
        },
        paymentMethod,
      };

      const result = await bookingsApi.createBooking(bookingData);
      navigate(`/confirmation/${result.booking.bookingCode}`);
    } catch (err) {
      setError('Failed to create booking. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="py-12">
      <div className="container max-w-4xl">
        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="font-display text-4xl font-bold mb-4">Book Your Stay</h1>
          <p className="text-muted-foreground">
            Complete the steps below to reserve your room at Tirumala Residency
          </p>
        </div>

        {/* Progress Steps */}
        <div className="flex justify-between mb-10 px-4">
          {(['dates', 'room', 'guest', 'confirm'] as Step[]).map((s, idx) => (
            <div key={s} className="flex items-center">
              <div className={cn(
                'w-10 h-10 rounded-full flex items-center justify-center font-semibold text-sm transition-colors',
                step === s 
                  ? 'bg-primary text-primary-foreground'
                  : (['dates', 'room', 'guest', 'confirm'].indexOf(step) > idx)
                    ? 'bg-success text-success-foreground'
                    : 'bg-muted text-muted-foreground'
              )}>
                {(['dates', 'room', 'guest', 'confirm'].indexOf(step) > idx) ? (
                  <Check className="h-5 w-5" />
                ) : (
                  idx + 1
                )}
              </div>
              {idx < 3 && (
                <div className={cn(
                  'hidden sm:block w-12 lg:w-24 h-0.5 mx-2',
                  (['dates', 'room', 'guest', 'confirm'].indexOf(step) > idx) 
                    ? 'bg-success' 
                    : 'bg-muted'
                )} />
              )}
            </div>
          ))}
        </div>

        {error && (
          <div className="mb-6 p-4 bg-destructive/10 text-destructive rounded-lg text-sm">
            {error}
          </div>
        )}

        {/* Step 1: Dates */}
        {step === 'dates' && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CalendarIcon className="h-5 w-5" />
                Select Your Dates
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                {/* Check-in */}
                <div className="space-y-2">
                  <Label>Check-in Date</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          'w-full justify-start text-left font-normal',
                          !checkIn && 'text-muted-foreground'
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {checkIn ? format(checkIn, 'PPP') : 'Select date'}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={checkIn}
                        onSelect={(date) => {
                          setCheckIn(date);
                          if (date && (!checkOut || date >= checkOut)) {
                            setCheckOut(addDays(date, 1));
                          }
                        }}
                        disabled={(date) => date < new Date()}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                {/* Check-out */}
                <div className="space-y-2">
                  <Label>Check-out Date</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          'w-full justify-start text-left font-normal',
                          !checkOut && 'text-muted-foreground'
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {checkOut ? format(checkOut, 'PPP') : 'Select date'}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={checkOut}
                        onSelect={setCheckOut}
                        disabled={(date) => date <= (checkIn || new Date())}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>

              {/* Guests */}
              <div className="space-y-2">
                <Label>Number of Guests</Label>
                <Select 
                  value={guestsCount.toString()} 
                  onValueChange={(v) => setGuestsCount(parseInt(v))}
                >
                  <SelectTrigger className="w-full md:w-48">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {[1, 2, 3, 4].map((n) => (
                      <SelectItem key={n} value={n.toString()}>
                        {n} Guest{n > 1 ? 's' : ''}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {nights > 0 && (
                <p className="text-muted-foreground">
                  {nights} night{nights > 1 ? 's' : ''} stay
                </p>
              )}

              <Button 
                onClick={checkAvailability} 
                disabled={checkingAvailability}
                className="w-full md:w-auto"
              >
                {checkingAvailability ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Checking Availability...
                  </>
                ) : (
                  <>
                    Check Availability
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Step 2: Select Room */}
        {step === 'room' && (
          <div className="space-y-6">
            <Card className="bg-muted/30">
              <CardContent className="p-4">
                <div className="flex flex-wrap gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Check-in:</span>{' '}
                    <strong>{checkIn && format(checkIn, 'PPP')}</strong>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Check-out:</span>{' '}
                    <strong>{checkOut && format(checkOut, 'PPP')}</strong>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Guests:</span>{' '}
                    <strong>{guestsCount}</strong>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Nights:</span>{' '}
                    <strong>{nights}</strong>
                  </div>
                </div>
                <Button variant="link" className="p-0 h-auto mt-2" onClick={() => setStep('dates')}>
                  Change dates
                </Button>
              </CardContent>
            </Card>

            <h2 className="font-display text-2xl font-semibold">Available Rooms</h2>

            <div className="space-y-4">
              {availableRoomTypes.map((roomType) => (
                <Card key={roomType.id} className="overflow-hidden">
                  <div className="grid md:grid-cols-3">
                    <div className="aspect-video md:aspect-square">
                      <img
                        src={roomType.images[0]}
                        alt={roomType.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <CardContent className="md:col-span-2 p-6 flex flex-col">
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-2">
                          <h3 className="font-display text-xl font-semibold">{roomType.name}</h3>
                          <div className="flex items-center gap-1 text-muted-foreground">
                            <Users className="h-4 w-4" />
                            <span className="text-sm">{roomType.capacity}</span>
                          </div>
                        </div>
                        <p className="text-muted-foreground text-sm mb-4 line-clamp-2">
                          {roomType.description}
                        </p>
                        <div className="flex flex-wrap gap-2 mb-4">
                          {roomType.amenities.slice(0, 5).map((amenity) => (
                            <span
                              key={amenity}
                              className="text-xs bg-muted px-2 py-1 rounded-full"
                            >
                              {amenity}
                            </span>
                          ))}
                        </div>
                      </div>
                      <div className="flex items-center justify-between pt-4 border-t">
                        <div>
                          <p className="text-sm text-muted-foreground">
                            ₹{roomType.basePrice.toLocaleString()} × {nights} night{nights > 1 ? 's' : ''}
                          </p>
                          <p className="text-2xl font-display font-bold text-primary">
                            ₹{roomType.totalPrice.toLocaleString()}
                          </p>
                        </div>
                        <Button onClick={() => selectRoom(roomType)}>
                          Select Room
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Step 3: Guest Information */}
        {step === 'guest' && (
          <Card>
            <CardHeader>
              <CardTitle>Guest Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name *</Label>
                  <Input
                    id="name"
                    value={guestName}
                    onChange={(e) => setGuestName(e.target.value)}
                    placeholder="Enter your full name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number *</Label>
                  <Input
                    id="phone"
                    value={guestPhone}
                    onChange={(e) => setGuestPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                    placeholder="10-digit mobile number"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email (Optional)</Label>
                  <Input
                    id="email"
                    type="email"
                    value={guestEmail}
                    onChange={(e) => setGuestEmail(e.target.value)}
                    placeholder="your@email.com"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="city">City (Optional)</Label>
                  <Input
                    id="city"
                    value={guestCity}
                    onChange={(e) => setGuestCity(e.target.value)}
                    placeholder="Your city"
                  />
                </div>
              </div>

              <div className="space-y-4">
                <Label>Payment Option</Label>
                <RadioGroup
                  value={paymentMethod}
                  onValueChange={(v) => setPaymentMethod(v as 'ONLINE' | 'PAY_AT_HOTEL')}
                  className="grid md:grid-cols-2 gap-4"
                >
                  <Label
                    htmlFor="pay-hotel"
                    className={cn(
                      'flex items-center gap-3 p-4 border rounded-lg cursor-pointer transition-colors',
                      paymentMethod === 'PAY_AT_HOTEL' 
                        ? 'border-primary bg-primary/5' 
                        : 'hover:border-muted-foreground/30'
                    )}
                  >
                    <RadioGroupItem value="PAY_AT_HOTEL" id="pay-hotel" />
                    <div>
                      <p className="font-medium">Pay at Hotel</p>
                      <p className="text-sm text-muted-foreground">
                        Pay when you arrive (Cash/UPI/Card)
                      </p>
                    </div>
                  </Label>
                  <Label
                    htmlFor="pay-online"
                    className={cn(
                      'flex items-center gap-3 p-4 border rounded-lg cursor-pointer transition-colors',
                      paymentMethod === 'ONLINE' 
                        ? 'border-primary bg-primary/5' 
                        : 'hover:border-muted-foreground/30'
                    )}
                  >
                    <RadioGroupItem value="ONLINE" id="pay-online" />
                    <div>
                      <p className="font-medium">Pay Now</p>
                      <p className="text-sm text-muted-foreground">
                        Secure online payment
                      </p>
                    </div>
                  </Label>
                </RadioGroup>
              </div>

              <div className="flex gap-4 pt-4">
                <Button variant="outline" onClick={() => setStep('room')}>
                  Back
                </Button>
                <Button onClick={proceedToConfirm}>
                  Continue to Confirm
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 4: Confirmation */}
        {step === 'confirm' && selectedRoomType && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Booking Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Room Details */}
                <div className="flex gap-4">
                  <div className="w-24 h-24 rounded-lg overflow-hidden shrink-0">
                    <img
                      src={selectedRoomType.images[0]}
                      alt={selectedRoomType.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <h3 className="font-semibold">{selectedRoomType.name}</h3>
                    <p className="text-sm text-muted-foreground">Room {selectedRoom?.number}</p>
                  </div>
                </div>

                {/* Dates */}
                <div className="grid grid-cols-2 gap-4 py-4 border-y">
                  <div>
                    <p className="text-sm text-muted-foreground">Check-in</p>
                    <p className="font-semibold">{checkIn && format(checkIn, 'EEE, MMM d, yyyy')}</p>
                    <p className="text-sm text-muted-foreground">From 12:00 PM</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Check-out</p>
                    <p className="font-semibold">{checkOut && format(checkOut, 'EEE, MMM d, yyyy')}</p>
                    <p className="text-sm text-muted-foreground">Before 11:00 AM</p>
                  </div>
                </div>

                {/* Guest Info */}
                <div>
                  <h4 className="font-semibold mb-2">Guest Details</h4>
                  <div className="text-sm space-y-1">
                    <p><span className="text-muted-foreground">Name:</span> {guestName}</p>
                    <p><span className="text-muted-foreground">Phone:</span> {guestPhone}</p>
                    {guestEmail && <p><span className="text-muted-foreground">Email:</span> {guestEmail}</p>}
                    {guestCity && <p><span className="text-muted-foreground">City:</span> {guestCity}</p>}
                  </div>
                </div>

                {/* Payment */}
                <div className="bg-muted/50 rounded-lg p-4">
                  <div className="flex justify-between mb-2">
                    <span>Room Rate × {nights} night{nights > 1 ? 's' : ''}</span>
                    <span>₹{totalAmount.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between font-semibold text-lg border-t pt-2">
                    <span>Total</span>
                    <span className="text-primary">₹{totalAmount.toLocaleString()}</span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-2">
                    Payment: {paymentMethod === 'PAY_AT_HOTEL' ? 'Pay at Hotel' : 'Online Payment'}
                  </p>
                </div>

                {/* Policies */}
                <div className="text-sm text-muted-foreground space-y-1">
                  <p>• Free cancellation up to 24 hours before check-in</p>
                  <p>• Valid ID proof required at check-in</p>
                  <p>• Early check-in/late check-out subject to availability</p>
                </div>
              </CardContent>
            </Card>

            <div className="flex gap-4">
              <Button variant="outline" onClick={() => setStep('guest')}>
                Back
              </Button>
              <Button 
                onClick={submitBooking} 
                disabled={loading}
                className="flex-1 md:flex-initial"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  'Confirm Booking'
                )}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
