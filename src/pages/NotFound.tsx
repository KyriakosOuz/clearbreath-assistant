
import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { motion } from 'framer-motion';
import { AlertTriangle, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';
import AnimatedBackground from '@/components/AnimatedBackground';

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <AnimatedBackground intensity="light">
      <div className="min-h-[80vh] flex items-center justify-center">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="text-center"
        >
          <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-muted">
            <AlertTriangle className="h-12 w-12 text-muted-foreground" />
          </div>
          <h1 className="mb-4 text-4xl font-bold">404</h1>
          <p className="mb-8 text-xl text-muted-foreground">Oops! Page not found</p>
          <Button asChild size="lg">
            <Link to="/" className="flex items-center gap-2">
              <Home className="h-4 w-4" />
              Return to Home
            </Link>
          </Button>
        </motion.div>
      </div>
    </AnimatedBackground>
  );
};

export default NotFound;
