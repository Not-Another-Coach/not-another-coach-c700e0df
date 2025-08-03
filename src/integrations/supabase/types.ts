export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instanciate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.12 (cd3cf9e)"
  }
  public: {
    Tables: {
      profiles: {
        Row: {
          admin_verification_notes: string | null
          availability_schedule: Json | null
          availability_slots: Json | null
          before_after_photos: Json | null
          bio: string | null
          calendar_link: string | null
          certifying_body: string | null
          client_status:
            | Database["public"]["Enums"]["client_status_enum"]
            | null
          coaching_styles: string[] | null
          created_at: string
          first_name: string | null
          fitness_goals: string[] | null
          free_discovery_call: boolean | null
          hourly_rate: number | null
          id: string
          ideal_client_age_range: string | null
          ideal_client_fitness_level: string | null
          ideal_client_personality: string | null
          ideal_client_types: string[] | null
          internal_tags: string[] | null
          is_uk_based: boolean | null
          is_verified: boolean | null
          journey_progress: Json | null
          journey_stage: string | null
          last_name: string | null
          last_verification_request: string | null
          location: string | null
          max_clients: number | null
          onboarding_step: number | null
          package_inclusions: Json | null
          package_options: Json | null
          profile_photo_url: string | null
          profile_published: boolean | null
          profile_setup_completed: boolean | null
          profile_setup_step: number | null
          proof_upload_urls: string[] | null
          qualifications: string[] | null
          quiz_answers: Json | null
          quiz_completed: boolean | null
          quiz_completed_at: string | null
          rating: number | null
          special_credentials: string[] | null
          specializations: string[] | null
          tagline: string | null
          terms_agreed: boolean | null
          testimonials: Json | null
          total_onboarding_steps: number | null
          total_profile_setup_steps: number | null
          total_ratings: number | null
          training_types: string[] | null
          training_vibe: string | null
          updated_at: string
          uploaded_certificates: Json | null
          user_type: Database["public"]["Enums"]["user_type"]
          verification_status:
            | Database["public"]["Enums"]["verification_status_enum"]
            | null
          works_bank_holidays: boolean | null
          year_certified: number | null
        }
        Insert: {
          admin_verification_notes?: string | null
          availability_schedule?: Json | null
          availability_slots?: Json | null
          before_after_photos?: Json | null
          bio?: string | null
          calendar_link?: string | null
          certifying_body?: string | null
          client_status?:
            | Database["public"]["Enums"]["client_status_enum"]
            | null
          coaching_styles?: string[] | null
          created_at?: string
          first_name?: string | null
          fitness_goals?: string[] | null
          free_discovery_call?: boolean | null
          hourly_rate?: number | null
          id: string
          ideal_client_age_range?: string | null
          ideal_client_fitness_level?: string | null
          ideal_client_personality?: string | null
          ideal_client_types?: string[] | null
          internal_tags?: string[] | null
          is_uk_based?: boolean | null
          is_verified?: boolean | null
          journey_progress?: Json | null
          journey_stage?: string | null
          last_name?: string | null
          last_verification_request?: string | null
          location?: string | null
          max_clients?: number | null
          onboarding_step?: number | null
          package_inclusions?: Json | null
          package_options?: Json | null
          profile_photo_url?: string | null
          profile_published?: boolean | null
          profile_setup_completed?: boolean | null
          profile_setup_step?: number | null
          proof_upload_urls?: string[] | null
          qualifications?: string[] | null
          quiz_answers?: Json | null
          quiz_completed?: boolean | null
          quiz_completed_at?: string | null
          rating?: number | null
          special_credentials?: string[] | null
          specializations?: string[] | null
          tagline?: string | null
          terms_agreed?: boolean | null
          testimonials?: Json | null
          total_onboarding_steps?: number | null
          total_profile_setup_steps?: number | null
          total_ratings?: number | null
          training_types?: string[] | null
          training_vibe?: string | null
          updated_at?: string
          uploaded_certificates?: Json | null
          user_type: Database["public"]["Enums"]["user_type"]
          verification_status?:
            | Database["public"]["Enums"]["verification_status_enum"]
            | null
          works_bank_holidays?: boolean | null
          year_certified?: number | null
        }
        Update: {
          admin_verification_notes?: string | null
          availability_schedule?: Json | null
          availability_slots?: Json | null
          before_after_photos?: Json | null
          bio?: string | null
          calendar_link?: string | null
          certifying_body?: string | null
          client_status?:
            | Database["public"]["Enums"]["client_status_enum"]
            | null
          coaching_styles?: string[] | null
          created_at?: string
          first_name?: string | null
          fitness_goals?: string[] | null
          free_discovery_call?: boolean | null
          hourly_rate?: number | null
          id?: string
          ideal_client_age_range?: string | null
          ideal_client_fitness_level?: string | null
          ideal_client_personality?: string | null
          ideal_client_types?: string[] | null
          internal_tags?: string[] | null
          is_uk_based?: boolean | null
          is_verified?: boolean | null
          journey_progress?: Json | null
          journey_stage?: string | null
          last_name?: string | null
          last_verification_request?: string | null
          location?: string | null
          max_clients?: number | null
          onboarding_step?: number | null
          package_inclusions?: Json | null
          package_options?: Json | null
          profile_photo_url?: string | null
          profile_published?: boolean | null
          profile_setup_completed?: boolean | null
          profile_setup_step?: number | null
          proof_upload_urls?: string[] | null
          qualifications?: string[] | null
          quiz_answers?: Json | null
          quiz_completed?: boolean | null
          quiz_completed_at?: string | null
          rating?: number | null
          special_credentials?: string[] | null
          specializations?: string[] | null
          tagline?: string | null
          terms_agreed?: boolean | null
          testimonials?: Json | null
          total_onboarding_steps?: number | null
          total_profile_setup_steps?: number | null
          total_ratings?: number | null
          training_types?: string[] | null
          training_vibe?: string | null
          updated_at?: string
          uploaded_certificates?: Json | null
          user_type?: Database["public"]["Enums"]["user_type"]
          verification_status?:
            | Database["public"]["Enums"]["verification_status_enum"]
            | null
          works_bank_holidays?: boolean | null
          year_certified?: number | null
        }
        Relationships: []
      }
      saved_trainers: {
        Row: {
          id: string
          notes: string | null
          saved_at: string
          trainer_id: string
          user_id: string
        }
        Insert: {
          id?: string
          notes?: string | null
          saved_at?: string
          trainer_id: string
          user_id: string
        }
        Update: {
          id?: string
          notes?: string | null
          saved_at?: string
          trainer_id?: string
          user_id?: string
        }
        Relationships: []
      }
      user_journey_tracking: {
        Row: {
          completed_at: string
          id: string
          metadata: Json | null
          stage: string
          step_name: string
          user_id: string
        }
        Insert: {
          completed_at?: string
          id?: string
          metadata?: Json | null
          stage: string
          step_name: string
          user_id: string
        }
        Update: {
          completed_at?: string
          id?: string
          metadata?: Json | null
          stage?: string
          step_name?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_current_user_type: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      request_profile_verification: {
        Args: { trainer_id: string }
        Returns: boolean
      }
    }
    Enums: {
      client_status_enum: "open" | "waitlist" | "paused"
      user_type: "client" | "trainer" | "admin"
      verification_status_enum: "pending" | "verified" | "rejected"
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
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
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
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
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
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
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
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
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
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
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
      client_status_enum: ["open", "waitlist", "paused"],
      user_type: ["client", "trainer", "admin"],
      verification_status_enum: ["pending", "verified", "rejected"],
    },
  },
} as const
