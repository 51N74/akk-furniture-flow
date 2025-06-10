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
      contract_items: {
        Row: {
          contract_id: string
          created_at: string | null
          discount: number | null
          id: string
          product_id: string
          quantity: number
          total_price: number
          unit_price: number
        }
        Insert: {
          contract_id: string
          created_at?: string | null
          discount?: number | null
          id?: string
          product_id: string
          quantity: number
          total_price: number
          unit_price: number
        }
        Update: {
          contract_id?: string
          created_at?: string | null
          discount?: number | null
          id?: string
          product_id?: string
          quantity?: number
          total_price?: number
          unit_price?: number
        }
        Relationships: [
          {
            foreignKeyName: "contract_items_contract_id_fkey"
            columns: ["contract_id"]
            isOneToOne: false
            referencedRelation: "hire_purchase_contracts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contract_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      customers: {
        Row: {
          address_line1: string | null
          address_line2: string | null
          created_at: string | null
          customer_type: string
          district: string | null
          email: string | null
          id: string
          latitude: number | null
          longitude: number | null
          name: string
          phone: string | null
          postal_code: string | null
          province: string | null
          subdistrict: string | null
          tax_id: string
          updated_at: string | null
        }
        Insert: {
          address_line1?: string | null
          address_line2?: string | null
          created_at?: string | null
          customer_type: string
          district?: string | null
          email?: string | null
          id?: string
          latitude?: number | null
          longitude?: number | null
          name: string
          phone?: string | null
          postal_code?: string | null
          province?: string | null
          subdistrict?: string | null
          tax_id: string
          updated_at?: string | null
        }
        Update: {
          address_line1?: string | null
          address_line2?: string | null
          created_at?: string | null
          customer_type?: string
          district?: string | null
          email?: string | null
          id?: string
          latitude?: number | null
          longitude?: number | null
          name?: string
          phone?: string | null
          postal_code?: string | null
          province?: string | null
          subdistrict?: string | null
          tax_id?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      expenses: {
        Row: {
          amount: number
          category: string
          created_at: string | null
          date: string
          description: string
          id: string
          payment_method: string
          receipt_image_url: string | null
          vat_amount: number | null
        }
        Insert: {
          amount: number
          category: string
          created_at?: string | null
          date?: string
          description: string
          id?: string
          payment_method: string
          receipt_image_url?: string | null
          vat_amount?: number | null
        }
        Update: {
          amount?: number
          category?: string
          created_at?: string | null
          date?: string
          description?: string
          id?: string
          payment_method?: string
          receipt_image_url?: string | null
          vat_amount?: number | null
        }
        Relationships: []
      }
      hire_purchase_contracts: {
        Row: {
          contract_number: string
          created_at: string | null
          customer_id: string
          down_payment: number | null
          end_date: string
          id: string
          installment_count: number
          interest_rate: number | null
          monthly_payment: number
          other_fees: number | null
          start_date: string
          status: string
          total_amount: number
          updated_at: string | null
        }
        Insert: {
          contract_number: string
          created_at?: string | null
          customer_id: string
          down_payment?: number | null
          end_date: string
          id?: string
          installment_count: number
          interest_rate?: number | null
          monthly_payment: number
          other_fees?: number | null
          start_date: string
          status?: string
          total_amount: number
          updated_at?: string | null
        }
        Update: {
          contract_number?: string
          created_at?: string | null
          customer_id?: string
          down_payment?: number | null
          end_date?: string
          id?: string
          installment_count?: number
          interest_rate?: number | null
          monthly_payment?: number
          other_fees?: number | null
          start_date?: string
          status?: string
          total_amount?: number
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "hire_purchase_contracts_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
        ]
      }
      installments: {
        Row: {
          contract_id: string
          created_at: string | null
          due_date: string
          id: string
          installment_number: number
          interest_amount: number
          paid_amount: number | null
          paid_date: string | null
          principal_amount: number
          remaining_balance: number
          status: string | null
          total_amount: number
        }
        Insert: {
          contract_id: string
          created_at?: string | null
          due_date: string
          id?: string
          installment_number: number
          interest_amount: number
          paid_amount?: number | null
          paid_date?: string | null
          principal_amount: number
          remaining_balance: number
          status?: string | null
          total_amount: number
        }
        Update: {
          contract_id?: string
          created_at?: string | null
          due_date?: string
          id?: string
          installment_number?: number
          interest_amount?: number
          paid_amount?: number | null
          paid_date?: string | null
          principal_amount?: number
          remaining_balance?: number
          status?: string | null
          total_amount?: number
        }
        Relationships: [
          {
            foreignKeyName: "installments_contract_id_fkey"
            columns: ["contract_id"]
            isOneToOne: false
            referencedRelation: "hire_purchase_contracts"
            referencedColumns: ["id"]
          },
        ]
      }
      invoices: {
        Row: {
          contract_id: string | null
          created_at: string | null
          customer_id: string
          discount: number | null
          due_date: string
          id: string
          installment_id: string | null
          invoice_number: string
          issue_date: string
          notes: string | null
          status: string | null
          subtotal: number
          total_amount: number
          vat_amount: number
          vat_rate: number | null
        }
        Insert: {
          contract_id?: string | null
          created_at?: string | null
          customer_id: string
          discount?: number | null
          due_date: string
          id?: string
          installment_id?: string | null
          invoice_number: string
          issue_date?: string
          notes?: string | null
          status?: string | null
          subtotal: number
          total_amount: number
          vat_amount: number
          vat_rate?: number | null
        }
        Update: {
          contract_id?: string | null
          created_at?: string | null
          customer_id?: string
          discount?: number | null
          due_date?: string
          id?: string
          installment_id?: string | null
          invoice_number?: string
          issue_date?: string
          notes?: string | null
          status?: string | null
          subtotal?: number
          total_amount?: number
          vat_amount?: number
          vat_rate?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "invoices_contract_id_fkey"
            columns: ["contract_id"]
            isOneToOne: false
            referencedRelation: "hire_purchase_contracts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoices_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoices_installment_id_fkey"
            columns: ["installment_id"]
            isOneToOne: false
            referencedRelation: "installments"
            referencedColumns: ["id"]
          },
        ]
      }
      product_categories: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          name: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          name: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          name?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      products: {
        Row: {
          category_id: string | null
          code: string
          created_at: string | null
          id: string
          min_stock_level: number | null
          name: string
          purchase_price: number | null
          qr_code: string | null
          selling_price: number | null
          stock_quantity: number | null
          unit: string
          updated_at: string | null
        }
        Insert: {
          category_id?: string | null
          code: string
          created_at?: string | null
          id?: string
          min_stock_level?: number | null
          name: string
          purchase_price?: number | null
          qr_code?: string | null
          selling_price?: number | null
          stock_quantity?: number | null
          unit?: string
          updated_at?: string | null
        }
        Update: {
          category_id?: string | null
          code?: string
          created_at?: string | null
          id?: string
          min_stock_level?: number | null
          name?: string
          purchase_price?: number | null
          qr_code?: string | null
          selling_price?: number | null
          stock_quantity?: number | null
          unit?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "products_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "product_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      receipts: {
        Row: {
          amount_received: number
          change_amount: number | null
          created_at: string | null
          customer_id: string
          id: string
          invoice_id: string | null
          notes: string | null
          payment_date: string
          payment_method: string
          receipt_number: string
        }
        Insert: {
          amount_received: number
          change_amount?: number | null
          created_at?: string | null
          customer_id: string
          id?: string
          invoice_id?: string | null
          notes?: string | null
          payment_date?: string
          payment_method: string
          receipt_number: string
        }
        Update: {
          amount_received?: number
          change_amount?: number | null
          created_at?: string | null
          customer_id?: string
          id?: string
          invoice_id?: string | null
          notes?: string | null
          payment_date?: string
          payment_method?: string
          receipt_number?: string
        }
        Relationships: [
          {
            foreignKeyName: "receipts_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "receipts_invoice_id_fkey"
            columns: ["invoice_id"]
            isOneToOne: false
            referencedRelation: "invoices"
            referencedColumns: ["id"]
          },
        ]
      }
      stock_movements: {
        Row: {
          adjust_type: string | null
          branch: string | null
          created_at: string | null
          id: string
          movement_date: string
          movement_type: string
          notes: string | null
          product_id: string
          quantity: number
          reference_number: string | null
          supplier: string | null
        }
        Insert: {
          adjust_type?: string | null
          branch?: string | null
          created_at?: string | null
          id?: string
          movement_date?: string
          movement_type: string
          notes?: string | null
          product_id: string
          quantity: number
          reference_number?: string | null
          supplier?: string | null
        }
        Update: {
          adjust_type?: string | null
          branch?: string | null
          created_at?: string | null
          id?: string
          movement_date?: string
          movement_type?: string
          notes?: string | null
          product_id?: string
          quantity?: number
          reference_number?: string | null
          supplier?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "stock_movements_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
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
  public: {
    Enums: {},
  },
} as const
