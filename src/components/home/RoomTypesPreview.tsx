import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Users, Wifi, Tv, Wind, ArrowRight } from 'lucide-react';
import { mockRoomTypes } from '@/services/mockData';

const amenityIcons: Record<string, React.ReactNode> = {
  'Wi-Fi': <Wifi className="h-4 w-4" />,
  'TV': <Tv className="h-4 w-4" />,
  'Smart TV': <Tv className="h-4 w-4" />,
  'AC': <Wind className="h-4 w-4" />,
};

export function RoomTypesPreview() {
  const displayedTypes = mockRoomTypes.slice(0, 3);

  return (
    <section className="py-20 bg-muted/30">
      <div className="container">
        <div className="text-center mb-12">
          <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4">
            Our Accommodations
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Choose from our range of comfortable rooms designed for your perfect stay. 
            Each room features modern amenities and warm hospitality.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {displayedTypes.map((roomType, index) => (
            <Card 
              key={roomType.id} 
              className="overflow-hidden card-hover border-0 shadow-card"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="aspect-[4/3] overflow-hidden">
                <img
                  src={roomType.images[0]}
                  alt={roomType.name}
                  className="w-full h-full object-cover transition-transform duration-500 hover:scale-110"
                />
              </div>
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-3">
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
                  {roomType.amenities.slice(0, 4).map((amenity) => (
                    <span
                      key={amenity}
                      className="inline-flex items-center gap-1 text-xs bg-muted px-2 py-1 rounded-full"
                    >
                      {amenityIcons[amenity] || null}
                      {amenity}
                    </span>
                  ))}
                  {roomType.amenities.length > 4 && (
                    <span className="text-xs text-muted-foreground">
                      +{roomType.amenities.length - 4} more
                    </span>
                  )}
                </div>
                <div className="flex items-center justify-between pt-4 border-t">
                  <div>
                    <span className="text-2xl font-display font-bold text-primary">
                      ₹{roomType.basePrice.toLocaleString()}
                    </span>
                    <span className="text-muted-foreground text-sm">/night</span>
                  </div>
                  <Button variant="outline" size="sm" asChild>
                    <Link to={`/rooms#${roomType.id}`}>
                      View Details
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="text-center mt-10">
          <Button size="lg" variant="outline" asChild>
            <Link to="/rooms">
              View All Rooms
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
