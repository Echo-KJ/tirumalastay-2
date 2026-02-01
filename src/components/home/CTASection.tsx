import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Phone, CalendarDays } from 'lucide-react';

export function CTASection() {
  return (
    <section className="py-20 hero-gradient">
      <div className="container">
        <div className="max-w-3xl mx-auto text-center text-primary-foreground">
          <h2 className="font-display text-3xl md:text-4xl font-bold mb-4">
            Ready to Book Your Stay?
          </h2>
          <p className="text-lg text-primary-foreground/80 mb-8">
            Experience the warmth of Tirumala Residency. Book online or call us directly 
            for reservations and inquiries.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg" 
              className="bg-hotel-gold text-hotel-dark hover:bg-hotel-gold/90 font-semibold"
              asChild
            >
              <Link to="/booking">
                <CalendarDays className="mr-2 h-5 w-5" />
                Book Online Now
              </Link>
            </Button>
            <Button 
              size="lg" 
              variant="outline" 
              className="border-2 border-white bg-white/10 text-white hover:bg-white/20 font-semibold"
              asChild
            >
              <a href="tel:+919876543210">
                <Phone className="mr-2 h-5 w-5" />
                Call: +91 98765 43210
              </a>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
