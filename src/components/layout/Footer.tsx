import { Link } from 'react-router-dom';
import { Phone, Mail, MapPin, Facebook, Instagram, Twitter } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-hotel-dark text-hotel-cream">
      <div className="container py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-full bg-hotel-gold flex items-center justify-center">
                <span className="text-hotel-dark font-display font-bold text-lg">T</span>
              </div>
              <div>
                <h3 className="font-display text-xl font-semibold">Tirumala Residency</h3>
              </div>
            </div>
            <p className="text-hotel-cream/70 text-sm leading-relaxed">
              Experience warm hospitality and comfortable stays at Tirumala Residency. 
              Your home away from home in the heart of the city.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-display text-lg font-semibold mb-4 text-hotel-gold">Quick Links</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/" className="text-hotel-cream/70 hover:text-hotel-gold transition-colors">Home</Link></li>
              <li><Link to="/rooms" className="text-hotel-cream/70 hover:text-hotel-gold transition-colors">Our Rooms</Link></li>
              <li><Link to="/booking" className="text-hotel-cream/70 hover:text-hotel-gold transition-colors">Book Now</Link></li>
              <li><Link to="/contact" className="text-hotel-cream/70 hover:text-hotel-gold transition-colors">Contact Us</Link></li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="font-display text-lg font-semibold mb-4 text-hotel-gold">Contact Us</h4>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start gap-3">
                <MapPin className="h-5 w-5 text-hotel-gold shrink-0 mt-0.5" />
                <span className="text-hotel-cream/70">
                  123 Main Road, Near Bus Stand,<br />
                  Tirumala, Andhra Pradesh 517501
                </span>
              </li>
              <li>
                <a href="tel:+919876543210" className="flex items-center gap-3 text-hotel-cream/70 hover:text-hotel-gold transition-colors">
                  <Phone className="h-5 w-5 text-hotel-gold" />
                  +91 98765 43210
                </a>
              </li>
              <li>
                <a href="mailto:info@tirumalaresidency.com" className="flex items-center gap-3 text-hotel-cream/70 hover:text-hotel-gold transition-colors">
                  <Mail className="h-5 w-5 text-hotel-gold" />
                  info@tirumalaresidency.com
                </a>
              </li>
            </ul>
          </div>

          {/* Social & Hours */}
          <div>
            <h4 className="font-display text-lg font-semibold mb-4 text-hotel-gold">Connect With Us</h4>
            <div className="flex gap-4 mb-6">
              <a href="#" className="w-10 h-10 rounded-full bg-hotel-cream/10 flex items-center justify-center hover:bg-hotel-gold hover:text-hotel-dark transition-colors">
                <Facebook className="h-5 w-5" />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-hotel-cream/10 flex items-center justify-center hover:bg-hotel-gold hover:text-hotel-dark transition-colors">
                <Instagram className="h-5 w-5" />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-hotel-cream/10 flex items-center justify-center hover:bg-hotel-gold hover:text-hotel-dark transition-colors">
                <Twitter className="h-5 w-5" />
              </a>
            </div>
            <div className="text-sm text-hotel-cream/70">
              <p className="font-medium text-hotel-cream mb-1">Check-in / Check-out</p>
              <p>Check-in: 12:00 PM</p>
              <p>Check-out: 11:00 AM</p>
            </div>
          </div>
        </div>

        <div className="border-t border-hotel-cream/10 mt-10 pt-6 text-center text-sm text-hotel-cream/50">
          <p>© {new Date().getFullYear()} Tirumala Residency. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
