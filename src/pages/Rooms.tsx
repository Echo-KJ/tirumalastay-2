import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Users, Check, CalendarDays } from 'lucide-react';
import { roomsApi } from '@/services/api';
import { RoomType } from '@/types';
import { PageLoader } from '@/components/ui/LoadingSpinner';

export default function Rooms() {
  const [roomTypes, setRoomTypes] = useState<RoomType[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState<Record<string, number>>({});

  useEffect(() => {
    const loadRoomTypes = async () => {
      try {
        const types = await roomsApi.getRoomTypes();
        setRoomTypes(types);
        // Initialize selected image for each room type
        const initial: Record<string, number> = {};
        types.forEach(t => initial[t.id] = 0);
        setSelectedImage(initial);
      } catch (error) {
        console.error('Failed to load room types:', error);
      } finally {
        setLoading(false);
      }
    };
    loadRoomTypes();
  }, []);

  if (loading) return <PageLoader />;

  return (
    <div className="py-12">
      {/* Header */}
      <div className="container mb-12">
        <div className="text-center max-w-2xl mx-auto">
          <h1 className="font-display text-4xl md:text-5xl font-bold mb-4">Our Rooms</h1>
          <p className="text-muted-foreground text-lg">
            Discover our range of comfortable rooms, each thoughtfully designed 
            to provide you with a relaxing and memorable stay.
          </p>
        </div>
      </div>

      {/* Room Types */}
      <div className="container space-y-16">
        {roomTypes.map((roomType) => (
          <Card 
            key={roomType.id} 
            id={roomType.id}
            className="overflow-hidden border-0 shadow-elegant scroll-mt-24"
          >
            <div className="grid lg:grid-cols-2">
              {/* Images */}
              <div className="space-y-4 p-4">
                <div className="aspect-[4/3] rounded-lg overflow-hidden">
                  <img
                    src={roomType.images[selectedImage[roomType.id] || 0]}
                    alt={roomType.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                {roomType.images.length > 1 && (
                  <div className="flex gap-2 overflow-x-auto pb-2">
                    {roomType.images.map((img, idx) => (
                      <button
                        key={idx}
                        onClick={() => setSelectedImage(prev => ({ ...prev, [roomType.id]: idx }))}
                        className={`shrink-0 w-20 h-16 rounded-md overflow-hidden border-2 transition-colors ${
                          selectedImage[roomType.id] === idx 
                            ? 'border-primary' 
                            : 'border-transparent hover:border-muted-foreground/30'
                        }`}
                      >
                        <img src={img} alt="" className="w-full h-full object-cover" />
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Details */}
              <CardContent className="p-8 flex flex-col">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h2 className="font-display text-2xl md:text-3xl font-bold mb-2">
                      {roomType.name}
                    </h2>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className="flex items-center gap-1">
                        <Users className="h-3 w-3" />
                        Up to {roomType.capacity} guests
                      </Badge>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-3xl font-display font-bold text-primary">
                      ₹{roomType.basePrice.toLocaleString()}
                    </p>
                    <p className="text-sm text-muted-foreground">per night</p>
                  </div>
                </div>

                <p className="text-muted-foreground mb-6">{roomType.description}</p>

                {/* Amenities */}
                <div className="mb-8">
                  <h3 className="font-semibold mb-3">Room Amenities</h3>
                  <div className="grid grid-cols-2 gap-2">
                    {roomType.amenities.map((amenity) => (
                      <div key={amenity} className="flex items-center gap-2 text-sm">
                        <Check className="h-4 w-4 text-success" />
                        <span>{amenity}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-auto pt-6 border-t">
                  <Button size="lg" className="w-full sm:w-auto" asChild>
                    <Link to={`/booking?room=${roomType.id}`}>
                      <CalendarDays className="mr-2 h-5 w-5" />
                      Book This Room
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </div>
          </Card>
        ))}
      </div>

      {/* Policies */}
      <div className="container mt-16">
        <Card className="p-8 bg-muted/30">
          <h3 className="font-display text-xl font-semibold mb-4">Hotel Policies</h3>
          <div className="grid md:grid-cols-3 gap-6 text-sm">
            <div>
              <h4 className="font-semibold mb-2">Check-in & Check-out</h4>
              <p className="text-muted-foreground">
                Check-in: 12:00 PM onwards<br />
                Check-out: 11:00 AM
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Cancellation Policy</h4>
              <p className="text-muted-foreground">
                Free cancellation up to 24 hours before check-in. 
                50% charge for late cancellations.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Payment Options</h4>
              <p className="text-muted-foreground">
                Pay online or at the hotel. We accept Cash, UPI, 
                and all major cards.
              </p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
