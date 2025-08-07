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
            foreignKeyName: "admin_actions_log_target_user_id_fkey"
            columns: ["target_user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
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
          availability_status: Database["public"]["Enums"]["coach_availability_status"]
          coach_id: string
          created_at: string
          id: string
          next_available_date: string | null
          updated_at: string
          waitlist_message: string | null
        }
        Insert: {
          allow_discovery_calls_on_waitlist?: boolean
          auto_follow_up_days?: number
          availability_status?: Database["public"]["Enums"]["coach_availability_status"]
          coach_id: string
          created_at?: string
          id?: string
          next_available_date?: string | null
          updated_at?: string
          waitlist_message?: string | null
        }
        Update: {
          allow_discovery_calls_on_waitlist?: boolean
          auto_follow_up_days?: number
          availability_status?: Database["public"]["Enums"]["coach_availability_status"]
          coach_id?: string
          created_at?: string
          id?: string
          next_available_date?: string | null
          updated_at?: string
          waitlist_message?: string | null
        }
        Relationships: []
      }
      coach_selection_requests: {
        Row: {
          client_id: string
          client_message: string | null
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
          created_at: string
          discovery_call_id: string
          id: string
          notification_type: string
          scheduled_for: string
          sent_at: string | null
        }
        Insert: {
          client_id: string
          created_at?: string
          discovery_call_id: string
          id?: string
          notification_type: string
          scheduled_for: string
          sent_at?: string | null
        }
        Update: {
          client_id?: string
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
      discovery_calls: {
        Row: {
          booking_notes: string | null
          calendar_event_id: string | null
          cancellation_reason: string | null
          client_id: string
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
            foreignKeyName: "discovery_calls_trainer_id_fkey"
            columns: ["trainer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
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
        ]
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
          account_status: string | null
          admin_notes: string | null
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
          client_status: Database["public"]["Enums"]["client_status"] | null
          client_survey_completed: boolean | null
          client_survey_completed_at: string | null
          client_survey_step: number | null
          coaching_styles: string[] | null
          communication_restricted: boolean | null
          communication_restricted_reason: string | null
          communication_style: string | null
          created_at: string
          delivery_format: string | null
          discovery_call_price: number | null
          experience_level: string | null
          first_name: string | null
          fitness_goals: string[] | null
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
          suspended_at: string | null
          suspended_reason: string | null
          suspended_until: string | null
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
          account_status?: string | null
          admin_notes?: string | null
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
          client_status?: Database["public"]["Enums"]["client_status"] | null
          client_survey_completed?: boolean | null
          client_survey_completed_at?: string | null
          client_survey_step?: number | null
          coaching_styles?: string[] | null
          communication_restricted?: boolean | null
          communication_restricted_reason?: string | null
          communication_style?: string | null
          created_at?: string
          delivery_format?: string | null
          discovery_call_price?: number | null
          experience_level?: string | null
          first_name?: string | null
          fitness_goals?: string[] | null
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
          suspended_at?: string | null
          suspended_reason?: string | null
          suspended_until?: string | null
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
          account_status?: string | null
          admin_notes?: string | null
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
          client_status?: Database["public"]["Enums"]["client_status"] | null
          client_survey_completed?: boolean | null
          client_survey_completed_at?: string | null
          client_survey_step?: number | null
          coaching_styles?: string[] | null
          communication_restricted?: boolean | null
          communication_restricted_reason?: string | null
          communication_style?: string | null
          created_at?: string
          delivery_format?: string | null
          discovery_call_price?: number | null
          experience_level?: string | null
          first_name?: string | null
          fitness_goals?: string[] | null
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
          suspended_at?: string | null
          suspended_reason?: string | null
          suspended_until?: string | null
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
      trainer_availability_settings: {
        Row: {
          availability_schedule: Json
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
          availability_schedule?: Json
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
          availability_schedule?: Json
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
        ]
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
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      client_has_sent_first_message: {
        Args: { conversation_uuid: string; client_uuid: string }
        Returns: boolean
      }
      create_coach_selection_request: {
        Args: {
          p_trainer_id: string
          p_package_id: string
          p_package_name: string
          p_package_price: number
          p_package_duration: string
          p_client_message?: string
        }
        Returns: string
      }
      get_content_visibility: {
        Args: {
          p_trainer_id: string
          p_content_type: Database["public"]["Enums"]["content_type"]
          p_engagement_stage: Database["public"]["Enums"]["engagement_stage"]
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
      get_user_emails_for_admin: {
        Args: Record<PropertyKey, never>
        Returns: {
          user_id: string
          email: string
        }[]
      }
      get_user_emails_for_development: {
        Args: Record<PropertyKey, never>
        Returns: {
          user_id: string
          email: string
        }[]
      }
      get_user_roles: {
        Args: { _user_id: string }
        Returns: {
          role: Database["public"]["Enums"]["app_role"]
        }[]
      }
      grant_admin_role: {
        Args: { _user_id: string }
        Returns: undefined
      }
      has_role: {
        Args: {
          _user_id: string
          _role: Database["public"]["Enums"]["app_role"]
        }
        Returns: boolean
      }
      initialize_trainer_visibility_defaults: {
        Args: { p_trainer_id: string }
        Returns: undefined
      }
      log_admin_action: {
        Args: {
          p_target_user_id: string
          p_action_type: string
          p_action_details?: Json
          p_reason?: string
        }
        Returns: undefined
      }
      reactivate_user: {
        Args: { p_user_id: string; p_reason?: string }
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
      restrict_communication: {
        Args: { p_user_id: string; p_reason: string }
        Returns: undefined
      }
      revert_waitlist_client_conversion: {
        Args: { p_client_id: string; p_trainer_id: string }
        Returns: boolean
      }
      suspend_user: {
        Args: { p_user_id: string; p_reason: string; p_duration_days?: number }
        Returns: undefined
      }
      update_admin_notes: {
        Args: { p_user_id: string; p_notes: string }
        Returns: undefined
      }
      update_engagement_stage: {
        Args: {
          client_uuid: string
          trainer_uuid: string
          new_stage: Database["public"]["Enums"]["engagement_stage"]
        }
        Returns: undefined
      }
      update_user_email_for_admin: {
        Args: { target_user_id: string; new_email: string }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "trainer" | "client"
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
        | "discovery_call_booked"
        | "discovery_in_progress"
        | "unmatched"
        | "declined"
      kb_article_status: "draft" | "published" | "archived"
      kb_content_type:
        | "feature"
        | "api"
        | "component"
        | "hook"
        | "database"
        | "business_rule"
        | "integration"
      user_type: "client" | "trainer" | "admin"
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
        "discovery_call_booked",
        "discovery_in_progress",
        "unmatched",
        "declined",
      ],
      kb_article_status: ["draft", "published", "archived"],
      kb_content_type: [
        "feature",
        "api",
        "component",
        "hook",
        "database",
        "business_rule",
        "integration",
      ],
      user_type: ["client", "trainer", "admin"],
      verification_status_enum: ["pending", "verified", "rejected"],
      visibility_state: ["hidden", "blurred", "visible"],
      waitlist_status: ["active", "contacted", "converted", "archived"],
    },
  },
} as const
