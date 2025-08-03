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
      alerts: {
        Row: {
          alert_type: string
          content: string
          created_at: string
          created_by: string | null
          expires_at: string | null
          id: string
          is_active: boolean
          metadata: Json | null
          priority: number
          target_audience: Json | null
          title: string
          updated_at: string
        }
        Insert: {
          alert_type: string
          content: string
          created_at?: string
          created_by?: string | null
          expires_at?: string | null
          id?: string
          is_active?: boolean
          metadata?: Json | null
          priority?: number
          target_audience?: Json | null
          title: string
          updated_at?: string
        }
        Update: {
          alert_type?: string
          content?: string
          created_at?: string
          created_by?: string | null
          expires_at?: string | null
          id?: string
          is_active?: boolean
          metadata?: Json | null
          priority?: number
          target_audience?: Json | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      client_trainer_engagement: {
        Row: {
          became_client_at: string | null
          client_id: string
          created_at: string
          discovery_completed_at: string | null
          id: string
          liked_at: string | null
          matched_at: string | null
          notes: string | null
          stage: Database["public"]["Enums"]["engagement_stage"]
          trainer_id: string
          updated_at: string
        }
        Insert: {
          became_client_at?: string | null
          client_id: string
          created_at?: string
          discovery_completed_at?: string | null
          id?: string
          liked_at?: string | null
          matched_at?: string | null
          notes?: string | null
          stage?: Database["public"]["Enums"]["engagement_stage"]
          trainer_id: string
          updated_at?: string
        }
        Update: {
          became_client_at?: string | null
          client_id?: string
          created_at?: string
          discovery_completed_at?: string | null
          id?: string
          liked_at?: string | null
          matched_at?: string | null
          notes?: string | null
          stage?: Database["public"]["Enums"]["engagement_stage"]
          trainer_id?: string
          updated_at?: string
        }
        Relationships: []
      }
      package_ways_of_working: {
        Row: {
          client_expectations_items: Json | null
          created_at: string
          first_week_items: Json | null
          id: string
          onboarding_items: Json | null
          ongoing_structure_items: Json | null
          package_id: string
          package_name: string
          tracking_tools_items: Json | null
          trainer_id: string
          updated_at: string
          visibility: string | null
          what_i_bring_items: Json | null
        }
        Insert: {
          client_expectations_items?: Json | null
          created_at?: string
          first_week_items?: Json | null
          id?: string
          onboarding_items?: Json | null
          ongoing_structure_items?: Json | null
          package_id: string
          package_name: string
          tracking_tools_items?: Json | null
          trainer_id: string
          updated_at?: string
          visibility?: string | null
          what_i_bring_items?: Json | null
        }
        Update: {
          client_expectations_items?: Json | null
          created_at?: string
          first_week_items?: Json | null
          id?: string
          onboarding_items?: Json | null
          ongoing_structure_items?: Json | null
          package_id?: string
          package_name?: string
          tracking_tools_items?: Json | null
          trainer_id?: string
          updated_at?: string
          visibility?: string | null
          what_i_bring_items?: Json | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          admin_verification_notes: string | null
          availability_schedule: Json | null
          availability_slots: Json | null
          before_after_photos: Json | null
          billing_address: Json | null
          bio: string | null
          budget_flexibility: string | null
          budget_range_max: number | null
          budget_range_min: number | null
          calendar_link: string | null
          card_expiry_month: number | null
          card_expiry_year: number | null
          card_last_four: string | null
          card_type: string | null
          certifying_body: string | null
          client_journey_stage: string | null
          client_personality_type: string[] | null
          client_status:
            | Database["public"]["Enums"]["client_status_enum"]
            | null
          client_survey_completed: boolean | null
          client_survey_completed_at: string | null
          client_survey_step: number | null
          coaching_styles: string[] | null
          communication_style: string | null
          created_at: string
          delivery_format: string | null
          discovery_call_price: number | null
          experience_level: string | null
          first_name: string | null
          fitness_goals: string[] | null
          flexible_scheduling: boolean | null
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
          languages: string[] | null
          last_name: string | null
          last_verification_request: string | null
          location: string | null
          max_clients: number | null
          messaging_support: boolean | null
          motivation_factors: string[] | null
          next_available_date: string | null
          onboarding_step: number | null
          open_to_virtual_coaching: boolean | null
          package_inclusions: Json | null
          package_options: Json | null
          phone: string | null
          preferred_coaching_style: string[] | null
          preferred_package_type: string | null
          preferred_time_slots: string[] | null
          preferred_training_frequency: number | null
          pricing_unlock_required: boolean | null
          primary_goals: string[] | null
          profile_blocks: Json | null
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
          secondary_goals: string[] | null
          special_credentials: string[] | null
          specializations: string[] | null
          start_timeline: string | null
          tagline: string | null
          terms_agreed: boolean | null
          testimonials: Json | null
          total_client_survey_steps: number | null
          total_onboarding_steps: number | null
          total_profile_setup_steps: number | null
          total_ratings: number | null
          training_location_preference: string | null
          training_types: string[] | null
          training_vibe: string | null
          updated_at: string
          uploaded_certificates: Json | null
          user_type: Database["public"]["Enums"]["user_type"]
          verification_status:
            | Database["public"]["Enums"]["verification_status_enum"]
            | null
          video_checkins: boolean | null
          waitlist_preference: string | null
          ways_of_working_client_expectations: Json | null
          ways_of_working_completed: boolean | null
          ways_of_working_first_week: Json | null
          ways_of_working_onboarding: Json | null
          ways_of_working_ongoing_structure: Json | null
          ways_of_working_tracking_tools: Json | null
          ways_of_working_visibility: string | null
          ways_of_working_what_i_bring: Json | null
          weekly_programming_only: boolean | null
          works_bank_holidays: boolean | null
          year_certified: number | null
        }
        Insert: {
          admin_verification_notes?: string | null
          availability_schedule?: Json | null
          availability_slots?: Json | null
          before_after_photos?: Json | null
          billing_address?: Json | null
          bio?: string | null
          budget_flexibility?: string | null
          budget_range_max?: number | null
          budget_range_min?: number | null
          calendar_link?: string | null
          card_expiry_month?: number | null
          card_expiry_year?: number | null
          card_last_four?: string | null
          card_type?: string | null
          certifying_body?: string | null
          client_journey_stage?: string | null
          client_personality_type?: string[] | null
          client_status?:
            | Database["public"]["Enums"]["client_status_enum"]
            | null
          client_survey_completed?: boolean | null
          client_survey_completed_at?: string | null
          client_survey_step?: number | null
          coaching_styles?: string[] | null
          communication_style?: string | null
          created_at?: string
          delivery_format?: string | null
          discovery_call_price?: number | null
          experience_level?: string | null
          first_name?: string | null
          fitness_goals?: string[] | null
          flexible_scheduling?: boolean | null
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
          languages?: string[] | null
          last_name?: string | null
          last_verification_request?: string | null
          location?: string | null
          max_clients?: number | null
          messaging_support?: boolean | null
          motivation_factors?: string[] | null
          next_available_date?: string | null
          onboarding_step?: number | null
          open_to_virtual_coaching?: boolean | null
          package_inclusions?: Json | null
          package_options?: Json | null
          phone?: string | null
          preferred_coaching_style?: string[] | null
          preferred_package_type?: string | null
          preferred_time_slots?: string[] | null
          preferred_training_frequency?: number | null
          pricing_unlock_required?: boolean | null
          primary_goals?: string[] | null
          profile_blocks?: Json | null
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
          secondary_goals?: string[] | null
          special_credentials?: string[] | null
          specializations?: string[] | null
          start_timeline?: string | null
          tagline?: string | null
          terms_agreed?: boolean | null
          testimonials?: Json | null
          total_client_survey_steps?: number | null
          total_onboarding_steps?: number | null
          total_profile_setup_steps?: number | null
          total_ratings?: number | null
          training_location_preference?: string | null
          training_types?: string[] | null
          training_vibe?: string | null
          updated_at?: string
          uploaded_certificates?: Json | null
          user_type: Database["public"]["Enums"]["user_type"]
          verification_status?:
            | Database["public"]["Enums"]["verification_status_enum"]
            | null
          video_checkins?: boolean | null
          waitlist_preference?: string | null
          ways_of_working_client_expectations?: Json | null
          ways_of_working_completed?: boolean | null
          ways_of_working_first_week?: Json | null
          ways_of_working_onboarding?: Json | null
          ways_of_working_ongoing_structure?: Json | null
          ways_of_working_tracking_tools?: Json | null
          ways_of_working_visibility?: string | null
          ways_of_working_what_i_bring?: Json | null
          weekly_programming_only?: boolean | null
          works_bank_holidays?: boolean | null
          year_certified?: number | null
        }
        Update: {
          admin_verification_notes?: string | null
          availability_schedule?: Json | null
          availability_slots?: Json | null
          before_after_photos?: Json | null
          billing_address?: Json | null
          bio?: string | null
          budget_flexibility?: string | null
          budget_range_max?: number | null
          budget_range_min?: number | null
          calendar_link?: string | null
          card_expiry_month?: number | null
          card_expiry_year?: number | null
          card_last_four?: string | null
          card_type?: string | null
          certifying_body?: string | null
          client_journey_stage?: string | null
          client_personality_type?: string[] | null
          client_status?:
            | Database["public"]["Enums"]["client_status_enum"]
            | null
          client_survey_completed?: boolean | null
          client_survey_completed_at?: string | null
          client_survey_step?: number | null
          coaching_styles?: string[] | null
          communication_style?: string | null
          created_at?: string
          delivery_format?: string | null
          discovery_call_price?: number | null
          experience_level?: string | null
          first_name?: string | null
          fitness_goals?: string[] | null
          flexible_scheduling?: boolean | null
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
          languages?: string[] | null
          last_name?: string | null
          last_verification_request?: string | null
          location?: string | null
          max_clients?: number | null
          messaging_support?: boolean | null
          motivation_factors?: string[] | null
          next_available_date?: string | null
          onboarding_step?: number | null
          open_to_virtual_coaching?: boolean | null
          package_inclusions?: Json | null
          package_options?: Json | null
          phone?: string | null
          preferred_coaching_style?: string[] | null
          preferred_package_type?: string | null
          preferred_time_slots?: string[] | null
          preferred_training_frequency?: number | null
          pricing_unlock_required?: boolean | null
          primary_goals?: string[] | null
          profile_blocks?: Json | null
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
          secondary_goals?: string[] | null
          special_credentials?: string[] | null
          specializations?: string[] | null
          start_timeline?: string | null
          tagline?: string | null
          terms_agreed?: boolean | null
          testimonials?: Json | null
          total_client_survey_steps?: number | null
          total_onboarding_steps?: number | null
          total_profile_setup_steps?: number | null
          total_ratings?: number | null
          training_location_preference?: string | null
          training_types?: string[] | null
          training_vibe?: string | null
          updated_at?: string
          uploaded_certificates?: Json | null
          user_type?: Database["public"]["Enums"]["user_type"]
          verification_status?:
            | Database["public"]["Enums"]["verification_status_enum"]
            | null
          video_checkins?: boolean | null
          waitlist_preference?: string | null
          ways_of_working_client_expectations?: Json | null
          ways_of_working_completed?: boolean | null
          ways_of_working_first_week?: Json | null
          ways_of_working_onboarding?: Json | null
          ways_of_working_ongoing_structure?: Json | null
          ways_of_working_tracking_tools?: Json | null
          ways_of_working_visibility?: string | null
          ways_of_working_what_i_bring?: Json | null
          weekly_programming_only?: boolean | null
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
      user_alert_interactions: {
        Row: {
          alert_id: string
          created_at: string
          id: string
          interaction_type: string
          user_id: string
        }
        Insert: {
          alert_id: string
          created_at?: string
          id?: string
          interaction_type: string
          user_id: string
        }
        Update: {
          alert_id?: string
          created_at?: string
          id?: string
          interaction_type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_alert_interactions_alert_id_fkey"
            columns: ["alert_id"]
            isOneToOne: false
            referencedRelation: "alerts"
            referencedColumns: ["id"]
          },
        ]
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
      get_engagement_stage: {
        Args: { client_uuid: string; trainer_uuid: string }
        Returns: Database["public"]["Enums"]["engagement_stage"]
      }
      request_profile_verification: {
        Args: { trainer_id: string }
        Returns: boolean
      }
      update_engagement_stage: {
        Args: {
          client_uuid: string
          trainer_uuid: string
          new_stage: Database["public"]["Enums"]["engagement_stage"]
        }
        Returns: undefined
      }
    }
    Enums: {
      client_status_enum: "open" | "waitlist" | "paused"
      engagement_stage:
        | "browsing"
        | "liked"
        | "matched"
        | "discovery_completed"
        | "active_client"
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
      engagement_stage: [
        "browsing",
        "liked",
        "matched",
        "discovery_completed",
        "active_client",
      ],
      user_type: ["client", "trainer", "admin"],
      verification_status_enum: ["pending", "verified", "rejected"],
    },
  },
} as const
