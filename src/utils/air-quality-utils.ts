
export const getAQILevel = (aqi: number) => {
  if (aqi === 1) return 'good';
  if (aqi === 2) return 'moderate';
  if (aqi === 3) return 'unhealthy';
  if (aqi === 4) return 'hazardous';
  return 'severe';
};

export const getAQIText = (level: string): string => {
  switch (level) {
    case 'good': return 'Good';
    case 'moderate': return 'Moderate';
    case 'unhealthy': return 'Unhealthy';
    case 'hazardous': return 'Hazardous';
    case 'severe': return 'Severe';
    default: return 'Unknown';
  }
};
