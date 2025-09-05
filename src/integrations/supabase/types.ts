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
    PostgrestVersion: "12.2.12 (cd3cf9e)"
  }
  public: {
    Tables: {
      activity_appointments: {
        Row: {
          activity_id: string | null
          calendar_event_id: string | null
          client_id: string
          client_notes: string | null
          created_at: string | null
          duration_minutes: number | null
          id: string
          meeting_link: string | null
          scheduled_at: string
          status: string | null
          trainer_id: string
          trainer_notes: string | null
          updated_at: string | null
        }
        Insert: {
          activity_id?: string | null
          calendar_event_id?: string | null
          client_id: string
          client_notes?: string | null
          created_at?: string | null
          duration_minutes?: number | null
          id?: string
          meeting_link?: string | null
          scheduled_at: string
          status?: string | null
          trainer_id: string
          trainer_notes?: string | null
          updated_at?: string | null
        }
        Update: {
          activity_id?: string | null
          calendar_event_id?: string | null
          client_id?: string
          client_notes?: string | null
          created_at?: string | null
          duration_minutes?: number | null
          id?: string
          meeting_link?: string | null
          scheduled_at?: string
          status?: string | null
          trainer_id?: string
          trainer_notes?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "activity_appointments_activity_id_fkey"
            columns: ["activity_id"]
            isOneToOne: false
            referencedRelation: "trainer_onboarding_activities"
            referencedColumns: ["id"]
          },
        ]
      }
      activity_completions: {
        Row: {
          activity_id: string | null
          activity_type: string
          client_id: string
          completed_at: string | null
          completion_data: Json | null
          created_at: string | null
          due_at: string | null
          id: string
          sla_due_at: string | null
          status: string | null
          template_assignment_id: string | null
          trainer_id: string
          updated_at: string | null
        }
        Insert: {
          activity_id?: string | null
          activity_type: string
          client_id: string
          completed_at?: string | null
          completion_data?: Json | null
          created_at?: string | null
          due_at?: string | null
          id?: string
          sla_due_at?: string | null
          status?: string | null
          template_assignment_id?: string | null
          trainer_id: string
          updated_at?: string | null
        }
        Update: {
          activity_id?: string | null
          activity_type?: string
          client_id?: string
          completed_at?: string | null
          completion_data?: Json | null
          created_at?: string | null
          due_at?: string | null
          id?: string
          sla_due_at?: string | null
          status?: string | null
          template_assignment_id?: string | null
          trainer_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "activity_completions_activity_id_fkey"
            columns: ["activity_id"]
            isOneToOne: false
            referencedRelation: "trainer_onboarding_activities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "activity_completions_template_assignment_id_fkey"
            columns: ["template_assignment_id"]
            isOneToOne: false
            referencedRelation: "client_template_assignments"
            referencedColumns: ["id"]
          },
        ]
      }
      admin_actions_log: {
        Row: {
          action_details: Json | null
          action_type: string
          admin_id: string
          created_at: string
          id: string
          reason: string | null
          target_user_id: string
        }
        Insert: {
          action_details?: Json | null
          action_type: string
          admin_id: string
          created_at?: string
          id?: string
          reason?: string | null
          target_user_id: string
        }
        Update: {
          action_details?: Json | null
          action_type?: string
          admin_id?: string
          created_at?: string
          id?: string
          reason?: string | null
          target_user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "admin_actions_log_admin_id_fkey"
            columns: ["admin_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "admin_actions_log_admin_id_fkey"
            columns: ["admin_id"]
            isOneToOne: false
            referencedRelation: "v_clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "admin_actions_log_admin_id_fkey"
            columns: ["admin_id"]
            isOneToOne: false
            referencedRelation: "v_trainers"
            referencedColumns: ["id"]
          },
        ]
      }
      alerts: {
        Row: {
          alert_type: string
          content: string
          correlation_id: string | null
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
          correlation_id?: string | null
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
          correlation_id?: string | null
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
      billing_invoice: {
        Row: {
          amount_cents: number
          created_at: string
          currency: string
          description: string | null
          download_url: string | null
          id: string
          invoice_type: string
          period_end: string | null
          period_start: string | null
          status: string
          trainer_id: string
          updated_at: string
        }
        Insert: {
          amount_cents: number
          created_at?: string
          currency?: string
          description?: string | null
          download_url?: string | null
          id?: string
          invoice_type?: string
          period_end?: string | null
          period_start?: string | null
          status?: string
          trainer_id: string
          updated_at?: string
        }
        Update: {
          amount_cents?: number
          created_at?: string
          currency?: string
          description?: string | null
          download_url?: string | null
          id?: string
          invoice_type?: string
          period_end?: string | null
          period_start?: string | null
          status?: string
          trainer_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "billing_invoice_trainer_id_fkey"
            columns: ["trainer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "billing_invoice_trainer_id_fkey"
            columns: ["trainer_id"]
            isOneToOne: false
            referencedRelation: "v_clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "billing_invoice_trainer_id_fkey"
            columns: ["trainer_id"]
            isOneToOne: false
            referencedRelation: "v_trainers"
            referencedColumns: ["id"]
          },
        ]
      }
      billing_payment_method: {
        Row: {
          brand: string | null
          created_at: string
          exp_month: number | null
          exp_year: number | null
          id: string
          is_active: boolean
          is_default: boolean
          last4: string | null
          method_type: string
          trainer_id: string
          updated_at: string
        }
        Insert: {
          brand?: string | null
          created_at?: string
          exp_month?: number | null
          exp_year?: number | null
          id?: string
          is_active?: boolean
          is_default?: boolean
          last4?: string | null
          method_type?: string
          trainer_id: string
          updated_at?: string
        }
        Update: {
          brand?: string | null
          created_at?: string
          exp_month?: number | null
          exp_year?: number | null
          id?: string
          is_active?: boolean
          is_default?: boolean
          last4?: string | null
          method_type?: string
          trainer_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "billing_payment_method_trainer_id_fkey"
            columns: ["trainer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "billing_payment_method_trainer_id_fkey"
            columns: ["trainer_id"]
            isOneToOne: false
            referencedRelation: "v_clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "billing_payment_method_trainer_id_fkey"
            columns: ["trainer_id"]
            isOneToOne: false
            referencedRelation: "v_trainers"
            referencedColumns: ["id"]
          },
        ]
      }
      client_commitment_acknowledgments: {
        Row: {
          acknowledged_at: string | null
          client_id: string
          commitment_id: string
          created_at: string
          id: string
          ip_address: unknown | null
          notes: string | null
          signature_data: string | null
          trainer_id: string
          user_agent: string | null
        }
        Insert: {
          acknowledged_at?: string | null
          client_id: string
          commitment_id: string
          created_at?: string
          id?: string
          ip_address?: unknown | null
          notes?: string | null
          signature_data?: string | null
          trainer_id: string
          user_agent?: string | null
        }
        Update: {
          acknowledged_at?: string | null
          client_id?: string
          commitment_id?: string
          created_at?: string
          id?: string
          ip_address?: unknown | null
          notes?: string | null
          signature_data?: string | null
          trainer_id?: string
          user_agent?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "client_commitment_acknowledgments_commitment_id_fkey"
            columns: ["commitment_id"]
            isOneToOne: false
            referencedRelation: "onboarding_commitments"
            referencedColumns: ["id"]
          },
        ]
      }
      client_getting_started_progress: {
        Row: {
          attachments: Json | null
          client_id: string
          client_notes: string | null
          completed_at: string | null
          created_at: string
          due_at: string | null
          getting_started_id: string
          id: string
          sla_due_at: string | null
          status: string
          trainer_id: string
          trainer_notes: string | null
          updated_at: string
        }
        Insert: {
          attachments?: Json | null
          client_id: string
          client_notes?: string | null
          completed_at?: string | null
          created_at?: string
          due_at?: string | null
          getting_started_id: string
          id?: string
          sla_due_at?: string | null
          status?: string
          trainer_id: string
          trainer_notes?: string | null
          updated_at?: string
        }
        Update: {
          attachments?: Json | null
          client_id?: string
          client_notes?: string | null
          completed_at?: string | null
          created_at?: string
          due_at?: string | null
          getting_started_id?: string
          id?: string
          sla_due_at?: string | null
          status?: string
          trainer_id?: string
          trainer_notes?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "client_getting_started_progress_getting_started_id_fkey"
            columns: ["getting_started_id"]
            isOneToOne: false
            referencedRelation: "onboarding_getting_started"
            referencedColumns: ["id"]
          },
        ]
      }
      client_onboarding_progress: {
        Row: {
          activity_id: string | null
          allowed_attachments: Json | null
          assignment_id: string | null
          attachments: Json | null
          client_id: string
          completed_at: string | null
          completed_by: string | null
          completion_method: string
          completion_notes: string | null
          correlation_id: string | null
          created_at: string
          description: string | null
          display_order: number
          due_at: string | null
          due_in_days: number | null
          id: string
          instructions: string | null
          overdue_alert_sent_at: string | null
          requires_file_upload: boolean
          sla_alert_sent_at: string | null
          sla_days: number | null
          sla_due_at: string | null
          status: string
          step_name: string
          step_type: string
          template_step_id: string | null
          trainer_id: string
          trainer_notes: string | null
          updated_at: string
          uploaded_file_url: string | null
          visibility:
            | Database["public"]["Enums"]["onboarding_visibility"]
            | null
        }
        Insert: {
          activity_id?: string | null
          allowed_attachments?: Json | null
          assignment_id?: string | null
          attachments?: Json | null
          client_id: string
          completed_at?: string | null
          completed_by?: string | null
          completion_method?: string
          completion_notes?: string | null
          correlation_id?: string | null
          created_at?: string
          description?: string | null
          display_order?: number
          due_at?: string | null
          due_in_days?: number | null
          id?: string
          instructions?: string | null
          overdue_alert_sent_at?: string | null
          requires_file_upload?: boolean
          sla_alert_sent_at?: string | null
          sla_days?: number | null
          sla_due_at?: string | null
          status?: string
          step_name: string
          step_type?: string
          template_step_id?: string | null
          trainer_id: string
          trainer_notes?: string | null
          updated_at?: string
          uploaded_file_url?: string | null
          visibility?:
            | Database["public"]["Enums"]["onboarding_visibility"]
            | null
        }
        Update: {
          activity_id?: string | null
          allowed_attachments?: Json | null
          assignment_id?: string | null
          attachments?: Json | null
          client_id?: string
          completed_at?: string | null
          completed_by?: string | null
          completion_method?: string
          completion_notes?: string | null
          correlation_id?: string | null
          created_at?: string
          description?: string | null
          display_order?: number
          due_at?: string | null
          due_in_days?: number | null
          id?: string
          instructions?: string | null
          overdue_alert_sent_at?: string | null
          requires_file_upload?: boolean
          sla_alert_sent_at?: string | null
          sla_days?: number | null
          sla_due_at?: string | null
          status?: string
          step_name?: string
          step_type?: string
          template_step_id?: string | null
          trainer_id?: string
          trainer_notes?: string | null
          updated_at?: string
          uploaded_file_url?: string | null
          visibility?:
            | Database["public"]["Enums"]["onboarding_visibility"]
            | null
        }
        Relationships: [
          {
            foreignKeyName: "client_onboarding_progress_activity_id_fkey"
            columns: ["activity_id"]
            isOneToOne: false
            referencedRelation: "trainer_onboarding_activities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "client_onboarding_progress_assignment_id_fkey"
            columns: ["assignment_id"]
            isOneToOne: false
            referencedRelation: "client_template_assignments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "client_onboarding_progress_template_step_id_fkey"
            columns: ["template_step_id"]
            isOneToOne: false
            referencedRelation: "trainer_onboarding_templates"
            referencedColumns: ["id"]
          },
        ]
      }
      client_ongoing_support_agreements: {
        Row: {
          agreed_check_in_day: string | null
          agreed_check_in_frequency: string | null
          agreed_check_in_time: string | null
          agreed_communication_channel: string | null
          client_agreed_at: string | null
          client_id: string
          created_at: string
          custom_notes: string | null
          id: string
          is_active: boolean
          ongoing_support_id: string
          trainer_agreed_at: string | null
          trainer_id: string
          updated_at: string
        }
        Insert: {
          agreed_check_in_day?: string | null
          agreed_check_in_frequency?: string | null
          agreed_check_in_time?: string | null
          agreed_communication_channel?: string | null
          client_agreed_at?: string | null
          client_id: string
          created_at?: string
          custom_notes?: string | null
          id?: string
          is_active?: boolean
          ongoing_support_id: string
          trainer_agreed_at?: string | null
          trainer_id: string
          updated_at?: string
        }
        Update: {
          agreed_check_in_day?: string | null
          agreed_check_in_frequency?: string | null
          agreed_check_in_time?: string | null
          agreed_communication_channel?: string | null
          client_agreed_at?: string | null
          client_id?: string
          created_at?: string
          custom_notes?: string | null
          id?: string
          is_active?: boolean
          ongoing_support_id?: string
          trainer_agreed_at?: string | null
          trainer_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "client_ongoing_support_agreements_ongoing_support_id_fkey"
            columns: ["ongoing_support_id"]
            isOneToOne: false
            referencedRelation: "onboarding_ongoing_support"
            referencedColumns: ["id"]
          },
        ]
      }
      client_profiles: {
        Row: {
          budget_flexibility: string | null
          budget_range_max: number | null
          budget_range_min: number | null
          client_journey_stage: string | null
          client_personality_type: string[] | null
          client_status: string | null
          client_survey_completed: boolean | null
          client_survey_completed_at: string | null
          created_at: string | null
          experience_level: string | null
          fitness_goals: string[] | null
          flexible_scheduling: boolean | null
          id: string
          journey_progress: Json | null
          motivation_factors: string[] | null
          open_to_virtual_coaching: boolean | null
          preferred_coaching_style: string[] | null
          preferred_package_type: string | null
          preferred_time_slots: string[] | null
          preferred_training_frequency: string | null
          primary_goals: string[] | null
          quiz_answers: Json | null
          quiz_completed: boolean | null
          quiz_completed_at: string | null
          secondary_goals: string[] | null
          start_timeline: string | null
          training_location_preference: string | null
          updated_at: string | null
          waitlist_preference: boolean | null
        }
        Insert: {
          budget_flexibility?: string | null
          budget_range_max?: number | null
          budget_range_min?: number | null
          client_journey_stage?: string | null
          client_personality_type?: string[] | null
          client_status?: string | null
          client_survey_completed?: boolean | null
          client_survey_completed_at?: string | null
          created_at?: string | null
          experience_level?: string | null
          fitness_goals?: string[] | null
          flexible_scheduling?: boolean | null
          id: string
          journey_progress?: Json | null
          motivation_factors?: string[] | null
          open_to_virtual_coaching?: boolean | null
          preferred_coaching_style?: string[] | null
          preferred_package_type?: string | null
          preferred_time_slots?: string[] | null
          preferred_training_frequency?: string | null
          primary_goals?: string[] | null
          quiz_answers?: Json | null
          quiz_completed?: boolean | null
          quiz_completed_at?: string | null
          secondary_goals?: string[] | null
          start_timeline?: string | null
          training_location_preference?: string | null
          updated_at?: string | null
          waitlist_preference?: boolean | null
        }
        Update: {
          budget_flexibility?: string | null
          budget_range_max?: number | null
          budget_range_min?: number | null
          client_journey_stage?: string | null
          client_personality_type?: string[] | null
          client_status?: string | null
          client_survey_completed?: boolean | null
          client_survey_completed_at?: string | null
          created_at?: string | null
          experience_level?: string | null
          fitness_goals?: string[] | null
          flexible_scheduling?: boolean | null
          id?: string
          journey_progress?: Json | null
          motivation_factors?: string[] | null
          open_to_virtual_coaching?: boolean | null
          preferred_coaching_style?: string[] | null
          preferred_package_type?: string | null
          preferred_time_slots?: string[] | null
          preferred_training_frequency?: string | null
          primary_goals?: string[] | null
          quiz_answers?: Json | null
          quiz_completed?: boolean | null
          quiz_completed_at?: string | null
          secondary_goals?: string[] | null
          start_timeline?: string | null
          training_location_preference?: string | null
          updated_at?: string | null
          waitlist_preference?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "client_profiles_id_fkey"
            columns: ["id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "client_profiles_id_fkey"
            columns: ["id"]
            isOneToOne: true
            referencedRelation: "v_clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "client_profiles_id_fkey"
            columns: ["id"]
            isOneToOne: true
            referencedRelation: "v_trainers"
            referencedColumns: ["id"]
          },
        ]
      }
      client_template_assignments: {
        Row: {
          assigned_at: string
          assignment_notes: string | null
          client_id: string
          correlation_id: string
          created_at: string
          expired_at: string | null
          expiry_reason: string | null
          id: string
          removal_reason: string | null
          removed_at: string | null
          removed_by: string | null
          status: string
          template_base_id: string | null
          template_name: string
          trainer_id: string
          updated_at: string
        }
        Insert: {
          assigned_at?: string
          assignment_notes?: string | null
          client_id: string
          correlation_id?: string
          created_at?: string
          expired_at?: string | null
          expiry_reason?: string | null
          id?: string
          removal_reason?: string | null
          removed_at?: string | null
          removed_by?: string | null
          status?: string
          template_base_id?: string | null
          template_name: string
          trainer_id: string
          updated_at?: string
        }
        Update: {
          assigned_at?: string
          assignment_notes?: string | null
          client_id?: string
          correlation_id?: string
          created_at?: string
          expired_at?: string | null
          expiry_reason?: string | null
          id?: string
          removal_reason?: string | null
          removed_at?: string | null
          removed_by?: string | null
          status?: string
          template_base_id?: string | null
          template_name?: string
          trainer_id?: string
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
      coach_analytics: {
        Row: {
          conversion_rate: number
          created_at: string
          id: string
          last_activity_at: string | null
          match_tier_stats: Json
          total_likes: number
          total_saves: number
          total_shortlists: number
          total_views: number
          trainer_id: string
          updated_at: string
        }
        Insert: {
          conversion_rate?: number
          created_at?: string
          id?: string
          last_activity_at?: string | null
          match_tier_stats?: Json
          total_likes?: number
          total_saves?: number
          total_shortlists?: number
          total_views?: number
          trainer_id: string
          updated_at?: string
        }
        Update: {
          conversion_rate?: number
          created_at?: string
          id?: string
          last_activity_at?: string | null
          match_tier_stats?: Json
          total_likes?: number
          total_saves?: number
          total_shortlists?: number
          total_views?: number
          trainer_id?: string
          updated_at?: string
        }
        Relationships: []
      }
      coach_availability_settings: {
        Row: {
          allow_discovery_calls_on_waitlist: boolean
          auto_follow_up_days: number
          availability_schedule: Json | null
          availability_status: Database["public"]["Enums"]["coach_availability_status"]
          coach_id: string
          created_at: string
          id: string
          next_available_date: string | null
          updated_at: string
          waitlist_exclusive_active: boolean | null
          waitlist_exclusive_until: string | null
          waitlist_message: string | null
        }
        Insert: {
          allow_discovery_calls_on_waitlist?: boolean
          auto_follow_up_days?: number
          availability_schedule?: Json | null
          availability_status?: Database["public"]["Enums"]["coach_availability_status"]
          coach_id: string
          created_at?: string
          id?: string
          next_available_date?: string | null
          updated_at?: string
          waitlist_exclusive_active?: boolean | null
          waitlist_exclusive_until?: string | null
          waitlist_message?: string | null
        }
        Update: {
          allow_discovery_calls_on_waitlist?: boolean
          auto_follow_up_days?: number
          availability_schedule?: Json | null
          availability_status?: Database["public"]["Enums"]["coach_availability_status"]
          coach_id?: string
          created_at?: string
          id?: string
          next_available_date?: string | null
          updated_at?: string
          waitlist_exclusive_active?: boolean | null
          waitlist_exclusive_until?: string | null
          waitlist_message?: string | null
        }
        Relationships: []
      }
      coach_selection_requests: {
        Row: {
          client_id: string
          client_message: string | null
          correlation_id: string | null
          created_at: string
          id: string
          package_duration: string | null
          package_id: string
          package_name: string
          package_price: number | null
          responded_at: string | null
          status: string
          suggested_alternative_package_id: string | null
          suggested_alternative_package_name: string | null
          suggested_alternative_package_price: number | null
          trainer_id: string
          trainer_response: string | null
          updated_at: string
        }
        Insert: {
          client_id: string
          client_message?: string | null
          correlation_id?: string | null
          created_at?: string
          id?: string
          package_duration?: string | null
          package_id: string
          package_name: string
          package_price?: number | null
          responded_at?: string | null
          status?: string
          suggested_alternative_package_id?: string | null
          suggested_alternative_package_name?: string | null
          suggested_alternative_package_price?: number | null
          trainer_id: string
          trainer_response?: string | null
          updated_at?: string
        }
        Update: {
          client_id?: string
          client_message?: string | null
          correlation_id?: string | null
          created_at?: string
          id?: string
          package_duration?: string | null
          package_id?: string
          package_name?: string
          package_price?: number | null
          responded_at?: string | null
          status?: string
          suggested_alternative_package_id?: string | null
          suggested_alternative_package_name?: string | null
          suggested_alternative_package_price?: number | null
          trainer_id?: string
          trainer_response?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      coach_waitlists: {
        Row: {
          client_goals: string | null
          client_id: string
          coach_id: string
          coach_notes: string | null
          correlation_id: string | null
          created_at: string
          estimated_start_date: string | null
          follow_up_scheduled_date: string | null
          id: string
          joined_at: string
          last_contacted_at: string | null
          status: Database["public"]["Enums"]["waitlist_status"]
          updated_at: string
        }
        Insert: {
          client_goals?: string | null
          client_id: string
          coach_id: string
          coach_notes?: string | null
          correlation_id?: string | null
          created_at?: string
          estimated_start_date?: string | null
          follow_up_scheduled_date?: string | null
          id?: string
          joined_at?: string
          last_contacted_at?: string | null
          status?: Database["public"]["Enums"]["waitlist_status"]
          updated_at?: string
        }
        Update: {
          client_goals?: string | null
          client_id?: string
          coach_id?: string
          coach_notes?: string | null
          correlation_id?: string | null
          created_at?: string
          estimated_start_date?: string | null
          follow_up_scheduled_date?: string | null
          id?: string
          joined_at?: string
          last_contacted_at?: string | null
          status?: Database["public"]["Enums"]["waitlist_status"]
          updated_at?: string
        }
        Relationships: []
      }
      consent_audit_log: {
        Row: {
          consent_method: string
          consent_type: string
          consent_version: string
          created_at: string
          id: string
          ip_address: unknown | null
          legal_basis: string
          metadata: Json | null
          new_value: boolean
          previous_value: boolean | null
          source_url: string | null
          user_agent: string | null
          user_id: string
        }
        Insert: {
          consent_method: string
          consent_type: string
          consent_version?: string
          created_at?: string
          id?: string
          ip_address?: unknown | null
          legal_basis?: string
          metadata?: Json | null
          new_value: boolean
          previous_value?: boolean | null
          source_url?: string | null
          user_agent?: string | null
          user_id: string
        }
        Update: {
          consent_method?: string
          consent_type?: string
          consent_version?: string
          created_at?: string
          id?: string
          ip_address?: unknown | null
          legal_basis?: string
          metadata?: Json | null
          new_value?: boolean
          previous_value?: boolean | null
          source_url?: string | null
          user_agent?: string | null
          user_id?: string
        }
        Relationships: []
      }
      conversations: {
        Row: {
          client_id: string
          client_last_read_at: string | null
          created_at: string
          id: string
          last_message_at: string | null
          trainer_id: string
          trainer_last_read_at: string | null
          updated_at: string
        }
        Insert: {
          client_id: string
          client_last_read_at?: string | null
          created_at?: string
          id?: string
          last_message_at?: string | null
          trainer_id: string
          trainer_last_read_at?: string | null
          updated_at?: string
        }
        Update: {
          client_id?: string
          client_last_read_at?: string | null
          created_at?: string
          id?: string
          last_message_at?: string | null
          trainer_id?: string
          trainer_last_read_at?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      critical_tasks: {
        Row: {
          completed_at: string | null
          created_at: string
          ct_type: Database["public"]["Enums"]["ct_type"]
          current_count: number | null
          cycle_id: string | null
          description: string | null
          due_date: string
          goal_id: string | null
          id: string
          status: Database["public"]["Enums"]["ct_status"]
          target_count: number | null
          title: string
          trainer_id: string
          updated_at: string
          week_start: string
          weight: number | null
        }
        Insert: {
          completed_at?: string | null
          created_at?: string
          ct_type?: Database["public"]["Enums"]["ct_type"]
          current_count?: number | null
          cycle_id?: string | null
          description?: string | null
          due_date: string
          goal_id?: string | null
          id?: string
          status?: Database["public"]["Enums"]["ct_status"]
          target_count?: number | null
          title: string
          trainer_id: string
          updated_at?: string
          week_start: string
          weight?: number | null
        }
        Update: {
          completed_at?: string | null
          created_at?: string
          ct_type?: Database["public"]["Enums"]["ct_type"]
          current_count?: number | null
          cycle_id?: string | null
          description?: string | null
          due_date?: string
          goal_id?: string | null
          id?: string
          status?: Database["public"]["Enums"]["ct_status"]
          target_count?: number | null
          title?: string
          trainer_id?: string
          updated_at?: string
          week_start?: string
          weight?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "critical_tasks_goal_id_fkey"
            columns: ["goal_id"]
            isOneToOne: false
            referencedRelation: "goals"
            referencedColumns: ["id"]
          },
        ]
      }
      ct_client_links: {
        Row: {
          client_id: string
          created_at: string
          ct_id: string
          id: string
        }
        Insert: {
          client_id: string
          created_at?: string
          ct_id: string
          id?: string
        }
        Update: {
          client_id?: string
          created_at?: string
          ct_id?: string
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ct_client_links_ct_id_fkey"
            columns: ["ct_id"]
            isOneToOne: false
            referencedRelation: "critical_tasks"
            referencedColumns: ["id"]
          },
        ]
      }
      custom_qualification_requests: {
        Row: {
          admin_notes: string | null
          category: string
          created_at: string
          description: string | null
          id: string
          qualification_name: string
          reviewed_at: string | null
          reviewed_by: string | null
          similar_existing_qualification_id: string | null
          status: string
          trainer_id: string
          updated_at: string
          usage_count: number | null
        }
        Insert: {
          admin_notes?: string | null
          category?: string
          created_at?: string
          description?: string | null
          id?: string
          qualification_name: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          similar_existing_qualification_id?: string | null
          status?: string
          trainer_id: string
          updated_at?: string
          usage_count?: number | null
        }
        Update: {
          admin_notes?: string | null
          category?: string
          created_at?: string
          description?: string | null
          id?: string
          qualification_name?: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          similar_existing_qualification_id?: string | null
          status?: string
          trainer_id?: string
          updated_at?: string
          usage_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "custom_qualification_requests_similar_existing_qualificati_fkey"
            columns: ["similar_existing_qualification_id"]
            isOneToOne: false
            referencedRelation: "popular_qualifications"
            referencedColumns: ["id"]
          },
        ]
      }
      custom_specialty_requests: {
        Row: {
          admin_notes: string | null
          category_id: string | null
          created_at: string
          description: string | null
          id: string
          justification: string | null
          requested_name: string
          reviewed_at: string | null
          reviewed_by: string | null
          status: string
          trainer_id: string
          updated_at: string
        }
        Insert: {
          admin_notes?: string | null
          category_id?: string | null
          created_at?: string
          description?: string | null
          id?: string
          justification?: string | null
          requested_name: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
          trainer_id: string
          updated_at?: string
        }
        Update: {
          admin_notes?: string | null
          category_id?: string | null
          created_at?: string
          description?: string | null
          id?: string
          justification?: string | null
          requested_name?: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
          trainer_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "custom_specialty_requests_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "specialty_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      customer_payments: {
        Row: {
          amount_currency: string
          amount_value: number
          created_at: string
          id: string
          metadata: Json | null
          package_id: string
          paid_at: string
          payment_method: string
          status: string
          stripe_payment_intent_id: string | null
          updated_at: string
        }
        Insert: {
          amount_currency?: string
          amount_value: number
          created_at?: string
          id?: string
          metadata?: Json | null
          package_id: string
          paid_at: string
          payment_method?: string
          status?: string
          stripe_payment_intent_id?: string | null
          updated_at?: string
        }
        Update: {
          amount_currency?: string
          amount_value?: number
          created_at?: string
          id?: string
          metadata?: Json | null
          package_id?: string
          paid_at?: string
          payment_method?: string
          status?: string
          stripe_payment_intent_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "customer_payments_package_id_fkey"
            columns: ["package_id"]
            isOneToOne: false
            referencedRelation: "payment_packages"
            referencedColumns: ["id"]
          },
        ]
      }
      data_retention_policies: {
        Row: {
          auto_purge_enabled: boolean | null
          created_at: string
          created_by: string | null
          data_category: string
          id: string
          legal_basis: string
          retention_period_months: number
          updated_at: string
        }
        Insert: {
          auto_purge_enabled?: boolean | null
          created_at?: string
          created_by?: string | null
          data_category: string
          id?: string
          legal_basis: string
          retention_period_months: number
          updated_at?: string
        }
        Update: {
          auto_purge_enabled?: boolean | null
          created_at?: string
          created_by?: string | null
          data_category?: string
          id?: string
          legal_basis?: string
          retention_period_months?: number
          updated_at?: string
        }
        Relationships: []
      }
      discovery_call_feedback: {
        Row: {
          asked_right_questions: number | null
          client_id: string
          coach_notes: string | null
          coach_viewed_at: string | null
          comfort_level: string | null
          comparison_notes: string | null
          conversation_helpful: number | null
          created_at: string
          discovery_call_id: string
          id: string
          professionalism: number | null
          share_with_coach: boolean
          submitted_at: string
          trainer_id: string
          updated_at: string
          what_stood_out: string | null
          would_consider_training: string | null
        }
        Insert: {
          asked_right_questions?: number | null
          client_id: string
          coach_notes?: string | null
          coach_viewed_at?: string | null
          comfort_level?: string | null
          comparison_notes?: string | null
          conversation_helpful?: number | null
          created_at?: string
          discovery_call_id: string
          id?: string
          professionalism?: number | null
          share_with_coach?: boolean
          submitted_at?: string
          trainer_id: string
          updated_at?: string
          what_stood_out?: string | null
          would_consider_training?: string | null
        }
        Update: {
          asked_right_questions?: number | null
          client_id?: string
          coach_notes?: string | null
          coach_viewed_at?: string | null
          comfort_level?: string | null
          comparison_notes?: string | null
          conversation_helpful?: number | null
          created_at?: string
          discovery_call_id?: string
          id?: string
          professionalism?: number | null
          share_with_coach?: boolean
          submitted_at?: string
          trainer_id?: string
          updated_at?: string
          what_stood_out?: string | null
          would_consider_training?: string | null
        }
        Relationships: []
      }
      discovery_call_feedback_notifications: {
        Row: {
          client_id: string
          correlation_id: string | null
          created_at: string
          discovery_call_id: string
          id: string
          notification_type: string
          scheduled_for: string
          sent_at: string | null
        }
        Insert: {
          client_id: string
          correlation_id?: string | null
          created_at?: string
          discovery_call_id: string
          id?: string
          notification_type: string
          scheduled_for: string
          sent_at?: string | null
        }
        Update: {
          client_id?: string
          correlation_id?: string | null
          created_at?: string
          discovery_call_id?: string
          id?: string
          notification_type?: string
          scheduled_for?: string
          sent_at?: string | null
        }
        Relationships: []
      }
      discovery_call_feedback_questions: {
        Row: {
          audience: string
          created_at: string
          created_by: string | null
          display_order: number
          help_text: string | null
          id: string
          is_archived: boolean
          is_mandatory: boolean
          options: Json | null
          placeholder_text: string | null
          question_group: string | null
          question_text: string
          question_type: string
          updated_at: string
          visible_to_pt: boolean
        }
        Insert: {
          audience: string
          created_at?: string
          created_by?: string | null
          display_order?: number
          help_text?: string | null
          id?: string
          is_archived?: boolean
          is_mandatory?: boolean
          options?: Json | null
          placeholder_text?: string | null
          question_group?: string | null
          question_text: string
          question_type: string
          updated_at?: string
          visible_to_pt?: boolean
        }
        Update: {
          audience?: string
          created_at?: string
          created_by?: string | null
          display_order?: number
          help_text?: string | null
          id?: string
          is_archived?: boolean
          is_mandatory?: boolean
          options?: Json | null
          placeholder_text?: string | null
          question_group?: string | null
          question_text?: string
          question_type?: string
          updated_at?: string
          visible_to_pt?: boolean
        }
        Relationships: []
      }
      discovery_call_feedback_responses: {
        Row: {
          client_id: string
          created_at: string
          discovery_call_id: string
          id: string
          question_id: string
          response_data: Json | null
          response_value: string | null
          submitted_at: string
          trainer_id: string
        }
        Insert: {
          client_id: string
          created_at?: string
          discovery_call_id: string
          id?: string
          question_id: string
          response_data?: Json | null
          response_value?: string | null
          submitted_at?: string
          trainer_id: string
        }
        Update: {
          client_id?: string
          created_at?: string
          discovery_call_id?: string
          id?: string
          question_id?: string
          response_data?: Json | null
          response_value?: string | null
          submitted_at?: string
          trainer_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "discovery_call_feedback_responses_question_id_fkey"
            columns: ["question_id"]
            isOneToOne: false
            referencedRelation: "discovery_call_feedback_questions"
            referencedColumns: ["id"]
          },
        ]
      }
      discovery_call_notes: {
        Row: {
          client_id: string
          created_at: string
          discovery_call_id: string | null
          id: string
          note_content: string | null
          trainer_id: string
          updated_at: string
        }
        Insert: {
          client_id: string
          created_at?: string
          discovery_call_id?: string | null
          id?: string
          note_content?: string | null
          trainer_id: string
          updated_at?: string
        }
        Update: {
          client_id?: string
          created_at?: string
          discovery_call_id?: string | null
          id?: string
          note_content?: string | null
          trainer_id?: string
          updated_at?: string
        }
        Relationships: []
      }
      discovery_call_notifications: {
        Row: {
          correlation_id: string | null
          created_at: string
          discovery_call_id: string
          email_id: string | null
          error_message: string | null
          id: string
          notification_type: string
          recipient_email: string
          sent_at: string
        }
        Insert: {
          correlation_id?: string | null
          created_at?: string
          discovery_call_id: string
          email_id?: string | null
          error_message?: string | null
          id?: string
          notification_type: string
          recipient_email: string
          sent_at?: string
        }
        Update: {
          correlation_id?: string | null
          created_at?: string
          discovery_call_id?: string
          email_id?: string | null
          error_message?: string | null
          id?: string
          notification_type?: string
          recipient_email?: string
          sent_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "discovery_call_notifications_discovery_call_id_fkey"
            columns: ["discovery_call_id"]
            isOneToOne: false
            referencedRelation: "discovery_calls"
            referencedColumns: ["id"]
          },
        ]
      }
      discovery_call_settings: {
        Row: {
          created_at: string
          discovery_call_availability_schedule: Json | null
          discovery_call_duration: number
          id: string
          offers_discovery_call: boolean
          prep_notes: string | null
          trainer_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          discovery_call_availability_schedule?: Json | null
          discovery_call_duration?: number
          id?: string
          offers_discovery_call?: boolean
          prep_notes?: string | null
          trainer_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          discovery_call_availability_schedule?: Json | null
          discovery_call_duration?: number
          id?: string
          offers_discovery_call?: boolean
          prep_notes?: string | null
          trainer_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "trainer_availability_settings_trainer_id_fkey"
            columns: ["trainer_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "trainer_availability_settings_trainer_id_fkey"
            columns: ["trainer_id"]
            isOneToOne: true
            referencedRelation: "v_clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "trainer_availability_settings_trainer_id_fkey"
            columns: ["trainer_id"]
            isOneToOne: true
            referencedRelation: "v_trainers"
            referencedColumns: ["id"]
          },
        ]
      }
      discovery_calls: {
        Row: {
          booking_notes: string | null
          calendar_event_id: string | null
          cancellation_reason: string | null
          client_id: string
          correlation_id: string | null
          created_at: string
          duration_minutes: number
          id: string
          prep_notes: string | null
          reminder_1h_sent: string | null
          reminder_24h_sent: string | null
          scheduled_for: string
          status: Database["public"]["Enums"]["discovery_call_status"]
          trainer_id: string
          updated_at: string
        }
        Insert: {
          booking_notes?: string | null
          calendar_event_id?: string | null
          cancellation_reason?: string | null
          client_id: string
          correlation_id?: string | null
          created_at?: string
          duration_minutes?: number
          id?: string
          prep_notes?: string | null
          reminder_1h_sent?: string | null
          reminder_24h_sent?: string | null
          scheduled_for: string
          status?: Database["public"]["Enums"]["discovery_call_status"]
          trainer_id: string
          updated_at?: string
        }
        Update: {
          booking_notes?: string | null
          calendar_event_id?: string | null
          cancellation_reason?: string | null
          client_id?: string
          correlation_id?: string | null
          created_at?: string
          duration_minutes?: number
          id?: string
          prep_notes?: string | null
          reminder_1h_sent?: string | null
          reminder_24h_sent?: string | null
          scheduled_for?: string
          status?: Database["public"]["Enums"]["discovery_call_status"]
          trainer_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "discovery_calls_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "discovery_calls_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "v_clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "discovery_calls_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "v_trainers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "discovery_calls_trainer_id_fkey"
            columns: ["trainer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "discovery_calls_trainer_id_fkey"
            columns: ["trainer_id"]
            isOneToOne: false
            referencedRelation: "v_clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "discovery_calls_trainer_id_fkey"
            columns: ["trainer_id"]
            isOneToOne: false
            referencedRelation: "v_trainers"
            referencedColumns: ["id"]
          },
        ]
      }
      event_processing_state: {
        Row: {
          completed_at: string | null
          completed_steps: number
          correlation_id: string
          created_at: string
          current_step: string
          failed_at: string | null
          failure_reason: string | null
          id: string
          max_retries: number | null
          next_retry_at: string | null
          retry_count: number | null
          started_at: string
          state_data: Json
          total_steps: number
          updated_at: string
          workflow_type: string
        }
        Insert: {
          completed_at?: string | null
          completed_steps?: number
          correlation_id: string
          created_at?: string
          current_step: string
          failed_at?: string | null
          failure_reason?: string | null
          id?: string
          max_retries?: number | null
          next_retry_at?: string | null
          retry_count?: number | null
          started_at?: string
          state_data?: Json
          total_steps?: number
          updated_at?: string
          workflow_type: string
        }
        Update: {
          completed_at?: string | null
          completed_steps?: number
          correlation_id?: string
          created_at?: string
          current_step?: string
          failed_at?: string | null
          failure_reason?: string | null
          id?: string
          max_retries?: number | null
          next_retry_at?: string | null
          retry_count?: number | null
          started_at?: string
          state_data?: Json
          total_steps?: number
          updated_at?: string
          workflow_type?: string
        }
        Relationships: []
      }
      goal_client_links: {
        Row: {
          client_id: string
          created_at: string
          goal_id: string
          id: string
        }
        Insert: {
          client_id: string
          created_at?: string
          goal_id: string
          id?: string
        }
        Update: {
          client_id?: string
          created_at?: string
          goal_id?: string
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "goal_client_links_goal_id_fkey"
            columns: ["goal_id"]
            isOneToOne: false
            referencedRelation: "goals"
            referencedColumns: ["id"]
          },
        ]
      }
      goals: {
        Row: {
          created_at: string
          current_value: number | null
          cycle_id: string | null
          description: string | null
          display_order: number | null
          end_date: string
          goal_type: Database["public"]["Enums"]["goal_type"]
          id: string
          is_archived: boolean | null
          parent_goal_id: string | null
          start_date: string
          status: Database["public"]["Enums"]["goal_status"]
          target_unit: string | null
          target_value: number | null
          timeframe: Database["public"]["Enums"]["goal_timeframe"]
          title: string
          trainer_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          current_value?: number | null
          cycle_id?: string | null
          description?: string | null
          display_order?: number | null
          end_date: string
          goal_type?: Database["public"]["Enums"]["goal_type"]
          id?: string
          is_archived?: boolean | null
          parent_goal_id?: string | null
          start_date: string
          status?: Database["public"]["Enums"]["goal_status"]
          target_unit?: string | null
          target_value?: number | null
          timeframe: Database["public"]["Enums"]["goal_timeframe"]
          title: string
          trainer_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          current_value?: number | null
          cycle_id?: string | null
          description?: string | null
          display_order?: number | null
          end_date?: string
          goal_type?: Database["public"]["Enums"]["goal_type"]
          id?: string
          is_archived?: boolean | null
          parent_goal_id?: string | null
          start_date?: string
          status?: Database["public"]["Enums"]["goal_status"]
          target_unit?: string | null
          target_value?: number | null
          timeframe?: Database["public"]["Enums"]["goal_timeframe"]
          title?: string
          trainer_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "goals_parent_goal_id_fkey"
            columns: ["parent_goal_id"]
            isOneToOne: false
            referencedRelation: "goals"
            referencedColumns: ["id"]
          },
        ]
      }
      instagram_connections: {
        Row: {
          access_token: string
          account_type: string
          connected_at: string
          created_at: string
          id: string
          instagram_user_id: string
          instagram_username: string
          is_active: boolean
          reveal_handle_post_discovery: boolean
          token_expires_at: string | null
          trainer_id: string
          updated_at: string
        }
        Insert: {
          access_token: string
          account_type: string
          connected_at?: string
          created_at?: string
          id?: string
          instagram_user_id: string
          instagram_username: string
          is_active?: boolean
          reveal_handle_post_discovery?: boolean
          token_expires_at?: string | null
          trainer_id: string
          updated_at?: string
        }
        Update: {
          access_token?: string
          account_type?: string
          connected_at?: string
          created_at?: string
          id?: string
          instagram_user_id?: string
          instagram_username?: string
          is_active?: boolean
          reveal_handle_post_discovery?: boolean
          token_expires_at?: string | null
          trainer_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "instagram_connections_trainer_id_fkey"
            columns: ["trainer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "instagram_connections_trainer_id_fkey"
            columns: ["trainer_id"]
            isOneToOne: false
            referencedRelation: "v_clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "instagram_connections_trainer_id_fkey"
            columns: ["trainer_id"]
            isOneToOne: false
            referencedRelation: "v_trainers"
            referencedColumns: ["id"]
          },
        ]
      }
      instagram_handle_revelations: {
        Row: {
          client_id: string
          connection_id: string
          created_at: string
          discovery_call_id: string | null
          id: string
          revealed_at: string
          trainer_id: string
        }
        Insert: {
          client_id: string
          connection_id: string
          created_at?: string
          discovery_call_id?: string | null
          id?: string
          revealed_at?: string
          trainer_id: string
        }
        Update: {
          client_id?: string
          connection_id?: string
          created_at?: string
          discovery_call_id?: string | null
          id?: string
          revealed_at?: string
          trainer_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "instagram_handle_revelations_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "instagram_handle_revelations_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "v_clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "instagram_handle_revelations_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "v_trainers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "instagram_handle_revelations_connection_id_fkey"
            columns: ["connection_id"]
            isOneToOne: false
            referencedRelation: "instagram_connections"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "instagram_handle_revelations_trainer_id_fkey"
            columns: ["trainer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "instagram_handle_revelations_trainer_id_fkey"
            columns: ["trainer_id"]
            isOneToOne: false
            referencedRelation: "v_clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "instagram_handle_revelations_trainer_id_fkey"
            columns: ["trainer_id"]
            isOneToOne: false
            referencedRelation: "v_trainers"
            referencedColumns: ["id"]
          },
        ]
      }
      instagram_selected_media: {
        Row: {
          caption: string | null
          connection_id: string
          created_at: string
          display_order: number
          id: string
          instagram_media_id: string
          is_active: boolean
          media_type: string
          media_url: string
          permalink: string
          selected_at: string
          thumbnail_url: string | null
          trainer_id: string
          updated_at: string
        }
        Insert: {
          caption?: string | null
          connection_id: string
          created_at?: string
          display_order?: number
          id?: string
          instagram_media_id: string
          is_active?: boolean
          media_type: string
          media_url: string
          permalink: string
          selected_at?: string
          thumbnail_url?: string | null
          trainer_id: string
          updated_at?: string
        }
        Update: {
          caption?: string | null
          connection_id?: string
          created_at?: string
          display_order?: number
          id?: string
          instagram_media_id?: string
          is_active?: boolean
          media_type?: string
          media_url?: string
          permalink?: string
          selected_at?: string
          thumbnail_url?: string | null
          trainer_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "instagram_selected_media_connection_id_fkey"
            columns: ["connection_id"]
            isOneToOne: false
            referencedRelation: "instagram_connections"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "instagram_selected_media_trainer_id_fkey"
            columns: ["trainer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "instagram_selected_media_trainer_id_fkey"
            columns: ["trainer_id"]
            isOneToOne: false
            referencedRelation: "v_clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "instagram_selected_media_trainer_id_fkey"
            columns: ["trainer_id"]
            isOneToOne: false
            referencedRelation: "v_trainers"
            referencedColumns: ["id"]
          },
        ]
      }
      kb_article_revisions: {
        Row: {
          article_id: string
          change_summary: string | null
          content: string
          created_at: string
          created_by: string | null
          excerpt: string | null
          id: string
          metadata: Json | null
          revision_number: number
          title: string
        }
        Insert: {
          article_id: string
          change_summary?: string | null
          content: string
          created_at?: string
          created_by?: string | null
          excerpt?: string | null
          id?: string
          metadata?: Json | null
          revision_number: number
          title: string
        }
        Update: {
          article_id?: string
          change_summary?: string | null
          content?: string
          created_at?: string
          created_by?: string | null
          excerpt?: string | null
          id?: string
          metadata?: Json | null
          revision_number?: number
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "kb_article_revisions_article_id_fkey"
            columns: ["article_id"]
            isOneToOne: false
            referencedRelation: "kb_articles"
            referencedColumns: ["id"]
          },
        ]
      }
      kb_article_tags: {
        Row: {
          article_id: string
          created_at: string
          id: string
          tag_id: string
        }
        Insert: {
          article_id: string
          created_at?: string
          id?: string
          tag_id: string
        }
        Update: {
          article_id?: string
          created_at?: string
          id?: string
          tag_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "kb_article_tags_article_id_fkey"
            columns: ["article_id"]
            isOneToOne: false
            referencedRelation: "kb_articles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "kb_article_tags_tag_id_fkey"
            columns: ["tag_id"]
            isOneToOne: false
            referencedRelation: "kb_tags"
            referencedColumns: ["id"]
          },
        ]
      }
      kb_articles: {
        Row: {
          category_id: string | null
          content: string
          content_type: Database["public"]["Enums"]["kb_content_type"]
          created_at: string
          created_by: string | null
          excerpt: string | null
          featured: boolean
          id: string
          metadata: Json | null
          published_at: string | null
          search_vector: unknown | null
          slug: string
          status: Database["public"]["Enums"]["kb_article_status"]
          title: string
          updated_at: string
          updated_by: string | null
          view_count: number
        }
        Insert: {
          category_id?: string | null
          content: string
          content_type: Database["public"]["Enums"]["kb_content_type"]
          created_at?: string
          created_by?: string | null
          excerpt?: string | null
          featured?: boolean
          id?: string
          metadata?: Json | null
          published_at?: string | null
          search_vector?: unknown | null
          slug: string
          status?: Database["public"]["Enums"]["kb_article_status"]
          title: string
          updated_at?: string
          updated_by?: string | null
          view_count?: number
        }
        Update: {
          category_id?: string | null
          content?: string
          content_type?: Database["public"]["Enums"]["kb_content_type"]
          created_at?: string
          created_by?: string | null
          excerpt?: string | null
          featured?: boolean
          id?: string
          metadata?: Json | null
          published_at?: string | null
          search_vector?: unknown | null
          slug?: string
          status?: Database["public"]["Enums"]["kb_article_status"]
          title?: string
          updated_at?: string
          updated_by?: string | null
          view_count?: number
        }
        Relationships: [
          {
            foreignKeyName: "kb_articles_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "kb_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      kb_categories: {
        Row: {
          color: string | null
          created_at: string
          created_by: string | null
          description: string | null
          display_order: number
          icon: string | null
          id: string
          is_active: boolean
          name: string
          parent_id: string | null
          slug: string
          updated_at: string
        }
        Insert: {
          color?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          display_order?: number
          icon?: string | null
          id?: string
          is_active?: boolean
          name: string
          parent_id?: string | null
          slug: string
          updated_at?: string
        }
        Update: {
          color?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          display_order?: number
          icon?: string | null
          id?: string
          is_active?: boolean
          name?: string
          parent_id?: string | null
          slug?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "kb_categories_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "kb_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      kb_tags: {
        Row: {
          color: string | null
          created_at: string
          description: string | null
          id: string
          name: string
          slug: string
          usage_count: number
        }
        Insert: {
          color?: string | null
          created_at?: string
          description?: string | null
          id?: string
          name: string
          slug: string
          usage_count?: number
        }
        Update: {
          color?: string | null
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          slug?: string
          usage_count?: number
        }
        Relationships: []
      }
      login_history: {
        Row: {
          failure_reason: string | null
          id: string
          ip_address: unknown | null
          login_at: string
          success: boolean
          user_agent: string | null
          user_id: string
        }
        Insert: {
          failure_reason?: string | null
          id?: string
          ip_address?: unknown | null
          login_at?: string
          success?: boolean
          user_agent?: string | null
          user_id: string
        }
        Update: {
          failure_reason?: string | null
          id?: string
          ip_address?: unknown | null
          login_at?: string
          success?: boolean
          user_agent?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "login_history_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "login_history_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "v_clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "login_history_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "v_trainers"
            referencedColumns: ["id"]
          },
        ]
      }
      membership_commission_config: {
        Row: {
          created_at: string
          created_by: string
          effective_from: string
          fee_type: string
          fee_value_flat_cents: number | null
          fee_value_percent: number | null
          id: string
          trainer_id: string
        }
        Insert: {
          created_at?: string
          created_by?: string
          effective_from?: string
          fee_type?: string
          fee_value_flat_cents?: number | null
          fee_value_percent?: number | null
          id?: string
          trainer_id: string
        }
        Update: {
          created_at?: string
          created_by?: string
          effective_from?: string
          fee_type?: string
          fee_value_flat_cents?: number | null
          fee_value_percent?: number | null
          id?: string
          trainer_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "membership_commission_config_trainer_id_fkey"
            columns: ["trainer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "membership_commission_config_trainer_id_fkey"
            columns: ["trainer_id"]
            isOneToOne: false
            referencedRelation: "v_clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "membership_commission_config_trainer_id_fkey"
            columns: ["trainer_id"]
            isOneToOne: false
            referencedRelation: "v_trainers"
            referencedColumns: ["id"]
          },
        ]
      }
      message_publish_ledger: {
        Row: {
          consent_snapshot: Json
          content_hash: string | null
          correlation_id: string
          created_at: string
          delivered_at: string | null
          delivery_provider: string | null
          delivery_provider_id: string | null
          delivery_status: string
          failed_at: string | null
          failure_reason: string | null
          id: string
          legal_basis: string
          message_type: string
          metadata: Json | null
          recipient_id: string
          retry_count: number | null
          sender_id: string | null
          sent_at: string | null
          template_id: string | null
          template_version: string | null
          updated_at: string
        }
        Insert: {
          consent_snapshot?: Json
          content_hash?: string | null
          correlation_id?: string
          created_at?: string
          delivered_at?: string | null
          delivery_provider?: string | null
          delivery_provider_id?: string | null
          delivery_status?: string
          failed_at?: string | null
          failure_reason?: string | null
          id?: string
          legal_basis?: string
          message_type: string
          metadata?: Json | null
          recipient_id: string
          retry_count?: number | null
          sender_id?: string | null
          sent_at?: string | null
          template_id?: string | null
          template_version?: string | null
          updated_at?: string
        }
        Update: {
          consent_snapshot?: Json
          content_hash?: string | null
          correlation_id?: string
          created_at?: string
          delivered_at?: string | null
          delivery_provider?: string | null
          delivery_provider_id?: string | null
          delivery_status?: string
          failed_at?: string | null
          failure_reason?: string | null
          id?: string
          legal_basis?: string
          message_type?: string
          metadata?: Json | null
          recipient_id?: string
          retry_count?: number | null
          sender_id?: string | null
          sent_at?: string | null
          template_id?: string | null
          template_version?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      messages: {
        Row: {
          content: string
          conversation_id: string
          created_at: string
          id: string
          message_type: string
          metadata: Json | null
          read_at: string | null
          sender_id: string
        }
        Insert: {
          content: string
          conversation_id: string
          created_at?: string
          id?: string
          message_type?: string
          metadata?: Json | null
          read_at?: string | null
          sender_id: string
        }
        Update: {
          content?: string
          conversation_id?: string
          created_at?: string
          id?: string
          message_type?: string
          metadata?: Json | null
          read_at?: string | null
          sender_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      onboarding_activity_assignments: {
        Row: {
          activity_id: string
          assignment_order: number
          created_at: string
          custom_instructions: string | null
          estimated_duration_minutes: number | null
          id: string
          is_required: boolean
          section_item_id: string
          section_type: string
          template_id: string
          updated_at: string
        }
        Insert: {
          activity_id: string
          assignment_order?: number
          created_at?: string
          custom_instructions?: string | null
          estimated_duration_minutes?: number | null
          id?: string
          is_required?: boolean
          section_item_id: string
          section_type: string
          template_id: string
          updated_at?: string
        }
        Update: {
          activity_id?: string
          assignment_order?: number
          created_at?: string
          custom_instructions?: string | null
          estimated_duration_minutes?: number | null
          id?: string
          is_required?: boolean
          section_item_id?: string
          section_type?: string
          template_id?: string
          updated_at?: string
        }
        Relationships: []
      }
      onboarding_bulk_operations: {
        Row: {
          completed_at: string | null
          created_at: string | null
          error_log: string[] | null
          id: string
          operation_data: Json | null
          operation_type: string
          progress_count: number | null
          started_at: string | null
          status: string | null
          target_clients: string[]
          template_id: string | null
          total_count: number
          trainer_id: string
          updated_at: string | null
        }
        Insert: {
          completed_at?: string | null
          created_at?: string | null
          error_log?: string[] | null
          id?: string
          operation_data?: Json | null
          operation_type: string
          progress_count?: number | null
          started_at?: string | null
          status?: string | null
          target_clients: string[]
          template_id?: string | null
          total_count: number
          trainer_id: string
          updated_at?: string | null
        }
        Update: {
          completed_at?: string | null
          created_at?: string | null
          error_log?: string[] | null
          id?: string
          operation_data?: Json | null
          operation_type?: string
          progress_count?: number | null
          started_at?: string | null
          status?: string | null
          target_clients?: string[]
          template_id?: string | null
          total_count?: number
          trainer_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "onboarding_bulk_operations_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "onboarding_templates"
            referencedColumns: ["id"]
          },
        ]
      }
      onboarding_commitments: {
        Row: {
          commitment_description: string
          commitment_title: string
          commitment_type: string
          created_at: string
          display_order: number
          id: string
          requires_acknowledgment: boolean
          requires_signature: boolean
          show_in_summary: boolean | null
          template_id: string
          updated_at: string
          visibility_client: boolean | null
          visibility_trainer: boolean | null
        }
        Insert: {
          commitment_description: string
          commitment_title: string
          commitment_type: string
          created_at?: string
          display_order?: number
          id?: string
          requires_acknowledgment?: boolean
          requires_signature?: boolean
          show_in_summary?: boolean | null
          template_id: string
          updated_at?: string
          visibility_client?: boolean | null
          visibility_trainer?: boolean | null
        }
        Update: {
          commitment_description?: string
          commitment_title?: string
          commitment_type?: string
          created_at?: string
          display_order?: number
          id?: string
          requires_acknowledgment?: boolean
          requires_signature?: boolean
          show_in_summary?: boolean | null
          template_id?: string
          updated_at?: string
          visibility_client?: boolean | null
          visibility_trainer?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "onboarding_commitments_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "trainer_onboarding_templates"
            referencedColumns: ["id"]
          },
        ]
      }
      onboarding_conditional_evaluations: {
        Row: {
          client_id: string
          condition_result: boolean
          evaluated_at: string | null
          evaluation_data: Json | null
          id: string
          step_id: string
          template_id: string | null
        }
        Insert: {
          client_id: string
          condition_result: boolean
          evaluated_at?: string | null
          evaluation_data?: Json | null
          id?: string
          step_id: string
          template_id?: string | null
        }
        Update: {
          client_id?: string
          condition_result?: boolean
          evaluated_at?: string | null
          evaluation_data?: Json | null
          id?: string
          step_id?: string
          template_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "onboarding_conditional_evaluations_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "onboarding_templates"
            referencedColumns: ["id"]
          },
        ]
      }
      onboarding_first_week: {
        Row: {
          activity_id: string | null
          attachment_types: string[] | null
          created_at: string
          description: string | null
          display_order: number
          due_days: number | null
          id: string
          is_mandatory: boolean
          max_attachments: number | null
          max_file_size_mb: number | null
          requires_attachment: boolean
          rich_guidance: string | null
          sla_hours: number | null
          task_name: string
          template_id: string
          updated_at: string
        }
        Insert: {
          activity_id?: string | null
          attachment_types?: string[] | null
          created_at?: string
          description?: string | null
          display_order?: number
          due_days?: number | null
          id?: string
          is_mandatory?: boolean
          max_attachments?: number | null
          max_file_size_mb?: number | null
          requires_attachment?: boolean
          rich_guidance?: string | null
          sla_hours?: number | null
          task_name: string
          template_id: string
          updated_at?: string
        }
        Update: {
          activity_id?: string | null
          attachment_types?: string[] | null
          created_at?: string
          description?: string | null
          display_order?: number
          due_days?: number | null
          id?: string
          is_mandatory?: boolean
          max_attachments?: number | null
          max_file_size_mb?: number | null
          requires_attachment?: boolean
          rich_guidance?: string | null
          sla_hours?: number | null
          task_name?: string
          template_id?: string
          updated_at?: string
        }
        Relationships: []
      }
      onboarding_getting_started: {
        Row: {
          activity_id: string | null
          allowed_file_types: Json | null
          attachment_types: Json | null
          attachment_upload_instructions: string | null
          auto_calculate_due_date: boolean | null
          created_at: string
          description: string | null
          display_order: number
          due_date_business_days_only: boolean | null
          due_days: number | null
          id: string
          is_mandatory: boolean
          max_attachments: number | null
          max_file_size_mb: number | null
          max_file_size_per_attachment_mb: number | null
          requires_attachment: boolean
          rich_guidance: string | null
          show_in_summary: boolean | null
          sla_escalation_hours: number | null
          sla_hours: number | null
          sla_reminder_hours: number | null
          task_name: string
          template_id: string
          updated_at: string
          visibility_client: boolean | null
          visibility_trainer: boolean | null
        }
        Insert: {
          activity_id?: string | null
          allowed_file_types?: Json | null
          attachment_types?: Json | null
          attachment_upload_instructions?: string | null
          auto_calculate_due_date?: boolean | null
          created_at?: string
          description?: string | null
          display_order?: number
          due_date_business_days_only?: boolean | null
          due_days?: number | null
          id?: string
          is_mandatory?: boolean
          max_attachments?: number | null
          max_file_size_mb?: number | null
          max_file_size_per_attachment_mb?: number | null
          requires_attachment?: boolean
          rich_guidance?: string | null
          show_in_summary?: boolean | null
          sla_escalation_hours?: number | null
          sla_hours?: number | null
          sla_reminder_hours?: number | null
          task_name: string
          template_id: string
          updated_at?: string
          visibility_client?: boolean | null
          visibility_trainer?: boolean | null
        }
        Update: {
          activity_id?: string | null
          allowed_file_types?: Json | null
          attachment_types?: Json | null
          attachment_upload_instructions?: string | null
          auto_calculate_due_date?: boolean | null
          created_at?: string
          description?: string | null
          display_order?: number
          due_date_business_days_only?: boolean | null
          due_days?: number | null
          id?: string
          is_mandatory?: boolean
          max_attachments?: number | null
          max_file_size_mb?: number | null
          max_file_size_per_attachment_mb?: number | null
          requires_attachment?: boolean
          rich_guidance?: string | null
          show_in_summary?: boolean | null
          sla_escalation_hours?: number | null
          sla_hours?: number | null
          sla_reminder_hours?: number | null
          task_name?: string
          template_id?: string
          updated_at?: string
          visibility_client?: boolean | null
          visibility_trainer?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "onboarding_getting_started_activity_id_fkey"
            columns: ["activity_id"]
            isOneToOne: false
            referencedRelation: "trainer_onboarding_activities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "onboarding_getting_started_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "trainer_onboarding_templates"
            referencedColumns: ["id"]
          },
        ]
      }
      onboarding_ongoing_support: {
        Row: {
          cancellation_policy: string | null
          check_in_day: string | null
          check_in_duration: number | null
          check_in_frequency: string | null
          check_in_time: string | null
          client_response_expectations: string | null
          communication_channels: Json | null
          created_at: string
          emergency_contact_method: string | null
          id: string
          preferred_communication_channel: string | null
          progress_tracking_frequency: string | null
          session_rescheduling_policy: string | null
          show_in_summary: boolean | null
          template_id: string
          trainer_response_time_hours: number
          updated_at: string
          visibility_client: boolean | null
          visibility_trainer: boolean | null
        }
        Insert: {
          cancellation_policy?: string | null
          check_in_day?: string | null
          check_in_duration?: number | null
          check_in_frequency?: string | null
          check_in_time?: string | null
          client_response_expectations?: string | null
          communication_channels?: Json | null
          created_at?: string
          emergency_contact_method?: string | null
          id?: string
          preferred_communication_channel?: string | null
          progress_tracking_frequency?: string | null
          session_rescheduling_policy?: string | null
          show_in_summary?: boolean | null
          template_id: string
          trainer_response_time_hours?: number
          updated_at?: string
          visibility_client?: boolean | null
          visibility_trainer?: boolean | null
        }
        Update: {
          cancellation_policy?: string | null
          check_in_day?: string | null
          check_in_duration?: number | null
          check_in_frequency?: string | null
          check_in_time?: string | null
          client_response_expectations?: string | null
          communication_channels?: Json | null
          created_at?: string
          emergency_contact_method?: string | null
          id?: string
          preferred_communication_channel?: string | null
          progress_tracking_frequency?: string | null
          session_rescheduling_policy?: string | null
          show_in_summary?: boolean | null
          template_id?: string
          trainer_response_time_hours?: number
          updated_at?: string
          visibility_client?: boolean | null
          visibility_trainer?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "onboarding_ongoing_support_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "trainer_onboarding_templates"
            referencedColumns: ["id"]
          },
        ]
      }
      onboarding_template_analytics: {
        Row: {
          created_at: string | null
          date_recorded: string | null
          id: string
          metric_data: Json | null
          metric_type: string
          metric_value: number | null
          template_id: string | null
          trainer_id: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          date_recorded?: string | null
          id?: string
          metric_data?: Json | null
          metric_type: string
          metric_value?: number | null
          template_id?: string | null
          trainer_id: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          date_recorded?: string | null
          id?: string
          metric_data?: Json | null
          metric_type?: string
          metric_value?: number | null
          template_id?: string | null
          trainer_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "onboarding_template_analytics_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "onboarding_templates"
            referencedColumns: ["id"]
          },
        ]
      }
      onboarding_template_audit_log: {
        Row: {
          action_by: string
          action_details: Json | null
          action_reason: string | null
          action_type: string
          created_at: string
          id: string
          template_id: string
          version_number: number | null
        }
        Insert: {
          action_by: string
          action_details?: Json | null
          action_reason?: string | null
          action_type: string
          created_at?: string
          id?: string
          template_id: string
          version_number?: number | null
        }
        Update: {
          action_by?: string
          action_details?: Json | null
          action_reason?: string | null
          action_type?: string
          created_at?: string
          id?: string
          template_id?: string
          version_number?: number | null
        }
        Relationships: []
      }
      onboarding_template_sections: {
        Row: {
          allowed_attachments: Json | null
          completion_method: string | null
          created_at: string | null
          description: string | null
          display_order: number | null
          due_date_business_days_only: boolean | null
          due_days: number | null
          id: string
          instructions: string | null
          is_active: boolean | null
          requires_file_upload: boolean | null
          section_type: string
          sla_hours: number | null
          step_name: string
          step_type: string | null
          template_id: string | null
          updated_at: string | null
          visibility: string | null
        }
        Insert: {
          allowed_attachments?: Json | null
          completion_method?: string | null
          created_at?: string | null
          description?: string | null
          display_order?: number | null
          due_date_business_days_only?: boolean | null
          due_days?: number | null
          id?: string
          instructions?: string | null
          is_active?: boolean | null
          requires_file_upload?: boolean | null
          section_type: string
          sla_hours?: number | null
          step_name: string
          step_type?: string | null
          template_id?: string | null
          updated_at?: string | null
          visibility?: string | null
        }
        Update: {
          allowed_attachments?: Json | null
          completion_method?: string | null
          created_at?: string | null
          description?: string | null
          display_order?: number | null
          due_date_business_days_only?: boolean | null
          due_days?: number | null
          id?: string
          instructions?: string | null
          is_active?: boolean | null
          requires_file_upload?: boolean | null
          section_type?: string
          sla_hours?: number | null
          step_name?: string
          step_type?: string | null
          template_id?: string | null
          updated_at?: string | null
          visibility?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "onboarding_template_sections_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "onboarding_templates"
            referencedColumns: ["id"]
          },
        ]
      }
      onboarding_template_versions: {
        Row: {
          changelog: string | null
          created_at: string | null
          created_by: string
          id: string
          is_current: boolean | null
          template_data: Json
          template_id: string | null
          version_number: number
        }
        Insert: {
          changelog?: string | null
          created_at?: string | null
          created_by: string
          id?: string
          is_current?: boolean | null
          template_data: Json
          template_id?: string | null
          version_number: number
        }
        Update: {
          changelog?: string | null
          created_at?: string | null
          created_by?: string
          id?: string
          is_current?: boolean | null
          template_data?: Json
          template_id?: string | null
          version_number?: number
        }
        Relationships: [
          {
            foreignKeyName: "onboarding_template_versions_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "onboarding_templates"
            referencedColumns: ["id"]
          },
        ]
      }
      onboarding_templates: {
        Row: {
          conditional_logic: Json | null
          created_at: string | null
          description: string | null
          display_order: number | null
          id: string
          is_locked: boolean | null
          is_version: boolean | null
          lock_reason: string | null
          name: string
          package_type_restrictions: string[] | null
          parent_template_id: string | null
          published_at: string | null
          published_version: number | null
          status: string | null
          trainer_id: string
          updated_at: string | null
          version_number: number | null
        }
        Insert: {
          conditional_logic?: Json | null
          created_at?: string | null
          description?: string | null
          display_order?: number | null
          id?: string
          is_locked?: boolean | null
          is_version?: boolean | null
          lock_reason?: string | null
          name: string
          package_type_restrictions?: string[] | null
          parent_template_id?: string | null
          published_at?: string | null
          published_version?: number | null
          status?: string | null
          trainer_id: string
          updated_at?: string | null
          version_number?: number | null
        }
        Update: {
          conditional_logic?: Json | null
          created_at?: string | null
          description?: string | null
          display_order?: number | null
          id?: string
          is_locked?: boolean | null
          is_version?: boolean | null
          lock_reason?: string | null
          name?: string
          package_type_restrictions?: string[] | null
          parent_template_id?: string | null
          published_at?: string | null
          published_version?: number | null
          status?: string | null
          trainer_id?: string
          updated_at?: string | null
          version_number?: number | null
        }
        Relationships: []
      }
      onboarding_trainer_notes: {
        Row: {
          content: string
          created_at: string
          display_order: number
          due_before_client_start: boolean
          estimated_time_minutes: number | null
          id: string
          is_checklist_item: boolean
          note_type: string
          priority: string | null
          show_in_summary: boolean | null
          template_id: string
          title: string
          updated_at: string
          visibility_client: boolean | null
          visibility_trainer: boolean | null
        }
        Insert: {
          content: string
          created_at?: string
          display_order?: number
          due_before_client_start?: boolean
          estimated_time_minutes?: number | null
          id?: string
          is_checklist_item?: boolean
          note_type: string
          priority?: string | null
          show_in_summary?: boolean | null
          template_id: string
          title: string
          updated_at?: string
          visibility_client?: boolean | null
          visibility_trainer?: boolean | null
        }
        Update: {
          content?: string
          created_at?: string
          display_order?: number
          due_before_client_start?: boolean
          estimated_time_minutes?: number | null
          id?: string
          is_checklist_item?: boolean
          note_type?: string
          priority?: string | null
          show_in_summary?: boolean | null
          template_id?: string
          title?: string
          updated_at?: string
          visibility_client?: boolean | null
          visibility_trainer?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "onboarding_trainer_notes_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "trainer_onboarding_templates"
            referencedColumns: ["id"]
          },
        ]
      }
      package_ways_of_working: {
        Row: {
          client_expectations_activity_ids: Json | null
          client_expectations_items: Json | null
          created_at: string
          first_week_activity_ids: Json | null
          first_week_items: Json | null
          id: string
          onboarding_activity_ids: Json | null
          onboarding_items: Json | null
          ongoing_structure_activity_ids: Json | null
          ongoing_structure_items: Json | null
          package_id: string
          package_name: string
          tracking_tools_activity_ids: Json | null
          tracking_tools_items: Json | null
          trainer_id: string
          updated_at: string
          visibility: string | null
          what_i_bring_activity_ids: Json | null
          what_i_bring_items: Json | null
        }
        Insert: {
          client_expectations_activity_ids?: Json | null
          client_expectations_items?: Json | null
          created_at?: string
          first_week_activity_ids?: Json | null
          first_week_items?: Json | null
          id?: string
          onboarding_activity_ids?: Json | null
          onboarding_items?: Json | null
          ongoing_structure_activity_ids?: Json | null
          ongoing_structure_items?: Json | null
          package_id: string
          package_name: string
          tracking_tools_activity_ids?: Json | null
          tracking_tools_items?: Json | null
          trainer_id: string
          updated_at?: string
          visibility?: string | null
          what_i_bring_activity_ids?: Json | null
          what_i_bring_items?: Json | null
        }
        Update: {
          client_expectations_activity_ids?: Json | null
          client_expectations_items?: Json | null
          created_at?: string
          first_week_activity_ids?: Json | null
          first_week_items?: Json | null
          id?: string
          onboarding_activity_ids?: Json | null
          onboarding_items?: Json | null
          ongoing_structure_activity_ids?: Json | null
          ongoing_structure_items?: Json | null
          package_id?: string
          package_name?: string
          tracking_tools_activity_ids?: Json | null
          tracking_tools_items?: Json | null
          trainer_id?: string
          updated_at?: string
          visibility?: string | null
          what_i_bring_activity_ids?: Json | null
          what_i_bring_items?: Json | null
        }
        Relationships: []
      }
      payment_packages: {
        Row: {
          applied_onboarding_fee_kind: string | null
          applied_onboarding_fee_value: number | null
          coach_selection_request_id: string | null
          created_at: string
          customer_id: string
          customer_payment_mode: Database["public"]["Enums"]["customer_payment_mode_enum"]
          duration_months: number | null
          duration_weeks: number | null
          final_price_amount: number
          final_price_currency: string
          id: string
          installment_config: Json | null
          list_price_amount: number
          list_price_currency: string
          payout_frequency: Database["public"]["Enums"]["payout_frequency_enum"]
          start_date: string
          status: string
          title: string
          trainer_id: string
          updated_at: string
        }
        Insert: {
          applied_onboarding_fee_kind?: string | null
          applied_onboarding_fee_value?: number | null
          coach_selection_request_id?: string | null
          created_at?: string
          customer_id: string
          customer_payment_mode?: Database["public"]["Enums"]["customer_payment_mode_enum"]
          duration_months?: number | null
          duration_weeks?: number | null
          final_price_amount: number
          final_price_currency?: string
          id?: string
          installment_config?: Json | null
          list_price_amount: number
          list_price_currency?: string
          payout_frequency?: Database["public"]["Enums"]["payout_frequency_enum"]
          start_date: string
          status?: string
          title: string
          trainer_id: string
          updated_at?: string
        }
        Update: {
          applied_onboarding_fee_kind?: string | null
          applied_onboarding_fee_value?: number | null
          coach_selection_request_id?: string | null
          created_at?: string
          customer_id?: string
          customer_payment_mode?: Database["public"]["Enums"]["customer_payment_mode_enum"]
          duration_months?: number | null
          duration_weeks?: number | null
          final_price_amount?: number
          final_price_currency?: string
          id?: string
          installment_config?: Json | null
          list_price_amount?: number
          list_price_currency?: string
          payout_frequency?: Database["public"]["Enums"]["payout_frequency_enum"]
          start_date?: string
          status?: string
          title?: string
          trainer_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "payment_packages_coach_selection_request_id_fkey"
            columns: ["coach_selection_request_id"]
            isOneToOne: false
            referencedRelation: "coach_selection_requests"
            referencedColumns: ["id"]
          },
        ]
      }
      payment_statement_views: {
        Row: {
          created_at: string
          generated_at: string
          id: string
          package_id: string
          statement_data: Json
          viewer_id: string
          viewer_role: string
        }
        Insert: {
          created_at?: string
          generated_at?: string
          id?: string
          package_id: string
          statement_data: Json
          viewer_id: string
          viewer_role: string
        }
        Update: {
          created_at?: string
          generated_at?: string
          id?: string
          package_id?: string
          statement_data?: Json
          viewer_id?: string
          viewer_role?: string
        }
        Relationships: [
          {
            foreignKeyName: "payment_statement_views_package_id_fkey"
            columns: ["package_id"]
            isOneToOne: false
            referencedRelation: "payment_packages"
            referencedColumns: ["id"]
          },
        ]
      }
      payout_disbursements: {
        Row: {
          amount_currency: string
          amount_value: number
          created_at: string
          disbursed_at: string
          id: string
          metadata: Json | null
          payout_period_id: string
          status: string
          stripe_transfer_id: string | null
          updated_at: string
        }
        Insert: {
          amount_currency?: string
          amount_value: number
          created_at?: string
          disbursed_at: string
          id?: string
          metadata?: Json | null
          payout_period_id: string
          status?: string
          stripe_transfer_id?: string | null
          updated_at?: string
        }
        Update: {
          amount_currency?: string
          amount_value?: number
          created_at?: string
          disbursed_at?: string
          id?: string
          metadata?: Json | null
          payout_period_id?: string
          status?: string
          stripe_transfer_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "payout_disbursements_payout_period_id_fkey"
            columns: ["payout_period_id"]
            isOneToOne: true
            referencedRelation: "payout_periods"
            referencedColumns: ["id"]
          },
        ]
      }
      payout_periods: {
        Row: {
          approval_deadline_at: string
          approval_opened_at: string
          approval_status: Database["public"]["Enums"]["approval_status_enum"]
          approved_at: string | null
          approved_by: string | null
          commission_deduction_amount: number
          commission_deduction_currency: string
          created_at: string
          gross_portion_amount: number
          gross_portion_currency: string
          id: string
          net_payable_amount: number
          net_payable_currency: string
          package_id: string
          period_end: string
          period_index: number
          period_start: string
          rejected_at: string | null
          rejected_by: string | null
          rejection_attachments: Json | null
          rejection_reason: string | null
          updated_at: string
        }
        Insert: {
          approval_deadline_at: string
          approval_opened_at: string
          approval_status?: Database["public"]["Enums"]["approval_status_enum"]
          approved_at?: string | null
          approved_by?: string | null
          commission_deduction_amount?: number
          commission_deduction_currency?: string
          created_at?: string
          gross_portion_amount: number
          gross_portion_currency?: string
          id?: string
          net_payable_amount: number
          net_payable_currency?: string
          package_id: string
          period_end: string
          period_index: number
          period_start: string
          rejected_at?: string | null
          rejected_by?: string | null
          rejection_attachments?: Json | null
          rejection_reason?: string | null
          updated_at?: string
        }
        Update: {
          approval_deadline_at?: string
          approval_opened_at?: string
          approval_status?: Database["public"]["Enums"]["approval_status_enum"]
          approved_at?: string | null
          approved_by?: string | null
          commission_deduction_amount?: number
          commission_deduction_currency?: string
          created_at?: string
          gross_portion_amount?: number
          gross_portion_currency?: string
          id?: string
          net_payable_amount?: number
          net_payable_currency?: string
          package_id?: string
          period_end?: string
          period_index?: number
          period_start?: string
          rejected_at?: string | null
          rejected_by?: string | null
          rejection_attachments?: Json | null
          rejection_reason?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "payout_periods_package_id_fkey"
            columns: ["package_id"]
            isOneToOne: false
            referencedRelation: "payment_packages"
            referencedColumns: ["id"]
          },
        ]
      }
      platform_settings: {
        Row: {
          created_at: string
          id: string
          setting_key: string
          setting_value: Json
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          setting_key: string
          setting_value?: Json
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          setting_key?: string
          setting_value?: Json
          updated_at?: string
        }
        Relationships: []
      }
      popular_qualifications: {
        Row: {
          category: string
          created_at: string
          created_by: string | null
          description: string | null
          display_order: number
          id: string
          is_active: boolean
          name: string
          requires_verification: boolean
          updated_at: string
          verification_requirements: Json | null
        }
        Insert: {
          category?: string
          created_at?: string
          created_by?: string | null
          description?: string | null
          display_order?: number
          id?: string
          is_active?: boolean
          name: string
          requires_verification?: boolean
          updated_at?: string
          verification_requirements?: Json | null
        }
        Update: {
          category?: string
          created_at?: string
          created_by?: string | null
          description?: string | null
          display_order?: number
          id?: string
          is_active?: boolean
          name?: string
          requires_verification?: boolean
          updated_at?: string
          verification_requirements?: Json | null
        }
        Relationships: []
      }
      profile_update_streaks: {
        Row: {
          created_at: string
          id: string
          trainer_id: string
          updated_at: string
          week_end_date: string
          week_start_date: string
        }
        Insert: {
          created_at?: string
          id?: string
          trainer_id: string
          updated_at?: string
          week_end_date: string
          week_start_date: string
        }
        Update: {
          created_at?: string
          id?: string
          trainer_id?: string
          updated_at?: string
          week_end_date?: string
          week_start_date?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          account_status: string | null
          admin_notes: string | null
          admin_verification_notes: string | null
          availability_schedule: Json | null
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
          client_status: string | null
          client_survey_completed: boolean | null
          client_survey_completed_at: string | null
          client_survey_step: number | null
          coaching_styles: string[] | null
          communication_restricted: boolean | null
          communication_restricted_reason: string | null
          communication_style: string | null
          consent_marketing: boolean | null
          consent_service: boolean | null
          consent_timestamp: string | null
          consent_version: string | null
          created_at: string
          data_retention_until: string | null
          delivery_format: string | null
          discovery_call_price: number | null
          discovery_call_settings: Json | null
          experience_level: string | null
          first_name: string | null
          flexible_scheduling: boolean | null
          force_password_reset: boolean | null
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
          last_failed_login_at: string | null
          last_login_at: string | null
          last_name: string | null
          last_verification_request: string | null
          location: string | null
          login_attempts: number | null
          marketing_unsubscribed_at: string | null
          max_clients: number | null
          messaging_support: boolean | null
          onboarding_step: number | null
          open_to_virtual_coaching: boolean | null
          package_inclusions: Json | null
          package_options: Json | null
          phone: string | null
          preferred_coaching_style: string[] | null
          preferred_package_type: string | null
          preferred_time_slots: string[] | null
          preferred_training_frequency: string | null
          pricing_unlock_required: boolean | null
          primary_goals: string[] | null
          privacy_policy_version: string | null
          profile_blocks: Json | null
          profile_image_position: Json | null
          profile_photo_url: string | null
          profile_published: boolean | null
          profile_setup_completed: boolean | null
          profile_setup_step: number | null
          proof_upload_urls: string[] | null
          qualifications: string[] | null
          quiz_completed: boolean | null
          rating: number | null
          special_credentials: string[] | null
          specialization_description: string | null
          specializations: string[] | null
          start_timeline: string | null
          suspended_at: string | null
          suspended_reason: string | null
          suspended_until: string | null
          tagline: string | null
          terms_agreed: boolean | null
          terms_version: string | null
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
          verification_status: string | null
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
          wow_activities: Json | null
          wow_activity_assignments: Json | null
          wow_client_expectations: string | null
          wow_how_i_work: string | null
          wow_package_applicability: Json | null
          wow_setup_completed: boolean | null
          wow_visibility: string | null
          wow_what_i_provide: string | null
          year_certified: number | null
        }
        Insert: {
          account_status?: string | null
          admin_notes?: string | null
          admin_verification_notes?: string | null
          availability_schedule?: Json | null
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
          client_status?: string | null
          client_survey_completed?: boolean | null
          client_survey_completed_at?: string | null
          client_survey_step?: number | null
          coaching_styles?: string[] | null
          communication_restricted?: boolean | null
          communication_restricted_reason?: string | null
          communication_style?: string | null
          consent_marketing?: boolean | null
          consent_service?: boolean | null
          consent_timestamp?: string | null
          consent_version?: string | null
          created_at?: string
          data_retention_until?: string | null
          delivery_format?: string | null
          discovery_call_price?: number | null
          discovery_call_settings?: Json | null
          experience_level?: string | null
          first_name?: string | null
          flexible_scheduling?: boolean | null
          force_password_reset?: boolean | null
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
          last_failed_login_at?: string | null
          last_login_at?: string | null
          last_name?: string | null
          last_verification_request?: string | null
          location?: string | null
          login_attempts?: number | null
          marketing_unsubscribed_at?: string | null
          max_clients?: number | null
          messaging_support?: boolean | null
          onboarding_step?: number | null
          open_to_virtual_coaching?: boolean | null
          package_inclusions?: Json | null
          package_options?: Json | null
          phone?: string | null
          preferred_coaching_style?: string[] | null
          preferred_package_type?: string | null
          preferred_time_slots?: string[] | null
          preferred_training_frequency?: string | null
          pricing_unlock_required?: boolean | null
          primary_goals?: string[] | null
          privacy_policy_version?: string | null
          profile_blocks?: Json | null
          profile_image_position?: Json | null
          profile_photo_url?: string | null
          profile_published?: boolean | null
          profile_setup_completed?: boolean | null
          profile_setup_step?: number | null
          proof_upload_urls?: string[] | null
          qualifications?: string[] | null
          quiz_completed?: boolean | null
          rating?: number | null
          special_credentials?: string[] | null
          specialization_description?: string | null
          specializations?: string[] | null
          start_timeline?: string | null
          suspended_at?: string | null
          suspended_reason?: string | null
          suspended_until?: string | null
          tagline?: string | null
          terms_agreed?: boolean | null
          terms_version?: string | null
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
          verification_status?: string | null
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
          wow_activities?: Json | null
          wow_activity_assignments?: Json | null
          wow_client_expectations?: string | null
          wow_how_i_work?: string | null
          wow_package_applicability?: Json | null
          wow_setup_completed?: boolean | null
          wow_visibility?: string | null
          wow_what_i_provide?: string | null
          year_certified?: number | null
        }
        Update: {
          account_status?: string | null
          admin_notes?: string | null
          admin_verification_notes?: string | null
          availability_schedule?: Json | null
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
          client_status?: string | null
          client_survey_completed?: boolean | null
          client_survey_completed_at?: string | null
          client_survey_step?: number | null
          coaching_styles?: string[] | null
          communication_restricted?: boolean | null
          communication_restricted_reason?: string | null
          communication_style?: string | null
          consent_marketing?: boolean | null
          consent_service?: boolean | null
          consent_timestamp?: string | null
          consent_version?: string | null
          created_at?: string
          data_retention_until?: string | null
          delivery_format?: string | null
          discovery_call_price?: number | null
          discovery_call_settings?: Json | null
          experience_level?: string | null
          first_name?: string | null
          flexible_scheduling?: boolean | null
          force_password_reset?: boolean | null
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
          last_failed_login_at?: string | null
          last_login_at?: string | null
          last_name?: string | null
          last_verification_request?: string | null
          location?: string | null
          login_attempts?: number | null
          marketing_unsubscribed_at?: string | null
          max_clients?: number | null
          messaging_support?: boolean | null
          onboarding_step?: number | null
          open_to_virtual_coaching?: boolean | null
          package_inclusions?: Json | null
          package_options?: Json | null
          phone?: string | null
          preferred_coaching_style?: string[] | null
          preferred_package_type?: string | null
          preferred_time_slots?: string[] | null
          preferred_training_frequency?: string | null
          pricing_unlock_required?: boolean | null
          primary_goals?: string[] | null
          privacy_policy_version?: string | null
          profile_blocks?: Json | null
          profile_image_position?: Json | null
          profile_photo_url?: string | null
          profile_published?: boolean | null
          profile_setup_completed?: boolean | null
          profile_setup_step?: number | null
          proof_upload_urls?: string[] | null
          qualifications?: string[] | null
          quiz_completed?: boolean | null
          rating?: number | null
          special_credentials?: string[] | null
          specialization_description?: string | null
          specializations?: string[] | null
          start_timeline?: string | null
          suspended_at?: string | null
          suspended_reason?: string | null
          suspended_until?: string | null
          tagline?: string | null
          terms_agreed?: boolean | null
          terms_version?: string | null
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
          verification_status?: string | null
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
          wow_activities?: Json | null
          wow_activity_assignments?: Json | null
          wow_client_expectations?: string | null
          wow_how_i_work?: string | null
          wow_package_applicability?: Json | null
          wow_setup_completed?: boolean | null
          wow_visibility?: string | null
          wow_what_i_provide?: string | null
          year_certified?: number | null
        }
        Relationships: []
      }
      qualification_usage_stats: {
        Row: {
          id: string
          qualification_id: string | null
          qualification_type: string
          selected_at: string
          trainer_id: string
        }
        Insert: {
          id?: string
          qualification_id?: string | null
          qualification_type?: string
          selected_at?: string
          trainer_id: string
        }
        Update: {
          id?: string
          qualification_id?: string | null
          qualification_type?: string
          selected_at?: string
          trainer_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "qualification_usage_stats_qualification_id_fkey"
            columns: ["qualification_id"]
            isOneToOne: false
            referencedRelation: "popular_qualifications"
            referencedColumns: ["id"]
          },
        ]
      }
      specialties: {
        Row: {
          category_id: string | null
          created_at: string
          created_by: string | null
          description: string | null
          display_order: number
          id: string
          is_active: boolean
          matching_keywords: string[] | null
          name: string
          requires_qualification: boolean
          updated_at: string
        }
        Insert: {
          category_id?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          display_order?: number
          id?: string
          is_active?: boolean
          matching_keywords?: string[] | null
          name: string
          requires_qualification?: boolean
          updated_at?: string
        }
        Update: {
          category_id?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          display_order?: number
          id?: string
          is_active?: boolean
          matching_keywords?: string[] | null
          name?: string
          requires_qualification?: boolean
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "specialties_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "specialty_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      specialty_categories: {
        Row: {
          color: string | null
          created_at: string
          created_by: string | null
          description: string | null
          display_order: number
          icon: string | null
          id: string
          is_active: boolean
          name: string
          updated_at: string
        }
        Insert: {
          color?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          display_order?: number
          icon?: string | null
          id?: string
          is_active?: boolean
          name: string
          updated_at?: string
        }
        Update: {
          color?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          display_order?: number
          icon?: string | null
          id?: string
          is_active?: boolean
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      specialty_matching_rules: {
        Row: {
          client_goal_keywords: string[]
          created_at: string
          id: string
          matching_score: number
          popularity_weight: number | null
          specialty_id: string
          updated_at: string
        }
        Insert: {
          client_goal_keywords: string[]
          created_at?: string
          id?: string
          matching_score?: number
          popularity_weight?: number | null
          specialty_id: string
          updated_at?: string
        }
        Update: {
          client_goal_keywords?: string[]
          created_at?: string
          id?: string
          matching_score?: number
          popularity_weight?: number | null
          specialty_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "specialty_matching_rules_specialty_id_fkey"
            columns: ["specialty_id"]
            isOneToOne: false
            referencedRelation: "specialties"
            referencedColumns: ["id"]
          },
        ]
      }
      specialty_qualification_links: {
        Row: {
          created_at: string
          id: string
          matching_weight: number | null
          qualification_id: string
          specialty_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          matching_weight?: number | null
          qualification_id: string
          specialty_id: string
        }
        Update: {
          created_at?: string
          id?: string
          matching_weight?: number | null
          qualification_id?: string
          specialty_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "specialty_qualification_links_qualification_id_fkey"
            columns: ["qualification_id"]
            isOneToOne: false
            referencedRelation: "popular_qualifications"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "specialty_qualification_links_specialty_id_fkey"
            columns: ["specialty_id"]
            isOneToOne: false
            referencedRelation: "specialties"
            referencedColumns: ["id"]
          },
        ]
      }
      specialty_usage_analytics: {
        Row: {
          client_matched_count: number | null
          conversion_rate: number | null
          id: string
          selected_at: string
          specialty_id: string
          trainer_id: string
        }
        Insert: {
          client_matched_count?: number | null
          conversion_rate?: number | null
          id?: string
          selected_at?: string
          specialty_id: string
          trainer_id: string
        }
        Update: {
          client_matched_count?: number | null
          conversion_rate?: number | null
          id?: string
          selected_at?: string
          specialty_id?: string
          trainer_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "specialty_usage_analytics_specialty_id_fkey"
            columns: ["specialty_id"]
            isOneToOne: false
            referencedRelation: "specialties"
            referencedColumns: ["id"]
          },
        ]
      }
      template_activities: {
        Row: {
          activity_id: string
          created_at: string
          id: string
          template_id: string
        }
        Insert: {
          activity_id: string
          created_at?: string
          id?: string
          template_id: string
        }
        Update: {
          activity_id?: string
          created_at?: string
          id?: string
          template_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "template_activities_activity_id_fkey"
            columns: ["activity_id"]
            isOneToOne: false
            referencedRelation: "trainer_onboarding_activities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "template_activities_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "trainer_onboarding_templates"
            referencedColumns: ["id"]
          },
        ]
      }
      template_activity_usage: {
        Row: {
          activity_id: string
          created_at: string | null
          id: string
          last_used_at: string | null
          template_id: string
          updated_at: string | null
          usage_count: number | null
        }
        Insert: {
          activity_id: string
          created_at?: string | null
          id?: string
          last_used_at?: string | null
          template_id: string
          updated_at?: string | null
          usage_count?: number | null
        }
        Update: {
          activity_id?: string
          created_at?: string | null
          id?: string
          last_used_at?: string | null
          template_id?: string
          updated_at?: string | null
          usage_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "template_activity_usage_activity_id_fkey"
            columns: ["activity_id"]
            isOneToOne: false
            referencedRelation: "trainer_onboarding_activities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "template_activity_usage_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "onboarding_templates"
            referencedColumns: ["id"]
          },
        ]
      }
      template_package_links: {
        Row: {
          auto_assign: boolean | null
          created_at: string
          id: string
          package_id: string
          package_name: string
          template_id: string
        }
        Insert: {
          auto_assign?: boolean | null
          created_at?: string
          id?: string
          package_id: string
          package_name: string
          template_id: string
        }
        Update: {
          auto_assign?: boolean | null
          created_at?: string
          id?: string
          package_id?: string
          package_name?: string
          template_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "template_package_links_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "trainer_onboarding_templates"
            referencedColumns: ["id"]
          },
        ]
      }
      trainer_image_preferences: {
        Row: {
          auto_sync_instagram: boolean | null
          created_at: string | null
          id: string
          instagram_sync_frequency: string | null
          last_instagram_sync: string | null
          max_images_per_view: number | null
          trainer_id: string
          updated_at: string | null
        }
        Insert: {
          auto_sync_instagram?: boolean | null
          created_at?: string | null
          id?: string
          instagram_sync_frequency?: string | null
          last_instagram_sync?: string | null
          max_images_per_view?: number | null
          trainer_id: string
          updated_at?: string | null
        }
        Update: {
          auto_sync_instagram?: boolean | null
          created_at?: string | null
          id?: string
          instagram_sync_frequency?: string | null
          last_instagram_sync?: string | null
          max_images_per_view?: number | null
          trainer_id?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      trainer_instagram_selections: {
        Row: {
          caption: string | null
          created_at: string | null
          display_order: number | null
          id: string
          instagram_media_id: string
          is_selected_for_display: boolean | null
          media_type: string
          media_url: string
          synced_at: string | null
          thumbnail_url: string | null
          trainer_id: string
          updated_at: string | null
        }
        Insert: {
          caption?: string | null
          created_at?: string | null
          display_order?: number | null
          id?: string
          instagram_media_id: string
          is_selected_for_display?: boolean | null
          media_type: string
          media_url: string
          synced_at?: string | null
          thumbnail_url?: string | null
          trainer_id: string
          updated_at?: string | null
        }
        Update: {
          caption?: string | null
          created_at?: string | null
          display_order?: number | null
          id?: string
          instagram_media_id?: string
          is_selected_for_display?: boolean | null
          media_type?: string
          media_url?: string
          synced_at?: string | null
          thumbnail_url?: string | null
          trainer_id?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      trainer_membership: {
        Row: {
          created_at: string
          id: string
          is_active: boolean
          monthly_price_cents: number
          plan_type: string
          proration_mode: string
          renewal_date: string
          trainer_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_active?: boolean
          monthly_price_cents?: number
          plan_type?: string
          proration_mode?: string
          renewal_date?: string
          trainer_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          is_active?: boolean
          monthly_price_cents?: number
          plan_type?: string
          proration_mode?: string
          renewal_date?: string
          trainer_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "trainer_membership_trainer_id_fkey"
            columns: ["trainer_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "trainer_membership_trainer_id_fkey"
            columns: ["trainer_id"]
            isOneToOne: true
            referencedRelation: "v_clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "trainer_membership_trainer_id_fkey"
            columns: ["trainer_id"]
            isOneToOne: true
            referencedRelation: "v_trainers"
            referencedColumns: ["id"]
          },
        ]
      }
      trainer_membership_settings: {
        Row: {
          created_at: string
          id: string
          onboarding_fee_kind: string | null
          onboarding_fee_value: number | null
          plan_type: Database["public"]["Enums"]["membership_plan_type_enum"]
          trainer_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          onboarding_fee_kind?: string | null
          onboarding_fee_value?: number | null
          plan_type?: Database["public"]["Enums"]["membership_plan_type_enum"]
          trainer_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          onboarding_fee_kind?: string | null
          onboarding_fee_value?: number | null
          plan_type?: Database["public"]["Enums"]["membership_plan_type_enum"]
          trainer_id?: string
          updated_at?: string
        }
        Relationships: []
      }
      trainer_onboarding_activities: {
        Row: {
          activity_name: string
          activity_type: string | null
          appointment_config: Json | null
          category: string
          completion_method: string
          content_config: Json | null
          created_at: string
          default_due_days: number | null
          default_sla_days: number | null
          description: string | null
          display_order: number
          guidance_html: string | null
          id: string
          instructions: string | null
          is_active: boolean
          is_system: boolean
          requires_file_upload: boolean
          source_package_id: string | null
          source_section: string | null
          source_type: string | null
          survey_config: Json | null
          trainer_id: string | null
          updated_at: string
          upload_config: Json | null
        }
        Insert: {
          activity_name: string
          activity_type?: string | null
          appointment_config?: Json | null
          category?: string
          completion_method?: string
          content_config?: Json | null
          created_at?: string
          default_due_days?: number | null
          default_sla_days?: number | null
          description?: string | null
          display_order?: number
          guidance_html?: string | null
          id?: string
          instructions?: string | null
          is_active?: boolean
          is_system?: boolean
          requires_file_upload?: boolean
          source_package_id?: string | null
          source_section?: string | null
          source_type?: string | null
          survey_config?: Json | null
          trainer_id?: string | null
          updated_at?: string
          upload_config?: Json | null
        }
        Update: {
          activity_name?: string
          activity_type?: string | null
          appointment_config?: Json | null
          category?: string
          completion_method?: string
          content_config?: Json | null
          created_at?: string
          default_due_days?: number | null
          default_sla_days?: number | null
          description?: string | null
          display_order?: number
          guidance_html?: string | null
          id?: string
          instructions?: string | null
          is_active?: boolean
          is_system?: boolean
          requires_file_upload?: boolean
          source_package_id?: string | null
          source_section?: string | null
          source_type?: string | null
          survey_config?: Json | null
          trainer_id?: string | null
          updated_at?: string
          upload_config?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "trainer_onboarding_activities_trainer_id_fkey"
            columns: ["trainer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "trainer_onboarding_activities_trainer_id_fkey"
            columns: ["trainer_id"]
            isOneToOne: false
            referencedRelation: "v_clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "trainer_onboarding_activities_trainer_id_fkey"
            columns: ["trainer_id"]
            isOneToOne: false
            referencedRelation: "v_trainers"
            referencedColumns: ["id"]
          },
        ]
      }
      trainer_onboarding_templates: {
        Row: {
          auto_assign_on_package: boolean | null
          completion_method: string
          created_at: string
          created_from_template_id: string | null
          description: string | null
          display_order: number
          id: string
          instructions: string | null
          is_active: boolean
          is_locked: boolean | null
          last_structural_change_at: string | null
          lock_reason: string | null
          package_links: Json | null
          published_at: string | null
          published_version: number | null
          requires_file_upload: boolean
          status: string | null
          step_name: string
          step_type: string
          trainer_id: string
          updated_at: string
        }
        Insert: {
          auto_assign_on_package?: boolean | null
          completion_method?: string
          created_at?: string
          created_from_template_id?: string | null
          description?: string | null
          display_order?: number
          id?: string
          instructions?: string | null
          is_active?: boolean
          is_locked?: boolean | null
          last_structural_change_at?: string | null
          lock_reason?: string | null
          package_links?: Json | null
          published_at?: string | null
          published_version?: number | null
          requires_file_upload?: boolean
          status?: string | null
          step_name: string
          step_type?: string
          trainer_id: string
          updated_at?: string
        }
        Update: {
          auto_assign_on_package?: boolean | null
          completion_method?: string
          created_at?: string
          created_from_template_id?: string | null
          description?: string | null
          display_order?: number
          id?: string
          instructions?: string | null
          is_active?: boolean
          is_locked?: boolean | null
          last_structural_change_at?: string | null
          lock_reason?: string | null
          package_links?: Json | null
          published_at?: string | null
          published_version?: number | null
          requires_file_upload?: boolean
          status?: string | null
          step_name?: string
          step_type?: string
          trainer_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "trainer_onboarding_templates_created_from_template_id_fkey"
            columns: ["created_from_template_id"]
            isOneToOne: false
            referencedRelation: "trainer_onboarding_templates"
            referencedColumns: ["id"]
          },
        ]
      }
      trainer_profiles: {
        Row: {
          admin_review_notes: string | null
          admin_verification_notes: string | null
          availability_schedule: Json | null
          calendar_link: string | null
          certifying_body: string | null
          client_preferences: string[] | null
          coaching_style: string[] | null
          communication_style: string[] | null
          created_at: string | null
          delivery_format: string[] | null
          discovery_call_price: number | null
          free_discovery_call: boolean | null
          hourly_rate: number | null
          how_started: string | null
          id: string
          ideal_client_personality: string | null
          ideal_client_types: string[] | null
          is_verified: boolean | null
          max_clients: number | null
          messaging_support: boolean | null
          offers_discovery_call: boolean | null
          package_options: Json | null
          philosophy: string | null
          professional_milestones: Json | null
          profile_setup_completed: boolean | null
          qualifications: string[] | null
          rating: number | null
          specializations: string[] | null
          terms_agreed: boolean | null
          testimonials: Json | null
          total_ratings: number | null
          training_types: string[] | null
          updated_at: string | null
          uploaded_certificates: Json | null
          verification_documents: Json | null
          verification_requested_at: string | null
          verification_status: string | null
          video_checkins: boolean | null
          ways_of_working_expectations: string[] | null
          ways_of_working_first_week: string[] | null
          ways_of_working_onboarding: string[] | null
          ways_of_working_ongoing: string[] | null
          ways_of_working_tracking: string[] | null
          ways_of_working_what_i_bring: string[] | null
          weekly_programming_only: boolean | null
          works_bank_holidays: boolean | null
          year_certified: number | null
        }
        Insert: {
          admin_review_notes?: string | null
          admin_verification_notes?: string | null
          availability_schedule?: Json | null
          calendar_link?: string | null
          certifying_body?: string | null
          client_preferences?: string[] | null
          coaching_style?: string[] | null
          communication_style?: string[] | null
          created_at?: string | null
          delivery_format?: string[] | null
          discovery_call_price?: number | null
          free_discovery_call?: boolean | null
          hourly_rate?: number | null
          how_started?: string | null
          id: string
          ideal_client_personality?: string | null
          ideal_client_types?: string[] | null
          is_verified?: boolean | null
          max_clients?: number | null
          messaging_support?: boolean | null
          offers_discovery_call?: boolean | null
          package_options?: Json | null
          philosophy?: string | null
          professional_milestones?: Json | null
          profile_setup_completed?: boolean | null
          qualifications?: string[] | null
          rating?: number | null
          specializations?: string[] | null
          terms_agreed?: boolean | null
          testimonials?: Json | null
          total_ratings?: number | null
          training_types?: string[] | null
          updated_at?: string | null
          uploaded_certificates?: Json | null
          verification_documents?: Json | null
          verification_requested_at?: string | null
          verification_status?: string | null
          video_checkins?: boolean | null
          ways_of_working_expectations?: string[] | null
          ways_of_working_first_week?: string[] | null
          ways_of_working_onboarding?: string[] | null
          ways_of_working_ongoing?: string[] | null
          ways_of_working_tracking?: string[] | null
          ways_of_working_what_i_bring?: string[] | null
          weekly_programming_only?: boolean | null
          works_bank_holidays?: boolean | null
          year_certified?: number | null
        }
        Update: {
          admin_review_notes?: string | null
          admin_verification_notes?: string | null
          availability_schedule?: Json | null
          calendar_link?: string | null
          certifying_body?: string | null
          client_preferences?: string[] | null
          coaching_style?: string[] | null
          communication_style?: string[] | null
          created_at?: string | null
          delivery_format?: string[] | null
          discovery_call_price?: number | null
          free_discovery_call?: boolean | null
          hourly_rate?: number | null
          how_started?: string | null
          id?: string
          ideal_client_personality?: string | null
          ideal_client_types?: string[] | null
          is_verified?: boolean | null
          max_clients?: number | null
          messaging_support?: boolean | null
          offers_discovery_call?: boolean | null
          package_options?: Json | null
          philosophy?: string | null
          professional_milestones?: Json | null
          profile_setup_completed?: boolean | null
          qualifications?: string[] | null
          rating?: number | null
          specializations?: string[] | null
          terms_agreed?: boolean | null
          testimonials?: Json | null
          total_ratings?: number | null
          training_types?: string[] | null
          updated_at?: string | null
          uploaded_certificates?: Json | null
          verification_documents?: Json | null
          verification_requested_at?: string | null
          verification_status?: string | null
          video_checkins?: boolean | null
          ways_of_working_expectations?: string[] | null
          ways_of_working_first_week?: string[] | null
          ways_of_working_onboarding?: string[] | null
          ways_of_working_ongoing?: string[] | null
          ways_of_working_tracking?: string[] | null
          ways_of_working_what_i_bring?: string[] | null
          weekly_programming_only?: boolean | null
          works_bank_holidays?: boolean | null
          year_certified?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "trainer_profiles_id_fkey"
            columns: ["id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "trainer_profiles_id_fkey"
            columns: ["id"]
            isOneToOne: true
            referencedRelation: "v_clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "trainer_profiles_id_fkey"
            columns: ["id"]
            isOneToOne: true
            referencedRelation: "v_trainers"
            referencedColumns: ["id"]
          },
        ]
      }
      trainer_setup_progress: {
        Row: {
          client_id: string
          completed: boolean
          completed_at: string | null
          created_at: string
          id: string
          notes: string | null
          time_spent_minutes: number | null
          trainer_id: string
          trainer_note_id: string
          updated_at: string
        }
        Insert: {
          client_id: string
          completed?: boolean
          completed_at?: string | null
          created_at?: string
          id?: string
          notes?: string | null
          time_spent_minutes?: number | null
          trainer_id: string
          trainer_note_id: string
          updated_at?: string
        }
        Update: {
          client_id?: string
          completed?: boolean
          completed_at?: string | null
          created_at?: string
          id?: string
          notes?: string | null
          time_spent_minutes?: number | null
          trainer_id?: string
          trainer_note_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "trainer_setup_progress_trainer_note_id_fkey"
            columns: ["trainer_note_id"]
            isOneToOne: false
            referencedRelation: "onboarding_trainer_notes"
            referencedColumns: ["id"]
          },
        ]
      }
      trainer_uploaded_images: {
        Row: {
          created_at: string | null
          display_order: number | null
          file_name: string
          file_path: string
          file_size: number | null
          id: string
          is_selected_for_display: boolean | null
          mime_type: string | null
          trainer_id: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          display_order?: number | null
          file_name: string
          file_path: string
          file_size?: number | null
          id?: string
          is_selected_for_display?: boolean | null
          mime_type?: string | null
          trainer_id: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          display_order?: number | null
          file_name?: string
          file_path?: string
          file_size?: number | null
          id?: string
          is_selected_for_display?: boolean | null
          mime_type?: string | null
          trainer_id?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      trainer_verification_audit_log: {
        Row: {
          action: Database["public"]["Enums"]["verification_audit_action"]
          actor: Database["public"]["Enums"]["verification_audit_actor"]
          actor_id: string | null
          check_id: string | null
          created_at: string
          id: string
          metadata: Json | null
          new_status:
            | Database["public"]["Enums"]["verification_check_status"]
            | null
          previous_status:
            | Database["public"]["Enums"]["verification_check_status"]
            | null
          reason: string | null
          trainer_id: string
        }
        Insert: {
          action: Database["public"]["Enums"]["verification_audit_action"]
          actor: Database["public"]["Enums"]["verification_audit_actor"]
          actor_id?: string | null
          check_id?: string | null
          created_at?: string
          id?: string
          metadata?: Json | null
          new_status?:
            | Database["public"]["Enums"]["verification_check_status"]
            | null
          previous_status?:
            | Database["public"]["Enums"]["verification_check_status"]
            | null
          reason?: string | null
          trainer_id: string
        }
        Update: {
          action?: Database["public"]["Enums"]["verification_audit_action"]
          actor?: Database["public"]["Enums"]["verification_audit_actor"]
          actor_id?: string | null
          check_id?: string | null
          created_at?: string
          id?: string
          metadata?: Json | null
          new_status?:
            | Database["public"]["Enums"]["verification_check_status"]
            | null
          previous_status?:
            | Database["public"]["Enums"]["verification_check_status"]
            | null
          reason?: string | null
          trainer_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "trainer_verification_audit_log_actor_id_fkey"
            columns: ["actor_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "trainer_verification_audit_log_actor_id_fkey"
            columns: ["actor_id"]
            isOneToOne: false
            referencedRelation: "v_clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "trainer_verification_audit_log_actor_id_fkey"
            columns: ["actor_id"]
            isOneToOne: false
            referencedRelation: "v_trainers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "trainer_verification_audit_log_check_id_fkey"
            columns: ["check_id"]
            isOneToOne: false
            referencedRelation: "trainer_verification_checks"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "trainer_verification_audit_log_trainer_id_fkey"
            columns: ["trainer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "trainer_verification_audit_log_trainer_id_fkey"
            columns: ["trainer_id"]
            isOneToOne: false
            referencedRelation: "v_clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "trainer_verification_audit_log_trainer_id_fkey"
            columns: ["trainer_id"]
            isOneToOne: false
            referencedRelation: "v_trainers"
            referencedColumns: ["id"]
          },
        ]
      }
      trainer_verification_checks: {
        Row: {
          admin_notes: string | null
          awarding_body: string | null
          certificate_id: string | null
          check_type: Database["public"]["Enums"]["verification_check_type"]
          coverage_amount: number | null
          created_at: string
          draft_status: string | null
          evidence_file_url: string | null
          evidence_metadata: Json | null
          expiry_date: string | null
          id: string
          issue_date: string | null
          level: number | null
          member_id: string | null
          policy_number: string | null
          provider: string | null
          rejection_reason: string | null
          status: Database["public"]["Enums"]["verification_check_status"]
          submitted_at: string | null
          trainer_id: string
          updated_at: string
          verified_at: string | null
          verified_by: string | null
        }
        Insert: {
          admin_notes?: string | null
          awarding_body?: string | null
          certificate_id?: string | null
          check_type: Database["public"]["Enums"]["verification_check_type"]
          coverage_amount?: number | null
          created_at?: string
          draft_status?: string | null
          evidence_file_url?: string | null
          evidence_metadata?: Json | null
          expiry_date?: string | null
          id?: string
          issue_date?: string | null
          level?: number | null
          member_id?: string | null
          policy_number?: string | null
          provider?: string | null
          rejection_reason?: string | null
          status?: Database["public"]["Enums"]["verification_check_status"]
          submitted_at?: string | null
          trainer_id: string
          updated_at?: string
          verified_at?: string | null
          verified_by?: string | null
        }
        Update: {
          admin_notes?: string | null
          awarding_body?: string | null
          certificate_id?: string | null
          check_type?: Database["public"]["Enums"]["verification_check_type"]
          coverage_amount?: number | null
          created_at?: string
          draft_status?: string | null
          evidence_file_url?: string | null
          evidence_metadata?: Json | null
          expiry_date?: string | null
          id?: string
          issue_date?: string | null
          level?: number | null
          member_id?: string | null
          policy_number?: string | null
          provider?: string | null
          rejection_reason?: string | null
          status?: Database["public"]["Enums"]["verification_check_status"]
          submitted_at?: string | null
          trainer_id?: string
          updated_at?: string
          verified_at?: string | null
          verified_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "trainer_verification_checks_trainer_id_fkey"
            columns: ["trainer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "trainer_verification_checks_trainer_id_fkey"
            columns: ["trainer_id"]
            isOneToOne: false
            referencedRelation: "v_clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "trainer_verification_checks_trainer_id_fkey"
            columns: ["trainer_id"]
            isOneToOne: false
            referencedRelation: "v_trainers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "trainer_verification_checks_verified_by_fkey"
            columns: ["verified_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "trainer_verification_checks_verified_by_fkey"
            columns: ["verified_by"]
            isOneToOne: false
            referencedRelation: "v_clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "trainer_verification_checks_verified_by_fkey"
            columns: ["verified_by"]
            isOneToOne: false
            referencedRelation: "v_trainers"
            referencedColumns: ["id"]
          },
        ]
      }
      trainer_verification_overview: {
        Row: {
          created_at: string
          display_preference: Database["public"]["Enums"]["verification_display_preference"]
          id: string
          last_computed_at: string | null
          overall_status: Database["public"]["Enums"]["verification_overall_status"]
          trainer_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          display_preference?: Database["public"]["Enums"]["verification_display_preference"]
          id?: string
          last_computed_at?: string | null
          overall_status?: Database["public"]["Enums"]["verification_overall_status"]
          trainer_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          display_preference?: Database["public"]["Enums"]["verification_display_preference"]
          id?: string
          last_computed_at?: string | null
          overall_status?: Database["public"]["Enums"]["verification_overall_status"]
          trainer_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "trainer_verification_overview_trainer_id_fkey"
            columns: ["trainer_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "trainer_verification_overview_trainer_id_fkey"
            columns: ["trainer_id"]
            isOneToOne: true
            referencedRelation: "v_clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "trainer_verification_overview_trainer_id_fkey"
            columns: ["trainer_id"]
            isOneToOne: true
            referencedRelation: "v_trainers"
            referencedColumns: ["id"]
          },
        ]
      }
      trainer_verification_requests: {
        Row: {
          admin_notes: string | null
          certificate_number: string | null
          created_at: string
          documents_provided: Json
          evidence_metadata: Json | null
          expiry_date: string | null
          id: string
          provider_name: string | null
          rejection_reason: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          status: Database["public"]["Enums"]["verification_request_status"]
          submission_notes: string | null
          submitted_at: string
          trainer_id: string
          updated_at: string
        }
        Insert: {
          admin_notes?: string | null
          certificate_number?: string | null
          created_at?: string
          documents_provided?: Json
          evidence_metadata?: Json | null
          expiry_date?: string | null
          id?: string
          provider_name?: string | null
          rejection_reason?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: Database["public"]["Enums"]["verification_request_status"]
          submission_notes?: string | null
          submitted_at?: string
          trainer_id: string
          updated_at?: string
        }
        Update: {
          admin_notes?: string | null
          certificate_number?: string | null
          created_at?: string
          documents_provided?: Json
          evidence_metadata?: Json | null
          expiry_date?: string | null
          id?: string
          provider_name?: string | null
          rejection_reason?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: Database["public"]["Enums"]["verification_request_status"]
          submission_notes?: string | null
          submitted_at?: string
          trainer_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "trainer_verification_requests_reviewed_by_fkey"
            columns: ["reviewed_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "trainer_verification_requests_reviewed_by_fkey"
            columns: ["reviewed_by"]
            isOneToOne: false
            referencedRelation: "v_clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "trainer_verification_requests_reviewed_by_fkey"
            columns: ["reviewed_by"]
            isOneToOne: false
            referencedRelation: "v_trainers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "trainer_verification_requests_trainer_id_fkey"
            columns: ["trainer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "trainer_verification_requests_trainer_id_fkey"
            columns: ["trainer_id"]
            isOneToOne: false
            referencedRelation: "v_clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "trainer_verification_requests_trainer_id_fkey"
            columns: ["trainer_id"]
            isOneToOne: false
            referencedRelation: "v_trainers"
            referencedColumns: ["id"]
          },
        ]
      }
      trainer_visibility_settings: {
        Row: {
          content_type: Database["public"]["Enums"]["content_type"]
          created_at: string | null
          engagement_stage: Database["public"]["Enums"]["engagement_stage"]
          id: string
          trainer_id: string
          updated_at: string | null
          visibility_state: Database["public"]["Enums"]["visibility_state"]
        }
        Insert: {
          content_type: Database["public"]["Enums"]["content_type"]
          created_at?: string | null
          engagement_stage: Database["public"]["Enums"]["engagement_stage"]
          id?: string
          trainer_id: string
          updated_at?: string | null
          visibility_state?: Database["public"]["Enums"]["visibility_state"]
        }
        Update: {
          content_type?: Database["public"]["Enums"]["content_type"]
          created_at?: string | null
          engagement_stage?: Database["public"]["Enums"]["engagement_stage"]
          id?: string
          trainer_id?: string
          updated_at?: string | null
          visibility_state?: Database["public"]["Enums"]["visibility_state"]
        }
        Relationships: [
          {
            foreignKeyName: "trainer_visibility_settings_trainer_id_fkey"
            columns: ["trainer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "trainer_visibility_settings_trainer_id_fkey"
            columns: ["trainer_id"]
            isOneToOne: false
            referencedRelation: "v_clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "trainer_visibility_settings_trainer_id_fkey"
            columns: ["trainer_id"]
            isOneToOne: false
            referencedRelation: "v_trainers"
            referencedColumns: ["id"]
          },
        ]
      }
      training_type_usage_analytics: {
        Row: {
          client_matched_count: number | null
          conversion_rate: number | null
          id: string
          selected_at: string
          trainer_id: string
          training_type_id: string
        }
        Insert: {
          client_matched_count?: number | null
          conversion_rate?: number | null
          id?: string
          selected_at?: string
          trainer_id: string
          training_type_id: string
        }
        Update: {
          client_matched_count?: number | null
          conversion_rate?: number | null
          id?: string
          selected_at?: string
          trainer_id?: string
          training_type_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "training_type_usage_analytics_training_type_id_fkey"
            columns: ["training_type_id"]
            isOneToOne: false
            referencedRelation: "training_types"
            referencedColumns: ["id"]
          },
        ]
      }
      training_types: {
        Row: {
          created_at: string
          created_by: string | null
          delivery_formats: string[] | null
          description: string | null
          display_order: number
          id: string
          is_active: boolean
          max_participants: number | null
          min_participants: number | null
          name: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          delivery_formats?: string[] | null
          description?: string | null
          display_order?: number
          id?: string
          is_active?: boolean
          max_participants?: number | null
          min_participants?: number | null
          name: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          delivery_formats?: string[] | null
          description?: string | null
          display_order?: number
          id?: string
          is_active?: boolean
          max_participants?: number | null
          min_participants?: number | null
          name?: string
          updated_at?: string
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
      user_roles: {
        Row: {
          created_at: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      waitlist_exclusive_periods: {
        Row: {
          coach_id: string
          correlation_id: string | null
          created_at: string
          expires_at: string
          id: string
          is_active: boolean
          started_at: string
          updated_at: string
        }
        Insert: {
          coach_id: string
          correlation_id?: string | null
          created_at?: string
          expires_at: string
          id?: string
          is_active?: boolean
          started_at?: string
          updated_at?: string
        }
        Update: {
          coach_id?: string
          correlation_id?: string | null
          created_at?: string
          expires_at?: string
          id?: string
          is_active?: boolean
          started_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      waitlist_interactions: {
        Row: {
          completed_at: string | null
          created_at: string
          created_by: string | null
          id: string
          interaction_type: string
          message: string | null
          scheduled_for: string | null
          waitlist_id: string
        }
        Insert: {
          completed_at?: string | null
          created_at?: string
          created_by?: string | null
          id?: string
          interaction_type: string
          message?: string | null
          scheduled_for?: string | null
          waitlist_id: string
        }
        Update: {
          completed_at?: string | null
          created_at?: string
          created_by?: string | null
          id?: string
          interaction_type?: string
          message?: string | null
          scheduled_for?: string | null
          waitlist_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "waitlist_interactions_waitlist_id_fkey"
            columns: ["waitlist_id"]
            isOneToOne: false
            referencedRelation: "coach_waitlists"
            referencedColumns: ["id"]
          },
        ]
      }
      webhook_events: {
        Row: {
          correlation_id: string
          created_at: string
          event_type: string
          id: string
          last_processing_error: string | null
          metadata: Json | null
          processed_at: string | null
          processing_attempts: number | null
          processing_status: string
          provider_event_id: string
          provider_name: string
          raw_payload: Json
          updated_at: string
          webhook_signature: string | null
        }
        Insert: {
          correlation_id?: string
          created_at?: string
          event_type: string
          id?: string
          last_processing_error?: string | null
          metadata?: Json | null
          processed_at?: string | null
          processing_attempts?: number | null
          processing_status?: string
          provider_event_id: string
          provider_name: string
          raw_payload: Json
          updated_at?: string
          webhook_signature?: string | null
        }
        Update: {
          correlation_id?: string
          created_at?: string
          event_type?: string
          id?: string
          last_processing_error?: string | null
          metadata?: Json | null
          processed_at?: string | null
          processing_attempts?: number | null
          processing_status?: string
          provider_event_id?: string
          provider_name?: string
          raw_payload?: Json
          updated_at?: string
          webhook_signature?: string | null
        }
        Relationships: []
      }
      weekly_cycles: {
        Row: {
          avg_execution_score: number | null
          completed_goals_count: number | null
          created_at: string
          current_week: number | null
          description: string | null
          end_date: string
          id: string
          is_active: boolean | null
          is_completed: boolean | null
          start_date: string
          title: string
          total_goals_count: number | null
          trainer_id: string
          updated_at: string
        }
        Insert: {
          avg_execution_score?: number | null
          completed_goals_count?: number | null
          created_at?: string
          current_week?: number | null
          description?: string | null
          end_date: string
          id?: string
          is_active?: boolean | null
          is_completed?: boolean | null
          start_date: string
          title: string
          total_goals_count?: number | null
          trainer_id: string
          updated_at?: string
        }
        Update: {
          avg_execution_score?: number | null
          completed_goals_count?: number | null
          created_at?: string
          current_week?: number | null
          description?: string | null
          end_date?: string
          id?: string
          is_active?: boolean | null
          is_completed?: boolean | null
          start_date?: string
          title?: string
          total_goals_count?: number | null
          trainer_id?: string
          updated_at?: string
        }
        Relationships: []
      }
      weekly_execution_scores: {
        Row: {
          completed_cts: number | null
          completed_weight: number | null
          created_at: string
          cycle_id: string | null
          execution_score: number
          id: string
          review_completed: boolean | null
          review_notes: string | null
          total_cts: number | null
          total_weight: number | null
          trainer_id: string
          updated_at: string
          week_end: string
          week_number: number | null
          week_start: string
        }
        Insert: {
          completed_cts?: number | null
          completed_weight?: number | null
          created_at?: string
          cycle_id?: string | null
          execution_score?: number
          id?: string
          review_completed?: boolean | null
          review_notes?: string | null
          total_cts?: number | null
          total_weight?: number | null
          trainer_id: string
          updated_at?: string
          week_end: string
          week_number?: number | null
          week_start: string
        }
        Update: {
          completed_cts?: number | null
          completed_weight?: number | null
          created_at?: string
          cycle_id?: string | null
          execution_score?: number
          id?: string
          review_completed?: boolean | null
          review_notes?: string | null
          total_cts?: number | null
          total_weight?: number | null
          trainer_id?: string
          updated_at?: string
          week_end?: string
          week_number?: number | null
          week_start?: string
        }
        Relationships: [
          {
            foreignKeyName: "weekly_execution_scores_cycle_id_fkey"
            columns: ["cycle_id"]
            isOneToOne: false
            referencedRelation: "weekly_cycles"
            referencedColumns: ["id"]
          },
        ]
      }
      weekly_reviews: {
        Row: {
          carry_forward_notes: string | null
          challenges: string | null
          created_at: string
          id: string
          learnings: string | null
          next_week_focus: string | null
          trainer_id: string
          updated_at: string
          week_score_id: string
          wins: string | null
        }
        Insert: {
          carry_forward_notes?: string | null
          challenges?: string | null
          created_at?: string
          id?: string
          learnings?: string | null
          next_week_focus?: string | null
          trainer_id: string
          updated_at?: string
          week_score_id: string
          wins?: string | null
        }
        Update: {
          carry_forward_notes?: string | null
          challenges?: string | null
          created_at?: string
          id?: string
          learnings?: string | null
          next_week_focus?: string | null
          trainer_id?: string
          updated_at?: string
          week_score_id?: string
          wins?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "weekly_reviews_week_score_id_fkey"
            columns: ["week_score_id"]
            isOneToOne: false
            referencedRelation: "weekly_execution_scores"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      v_clients: {
        Row: {
          bio: string | null
          budget_flexibility: string | null
          budget_range_max: number | null
          budget_range_min: number | null
          client_journey_stage: string | null
          client_personality_type: string[] | null
          client_profile_created_at: string | null
          client_profile_updated_at: string | null
          client_status: string | null
          client_survey_completed: boolean | null
          client_survey_completed_at: string | null
          experience_level: string | null
          first_name: string | null
          fitness_goals: string[] | null
          flexible_scheduling: boolean | null
          id: string | null
          is_uk_based: boolean | null
          journey_progress: Json | null
          last_name: string | null
          location: string | null
          motivation_factors: string[] | null
          open_to_virtual_coaching: boolean | null
          preferred_coaching_style: string[] | null
          preferred_package_type: string | null
          preferred_time_slots: string[] | null
          preferred_training_frequency: string | null
          primary_goals: string[] | null
          profile_created_at: string | null
          profile_photo_url: string | null
          profile_published: boolean | null
          profile_updated_at: string | null
          quiz_answers: Json | null
          quiz_completed: boolean | null
          quiz_completed_at: string | null
          secondary_goals: string[] | null
          start_timeline: string | null
          tagline: string | null
          training_location_preference: string | null
          user_type: Database["public"]["Enums"]["user_type"] | null
          waitlist_preference: boolean | null
        }
        Relationships: []
      }
      v_trainers: {
        Row: {
          admin_verification_notes: string | null
          availability_schedule: Json | null
          bio: string | null
          calendar_link: string | null
          certifying_body: string | null
          client_preferences: string[] | null
          coaching_style: string[] | null
          communication_style: string[] | null
          created_at: string | null
          delivery_format: string[] | null
          discovery_call_price: number | null
          first_name: string | null
          free_discovery_call: boolean | null
          hourly_rate: number | null
          how_started: string | null
          id: string | null
          ideal_client_personality: string | null
          ideal_client_types: string[] | null
          is_uk_based: boolean | null
          is_verified: boolean | null
          last_name: string | null
          location: string | null
          max_clients: number | null
          messaging_support: boolean | null
          offers_discovery_call: boolean | null
          package_options: Json | null
          philosophy: string | null
          professional_milestones: Json | null
          profile_image_position: Json | null
          profile_photo_url: string | null
          profile_published: boolean | null
          profile_setup_completed: boolean | null
          qualifications: string[] | null
          rating: number | null
          specializations: string[] | null
          tagline: string | null
          terms_agreed: boolean | null
          testimonials: Json | null
          total_ratings: number | null
          training_types: string[] | null
          updated_at: string | null
          uploaded_certificates: Json | null
          verification_documents: Json | null
          verification_requested_at: string | null
          verification_status: string | null
          video_checkins: boolean | null
          ways_of_working_expectations: string[] | null
          ways_of_working_first_week: string[] | null
          ways_of_working_onboarding: string[] | null
          ways_of_working_ongoing: string[] | null
          ways_of_working_tracking: string[] | null
          ways_of_working_what_i_bring: string[] | null
          weekly_programming_only: boolean | null
          works_bank_holidays: boolean | null
          wow_activities: Json | null
          wow_activity_assignments: Json | null
          wow_client_expectations: string | null
          wow_how_i_work: string | null
          wow_setup_completed: boolean | null
          wow_visibility: string | null
          wow_what_i_provide: string | null
          year_certified: number | null
        }
        Relationships: []
      }
    }
    Functions: {
      admin_cleanup_client_trainer_interactions: {
        Args: { p_client_id: string; p_trainer_id: string }
        Returns: Json
      }
      admin_delete_user_completely: {
        Args: { p_user_id: string }
        Returns: Json
      }
      admin_update_verification_check: {
        Args: {
          p_admin_notes?: string
          p_check_type: Database["public"]["Enums"]["verification_check_type"]
          p_rejection_reason?: string
          p_status: Database["public"]["Enums"]["verification_check_status"]
          p_trainer_id: string
        }
        Returns: string
      }
      auto_end_expired_exclusive_periods: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      calculate_business_due_date: {
        Args: { business_days: number; start_date: string }
        Returns: string
      }
      calculate_execution_score: {
        Args: { p_trainer_id: string; p_week_start: string }
        Returns: number
      }
      calculate_package_commission: {
        Args: { p_package_price_cents: number; p_trainer_id: string }
        Returns: number
      }
      can_send_marketing_message: {
        Args: { p_user_id: string }
        Returns: boolean
      }
      carry_forward_incomplete_cts: {
        Args: {
          p_from_week_start: string
          p_to_week_start?: string
          p_trainer_id: string
        }
        Returns: number
      }
      check_verification_expiry: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      client_has_sent_first_message: {
        Args: { client_uuid: string; conversation_uuid: string }
        Returns: boolean
      }
      client_has_waitlist_exclusive_access: {
        Args: { p_client_id: string; p_coach_id: string }
        Returns: boolean
      }
      complete_coach_selection_payment: {
        Args:
          | {
              p_client_id: string
              p_payment_method?: string
              p_stripe_payment_intent_id?: string
              p_trainer_id: string
            }
          | {
              p_client_id: string
              p_payment_method?: string
              p_trainer_id: string
            }
        Returns: Json
      }
      complete_webhook_event: {
        Args: { p_event_id: string; p_result?: Json }
        Returns: undefined
      }
      compute_trainer_verification_status: {
        Args: { p_trainer_id: string }
        Returns: Database["public"]["Enums"]["verification_overall_status"]
      }
      create_coach_selection_request: {
        Args: {
          p_client_message?: string
          p_package_duration: string
          p_package_id: string
          p_package_name: string
          p_package_price: number
          p_trainer_id: string
        }
        Returns: string
      }
      create_consent_snapshot: {
        Args: { p_user_id: string }
        Returns: Json
      }
      create_template_version: {
        Args: { p_changelog?: string; p_template_id: string }
        Returns: string
      }
      end_waitlist_exclusive_period: {
        Args: { p_coach_id: string }
        Returns: undefined
      }
      evaluate_conditional_step: {
        Args: {
          p_client_data?: Json
          p_client_id: string
          p_step_id: string
          p_template_id: string
        }
        Returns: boolean
      }
      fail_webhook_event: {
        Args: { p_error_message: string; p_event_id: string }
        Returns: undefined
      }
      fix_client_lou_status: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      get_activity_recommendations_for_template: {
        Args: { p_package_ids?: string[]; p_trainer_id: string }
        Returns: {
          activity_id: string
          activity_name: string
          category: string
          source_packages: string[]
          usage_count: number
        }[]
      }
      get_client_journey_stage: {
        Args: { p_client_id: string }
        Returns: Database["public"]["Enums"]["engagement_stage"]
      }
      get_client_status: {
        Args: { p_client_id: string }
        Returns: string
      }
      get_content_visibility: {
        Args: {
          p_content_type: Database["public"]["Enums"]["content_type"]
          p_engagement_stage: Database["public"]["Enums"]["engagement_stage"]
          p_trainer_id: string
        }
        Returns: Database["public"]["Enums"]["visibility_state"]
      }
      get_current_user_type: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      get_engagement_stage: {
        Args: { client_uuid: string; trainer_uuid: string }
        Returns: Database["public"]["Enums"]["engagement_stage"]
      }
      get_secure_profile_data: {
        Args: { p_user_id?: string }
        Returns: {
          email: string
          first_name: string
          id: string
          last_name: string
          user_type: string
        }[]
      }
      get_trainer_membership_details: {
        Args: { p_trainer_id: string }
        Returns: {
          fee_preview_text: string
          fee_type: string
          fee_value_flat_cents: number
          fee_value_percent: number
          is_active: boolean
          membership_id: string
          monthly_price_cents: number
          plan_type: string
          proration_mode: string
          renewal_date: string
        }[]
      }
      get_trainer_streak_count: {
        Args: { trainer_uuid: string }
        Returns: number
      }
      get_user_emails_for_admin: {
        Args: Record<PropertyKey, never>
        Returns: {
          email: string
          user_id: string
        }[]
      }
      get_user_emails_for_development: {
        Args: Record<PropertyKey, never>
        Returns: {
          email: string
          user_id: string
        }[]
      }
      get_user_roles: {
        Args: { _user_id: string }
        Returns: {
          role: Database["public"]["Enums"]["app_role"]
        }[]
      }
      get_week_end: {
        Args: { input_date: string }
        Returns: string
      }
      get_week_start: {
        Args: { input_date: string }
        Returns: string
      }
      grant_admin_role: {
        Args: { _user_id: string }
        Returns: undefined
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      import_activities_from_ways_of_working: {
        Args: { p_trainer_id?: string }
        Returns: number
      }
      initialize_client_onboarding: {
        Args: { p_client_id: string; p_trainer_id: string }
        Returns: undefined
      }
      initialize_client_onboarding_from_ways_of_working: {
        Args: {
          p_client_id: string
          p_package_id?: string
          p_trainer_id: string
        }
        Returns: undefined
      }
      initialize_trainer_visibility_defaults: {
        Args: { p_trainer_id: string }
        Returns: undefined
      }
      is_client_on_waitlist: {
        Args: { p_client_id: string; p_trainer_id: string }
        Returns: boolean
      }
      list_users_minimal_admin: {
        Args: Record<PropertyKey, never>
        Returns: {
          email: string
          first_name: string
          id: string
          last_name: string
          roles: string[]
          user_type: string
        }[]
      }
      log_admin_action: {
        Args: {
          p_action_details?: Json
          p_action_type: string
          p_reason?: string
          p_target_user_id: string
        }
        Returns: undefined
      }
      process_webhook_event: {
        Args: {
          p_event_type: string
          p_provider_event_id: string
          p_provider_name: string
          p_raw_payload: Json
          p_webhook_signature: string
        }
        Returns: Json
      }
      reactivate_user: {
        Args: { p_reason?: string; p_user_id: string }
        Returns: undefined
      }
      reorder_feedback_questions: {
        Args: { question_ids: string[] }
        Returns: undefined
      }
      request_profile_verification: {
        Args: { trainer_id: string }
        Returns: boolean
      }
      request_trainer_verification: {
        Args: { p_documents?: Json }
        Returns: string
      }
      restrict_communication: {
        Args: { p_reason: string; p_user_id: string }
        Returns: undefined
      }
      revert_waitlist_client_conversion: {
        Args: { p_client_id: string; p_trainer_id: string }
        Returns: boolean
      }
      start_waitlist_exclusive_period: {
        Args: { p_coach_id: string; p_duration_hours?: number }
        Returns: string
      }
      start_workflow: {
        Args: {
          p_correlation_id?: string
          p_initial_state?: Json
          p_total_steps?: number
          p_workflow_type: string
        }
        Returns: string
      }
      suspend_user: {
        Args: { p_duration_days?: number; p_reason: string; p_user_id: string }
        Returns: undefined
      }
      sync_ways_of_working_to_activities: {
        Args: {
          p_items: Json
          p_package_id: string
          p_section: string
          p_trainer_id: string
        }
        Returns: Json
      }
      update_admin_notes: {
        Args: { p_notes: string; p_user_id: string }
        Returns: undefined
      }
      update_all_user_passwords_dev: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      update_all_user_passwords_dev_simple: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      update_engagement_stage: {
        Args: {
          client_uuid: string
          new_stage: Database["public"]["Enums"]["engagement_stage"]
          trainer_uuid: string
        }
        Returns: undefined
      }
      update_template_analytics: {
        Args: {
          p_increment?: number
          p_metric_data?: Json
          p_metric_type: string
          p_template_id: string
        }
        Returns: undefined
      }
      update_trainer_verification_status: {
        Args:
          | {
              p_admin_notes?: string
              p_rejection_reason?: string
              p_status: Database["public"]["Enums"]["verification_status_enum"]
              p_trainer_id: string
            }
          | { p_trainer_id: string }
        Returns: undefined
      }
      update_user_email_for_admin: {
        Args: { new_email: string; target_user_id: string }
        Returns: boolean
      }
      update_workflow_progress: {
        Args: {
          p_correlation_id: string
          p_current_step: string
          p_state_data?: Json
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "trainer" | "client"
      approval_status_enum:
        | "pending"
        | "approved"
        | "rejected"
        | "auto_approved"
      client_status:
        | "onboarding"
        | "survey_completed"
        | "browsing"
        | "shortlisted"
        | "discovery_booked"
        | "decision_pending"
        | "coach_selected"
      client_status_enum: "open" | "waitlist" | "paused"
      coach_availability_status: "accepting" | "waitlist" | "unavailable"
      content_type:
        | "profile_image"
        | "before_after_images"
        | "package_images"
        | "testimonial_images"
        | "certification_images"
        | "gallery_images"
      ct_status: "to_do" | "doing" | "done" | "skipped" | "deferred"
      ct_type:
        | "outreach"
        | "check_in"
        | "content"
        | "admin"
        | "learning"
        | "sales"
        | "delivery"
      customer_payment_mode_enum: "upfront" | "installments"
      discovery_call_status:
        | "scheduled"
        | "completed"
        | "cancelled"
        | "rescheduled"
      engagement_stage:
        | "browsing"
        | "liked"
        | "matched"
        | "discovery_completed"
        | "active_client"
        | "shortlisted"
        | "getting_to_know_your_coach"
        | "discovery_in_progress"
        | "unmatched"
        | "declined"
        | "declined_dismissed"
        | "waitlist"
        | "agreed"
        | "payment_pending"
        | "preferences_identified"
        | "exploring_coaches"
        | "discovery_scheduled"
        | "coach_chosen"
        | "onboarding_in_progress"
        | "goal_achieved"
        | "relationship_ended"
      goal_status:
        | "not_started"
        | "in_progress"
        | "on_track"
        | "at_risk"
        | "completed"
        | "cancelled"
      goal_timeframe: "weekly" | "monthly" | "quarterly" | "yearly"
      goal_type:
        | "coaching"
        | "sales"
        | "program"
        | "content"
        | "ops"
        | "learning"
      kb_article_status: "draft" | "published" | "archived" | "staging"
      kb_content_type:
        | "feature"
        | "api"
        | "component"
        | "hook"
        | "database"
        | "business_rule"
        | "integration"
      membership_plan_type_enum:
        | "low_sub_with_onboarding"
        | "high_sub_no_onboarding"
      onboarding_visibility: "client" | "trainer" | "shared"
      payout_frequency_enum: "weekly" | "monthly"
      user_type: "client" | "trainer" | "admin"
      verification_audit_action:
        | "upload"
        | "verify"
        | "reject"
        | "delete"
        | "toggle_preference"
        | "expire"
      verification_audit_actor: "admin" | "trainer" | "system"
      verification_check_status: "pending" | "verified" | "rejected" | "expired"
      verification_check_type:
        | "cimspa_membership"
        | "insurance_proof"
        | "first_aid_certification"
        | "qualifications"
        | "identity_match"
      verification_display_preference: "verified_allowed" | "hidden"
      verification_overall_status: "verified" | "not_shown" | "expired"
      verification_request_status:
        | "pending"
        | "under_review"
        | "approved"
        | "rejected"
        | "resubmitted"
      verification_status_enum: "pending" | "verified" | "rejected"
      visibility_state: "hidden" | "blurred" | "visible"
      waitlist_status: "active" | "contacted" | "converted" | "archived"
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
      app_role: ["admin", "trainer", "client"],
      approval_status_enum: [
        "pending",
        "approved",
        "rejected",
        "auto_approved",
      ],
      client_status: [
        "onboarding",
        "survey_completed",
        "browsing",
        "shortlisted",
        "discovery_booked",
        "decision_pending",
        "coach_selected",
      ],
      client_status_enum: ["open", "waitlist", "paused"],
      coach_availability_status: ["accepting", "waitlist", "unavailable"],
      content_type: [
        "profile_image",
        "before_after_images",
        "package_images",
        "testimonial_images",
        "certification_images",
        "gallery_images",
      ],
      ct_status: ["to_do", "doing", "done", "skipped", "deferred"],
      ct_type: [
        "outreach",
        "check_in",
        "content",
        "admin",
        "learning",
        "sales",
        "delivery",
      ],
      customer_payment_mode_enum: ["upfront", "installments"],
      discovery_call_status: [
        "scheduled",
        "completed",
        "cancelled",
        "rescheduled",
      ],
      engagement_stage: [
        "browsing",
        "liked",
        "matched",
        "discovery_completed",
        "active_client",
        "shortlisted",
        "getting_to_know_your_coach",
        "discovery_in_progress",
        "unmatched",
        "declined",
        "declined_dismissed",
        "waitlist",
        "agreed",
        "payment_pending",
        "preferences_identified",
        "exploring_coaches",
        "discovery_scheduled",
        "coach_chosen",
        "onboarding_in_progress",
        "goal_achieved",
        "relationship_ended",
      ],
      goal_status: [
        "not_started",
        "in_progress",
        "on_track",
        "at_risk",
        "completed",
        "cancelled",
      ],
      goal_timeframe: ["weekly", "monthly", "quarterly", "yearly"],
      goal_type: ["coaching", "sales", "program", "content", "ops", "learning"],
      kb_article_status: ["draft", "published", "archived", "staging"],
      kb_content_type: [
        "feature",
        "api",
        "component",
        "hook",
        "database",
        "business_rule",
        "integration",
      ],
      membership_plan_type_enum: [
        "low_sub_with_onboarding",
        "high_sub_no_onboarding",
      ],
      onboarding_visibility: ["client", "trainer", "shared"],
      payout_frequency_enum: ["weekly", "monthly"],
      user_type: ["client", "trainer", "admin"],
      verification_audit_action: [
        "upload",
        "verify",
        "reject",
        "delete",
        "toggle_preference",
        "expire",
      ],
      verification_audit_actor: ["admin", "trainer", "system"],
      verification_check_status: ["pending", "verified", "rejected", "expired"],
      verification_check_type: [
        "cimspa_membership",
        "insurance_proof",
        "first_aid_certification",
        "qualifications",
        "identity_match",
      ],
      verification_display_preference: ["verified_allowed", "hidden"],
      verification_overall_status: ["verified", "not_shown", "expired"],
      verification_request_status: [
        "pending",
        "under_review",
        "approved",
        "rejected",
        "resubmitted",
      ],
      verification_status_enum: ["pending", "verified", "rejected"],
      visibility_state: ["hidden", "blurred", "visible"],
      waitlist_status: ["active", "contacted", "converted", "archived"],
    },
  },
} as const
