
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
  predicted_pollution_zones?: any;
  generated_routes?: any;
  status: 'Pending' | 'Processing' | 'Completed' | 'Failed';
  created_at: string;
}
