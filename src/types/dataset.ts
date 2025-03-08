
export interface AirQualityDataset {
  id: string;
  user_id: string;
  file_name: string;
  original_file_name: string;
  upload_date: string;
  status: 'Pending' | 'Processing' | 'Completed' | 'Failed';
  file_type: string;
  file_size: number;
  data_preview?: any;
  column_names?: string[];
  row_count?: number;
  created_at: string;
}

export interface PollutionPrediction {
  id: string;
  dataset_id: string;
  predicted_pollution_zones?: PollutionZone[];
  generated_routes?: {
    standard: RoutePoint[];
    clean: RoutePoint[];
    pollution_zones: PollutionZone[];
  };
  status: 'Pending' | 'Processing' | 'Completed' | 'Failed';
  created_at: string;
  // Updated property names to match database column names exactly
  mlinsights?: MLInsight[];
  trends?: Trend[];
  correlations?: Correlation[];
  predictions?: {
    nextDayPrediction: number;
    nextWeekTrend: 'increasing' | 'stable' | 'decreasing';
    confidence: number;
  };
}

export interface PollutionZone {
  center: {
    lat: number;
    lng: number;
  };
  radius: number;
  value: number;
  points: number;
}

export interface RoutePoint {
  lat: number;
  lng: number;
}

// Added to match the data structure coming from processor.ts
export interface MLInsight {
  type: string;
  description: string;
  confidence: number;
  relevance: number;
}

export interface Trend {
  period: string;
  averageValue: number;
  changePercent: number;
}

export interface Correlation {
  factor: string;
  strength: number;
  description: string;
}
