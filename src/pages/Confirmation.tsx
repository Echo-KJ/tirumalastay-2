import { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { CheckCircle2, Calendar, MapPin, Phone, Copy, Check, Home } from 'lucide-react';
import { format } from 'date-fns';
import { bookingsApi } from '@/services/api';
import { Booking, Guest, Room } from '@/types';
import { PageLoader } from '@/components/ui/LoadingSpinner';
import { StatusBadge } from '@/components/ui/StatusBadge';

export default function Confirmation() {
  const { bookingCode } = useParams<{ bookingCode: string }>();
  const [booking, setBooking] = useState<(Booking & { guest: Guest; room: Room }) | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const loadBooking = async () => {
      if (!bookingCode) return;
      try {
        const data = await bookingsApi.getBookingByCode(bookingCode);
        setBooking(data);
      } catch (err) {
        setError('Booking not found');
      } finally {
        setLoading(false);
      }
    };
    loadBooking();
  }, [bookingCode]);

  const copyBookingCode = () => {
    if (booking) {
      navigator.clipboard.writeText(booking.bookingCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (loading) return <PageLoader />;

  if (error || !booking) {
    return (
      <div className="py-20">
        <div className="container max-w-lg text-center">
          <h1 className="font-display text-2xl font-bold mb-4">Booking Not Found</h1>
          <p className="text-muted-foreground mb-6">
            We couldn't find a booking with the code "{bookingCode}". 
            Please check the code and try again.
          </p>
          <Button asChild>
            <Link to="/">Return to Home</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="py-12">
      <div className="container max-w-2xl">
        {/* Success Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-success/10 mb-6">
            <CheckCircle2 className="h-10 w-10 text-success" />
          </div>
          <h1 className="font-display text-3xl font-bold mb-2">Booking Confirmed!</h1>
          <p className="text-muted-foreground">
            Thank you for choosing Tirumala Residency
          </p>
        </div>

        {/* Booking Code */}
        <Card className="mb-6 bg-primary/5 border-primary/20">
          <CardContent className="p-6 text-center">
            <p className="text-sm text-muted-foreground mb-2">Your Booking Code</p>
            <div className="flex items-center justify-center gap-2">
              <span className="font-display text-2xl md:text-3xl font-bold tracking-wider">
                {booking.bookingCode}
              </span>
              <Button variant="ghost" size="icon" onClick={copyBookingCode}>
                {copied ? <Check className="h-4 w-4 text-success" /> : <Copy className="h-4 w-4" />}
              </Button>
            </div>
            <p className="text-sm text-muted-foreground mt-2">
              Please save this code for your reference
            </p>
          </CardContent>
        </Card>

        {/* Booking Details */}
        <Card className="mb-6">
          <CardContent className="p-6 space-y-6">
            {/* Status */}
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Booking Status</span>
              <StatusBadge status={booking.status} type="booking" />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Payment</span>
              <StatusBadge status={booking.paymentStatus} type="payment" />
            </div>

            <div className="border-t pt-6">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <Calendar className="h-5 w-5 text-primary" />
                Stay Details
              </h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Check-in</p>
                  <p className="font-semibold">{format(new Date(booking.checkIn), 'EEE, MMM d, yyyy')}</p>
                  <p className="text-muted-foreground">From 12:00 PM</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Check-out</p>
                  <p className="font-semibold">{format(new Date(booking.checkOut), 'EEE, MMM d, yyyy')}</p>
                  <p className="text-muted-foreground">Before 11:00 AM</p>
                </div>
              </div>
            </div>

            <div className="border-t pt-6">
              <h3 className="font-semibold mb-4">Room Details</h3>
              <div className="text-sm space-y-2">
                <p>
                  <span className="text-muted-foreground">Room Type:</span>{' '}
                  {booking.room.type?.name}
                </p>
                <p>
                  <span className="text-muted-foreground">Room Number:</span>{' '}
                  {booking.room.number}
                </p>
                <p>
                  <span className="text-muted-foreground">Guests:</span>{' '}
                  {booking.guestsCount}
                </p>
              </div>
            </div>

            <div className="border-t pt-6">
              <h3 className="font-semibold mb-4">Guest Details</h3>
              <div className="text-sm space-y-2">
                <p>
                  <span className="text-muted-foreground">Name:</span>{' '}
                  {booking.guest?.name}
                </p>
                <p>
                  <span className="text-muted-foreground">Phone:</span>{' '}
                  {booking.guest?.phone}
                </p>
                {booking.guest?.email && (
                  <p>
                    <span className="text-muted-foreground">Email:</span>{' '}
                    {booking.guest.email}
                  </p>
                )}
              </div>
            </div>

            <div className="border-t pt-6">
              <div className="flex justify-between items-center text-lg">
                <span className="font-semibold">Total Amount</span>
                <span className="font-display text-2xl font-bold text-primary">
                  ₹{booking.totalAmount.toLocaleString()}
                </span>
              </div>
              {booking.paymentStatus === 'PAY_AT_HOTEL' && (
                <p className="text-sm text-muted-foreground mt-1">
                  To be paid at check-in
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Hotel Info */}
        <Card className="mb-6 bg-muted/30">
          <CardContent className="p-6">
            <h3 className="font-semibold mb-4">Hotel Information</h3>
            <div className="space-y-3 text-sm">
              <div className="flex items-start gap-3">
                <MapPin className="h-5 w-5 text-primary shrink-0" />
                <div>
                  <p className="font-medium">Tirumala Residency</p>
                  <p className="text-muted-foreground">
                    123 Main Road, Near Bus Stand, Tirumala, AP 517501
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="h-5 w-5 text-primary" />
                <a href="tel:+919876543210" className="hover:text-primary">
                  +91 98765 43210
                </a>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button variant="outline" asChild>
            <Link to="/">
              <Home className="mr-2 h-4 w-4" />
              Back to Home
            </Link>
          </Button>
          <Button onClick={() => window.print()}>
            Print Confirmation
          </Button>
        </div>
      </div>
    </div>
  );
}
