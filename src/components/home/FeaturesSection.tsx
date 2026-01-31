import { 
  Wifi, 
  Car, 
  Utensils, 
  ShieldCheck, 
  Clock, 
  MapPin,
  Sparkles,
  Users
} from 'lucide-react';

const features = [
  {
    icon: Wifi,
    title: 'Free High-Speed WiFi',
    description: 'Stay connected with complimentary high-speed internet throughout the property.',
  },
  {
    icon: Car,
    title: 'Free Parking',
    description: 'Convenient and secure parking available for all guests at no extra cost.',
  },
  {
    icon: Utensils,
    title: 'Room Service',
    description: 'Delicious food delivered to your room for a comfortable dining experience.',
  },
  {
    icon: Clock,
    title: '24/7 Front Desk',
    description: 'Our friendly staff is available round the clock to assist you.',
  },
  {
    icon: ShieldCheck,
    title: 'Safe & Secure',
    description: 'CCTV surveillance and secure premises for your peace of mind.',
  },
  {
    icon: MapPin,
    title: 'Prime Location',
    description: 'Conveniently located near temples, bus stand, and major attractions.',
  },
  {
    icon: Sparkles,
    title: 'Daily Housekeeping',
    description: 'Clean and fresh rooms maintained daily for your comfort.',
  },
  {
    icon: Users,
    title: 'Family Friendly',
    description: 'Spacious rooms and amenities perfect for families and groups.',
  },
];

export function FeaturesSection() {
  return (
    <section className="py-20">
      <div className="container">
        <div className="text-center mb-12">
          <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4">
            Why Choose Us
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            We strive to provide the best hospitality experience with modern amenities 
            and personalized service.
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <div
              key={feature.title}
              className="group p-6 rounded-xl bg-card border shadow-sm hover:shadow-card transition-all duration-300 animate-fade-in"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                <feature.icon className="h-6 w-6 text-primary group-hover:text-primary-foreground" />
              </div>
              <h3 className="font-semibold text-foreground mb-2">{feature.title}</h3>
              <p className="text-sm text-muted-foreground">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
