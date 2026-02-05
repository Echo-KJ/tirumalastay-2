// ============================================
// PAGE HEADER COMPONENT
// Consistent page headers across admin panel
// ============================================

import { ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft, RefreshCw } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  showBack?: boolean;
  onBack?: () => void;
  onRefresh?: () => void;
  refreshing?: boolean;
  actions?: ReactNode;
  className?: string;
}

export function PageHeader({
  title,
  subtitle,
  showBack = false,
  onBack,
  onRefresh,
  refreshing = false,
  actions,
  className,
}: PageHeaderProps) {
  const navigate = useNavigate();

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      navigate(-1);
    }
  };

  return (
    <div className={`flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${className}`}>
      <div className="flex items-center gap-3">
        {showBack && (
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={handleBack}
            className="h-9 w-9 flex-shrink-0"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
        )}
        <div>
          <h1 className="font-display text-2xl sm:text-3xl font-bold tracking-tight">
            {title}
          </h1>
          {subtitle && (
            <p className="text-sm text-muted-foreground mt-0.5">
              {subtitle}
            </p>
          )}
        </div>
      </div>
      
      <div className="flex items-center gap-2 flex-wrap">
        {onRefresh && (
          <Button 
            variant="outline" 
            size="sm" 
            onClick={onRefresh}
            disabled={refreshing}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        )}
        {actions}
      </div>
    </div>
  );
}

// Breadcrumb-style subheader
interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface PageHeaderWithBreadcrumbProps extends PageHeaderProps {
  breadcrumbs?: BreadcrumbItem[];
}

export function PageHeaderWithBreadcrumb({
  breadcrumbs,
  ...props
}: PageHeaderWithBreadcrumbProps) {
  const navigate = useNavigate();

  return (
    <div className="space-y-2">
      {breadcrumbs && breadcrumbs.length > 0 && (
        <nav className="flex items-center gap-1 text-sm text-muted-foreground">
          {breadcrumbs.map((crumb, index) => (
            <div key={index} className="flex items-center gap-1">
              {index > 0 && <span>/</span>}
              {crumb.href ? (
                <button 
                  onClick={() => navigate(crumb.href!)}
                  className="hover:text-foreground transition-colors"
                >
                  {crumb.label}
                </button>
              ) : (
                <span className="text-foreground font-medium">{crumb.label}</span>
              )}
            </div>
          ))}
        </nav>
      )}
      <PageHeader {...props} />
    </div>
  );
}
