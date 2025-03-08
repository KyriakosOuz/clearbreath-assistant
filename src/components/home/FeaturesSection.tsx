
import { motion } from 'framer-motion';
import { Upload, BarChart, RefreshCw } from 'lucide-react';

export function FeaturesSection() {
  const features = [
    {
      title: 'Upload & Analyze',
      description: 'Upload your datasets in CSV or JSON format and get instant insights.',
      icon: Upload,
      delay: 0.7
    },
    {
      title: 'Visualization',
      description: 'Explore data through interactive visualizations and statistics.',
      icon: BarChart,
      delay: 0.8
    },
    {
      title: 'Clean Route Planning',
      description: 'Find the cleaner, shorter routes based on air quality data.',
      icon: RefreshCw,
      delay: 0.9
    }
  ];

  return (
    <section className="mb-12">
      <div className="mx-auto max-w-4xl">
        <motion.h2 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="mb-6 text-center text-2xl font-bold"
        >
          Data-Driven Air Quality Analysis
        </motion.h2>
        
        <div className="grid gap-6 sm:grid-cols-3">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: feature.delay }}
              className="glass-card rounded-xl p-6"
            >
              <feature.icon className="h-8 w-8 text-primary mb-4" />
              <h3 className="mb-2 text-lg font-medium">{feature.title}</h3>
              <p className="text-muted-foreground">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
