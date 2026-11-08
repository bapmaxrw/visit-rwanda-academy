export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.18"
  }
  public: {
    Tables: {
      admin_activity_log: {
        Row: {
          action: string
          actor_email: string
          actor_id: string | null
          actor_name: string
          created_at: string
          details: Json
          id: string
          resource_id: string
          resource_type: string
        }
        Insert: {
          action: string
          actor_email?: string
          actor_id?: string | null
          actor_name: string
          created_at?: string
          details?: Json
          id?: string
          resource_id: string
          resource_type: string
        }
        Update: {
          action?: string
          actor_email?: string
          actor_id?: string | null
          actor_name?: string
          created_at?: string
          details?: Json
          id?: string
          resource_id?: string
          resource_type?: string
        }
        Relationships: []
      }
      ai_feature_state: {
        Row: {
          blocked: boolean
          feature: string
          reason: string
        }
        Insert: {
          blocked?: boolean
          feature: string
          reason?: string
        }
        Update: {
          blocked?: boolean
          feature?: string
          reason?: string
        }
        Relationships: []
      }
      booking_events: {
        Row: {
          actor_id: string
          booking_id: string
          created_at: string
          id: string
          previous_status: string
          status: string
        }
        Insert: {
          actor_id: string
          booking_id: string
          created_at?: string
          id?: string
          previous_status: string
          status: string
        }
        Update: {
          actor_id?: string
          booking_id?: string
          created_at?: string
          id?: string
          previous_status?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "booking_events_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
        ]
      }
      bookings: {
        Row: {
          attraction_slug: string
          children: number
          created_at: string
          currency: string | null
          email: string
          experience: string
          full_name: string
          id: string
          nationality: string
          phone: string
          preferred_time: string
          price_id: string | null
          price_source: string | null
          price_verified_on: string | null
          reference: string
          special_requests: string
          status: string
          total_price: number | null
          user_id: string
          visiting_date: string
          visitor_category: string
          visitors: number
        }
        Insert: {
          attraction_slug: string
          children?: number
          created_at?: string
          currency?: string | null
          email: string
          experience?: string
          full_name: string
          id?: string
          nationality: string
          phone: string
          preferred_time: string
          price_id?: string | null
          price_source?: string | null
          price_verified_on?: string | null
          reference?: string
          special_requests?: string
          status?: string
          total_price?: number | null
          user_id: string
          visiting_date: string
          visitor_category?: string
          visitors: number
        }
        Update: {
          attraction_slug?: string
          children?: number
          created_at?: string
          currency?: string | null
          email?: string
          experience?: string
          full_name?: string
          id?: string
          nationality?: string
          phone?: string
          preferred_time?: string
          price_id?: string | null
          price_source?: string | null
          price_verified_on?: string | null
          reference?: string
          special_requests?: string
          status?: string
          total_price?: number | null
          user_id?: string
          visiting_date?: string
          visitor_category?: string
          visitors?: number
        }
        Relationships: [
          {
            foreignKeyName: "bookings_price_id_fkey"
            columns: ["price_id"]
            isOneToOne: false
            referencedRelation: "destination_prices"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bookings_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      destination_prices: {
        Row: {
          active: boolean
          activity: string
          adult_price: number
          attraction_slug: string
          child_age_max: number | null
          child_price: number | null
          currency: string
          id: string
          notes: string
          source_url: string
          verified_on: string
          visitor_category: string
        }
        Insert: {
          active?: boolean
          activity: string
          adult_price: number
          attraction_slug: string
          child_age_max?: number | null
          child_price?: number | null
          currency: string
          id?: string
          notes?: string
          source_url: string
          verified_on: string
          visitor_category: string
        }
        Update: {
          active?: boolean
          activity?: string
          adult_price?: number
          attraction_slug?: string
          child_age_max?: number | null
          child_price?: number | null
          currency?: string
          id?: string
          notes?: string
          source_url?: string
          verified_on?: string
          visitor_category?: string
        }
        Relationships: []
      }
      itineraries: {
        Row: {
          created_at: string
          id: string
          plan: Json
          preferences: Json
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          plan: Json
          preferences: Json
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          plan?: Json
          preferences?: Json
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "itineraries_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          display_name: string
          id: string
          phone: string
        }
        Insert: {
          created_at?: string
          display_name?: string
          id: string
          phone?: string
        }
        Update: {
          created_at?: string
          display_name?: string
          id?: string
          phone?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      admin_booking_status: {
        Args: { _booking_id: string; _status: string }
        Returns: string
      }
      cancel_pending_booking: { Args: { _booking_id: string }; Returns: string }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "user"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "user"],
    },
  },
} as const
