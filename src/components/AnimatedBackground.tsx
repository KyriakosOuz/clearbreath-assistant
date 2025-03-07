
import { useRef, useEffect } from 'react';
import { motion } from 'framer-motion';

interface AnimatedBackgroundProps {
  children: React.ReactNode;
  intensity?: 'light' | 'medium' | 'strong';
}

const AnimatedBackground = ({ children, intensity = 'light' }: AnimatedBackgroundProps) => {
  const backgroundRef = useRef<HTMLDivElement>(null);
  
  const intensityScales = {
    light: { particles: 15, size: '8px', opacity: 0.3, speed: 50 },
    medium: { particles: 25, size: '10px', opacity: 0.4, speed: 40 },
    strong: { particles: 40, size: '12px', opacity: 0.5, speed: 30 }
  };
  
  const settings = intensityScales[intensity];
  
  useEffect(() => {
    if (!backgroundRef.current) return;
    
    const bg = backgroundRef.current;
    const createParticle = () => {
      const particle = document.createElement('div');
      particle.classList.add('absolute', 'rounded-full', 'bg-primary/20', 'animate-float');
      
      // Random position
      particle.style.left = `${Math.random() * 100}%`;
      particle.style.top = `${Math.random() * 100}%`;
      
      // Random size
      const size = `${parseInt(settings.size) - Math.random() * 4}px`;
      particle.style.width = size;
      particle.style.height = size;
      
      // Random opacity
      particle.style.opacity = `${settings.opacity - Math.random() * 0.2}`;
      
      // Animation duration
      const duration = `${settings.speed + Math.random() * 20}s`;
      particle.style.animationDuration = duration;
      
      bg.appendChild(particle);
      
      // Remove after animation completes
      setTimeout(() => {
        particle.remove();
        createParticle();
      }, parseInt(duration) * 1000);
    };
    
    // Create initial particles
    for (let i = 0; i < settings.particles; i++) {
      createParticle();
    }
    
    return () => {
      // Clean up particles on unmount
      while (bg.firstChild) {
        bg.removeChild(bg.firstChild);
      }
    };
  }, [settings]);
  
  return (
    <div className="relative min-h-screen w-full overflow-hidden">
      <div ref={backgroundRef} className="absolute inset-0 -z-10" />
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        {children}
      </motion.div>
    </div>
  );
};

export default AnimatedBackground;
