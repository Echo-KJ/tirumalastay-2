import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Hotel, Loader2, ArrowLeft, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

export default function AdminLogin() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login({ username, password });
      navigate('/admin');
    } catch (err) {
      setError('Invalid username or password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen min-h-[100dvh] flex items-center justify-center bg-gradient-to-br from-hotel-dark to-hotel-copper/20 p-4 safe-area-inset">
      <div className="w-full max-w-md">
        {/* Back link - mobile friendly */}
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-hotel-cream/80 hover:text-hotel-gold transition-colors mb-6 py-2 touch-manipulation"
        >
          <ArrowLeft className="h-5 w-5" />
          <span>Back to website</span>
        </Link>

        <Card className="shadow-elegant">
          <CardHeader className="text-center pb-2 px-4 sm:px-6">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-primary mx-auto mb-4 flex items-center justify-center">
              <Hotel className="h-8 w-8 sm:h-10 sm:w-10 text-primary-foreground" />
            </div>
            <CardTitle className="font-display text-xl sm:text-2xl">Staff Login</CardTitle>
            <p className="text-muted-foreground text-sm">
              Tirumala Residency Management System
            </p>
          </CardHeader>
          <CardContent className="pt-6 px-4 sm:px-6">
            {error && (
              <div className="mb-4 p-3 bg-destructive/10 text-destructive rounded-lg text-sm text-center">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="username" className="text-base">Username</Label>
                <Input
                  id="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Enter username"
                  required
                  autoComplete="username"
                  className="h-12 text-base"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password" className="text-base">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter password"
                    required
                    autoComplete="current-password"
                    className="h-12 text-base pr-12"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-muted-foreground hover:text-foreground touch-manipulation"
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>

              <Button type="submit" className="w-full h-12 text-base" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Signing in...
                  </>
                ) : (
                  'Sign In'
                )}
              </Button>
            </form>

            {/* Demo credentials hint */}
            <div className="mt-6 p-3 bg-muted rounded-lg">
              <p className="text-sm text-muted-foreground text-center">
                <strong>Demo:</strong> admin / admin123
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
