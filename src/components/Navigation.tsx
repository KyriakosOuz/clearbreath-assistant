
import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Home, 
  BarChart, 
  MapPin, 
  MessageSquare, 
  Settings, 
  Navigation as NavigationIcon,
  Wind,
  LayoutDashboard,
  CloudSun,
  MapPin as MapPinIcon,
  MessageSquare as MessageSquareIcon
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useSidebar } from '@/hooks/use-sidebar';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from '@/components/ui/button';
import { useUser } from '@clerk/clerk-react';

const Navigation = () => {
  const { collapsed, onExpand, onCollapse } = useSidebar((state) => state);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const { user, isLoaded } = useUser();

  const toggleSettings = () => {
    setIsSettingsOpen((prev) => !prev);
  };

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
      name: "Air Quality",
      path: "/air-quality",
      icon: CloudSun,
    },
    {
      name: "Map",
      path: "/map",
      icon: MapPinIcon,
    },
    {
      name: "Clean Route",
      path: "/clean-route",
      icon: NavigationIcon,
    },
    {
      name: "Chat",
      path: "/chat",
      icon: MessageSquareIcon,
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
            <Settings className="h-5 w-5" />
          </Button>
        ) : (
          <div className="flex items-center gap-2">
            <Avatar className="h-8 w-8">
              {isLoaded && user ? (
                <>
                  <AvatarImage src={user.imageUrl} />
                  <AvatarFallback>{user.firstName?.charAt(0)}{user.lastName?.charAt(0)}</AvatarFallback>
                </>
              ) : (
                <AvatarFallback>GU</AvatarFallback>
              )}
            </Avatar>
            <span className="font-bold">{isLoaded && user ? user.firstName : "Guest"}</span>
            <Button variant="ghost" size="icon" onClick={onCollapse}>
              <Settings className="h-5 w-5" />
            </Button>
          </div>
        )}
      </div>
      
      <ScrollArea className="flex-1 space-y-4 p-4">
        <div className="space-y-1">
          {routes.map((route) => (
            <motion.a
              key={route.path}
              href={route.path}
              className={cn(
                "group flex items-center space-x-3 rounded-md p-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground",
                collapsed ? "justify-center" : "justify-start"
              )}
              whileHover={{ scale: 1.1 }}
              transition={{ duration: 0.2 }}
            >
              <route.icon className="h-4 w-4" />
              {!collapsed && <span>{route.name}</span>}
            </motion.a>
          ))}
        </div>
      </ScrollArea>
    </motion.div>
  );
};

export default Navigation;
