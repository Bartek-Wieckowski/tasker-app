export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          query?: string
          extensions?: Json
          variables?: Json
          operationName?: string
        }
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
  public: {
    Tables: {
      cyclic_todos: {
        Row: {
          created_at: string
          id: string
          todo: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          todo: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
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
        }
        Insert: {
          email: string
          id: string
          is_active?: boolean
        }
        Update: {
          email?: string
          id?: string
          is_active?: boolean
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
      todos: {
        Row: {
          created_at: string
          from_delegated: boolean | null
          id: string
          image_url: string | null
          is_completed: boolean
          is_independent_edit: boolean | null
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
      [_ in never]: never
    }
    Functions: {
      clean_test_users: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      deactivate_user: {
        Args: { p_user_id: string }
        Returns: undefined
      }
      search_todos: {
        Args: { search_term: string; user_id_param: string }
        Returns: {
          like: Database["public"]["Tables"]["todos"]["Row"]
        }[]
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

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {},
  },
} as const

