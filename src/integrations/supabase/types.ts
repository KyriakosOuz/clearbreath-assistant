export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      air_quality_alerts: {
        Row: {
          aqi_threshold: number
          created_at: string
          id: string
          is_active: boolean | null
          location_name: string
          user_id: string
        }
        Insert: {
          aqi_threshold: number
          created_at?: string
          id?: string
          is_active?: boolean | null
          location_name: string
          user_id: string
        }
        Update: {
          aqi_threshold?: number
          created_at?: string
          id?: string
          is_active?: boolean | null
          location_name?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "air_quality_alerts_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      air_quality_datasets: {
        Row: {
          column_names: Json | null
          created_at: string
          data_preview: Json | null
          file_name: string
          file_size: number
          file_type: string
          id: string
          original_file_name: string
          row_count: number | null
          status: string
          upload_date: string
          user_id: string
        }
        Insert: {
          column_names?: Json | null
          created_at?: string
          data_preview?: Json | null
          file_name: string
          file_size: number
          file_type: string
          id?: string
          original_file_name: string
          row_count?: number | null
          status?: string
          upload_date?: string
          user_id: string
        }
        Update: {
          column_names?: Json | null
          created_at?: string
          data_preview?: Json | null
          file_name?: string
          file_size?: number
          file_type?: string
          id?: string
          original_file_name?: string
          row_count?: number | null
          status?: string
          upload_date?: string
          user_id?: string
        }
        Relationships: []
      }
      health_data: {
        Row: {
          date: string
          heart_rate: number | null
          id: string
          respiratory_rate: number | null
          sleep_hours: number | null
          steps: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          date?: string
          heart_rate?: number | null
          id?: string
          respiratory_rate?: number | null
          sleep_hours?: number | null
          steps?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          date?: string
          heart_rate?: number | null
          id?: string
          respiratory_rate?: number | null
          sleep_hours?: number | null
          steps?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "health_data_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      pollution_predictions: {
        Row: {
          correlations: Json | null
          created_at: string
          dataset_id: string
          generated_routes: Json | null
          id: string
          mlinsights: Json | null
          predicted_pollution_zones: Json | null
          predictions: Json | null
          status: string
          trends: Json | null
        }
        Insert: {
          correlations?: Json | null
          created_at?: string
          dataset_id: string
          generated_routes?: Json | null
          id?: string
          mlinsights?: Json | null
          predicted_pollution_zones?: Json | null
          predictions?: Json | null
          status?: string
          trends?: Json | null
        }
        Update: {
          correlations?: Json | null
          created_at?: string
          dataset_id?: string
          generated_routes?: Json | null
          id?: string
          mlinsights?: Json | null
          predicted_pollution_zones?: Json | null
          predictions?: Json | null
          status?: string
          trends?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "pollution_predictions_dataset_id_fkey"
            columns: ["dataset_id"]
            isOneToOne: false
            referencedRelation: "air_quality_datasets"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          first_name: string | null
          id: string
          last_name: string | null
        }
        Insert: {
          created_at?: string
          first_name?: string | null
          id: string
          last_name?: string | null
        }
        Update: {
          created_at?: string
          first_name?: string | null
          id?: string
          last_name?: string | null
        }
        Relationships: []
      }
      saved_routes: {
        Row: {
          created_at: string
          destination: string
          id: string
          is_favorite: boolean | null
          name: string
          origin: string
          transport_mode: string
          user_id: string
        }
        Insert: {
          created_at?: string
          destination: string
          id?: string
          is_favorite?: boolean | null
          name: string
          origin: string
          transport_mode?: string
          user_id: string
        }
        Update: {
          created_at?: string
          destination?: string
          id?: string
          is_favorite?: boolean | null
          name?: string
          origin?: string
          transport_mode?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "saved_routes_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
    ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never
