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
      cached_top_tokens: {
        Row: {
          id: string
          last_updated: string | null
          token_data: Json
        }
        Insert: {
          id?: string
          last_updated?: string | null
          token_data: Json
        }
        Update: {
          id?: string
          last_updated?: string | null
          token_data?: Json
        }
        Relationships: []
      }
      crawled_memecoins: {
        Row: {
          bundled_buys: number | null
          created_at: string | null
          dex_status: string | null
          graduated: boolean | null
          id: string
          market_cap: number | null
          meta: string[] | null
          name: string
          social_score: number | null
          symbol: string | null
          thread_comments: number | null
          thread_url: string | null
          updated_at: string | null
        }
        Insert: {
          bundled_buys?: number | null
          created_at?: string | null
          dex_status?: string | null
          graduated?: boolean | null
          id?: string
          market_cap?: number | null
          meta?: string[] | null
          name: string
          social_score?: number | null
          symbol?: string | null
          thread_comments?: number | null
          thread_url?: string | null
          updated_at?: string | null
        }
        Update: {
          bundled_buys?: number | null
          created_at?: string | null
          dex_status?: string | null
          graduated?: boolean | null
          id?: string
          market_cap?: number | null
          meta?: string[] | null
          name?: string
          social_score?: number | null
          symbol?: string | null
          thread_comments?: number | null
          thread_url?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      memecoin_analysis: {
        Row: {
          analysis: string
          created_at: string | null
          growth_potential_score: number | null
          id: string
          memecoin_id: string | null
          risk_score: number | null
        }
        Insert: {
          analysis: string
          created_at?: string | null
          growth_potential_score?: number | null
          id?: string
          memecoin_id?: string | null
          risk_score?: number | null
        }
        Update: {
          analysis?: string
          created_at?: string | null
          growth_potential_score?: number | null
          id?: string
          memecoin_id?: string | null
          risk_score?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "memecoin_analysis_memecoin_id_fkey"
            columns: ["memecoin_id"]
            isOneToOne: false
            referencedRelation: "crawled_memecoins"
            referencedColumns: ["id"]
          },
        ]
      }
      moonshot_predictions: {
        Row: {
          created_at: string
          id: number
          predicted_price: number | null
          prediction_reason: string | null
          prediction_score: number
          timeframe: string | null
          token_id: number | null
        }
        Insert: {
          created_at?: string
          id?: number
          predicted_price?: number | null
          prediction_reason?: string | null
          prediction_score: number
          timeframe?: string | null
          token_id?: number | null
        }
        Update: {
          created_at?: string
          id?: number
          predicted_price?: number | null
          prediction_reason?: string | null
          prediction_score?: number
          timeframe?: string | null
          token_id?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "moonshot_predictions_token_id_fkey"
            columns: ["token_id"]
            isOneToOne: false
            referencedRelation: "pump_tokens"
            referencedColumns: ["id"]
          },
        ]
      }
      pump_alerts: {
        Row: {
          alert_type: string
          created_at: string
          id: number
          message: string
          token_id: number | null
        }
        Insert: {
          alert_type: string
          created_at?: string
          id?: number
          message: string
          token_id?: number | null
        }
        Update: {
          alert_type?: string
          created_at?: string
          id?: number
          message?: string
          token_id?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "pump_alerts_token_id_fkey"
            columns: ["token_id"]
            isOneToOne: false
            referencedRelation: "pump_tokens"
            referencedColumns: ["id"]
          },
        ]
      }
      pump_tokens: {
        Row: {
          address: string
          created_at: string
          holders: number | null
          id: number
          is_trending: boolean | null
          is_verified: boolean | null
          launch_date: string | null
          liquidity: number | null
          market_cap: number | null
          name: string
          price: number
          price_change_24h: number
          social_score: number | null
          symbol: string
          updated_at: string
          volume_24h: number | null
        }
        Insert: {
          address: string
          created_at?: string
          holders?: number | null
          id?: number
          is_trending?: boolean | null
          is_verified?: boolean | null
          launch_date?: string | null
          liquidity?: number | null
          market_cap?: number | null
          name: string
          price: number
          price_change_24h: number
          social_score?: number | null
          symbol: string
          updated_at?: string
          volume_24h?: number | null
        }
        Update: {
          address?: string
          created_at?: string
          holders?: number | null
          id?: number
          is_trending?: boolean | null
          is_verified?: boolean | null
          launch_date?: string | null
          liquidity?: number | null
          market_cap?: number | null
          name?: string
          price?: number
          price_change_24h?: number
          social_score?: number | null
          symbol?: string
          updated_at?: string
          volume_24h?: number | null
        }
        Relationships: []
      }
      subscriptions: {
        Row: {
          created_at: string | null
          id: string
          tier: string
          valid_until: string
          wallet_address: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          tier: string
          valid_until: string
          wallet_address: string
        }
        Update: {
          created_at?: string | null
          id?: string
          tier?: string
          valid_until?: string
          wallet_address?: string
        }
        Relationships: []
      }
      tokens: {
        Row: {
          address: string
          created_at: string
          id: number
          market_cap: number | null
          name: string
          price: number
          price_change_24h: number
          symbol: string
          updated_at: string
          volume_24h: number | null
        }
        Insert: {
          address: string
          created_at?: string
          id?: number
          market_cap?: number | null
          name: string
          price: number
          price_change_24h: number
          symbol: string
          updated_at?: string
          volume_24h?: number | null
        }
        Update: {
          address?: string
          created_at?: string
          id?: number
          market_cap?: number | null
          name?: string
          price?: number
          price_change_24h?: number
          symbol?: string
          updated_at?: string
          volume_24h?: number | null
        }
        Relationships: []
      }
      trial_attempts: {
        Row: {
          created_at: string | null
          id: string
          ip_address: string
          wallet_address: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          ip_address: string
          wallet_address: string
        }
        Update: {
          created_at?: string | null
          id?: string
          ip_address?: string
          wallet_address?: string
        }
        Relationships: []
      }
      whitelisted_wallets: {
        Row: {
          created_at: string | null
          id: string
          tier: string
          updated_at: string | null
          wallet_address: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          tier: string
          updated_at?: string | null
          wallet_address: string
        }
        Update: {
          created_at?: string | null
          id?: string
          tier?: string
          updated_at?: string | null
          wallet_address?: string
        }
        Relationships: []
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
