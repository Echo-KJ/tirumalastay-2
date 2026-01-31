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
  Hotel
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';

const navItems = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard, exact: true },
  { href: '/admin/bookings', label: 'Bookings', icon: CalendarRange },
  { href: '/admin/rooms', label: 'Rooms', icon: BedDouble },
  { href: '/admin/reports', label: 'Reports', icon: FileText },
];

export function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  // Close sidebar when route changes on mobile
  useEffect(() => {
    setSidebarOpen(false);
  }, [location.pathname]);

  // Prevent body scroll when sidebar is open on mobile
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
    if (exact) {
      return location.pathname === href;
    }
    return location.pathname.startsWith(href);
  };

  return (
    <div className="min-h-screen min-h-[100dvh] bg-background">
      {/* Mobile header */}
      <header className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-sidebar border-b border-sidebar-border safe-area-top">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center gap-2 text-sidebar-foreground">
            <Hotel className="h-6 w-6 text-sidebar-primary" />
            <span className="font-display font-semibold">HMS Admin</span>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="text-sidebar-foreground h-11 w-11 touch-manipulation"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            {sidebarOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </Button>
        </div>
      </header>

      <div className="flex pt-[60px] lg:pt-0">
        {/* Sidebar */}
        <aside
          className={cn(
            'fixed inset-y-0 left-0 z-40 w-72 bg-sidebar border-r border-sidebar-border transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:w-64',
            'pt-[60px] lg:pt-0',
            sidebarOpen ? 'translate-x-0' : '-translate-x-full'
          )}
        >
          <div className="flex flex-col h-full">
            {/* Logo - Desktop only */}
            <div className="hidden lg:flex items-center gap-3 p-6 border-b border-sidebar-border">
              <div className="w-10 h-10 rounded-lg bg-sidebar-primary flex items-center justify-center">
                <Hotel className="h-5 w-5 text-sidebar-primary-foreground" />
              </div>
              <div>
                <h1 className="font-display text-lg font-semibold text-sidebar-foreground">
                  HMS Admin
                </h1>
                <p className="text-xs text-sidebar-foreground/60">Tirumala Residency</p>
              </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  to={item.href}
                  className={cn(
                    'flex items-center gap-3 px-4 py-4 lg:py-3 rounded-lg text-base lg:text-sm font-medium transition-colors touch-manipulation',
                    isActive(item.href, item.exact)
                      ? 'bg-sidebar-primary text-sidebar-primary-foreground'
                      : 'text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground active:bg-sidebar-accent'
                  )}
                >
                  <item.icon className="h-5 w-5" />
                  {item.label}
                </Link>
              ))}
            </nav>

            {/* User section */}
            <div className="p-4 border-t border-sidebar-border safe-area-bottom">
              <div className="flex items-center gap-3 px-4 py-2 mb-2">
                <div className="w-10 h-10 lg:w-8 lg:h-8 rounded-full bg-sidebar-accent flex items-center justify-center">
                  <span className="text-base lg:text-sm font-semibold text-sidebar-accent-foreground">
                    {user?.username?.[0]?.toUpperCase() || 'U'}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-base lg:text-sm font-medium text-sidebar-foreground truncate">
                    {user?.username || 'Admin'}
                  </p>
                  <p className="text-sm lg:text-xs text-sidebar-foreground/60 capitalize">
                    {user?.role || 'staff'}
                  </p>
                </div>
              </div>
              <Button
                variant="ghost"
                className="w-full justify-start text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent h-12 lg:h-10 touch-manipulation"
                onClick={handleLogout}
              >
                <LogOut className="h-5 w-5 lg:h-4 lg:w-4 mr-3" />
                Logout
              </Button>
            </div>
          </div>
        </aside>

        {/* Overlay */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black/50 z-30 lg:hidden"
            style={{ top: '60px' }}
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Main content */}
        <main className="flex-1 min-h-[calc(100vh-60px)] lg:min-h-screen w-full overflow-x-hidden">
          <div className="p-4 sm:p-6">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
