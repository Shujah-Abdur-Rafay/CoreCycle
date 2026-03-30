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
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      admin_reports: {
        Row: {
          created_at: string
          date_range_end: string | null
          date_range_start: string | null
          filters: Json | null
          generated_by: string
          id: string
          report_data: Json | null
          report_type: string
          title: string
        }
        Insert: {
          created_at?: string
          date_range_end?: string | null
          date_range_start?: string | null
          filters?: Json | null
          generated_by: string
          id?: string
          report_data?: Json | null
          report_type: string
          title: string
        }
        Update: {
          created_at?: string
          date_range_end?: string | null
          date_range_start?: string | null
          filters?: Json | null
          generated_by?: string
          id?: string
          report_data?: Json | null
          report_type?: string
          title?: string
        }
        Relationships: []
      }
      certificates: {
        Row: {
          certificate_number: string
          company_name: string | null
          course_id: string
          course_title: string
          enrollment_id: string
          id: string
          issued_at: string
          learner_name: string
          municipality: string | null
          producer_program_id: string | null
          sme_id: string | null
          user_id: string
        }
        Insert: {
          certificate_number: string
          company_name?: string | null
          course_id: string
          course_title: string
          enrollment_id: string
          id?: string
          issued_at?: string
          learner_name: string
          municipality?: string | null
          producer_program_id?: string | null
          sme_id?: string | null
          user_id: string
        }
        Update: {
          certificate_number?: string
          company_name?: string | null
          course_id?: string
          course_title?: string
          enrollment_id?: string
          id?: string
          issued_at?: string
          learner_name?: string
          municipality?: string | null
          producer_program_id?: string | null
          sme_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "certificates_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "certificates_enrollment_id_fkey"
            columns: ["enrollment_id"]
            isOneToOne: false
            referencedRelation: "enrollments"
            referencedColumns: ["id"]
          },
        ]
      }
      course_allocations: {
        Row: {
          allocated_at: string
          allocated_by: string
          allocation_type: string
          course_id: string
          expires_at: string | null
          id: string
          sme_id: string | null
          user_id: string | null
        }
        Insert: {
          allocated_at?: string
          allocated_by: string
          allocation_type: string
          course_id: string
          expires_at?: string | null
          id?: string
          sme_id?: string | null
          user_id?: string | null
        }
        Update: {
          allocated_at?: string
          allocated_by?: string
          allocation_type?: string
          course_id?: string
          expires_at?: string | null
          id?: string
          sme_id?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "course_allocations_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
        ]
      }
      courses: {
        Row: {
          content_type: string | null
          content_url: string | null
          created_at: string
          description: string | null
          duration_minutes: number | null
          extracted_content: string | null
          id: string
          is_published: boolean | null
          short_description: string | null
          thumbnail_url: string | null
          title: string
          updated_at: string
        }
        Insert: {
          content_type?: string | null
          content_url?: string | null
          created_at?: string
          description?: string | null
          duration_minutes?: number | null
          extracted_content?: string | null
          id?: string
          is_published?: boolean | null
          short_description?: string | null
          thumbnail_url?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          content_type?: string | null
          content_url?: string | null
          created_at?: string
          description?: string | null
          duration_minutes?: number | null
          extracted_content?: string | null
          id?: string
          is_published?: boolean | null
          short_description?: string | null
          thumbnail_url?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      enrollments: {
        Row: {
          completed_at: string | null
          course_id: string
          enrolled_at: string
          id: string
          progress_percentage: number | null
          started_at: string | null
          status: string
          time_spent_minutes: number | null
          user_id: string
        }
        Insert: {
          completed_at?: string | null
          course_id: string
          enrolled_at?: string
          id?: string
          progress_percentage?: number | null
          started_at?: string | null
          status?: string
          time_spent_minutes?: number | null
          user_id: string
        }
        Update: {
          completed_at?: string | null
          course_id?: string
          enrolled_at?: string
          id?: string
          progress_percentage?: number | null
          started_at?: string | null
          status?: string
          time_spent_minutes?: number | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "enrollments_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
        ]
      }
      industry_sectors: {
        Row: {
          created_at: string
          created_by: string | null
          id: string
          is_active: boolean
          is_system: boolean
          name: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          id?: string
          is_active?: boolean
          is_system?: boolean
          name: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          id?: string
          is_active?: boolean
          is_system?: boolean
          name?: string
        }
        Relationships: []
      }
      module_completions: {
        Row: {
          attendance_confirmed: boolean | null
          attendance_confirmed_at: string | null
          completed_at: string | null
          enrollment_id: string
          id: string
          instructor_approved: boolean | null
          instructor_approved_at: string | null
          instructor_name: string | null
          module_id: string
          module_version: number | null
          quiz_score: number | null
          started_at: string
          status: string
          time_spent_minutes: number | null
          user_id: string
        }
        Insert: {
          attendance_confirmed?: boolean | null
          attendance_confirmed_at?: string | null
          completed_at?: string | null
          enrollment_id: string
          id?: string
          instructor_approved?: boolean | null
          instructor_approved_at?: string | null
          instructor_name?: string | null
          module_id: string
          module_version?: number | null
          quiz_score?: number | null
          started_at?: string
          status?: string
          time_spent_minutes?: number | null
          user_id: string
        }
        Update: {
          attendance_confirmed?: boolean | null
          attendance_confirmed_at?: string | null
          completed_at?: string | null
          enrollment_id?: string
          id?: string
          instructor_approved?: boolean | null
          instructor_approved_at?: string | null
          instructor_name?: string | null
          module_id?: string
          module_version?: number | null
          quiz_score?: number | null
          started_at?: string
          status?: string
          time_spent_minutes?: number | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "module_completions_enrollment_id_fkey"
            columns: ["enrollment_id"]
            isOneToOne: false
            referencedRelation: "enrollments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "module_completions_module_id_fkey"
            columns: ["module_id"]
            isOneToOne: false
            referencedRelation: "modules"
            referencedColumns: ["id"]
          },
        ]
      }
      modules: {
        Row: {
          content: string | null
          course_id: string
          created_at: string
          description: string | null
          duration_minutes: number | null
          has_quiz: boolean | null
          id: string
          is_mandatory_for_certification: boolean | null
          order_index: number
          quiz_pass_mark: number | null
          requires_instructor_approval: boolean | null
          title: string
          updated_at: string
          version: number | null
          video_url: string | null
        }
        Insert: {
          content?: string | null
          course_id: string
          created_at?: string
          description?: string | null
          duration_minutes?: number | null
          has_quiz?: boolean | null
          id?: string
          is_mandatory_for_certification?: boolean | null
          order_index?: number
          quiz_pass_mark?: number | null
          requires_instructor_approval?: boolean | null
          title: string
          updated_at?: string
          version?: number | null
          video_url?: string | null
        }
        Update: {
          content?: string | null
          course_id?: string
          created_at?: string
          description?: string | null
          duration_minutes?: number | null
          has_quiz?: boolean | null
          id?: string
          is_mandatory_for_certification?: boolean | null
          order_index?: number
          quiz_pass_mark?: number | null
          requires_instructor_approval?: boolean | null
          title?: string
          updated_at?: string
          version?: number | null
          video_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "modules_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          company_name: string | null
          created_at: string
          email: string | null
          full_name: string | null
          id: string
          industry_sector: string | null
          municipality: string | null
          other_sector_detail: string | null
          producer_program_id: string | null
          role_in_company: string | null
          sme_id: string | null
          updated_at: string
          user_id: string
          user_type: string
        }
        Insert: {
          company_name?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
          industry_sector?: string | null
          municipality?: string | null
          other_sector_detail?: string | null
          producer_program_id?: string | null
          role_in_company?: string | null
          sme_id?: string | null
          updated_at?: string
          user_id: string
          user_type?: string
        }
        Update: {
          company_name?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
          industry_sector?: string | null
          municipality?: string | null
          other_sector_detail?: string | null
          producer_program_id?: string | null
          role_in_company?: string | null
          sme_id?: string | null
          updated_at?: string
          user_id?: string
          user_type?: string
        }
        Relationships: []
      }
      quiz_questions: {
        Row: {
          correct_answer_index: number
          created_at: string
          explanation: string | null
          id: string
          module_id: string
          options: Json
          order_index: number
          question: string
        }
        Insert: {
          correct_answer_index: number
          created_at?: string
          explanation?: string | null
          id?: string
          module_id: string
          options?: Json
          order_index?: number
          question: string
        }
        Update: {
          correct_answer_index?: number
          created_at?: string
          explanation?: string | null
          id?: string
          module_id?: string
          options?: Json
          order_index?: number
          question?: string
        }
        Relationships: [
          {
            foreignKeyName: "quiz_questions_module_id_fkey"
            columns: ["module_id"]
            isOneToOne: false
            referencedRelation: "modules"
            referencedColumns: ["id"]
          },
        ]
      }
      smes: {
        Row: {
          company_name: string
          created_at: string | null
          id: string
          industry_sector: string | null
          municipality: string | null
          sme_id: string
          updated_at: string | null
        }
        Insert: {
          company_name: string
          created_at?: string | null
          id?: string
          industry_sector?: string | null
          municipality?: string | null
          sme_id: string
          updated_at?: string | null
        }
        Update: {
          company_name?: string
          created_at?: string | null
          id?: string
          industry_sector?: string | null
          municipality?: string | null
          sme_id?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          approved_at: string | null
          approved_by: string | null
          created_at: string
          id: string
          is_approved: boolean
          role: Database["public"]["Enums"]["app_role"]
          updated_at: string
          user_id: string
        }
        Insert: {
          approved_at?: string | null
          approved_by?: string | null
          created_at?: string
          id?: string
          is_approved?: boolean
          role?: Database["public"]["Enums"]["app_role"]
          updated_at?: string
          user_id: string
        }
        Update: {
          approved_at?: string | null
          approved_by?: string | null
          created_at?: string
          id?: string
          is_approved?: boolean
          role?: Database["public"]["Enums"]["app_role"]
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_user_role: {
        Args: { _user_id: string }
        Returns: Database["public"]["Enums"]["app_role"]
      }
      has_report_access: { Args: { _user_id: string }; Returns: boolean }
      is_super_admin: { Args: { _user_id: string }; Returns: boolean }
      is_user_approved: { Args: { _user_id: string }; Returns: boolean }
      user_has_course_access: {
        Args: { _course_id: string; _user_id: string }
        Returns: boolean
      }
    }
    Enums: {
      app_role:
        | "super_admin"
        | "producer_admin"
        | "municipality_admin"
        | "sme_admin"
        | "learner"
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
      app_role: [
        "super_admin",
        "producer_admin",
        "municipality_admin",
        "sme_admin",
        "learner",
      ],
    },
  },
} as const
