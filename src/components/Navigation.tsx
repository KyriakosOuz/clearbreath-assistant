
import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Home, 
  BarChart, 
  MapPin, 
  MessageSquare, 
  Settings, 
  Navigation as NavigationIcon,
  Wind
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
  const { user } = useUser();

  const toggleSettings = () => {
    setIsSettingsOpen((prev) => !prev);
  };

  const links = [
    {
      href: '/',
      label: 'Home',
      icon: Home,
    },
    {
      href: '/dashboard',
      label: 'Dashboard',
      icon: BarChart,
    },
    {
      href: '/map',
      label: 'Map',
      icon: MapPin,
    },
    {
      href: '/air-quality',
      label: 'Air Quality',
      icon: Wind,
    },
    {
      href: '/clean-route',
      label: 'Clean Route',
      icon: NavigationIcon,
    },
    {
      href: '/chat',
      label: 'Chat',
      icon: MessageSquare,
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
              <AvatarImage src={user?.imageUrl} />
              <AvatarFallback>{user?.firstName?.charAt(0)}{user?.lastName?.charAt(0)}</AvatarFallback>
            </Avatar>
            <span className="font-bold">{user?.firstName}</span>
            <Button variant="ghost" size="icon" onClick={onCollapse}>
              <Settings className="h-5 w-5" />
            </Button>
          </div>
        )}
      </div>
      
      <ScrollArea className="flex-1 space-y-4 p-4">
        <div className="space-y-1">
          {links.map((link) => (
            <motion.a
              key={link.href}
              href={link.href}
              className={cn(
                "group flex items-center space-x-3 rounded-md p-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground",
                collapsed ? "justify-center" : "justify-start"
              )}
              whileHover={{ scale: 1.1 }}
              transition={{ duration: 0.2 }}
            >
              <link.icon className="h-4 w-4" />
              {!collapsed && <span>{link.label}</span>}
            </motion.a>
          ))}
        </div>
      </ScrollArea>
    </motion.div>
  );
};

export default Navigation;
