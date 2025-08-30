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
    PostgrestVersion: "13.0.4"
  }
  public: {
    Tables: {
      coop_invitations: {
        Row: {
          created_at: string
          expires_at: string
          id: string
          invitee_email: string
          invitee_user_id: string | null
          inviter_user_id: string
          shared_table_id: string
          status: string
        }
        Insert: {
          created_at?: string
          expires_at?: string
          id?: string
          invitee_email: string
          invitee_user_id?: string | null
          inviter_user_id: string
          shared_table_id: string
          status?: string
        }
        Update: {
          created_at?: string
          expires_at?: string
          id?: string
          invitee_email?: string
          invitee_user_id?: string | null
          inviter_user_id?: string
          shared_table_id?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "coop_invitations_invitee_user_id_fkey"
            columns: ["invitee_user_id"]
            isOneToOne: false
            referencedRelation: "db_users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "coop_invitations_inviter_user_id_fkey"
            columns: ["inviter_user_id"]
            isOneToOne: false
            referencedRelation: "db_users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "coop_invitations_shared_table_id_fkey"
            columns: ["shared_table_id"]
            isOneToOne: false
            referencedRelation: "coop_todos_shared"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "coop_invitations_shared_table_id_fkey"
            columns: ["shared_table_id"]
            isOneToOne: false
            referencedRelation: "my_shared_tables"
            referencedColumns: ["id"]
          },
        ]
      }
      coop_todos: {
        Row: {
          completed_at: string | null
          created_at: string
          creator_user_id: string
          id: string
          is_completed: boolean
          order_index: number
          shared_table_id: string
          todo: string
          todo_more_content: string | null
          updated_at: string | null
          who_completed: string | null
          who_updated: string | null
        }
        Insert: {
          completed_at?: string | null
          created_at?: string
          creator_user_id: string
          id?: string
          is_completed?: boolean
          order_index?: number
          shared_table_id: string
          todo: string
          todo_more_content?: string | null
          updated_at?: string | null
          who_completed?: string | null
          who_updated?: string | null
        }
        Update: {
          completed_at?: string | null
          created_at?: string
          creator_user_id?: string
          id?: string
          is_completed?: boolean
          order_index?: number
          shared_table_id?: string
          todo?: string
          todo_more_content?: string | null
          updated_at?: string | null
          who_completed?: string | null
          who_updated?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "coop_todos_creator_user_id_fkey"
            columns: ["creator_user_id"]
            isOneToOne: false
            referencedRelation: "db_users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "coop_todos_shared_table_id_fkey"
            columns: ["shared_table_id"]
            isOneToOne: false
            referencedRelation: "coop_todos_shared"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "coop_todos_shared_table_id_fkey"
            columns: ["shared_table_id"]
            isOneToOne: false
            referencedRelation: "my_shared_tables"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "coop_todos_who_completed_fkey"
            columns: ["who_completed"]
            isOneToOne: false
            referencedRelation: "db_users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "coop_todos_who_updated_fkey"
            columns: ["who_updated"]
            isOneToOne: false
            referencedRelation: "db_users"
            referencedColumns: ["id"]
          },
        ]
      }
      coop_todos_shared: {
        Row: {
          created_at: string
          description: string | null
          id: string
          is_active: boolean
          member_emails: string[]
          owner_user_id: string
          table_name: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          member_emails?: string[]
          owner_user_id: string
          table_name: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          member_emails?: string[]
          owner_user_id?: string
          table_name?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "coop_todos_shared_owner_user_id_fkey"
            columns: ["owner_user_id"]
            isOneToOne: false
            referencedRelation: "db_users"
            referencedColumns: ["id"]
          },
        ]
      }
      cyclic_todos: {
        Row: {
          created_at: string
          id: string
          order_index: number
          todo: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          order_index?: number
          todo: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          order_index?: number
          todo?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "cyclic_todos_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "db_users"
            referencedColumns: ["id"]
          },
        ]
      }
      db_users: {
        Row: {
          email: string
          id: string
          is_active: boolean
          lang: string
        }
        Insert: {
          email: string
          id: string
          is_active?: boolean
          lang?: string
        }
        Update: {
          email?: string
          id?: string
          is_active?: boolean
          lang?: string
        }
        Relationships: []
      }
      delegated_todos: {
        Row: {
          created_at: string
          delegated_at: string | null
          delegated_by: string | null
          from_delegated: boolean | null
          id: string
          image_url: string | null
          is_completed: boolean
          order_index: number
          original_todo_id: string | null
          todo: string
          todo_more_content: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          delegated_at?: string | null
          delegated_by?: string | null
          from_delegated?: boolean | null
          id?: string
          image_url?: string | null
          is_completed?: boolean
          order_index?: number
          original_todo_id?: string | null
          todo: string
          todo_more_content?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          delegated_at?: string | null
          delegated_by?: string | null
          from_delegated?: boolean | null
          id?: string
          image_url?: string | null
          is_completed?: boolean
          order_index?: number
          original_todo_id?: string | null
          todo?: string
          todo_more_content?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "delegated_todos_delegated_by_fkey"
            columns: ["delegated_by"]
            isOneToOne: false
            referencedRelation: "db_users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "delegated_todos_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "db_users"
            referencedColumns: ["id"]
          },
        ]
      }
      global_todos: {
        Row: {
          created_at: string
          delegated_at: string | null
          delegated_by: string | null
          from_delegated: boolean | null
          id: string
          image_url: string | null
          is_completed: boolean
          order_index: number
          original_todo_id: string | null
          todo: string
          todo_more_content: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          delegated_at?: string | null
          delegated_by?: string | null
          from_delegated?: boolean | null
          id?: string
          image_url?: string | null
          is_completed?: boolean
          order_index?: number
          original_todo_id?: string | null
          todo: string
          todo_more_content?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          delegated_at?: string | null
          delegated_by?: string | null
          from_delegated?: boolean | null
          id?: string
          image_url?: string | null
          is_completed?: boolean
          order_index?: number
          original_todo_id?: string | null
          todo?: string
          todo_more_content?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "global_todos_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "db_users"
            referencedColumns: ["id"]
          },
        ]
      }
      notification_logs: {
        Row: {
          created_at: string
          error_message: string | null
          id: string
          incomplete_todos_count: number | null
          message: string
          notification_type: string
          sent_at: string
          status: string
          user_id: string
        }
        Insert: {
          created_at?: string
          error_message?: string | null
          id?: string
          incomplete_todos_count?: number | null
          message: string
          notification_type?: string
          sent_at?: string
          status?: string
          user_id: string
        }
        Update: {
          created_at?: string
          error_message?: string | null
          id?: string
          incomplete_todos_count?: number | null
          message?: string
          notification_type?: string
          sent_at?: string
          status?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notification_logs_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "db_users"
            referencedColumns: ["id"]
          },
        ]
      }
      push_subscriptions: {
        Row: {
          auth_key: string
          browser_name: string | null
          created_at: string
          device_type: string | null
          endpoint: string
          id: string
          is_active: boolean
          last_used_at: string | null
          p256dh_key: string
          updated_at: string | null
          user_agent: string | null
          user_id: string
        }
        Insert: {
          auth_key: string
          browser_name?: string | null
          created_at?: string
          device_type?: string | null
          endpoint: string
          id?: string
          is_active?: boolean
          last_used_at?: string | null
          p256dh_key: string
          updated_at?: string | null
          user_agent?: string | null
          user_id: string
        }
        Update: {
          auth_key?: string
          browser_name?: string | null
          created_at?: string
          device_type?: string | null
          endpoint?: string
          id?: string
          is_active?: boolean
          last_used_at?: string | null
          p256dh_key?: string
          updated_at?: string | null
          user_agent?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "push_subscriptions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "db_users"
            referencedColumns: ["id"]
          },
        ]
      }
      todos: {
        Row: {
          created_at: string
          from_delegated: boolean | null
          id: string
          image_url: string | null
          is_completed: boolean
          is_independent_edit: boolean | null
          order_index: number
          original_todo_id: string | null
          todo: string
          todo_date: string
          todo_more_content: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          from_delegated?: boolean | null
          id?: string
          image_url?: string | null
          is_completed?: boolean
          is_independent_edit?: boolean | null
          order_index?: number
          original_todo_id?: string | null
          todo: string
          todo_date: string
          todo_more_content?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          from_delegated?: boolean | null
          id?: string
          image_url?: string | null
          is_completed?: boolean
          is_independent_edit?: boolean | null
          order_index?: number
          original_todo_id?: string | null
          todo?: string
          todo_date?: string
          todo_more_content?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "todos_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "db_users"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      my_accessible_todos: {
        Row: {
          completed_at: string | null
          completed_by_email: string | null
          created_at: string | null
          creator_email: string | null
          creator_user_id: string | null
          id: string | null
          is_completed: boolean | null
          order_index: number | null
          shared_table_id: string | null
          table_name: string | null
          table_owner_email: string | null
          todo: string | null
          todo_more_content: string | null
          todo_type: string | null
          updated_at: string | null
          updated_by_email: string | null
          who_completed: string | null
          who_updated: string | null
        }
        Relationships: [
          {
            foreignKeyName: "coop_todos_creator_user_id_fkey"
            columns: ["creator_user_id"]
            isOneToOne: false
            referencedRelation: "db_users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "coop_todos_shared_table_id_fkey"
            columns: ["shared_table_id"]
            isOneToOne: false
            referencedRelation: "coop_todos_shared"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "coop_todos_shared_table_id_fkey"
            columns: ["shared_table_id"]
            isOneToOne: false
            referencedRelation: "my_shared_tables"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "coop_todos_who_completed_fkey"
            columns: ["who_completed"]
            isOneToOne: false
            referencedRelation: "db_users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "coop_todos_who_updated_fkey"
            columns: ["who_updated"]
            isOneToOne: false
            referencedRelation: "db_users"
            referencedColumns: ["id"]
          },
        ]
      }
      my_pending_invitations: {
        Row: {
          created_at: string | null
          description: string | null
          expires_at: string | null
          id: string | null
          invitee_email: string | null
          invitee_user_id: string | null
          inviter_email: string | null
          inviter_user_id: string | null
          shared_table_id: string | null
          status: string | null
          table_name: string | null
        }
        Relationships: [
          {
            foreignKeyName: "coop_invitations_invitee_user_id_fkey"
            columns: ["invitee_user_id"]
            isOneToOne: false
            referencedRelation: "db_users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "coop_invitations_inviter_user_id_fkey"
            columns: ["inviter_user_id"]
            isOneToOne: false
            referencedRelation: "db_users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "coop_invitations_shared_table_id_fkey"
            columns: ["shared_table_id"]
            isOneToOne: false
            referencedRelation: "coop_todos_shared"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "coop_invitations_shared_table_id_fkey"
            columns: ["shared_table_id"]
            isOneToOne: false
            referencedRelation: "my_shared_tables"
            referencedColumns: ["id"]
          },
        ]
      }
      my_received_invitations: {
        Row: {
          created_at: string | null
          description: string | null
          expires_at: string | null
          id: string | null
          invitee_email: string | null
          invitee_user_id: string | null
          inviter_email: string | null
          inviter_user_id: string | null
          shared_table_id: string | null
          status: string | null
          table_name: string | null
        }
        Relationships: [
          {
            foreignKeyName: "coop_invitations_invitee_user_id_fkey"
            columns: ["invitee_user_id"]
            isOneToOne: false
            referencedRelation: "db_users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "coop_invitations_inviter_user_id_fkey"
            columns: ["inviter_user_id"]
            isOneToOne: false
            referencedRelation: "db_users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "coop_invitations_shared_table_id_fkey"
            columns: ["shared_table_id"]
            isOneToOne: false
            referencedRelation: "coop_todos_shared"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "coop_invitations_shared_table_id_fkey"
            columns: ["shared_table_id"]
            isOneToOne: false
            referencedRelation: "my_shared_tables"
            referencedColumns: ["id"]
          },
        ]
      }
      my_sent_invitations: {
        Row: {
          created_at: string | null
          description: string | null
          expires_at: string | null
          id: string | null
          invitee_email: string | null
          invitee_user_email: string | null
          invitee_user_id: string | null
          inviter_user_id: string | null
          shared_table_id: string | null
          status: string | null
          table_name: string | null
        }
        Relationships: [
          {
            foreignKeyName: "coop_invitations_invitee_user_id_fkey"
            columns: ["invitee_user_id"]
            isOneToOne: false
            referencedRelation: "db_users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "coop_invitations_inviter_user_id_fkey"
            columns: ["inviter_user_id"]
            isOneToOne: false
            referencedRelation: "db_users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "coop_invitations_shared_table_id_fkey"
            columns: ["shared_table_id"]
            isOneToOne: false
            referencedRelation: "coop_todos_shared"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "coop_invitations_shared_table_id_fkey"
            columns: ["shared_table_id"]
            isOneToOne: false
            referencedRelation: "my_shared_tables"
            referencedColumns: ["id"]
          },
        ]
      }
      my_shared_tables: {
        Row: {
          created_at: string | null
          description: string | null
          id: string | null
          is_active: boolean | null
          member_count: number | null
          member_emails: string[] | null
          my_role: string | null
          owner_email: string | null
          owner_user_id: string | null
          table_name: string | null
          updated_at: string | null
        }
        Relationships: [
          {
            foreignKeyName: "coop_todos_shared_owner_user_id_fkey"
            columns: ["owner_user_id"]
            isOneToOne: false
            referencedRelation: "db_users"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Functions: {
      accept_invitation: {
        Args: { p_invitation_id: string }
        Returns: boolean
      }
      check_cron_jobs_status: {
        Args: Record<PropertyKey, never>
        Returns: {
          active: boolean
          command: string
          job_name: string
          last_run_started_at: string
          last_run_status: string
          schedule: string
        }[]
      }
      clean_test_users: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      cleanup_inactive_push_subscriptions: {
        Args: Record<PropertyKey, never>
        Returns: number
      }
      cleanup_old_notification_logs: {
        Args: Record<PropertyKey, never>
        Returns: number
      }
      create_shared_todos_table: {
        Args: { p_description?: string; p_table_name: string }
        Returns: string
      }
      current_user_email: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      deactivate_user: {
        Args: { p_user_id: string }
        Returns: undefined
      }
      decline_invitation: {
        Args: { p_invitation_id: string }
        Returns: boolean
      }
      invite_to_shared_table: {
        Args: { p_invitee_email: string; p_shared_table_id: string }
        Returns: string
      }
      leave_shared_table: {
        Args: { p_email_to_remove?: string; p_shared_table_id: string }
        Returns: boolean
      }
      manually_process_cyclic_todos: {
        Args: Record<PropertyKey, never>
        Returns: Json
      }
      process_cyclic_todos_internal: {
        Args: Record<PropertyKey, never>
        Returns: Json
      }
      search_todos: {
        Args: { search_term: string; user_id_param: string }
        Returns: {
          like: Database["public"]["Tables"]["todos"]["Row"]
        }[]
      }
      setup_cyclic_todos_test_cron: {
        Args: { interval_minutes?: number }
        Returns: string
      }
      stop_cyclic_todos_test_cron: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      trigger_daily_notifications: {
        Args: { is_production?: boolean }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
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
    Enums: {},
  },
} as const
