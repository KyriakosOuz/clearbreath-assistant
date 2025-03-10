
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Home, 
  Database,
  NavigationIcon,
  LayoutDashboard,
  LogOut,
  LogIn,
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { useSidebar } from '@/hooks/use-sidebar';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { signOut } from '@/lib/auth';

const Navigation = () => {
  const { collapsed, onExpand, onCollapse } = useSidebar((state) => state);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  
  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      setIsLoaded(true);
    };
    
    fetchUser();
    
    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null);
      setIsLoaded(true);
    });
    
    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  const toggleSettings = () => {
    setIsSettingsOpen((prev) => !prev);
  };

  const handleSignOut = () => {
    signOut();
  };

  const handleSignIn = () => {
    navigate('/sign-in');
  };

  // Updated routes - only showing active routes
  const routes = [
    {
      name: "Home",
      path: "/",
      icon: Home,
    },
    {
      name: "Dashboard",
      path: "/dashboard",
      icon: LayoutDashboard,
    },
    {
      name: "Datasets",
      path: "/datasets",
      icon: Database,
    },
    {
      name: "Clean Route",
      path: "/clean-route",
      icon: NavigationIcon,
    },
  ];

  return (
    <motion.div
      className={cn(
        "fixed left-0 top-0 z-50 flex h-full w-60 flex-col border-r bg-secondary",
        collapsed ? "w-[70px]" : "w-60"
      )}
      initial={{ x: -240 }}
      animate={{ x: 0 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
    >
      <div className="flex items-center justify-center p-4">
        {collapsed ? (
          <Button variant="ghost" size="icon" onClick={onExpand}>
            <Database className="h-5 w-5" />
          </Button>
        ) : (
          <div className="flex items-center gap-2">
            <Avatar className="h-8 w-8">
              {isLoaded && user ? (
                <>
                  <AvatarImage src={user.user_metadata?.avatar_url} />
                  <AvatarFallback>{user.email?.charAt(0).toUpperCase()}</AvatarFallback>
                </>
              ) : (
                <AvatarFallback>GU</AvatarFallback>
              )}
            </Avatar>
            <span className="font-bold">{isLoaded && user ? user.email?.split('@')[0] : "Guest"}</span>
            <Button variant="ghost" size="icon" onClick={onCollapse}>
              <Database className="h-5 w-5" />
            </Button>
          </div>
        )}
      </div>
      
      <ScrollArea className="flex-1 space-y-4 p-4">
        <div className="space-y-1">
          {routes.map((route) => (
            <motion.div key={route.path} whileHover={{ scale: 1.05 }} transition={{ duration: 0.2 }}>
              <Link
                to={route.path}
                className={cn(
                  "group flex items-center space-x-3 rounded-md p-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground",
                  collapsed ? "justify-center" : "justify-start"
                )}
              >
                <route.icon className="h-4 w-4" />
                {!collapsed && <span>{route.name}</span>}
              </Link>
            </motion.div>
          ))}
        </div>
      </ScrollArea>
      
      <div className="p-4">
        {!collapsed && isLoaded && (
          <Button 
            variant="outline" 
            className="w-full flex justify-start items-center space-x-2"
            onClick={user ? handleSignOut : handleSignIn}
          >
            {user ? (
              <>
                <LogOut className="h-4 w-4" />
                <span>Sign Out</span>
              </>
            ) : (
              <>
                <LogIn className="h-4 w-4" />
                <span>Sign In</span>
              </>
            )}
          </Button>
        )}
      </div>
    </motion.div>
  );
};

export default Navigation;
