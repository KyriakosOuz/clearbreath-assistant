
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Wind, BarChart2, Map, Navigation as NavigationIcon, MessageSquare } from 'lucide-react';

const Navigation = () => {
  const location = useLocation();
  
  const links = [
    { to: '/', label: 'Home', icon: Wind },
    { to: '/dashboard', label: 'Dashboard', icon: BarChart2 },
    { to: '/map', label: 'Air Quality Map', icon: Map },
    { to: '/clean-route', label: 'Clean Routes', icon: NavigationIcon },
    { to: '/chat', label: 'AI Assistant', icon: MessageSquare }
  ];
  
  return (
    <header className="sticky top-0 z-10 w-full bg-background/80 backdrop-blur-sm border-b">
      <div className="container flex h-16 items-center px-4">
        <div className="flex gap-2 font-semibold text-xl items-center mr-4">
          <Wind className="h-5 w-5 text-primary" />
          <span>AetherIQ</span>
        </div>
        
        <nav className="hidden md:flex flex-1 items-center gap-6 text-sm">
          {links.map(({ to, label, icon: Icon }) => {
            const isActive = to === '/' 
              ? location.pathname === to 
              : location.pathname.startsWith(to);
              
            return (
              <Link 
                key={to} 
                to={to}
                className={cn(
                  "group flex items-center gap-2 transition-colors hover:text-foreground/80",
                  isActive ? "text-foreground" : "text-foreground/60"
                )}
              >
                <Icon className="h-4 w-4" />
                <span>{label}</span>
                {isActive && (
                  <motion.div
                    layoutId="navbar-indicator"
                    className="absolute bottom-0 h-1 w-[calc(100%-1rem)] bg-primary"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.2 }}
                  />
                )}
              </Link>
            );
          })}
        </nav>
        
        <div className="md:hidden ml-auto">
          <button className="flex h-10 w-10 items-center justify-center rounded-md bg-muted">
            <span className="sr-only">Toggle menu</span>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </button>
        </div>
      </div>
    </header>
  );
};

export default Navigation;
