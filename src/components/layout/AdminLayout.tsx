// ============================================
// ADMIN LAYOUT - Clean Staff Dashboard Layout
// ============================================

import { useState, useEffect } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { 
  LayoutDashboard, 
  CalendarRange, 
  BedDouble, 
  FileText,
  LogOut,
  Menu,
  X,
  Hotel,
  Plus,
  ClipboardList,
  Settings,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import { hotelConfig } from '@/config/hotel';

const navItems = [
  { 
    href: '/admin', 
    label: 'Front Desk', 
    icon: LayoutDashboard, 
    exact: true,
    description: 'Daily operations',
  },
  { 
    href: '/admin/bookings', 
    label: 'Bookings', 
    icon: CalendarRange,
    description: 'All reservations',
  },
  { 
    href: '/admin/rooms', 
    label: 'Rooms', 
    icon: BedDouble,
    description: 'Room status',
  },
  { 
    href: '/admin/reports', 
    label: 'Reports', 
    icon: FileText,
    description: 'Analytics',
  },
  { 
    href: '/admin/audit', 
    label: 'Audit Log', 
    icon: ClipboardList,
    description: 'Activity history',
  },
];

export function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  // Close sidebar on route change (mobile)
  useEffect(() => {
    setSidebarOpen(false);
  }, [location.pathname]);

  // Prevent body scroll when sidebar open
  useEffect(() => {
    if (sidebarOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [sidebarOpen]);

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };

  const isActive = (href: string, exact?: boolean) => {
    if (exact) return location.pathname === href;
    return location.pathname.startsWith(href);
  };

  return (
    <div className="min-h-screen min-h-[100dvh] bg-background">
      {/* Mobile header */}
      <header className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-sidebar border-b border-sidebar-border safe-area-top">
        <div className="flex items-center justify-between p-3">
          <div className="flex items-center gap-2 text-sidebar-foreground">
            <Hotel className="h-5 w-5 text-sidebar-primary" />
            <span className="font-display font-semibold text-sm">HMS</span>
          </div>
          
          {/* Quick action - New Booking */}
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              className="bg-sidebar-primary text-sidebar-primary-foreground h-9 px-3"
              onClick={() => navigate('/admin/bookings/new')}
            >
              <Plus className="h-4 w-4 mr-1" />
              <span className="hidden xs:inline">New</span>
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="text-sidebar-foreground h-10 w-10"
              onClick={() => setSidebarOpen(!sidebarOpen)}
            >
              {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>
      </header>

      <div className="flex pt-[52px] lg:pt-0">
        {/* Sidebar */}
        <aside
          className={cn(
            'fixed inset-y-0 left-0 z-40 w-64 bg-sidebar border-r border-sidebar-border transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static',
            'pt-[52px] lg:pt-0',
            sidebarOpen ? 'translate-x-0' : '-translate-x-full'
          )}
        >
          <div className="flex flex-col h-full">
            {/* Logo - Desktop only */}
            <div className="hidden lg:flex items-center gap-3 p-5 border-b border-sidebar-border">
              <div className="w-10 h-10 rounded-lg bg-sidebar-primary flex items-center justify-center">
                <Hotel className="h-5 w-5 text-sidebar-primary-foreground" />
              </div>
              <div className="min-w-0">
                <h1 className="font-display text-base font-semibold text-sidebar-foreground truncate">
                  {hotelConfig.name}
                </h1>
                <p className="text-xs text-sidebar-foreground/60">Staff Dashboard</p>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="hidden lg:block p-3 border-b border-sidebar-border">
              <Button 
                className="w-full bg-sidebar-primary text-sidebar-primary-foreground hover:bg-sidebar-primary/90"
                onClick={() => navigate('/admin/bookings/new')}
              >
                <Plus className="h-4 w-4 mr-2" />
                New Booking
              </Button>
            </div>

            {/* Navigation */}
            <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  to={item.href}
                  className={cn(
                    'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                    isActive(item.href, item.exact)
                      ? 'bg-sidebar-primary text-sidebar-primary-foreground'
                      : 'text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
                  )}
                >
                  <item.icon className="h-4 w-4 flex-shrink-0" />
                  <span className="truncate">{item.label}</span>
                </Link>
              ))}
            </nav>

            {/* User section */}
            <div className="p-3 border-t border-sidebar-border">
              <div className="flex items-center gap-3 px-3 py-2 mb-2 rounded-lg bg-sidebar-accent/50">
                <div className="w-8 h-8 rounded-full bg-sidebar-primary flex items-center justify-center flex-shrink-0">
                  <span className="text-sm font-semibold text-sidebar-primary-foreground">
                    {user?.username?.[0]?.toUpperCase() || 'U'}
                  </span>
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-sidebar-foreground truncate">
                    {user?.username || 'Admin'}
                  </p>
                  <p className="text-xs text-sidebar-foreground/60 capitalize">
                    {user?.role || 'staff'}
                  </p>
                </div>
              </div>
              <Button
                variant="ghost"
                className="w-full justify-start text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent h-9"
                onClick={handleLogout}
              >
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </aside>

        {/* Overlay */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black/50 z-30 lg:hidden"
            style={{ top: '52px' }}
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Main content */}
        <main className="flex-1 min-h-[calc(100vh-52px)] lg:min-h-screen w-full overflow-x-hidden">
          <div className="p-4 sm:p-5 lg:p-6 max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
