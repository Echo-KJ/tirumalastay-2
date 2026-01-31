import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { CalendarDays, Star } from 'lucide-react';
import room1 from '@/assets/rooms/room-1.jpg';

export function HeroSection() {
  return (
    <section className="relative min-h-[80vh] flex items-center">
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <img
          src={room1}
          alt="Tirumala Residency Room"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 hero-overlay" />
      </div>

      {/* Content */}
      <div className="container relative z-10 py-20">
        <div className="max-w-2xl space-y-6 text-primary-foreground animate-fade-in-up">
          {/* Rating badge */}
          <div className="inline-flex items-center gap-2 bg-hotel-gold/20 backdrop-blur-sm rounded-full px-4 py-2 border border-hotel-gold/30">
            <div className="flex">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="h-4 w-4 fill-hotel-gold text-hotel-gold" />
              ))}
            </div>
            <span className="text-sm font-medium">Rated 4.8/5 by guests</span>
          </div>

          <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold leading-tight">
            Welcome to <br />
            <span className="text-hotel-gold">Tirumala Residency</span>
          </h1>

          <p className="text-lg md:text-xl text-primary-foreground/90 max-w-xl">
            Experience comfort and hospitality in the heart of the city. 
            Perfect for pilgrims, families, and business travelers.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 pt-4">
            <Button 
              size="lg" 
              className="bg-hotel-gold text-hotel-dark hover:bg-hotel-gold/90 font-semibold"
              asChild
            >
              <Link to="/booking">
                <CalendarDays className="mr-2 h-5 w-5" />
                Book Your Stay
              </Link>
            </Button>
            <Button 
              size="lg" 
              variant="outline" 
              className="border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10 backdrop-blur-sm"
              asChild
            >
              <Link to="/rooms">
                Explore Rooms
              </Link>
            </Button>
          </div>

          {/* Quick stats */}
          <div className="grid grid-cols-3 gap-6 pt-8 border-t border-primary-foreground/20 mt-8">
            <div>
              <p className="text-3xl font-display font-bold text-hotel-gold">11+</p>
              <p className="text-sm text-primary-foreground/70">Comfortable Rooms</p>
            </div>
            <div>
              <p className="text-3xl font-display font-bold text-hotel-gold">500+</p>
              <p className="text-sm text-primary-foreground/70">Happy Guests</p>
            </div>
            <div>
              <p className="text-3xl font-display font-bold text-hotel-gold">24/7</p>
              <p className="text-sm text-primary-foreground/70">Front Desk</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
