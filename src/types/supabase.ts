export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.4";
  };
  public: {
    Tables: {
      cyclic_todos: {
        Row: {
          created_at: string;
          id: string;
          todo: string;
          updated_at: string | null;
          user_id: string;
        };
        Insert: {
          created_at?: string;
          id?: string;
          todo: string;
          updated_at?: string | null;
          user_id: string;
        };
        Update: {
          created_at?: string;
          id?: string;
          todo?: string;
          updated_at?: string | null;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "cyclic_todos_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "db_users";
            referencedColumns: ["id"];
          }
        ];
      };
      db_users: {
        Row: {
          email: string;
          id: string;
          is_active: boolean;
          lang: string;
        };
        Insert: {
          email: string;
          id: string;
          is_active?: boolean;
          lang?: string;
        };
        Update: {
          email?: string;
          id?: string;
          is_active?: boolean;
          lang?: string;
        };
        Relationships: [];
      };
      delegated_todos: {
        Row: {
          created_at: string;
          delegated_at: string | null;
          delegated_by: string | null;
          from_delegated: boolean | null;
          id: string;
          image_url: string | null;
          is_completed: boolean;
          original_todo_id: string | null;
          todo: string;
          todo_more_content: string | null;
          updated_at: string | null;
          user_id: string;
        };
        Insert: {
          created_at?: string;
          delegated_at?: string | null;
          delegated_by?: string | null;
          from_delegated?: boolean | null;
          id?: string;
          image_url?: string | null;
          is_completed?: boolean;
          original_todo_id?: string | null;
          todo: string;
          todo_more_content?: string | null;
          updated_at?: string | null;
          user_id: string;
        };
        Update: {
          created_at?: string;
          delegated_at?: string | null;
          delegated_by?: string | null;
          from_delegated?: boolean | null;
          id?: string;
          image_url?: string | null;
          is_completed?: boolean;
          original_todo_id?: string | null;
          todo?: string;
          todo_more_content?: string | null;
          updated_at?: string | null;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "delegated_todos_delegated_by_fkey";
            columns: ["delegated_by"];
            isOneToOne: false;
            referencedRelation: "db_users";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "delegated_todos_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "db_users";
            referencedColumns: ["id"];
          }
        ];
      };
      global_todos: {
        Row: {
          created_at: string;
          delegated_at: string | null;
          delegated_by: string | null;
          from_delegated: boolean | null;
          id: string;
          image_url: string | null;
          is_completed: boolean;
          original_todo_id: string | null;
          todo: string;
          todo_more_content: string | null;
          updated_at: string | null;
          user_id: string;
        };
        Insert: {
          created_at?: string;
          delegated_at?: string | null;
          delegated_by?: string | null;
          from_delegated?: boolean | null;
          id?: string;
          image_url?: string | null;
          is_completed?: boolean;
          original_todo_id?: string | null;
          todo: string;
          todo_more_content?: string | null;
          updated_at?: string | null;
          user_id: string;
        };
        Update: {
          created_at?: string;
          delegated_at?: string | null;
          delegated_by?: string | null;
          from_delegated?: boolean | null;
          id?: string;
          image_url?: string | null;
          is_completed?: boolean;
          original_todo_id?: string | null;
          todo?: string;
          todo_more_content?: string | null;
          updated_at?: string | null;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "global_todos_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "db_users";
            referencedColumns: ["id"];
          }
        ];
      };
      notification_logs: {
        Row: {
          created_at: string;
          error_message: string | null;
          id: string;
          incomplete_todos_count: number | null;
          message: string;
          notification_type: string;
          sent_at: string;
          status: string;
          user_id: string;
        };
        Insert: {
          created_at?: string;
          error_message?: string | null;
          id?: string;
          incomplete_todos_count?: number | null;
          message: string;
          notification_type?: string;
          sent_at?: string;
          status?: string;
          user_id: string;
        };
        Update: {
          created_at?: string;
          error_message?: string | null;
          id?: string;
          incomplete_todos_count?: number | null;
          message?: string;
          notification_type?: string;
          sent_at?: string;
          status?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "notification_logs_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "db_users";
            referencedColumns: ["id"];
          }
        ];
      };
      push_subscriptions: {
        Row: {
          auth_key: string;
          browser_name: string | null;
          created_at: string;
          device_type: string | null;
          endpoint: string;
          id: string;
          is_active: boolean;
          last_used_at: string | null;
          p256dh_key: string;
          updated_at: string | null;
          user_agent: string | null;
          user_id: string;
        };
        Insert: {
          auth_key: string;
          browser_name?: string | null;
          created_at?: string;
          device_type?: string | null;
          endpoint: string;
          id?: string;
          is_active?: boolean;
          last_used_at?: string | null;
          p256dh_key: string;
          updated_at?: string | null;
          user_agent?: string | null;
          user_id: string;
        };
        Update: {
          auth_key?: string;
          browser_name?: string | null;
          created_at?: string;
          device_type?: string | null;
          endpoint?: string;
          id?: string;
          is_active?: boolean;
          last_used_at?: string | null;
          p256dh_key?: string;
          updated_at?: string | null;
          user_agent?: string | null;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "push_subscriptions_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "db_users";
            referencedColumns: ["id"];
          }
        ];
      };
      todos: {
        Row: {
          created_at: string;
          from_delegated: boolean | null;
          id: string;
          image_url: string | null;
          is_completed: boolean;
          is_independent_edit: boolean | null;
          original_todo_id: string | null;
          todo: string;
          todo_date: string;
          todo_more_content: string | null;
          updated_at: string | null;
          user_id: string;
        };
        Insert: {
          created_at?: string;
          from_delegated?: boolean | null;
          id?: string;
          image_url?: string | null;
          is_completed?: boolean;
          is_independent_edit?: boolean | null;
          original_todo_id?: string | null;
          todo: string;
          todo_date: string;
          todo_more_content?: string | null;
          updated_at?: string | null;
          user_id: string;
        };
        Update: {
          created_at?: string;
          from_delegated?: boolean | null;
          id?: string;
          image_url?: string | null;
          is_completed?: boolean;
          is_independent_edit?: boolean | null;
          original_todo_id?: string | null;
          todo?: string;
          todo_date?: string;
          todo_more_content?: string | null;
          updated_at?: string | null;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "todos_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "db_users";
            referencedColumns: ["id"];
          }
        ];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      check_cron_jobs_status: {
        Args: Record<PropertyKey, never>;
        Returns: {
          active: boolean;
          command: string;
          job_name: string;
          last_run_started_at: string;
          last_run_status: string;
          schedule: string;
        }[];
      };
      check_daily_notifications_cron_status: {
        Args: Record<PropertyKey, never>;
        Returns: {
          active: boolean;
          command: string;
          job_name: string;
          last_run_started_at: string;
          last_run_status: string;
          next_run_time: string;
          schedule: string;
        }[];
      };
      check_test_data: {
        Args: Record<PropertyKey, never>;
        Returns: Json;
      };
      clean_test_users: {
        Args: Record<PropertyKey, never>;
        Returns: undefined;
      };
      cleanup_inactive_push_subscriptions: {
        Args: Record<PropertyKey, never>;
        Returns: number;
      };
      cleanup_old_notification_logs: {
        Args: Record<PropertyKey, never>;
        Returns: number;
      };
      deactivate_user: {
        Args: { p_user_id: string };
        Returns: undefined;
      };
      manually_process_cyclic_todos: {
        Args: Record<PropertyKey, never>;
        Returns: Json;
      };
      manually_trigger_daily_notifications: {
        Args: Record<PropertyKey, never>;
        Returns: Json;
      };
      process_cyclic_todos_internal: {
        Args: Record<PropertyKey, never>;
        Returns: Json;
      };
      search_todos: {
        Args: { search_term: string; user_id_param: string };
        Returns: {
          like: Database["public"]["Tables"]["todos"]["Row"];
        }[];
      };
      setup_cyclic_todos_test_cron: {
        Args: { interval_minutes?: number };
        Returns: string;
      };
      stop_cyclic_todos_test_cron: {
        Args: Record<PropertyKey, never>;
        Returns: string;
      };
      trigger_daily_notifications: {
        Args: { is_production?: boolean };
        Returns: Json;
      };
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">;

type DefaultSchema = DatabaseWithoutInternals[Extract<
  keyof Database,
  "public"
>];

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
      DefaultSchema["Views"])
  ? (DefaultSchema["Tables"] &
      DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
      Row: infer R;
    }
    ? R
    : never
  : never;

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
  ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
      Insert: infer I;
    }
    ? I
    : never
  : never;

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
  ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
      Update: infer U;
    }
    ? U
    : never
  : never;

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
  ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
  : never;

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
  ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
  : never;

export const Constants = {
  public: {
    Enums: {},
  },
} as const;
