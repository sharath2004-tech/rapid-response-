import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';
import { AnimatePresence, motion } from 'framer-motion';
import {
    AlertTriangle,
    FileText,
    Home,
    Info,
    LayoutDashboard,
    LogIn,
    LogOut,
    Map,
    Menu,
    Phone,
    Radio,
    Shield,
    User,
    UserPlus,
    X
} from 'lucide-react';
import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Button } from './ui/button';

const navLinks = [
  { path: '/', label: 'Home', icon: Home },
  { path: '/report', label: 'Report', icon: FileText, requireAuth: true },
  { path: '/feed', label: 'Live Feed', icon: Radio, requireAuth: true },
  { path: '/map', label: 'Map View', icon: Map, requireAuth: true },
  { path: '/emergency-contacts', label: 'Emergency Contacts', icon: UserPlus, requireAuth: true },
  { path: '/about', label: 'About', icon: Info },
  { path: '/contact', label: 'Contact', icon: Phone },
];

const adminLinks = [
  { path: '/admin', label: 'Dashboard', icon: LayoutDashboard, requireAuth: true },
];

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/');
    setIsOpen(false);
  };

  const allLinks = user?.role === 'admin' ? [...navLinks, ...adminLinks] : navLinks;
  const visibleLinks = isAuthenticated ? allLinks : allLinks.filter(link => !link.requireAuth);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass-dark">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <div className="relative">
              <AlertTriangle className="w-8 h-8 text-destructive" />
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-success rounded-full border-2 border-background" />
            </div>
            <span className="font-bold text-lg hidden sm:block">
              <span className="text-foreground">Rapid</span>
              <span className="text-primary">Response</span>
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-1">
            {visibleLinks.map((link) => {
              const isActive = location.pathname === link.path;
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  className={cn(
                    'relative px-4 py-2 rounded-lg text-sm font-medium transition-colors',
                    isActive
                      ? 'text-primary'
                      : 'text-muted-foreground hover:text-foreground hover:bg-accent'
                  )}
                >
                  {link.label}
                  {isActive && (
                    <motion.div
                      layoutId="navbar-indicator"
                      className="absolute inset-0 bg-primary/10 rounded-lg -z-10"
                      transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                    />
                  )}
                </Link>
              );
            })}
          </div>

          {/* Right Section */}
          <div className="flex items-center gap-2">
            {isAuthenticated ? (
              <>
                {/* Report CTA */}
                <Link to="/report">
                  <Button 
                    size="sm" 
                    className="gradient-emergency text-primary-foreground shadow-lg shadow-destructive/20 hover:shadow-destructive/40 transition-shadow"
                  >
                    <AlertTriangle className="w-4 h-4 mr-1" />
                    <span className="hidden sm:inline">Report</span>
                  </Button>
                </Link>

                {/* User Menu */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="hidden md:flex">
                      <Avatar className="w-8 h-8">
                        <AvatarFallback className="bg-primary/10 text-primary">
                          {user?.name.charAt(0).toUpperCase() || 'U'}
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuLabel>
                      <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium">{user?.name}</p>
                        <p className="text-xs text-muted-foreground">{user?.email}</p>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem className="cursor-pointer">
                      <div className="flex items-center gap-2">
                        {user?.role === 'admin' ? (
                          <>
                            <Shield className="w-4 h-4" />
                            <span>Admin Account</span>
                          </>
                        ) : (
                          <>
                            <User className="w-4 h-4" />
                            <span>Citizen Account</span>
                          </>
                        )}
                      </div>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <Link to="/profile">
                      <DropdownMenuItem className="cursor-pointer">
                        <User className="w-4 h-4 mr-2" />
                        <span>My Profile</span>
                      </DropdownMenuItem>
                    </Link>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleLogout} className="cursor-pointer text-destructive">
                      <LogOut className="w-4 h-4 mr-2" />
                      <span>Log out</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <>
                <Link to="/login">
                  <Button variant="ghost" size="sm" className="hidden sm:flex">
                    <LogIn className="w-4 h-4 mr-2" />
                    Sign In
                  </Button>
                </Link>
                <Link to="/signup">
                  <Button size="sm" className="gradient-primary text-primary-foreground shadow-lg">
                    Get Started
                  </Button>
                </Link>
              </>
            )}

            {/* Mobile Menu Toggle */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setIsOpen(!isOpen)}
            >
              {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden border-t border-border bg-background"
          >
            <div className="container mx-auto px-4 py-4 space-y-2">
              {visibleLinks.map((link) => {
                const isActive = location.pathname === link.path;
                const Icon = link.icon;
                return (
                  <Link
                    key={link.path}
                    to={link.path}
                    onClick={() => setIsOpen(false)}
                    className={cn(
                      'flex items-center gap-3 px-4 py-3 rounded-lg transition-colors',
                      isActive
                        ? 'bg-primary/10 text-primary'
                        : 'text-muted-foreground hover:bg-accent hover:text-foreground'
                    )}
                  >
                    <Icon className="w-5 h-5" />
                    {link.label}
                  </Link>
                );
              })}
              
              {isAuthenticated ? (
                <div className="pt-2 border-t border-border space-y-2">
                  <div className="px-4 py-2">
                    <p className="text-sm font-medium">{user?.name}</p>
                    <p className="text-xs text-muted-foreground">{user?.email}</p>
                    <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                      {user?.role === 'admin' ? (
                        <>
                          <Shield className="w-3 h-3" />
                          <span>Admin Account</span>
                        </>
                      ) : (
                        <>
                          <User className="w-3 h-3" />
                          <span>Citizen Account</span>
                        </>
                      )}
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    className="w-full justify-center gap-2 text-destructive border-destructive/30 hover:bg-destructive/10"
                    onClick={handleLogout}
                  >
                    <LogOut className="w-4 h-4" />
                    Log out
                  </Button>
                </div>
              ) : (
                <div className="pt-2 border-t border-border space-y-2">
                  <Link to="/login" onClick={() => setIsOpen(false)}>
                    <Button variant="outline" className="w-full justify-center gap-2">
                      <LogIn className="w-4 h-4" />
                      Sign In
                    </Button>
                  </Link>
                  <Link to="/signup" onClick={() => setIsOpen(false)}>
                    <Button className="w-full justify-center gap-2 gradient-primary">
                      Get Started
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
