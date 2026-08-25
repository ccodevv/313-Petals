/**
 * Hand-written types mirroring supabase/migrations/*.sql. If the schema
 * changes, update this file to match (or replace it with the output of
 * `supabase gen types typescript` once a live project is linked).
 */

export type UserRole = "customer" | "admin";

export type OrderStatus =
  | "pending"
  | "confirmed"
  | "preparing"
  | "ready"
  | "out_for_delivery"
  | "completed"
  | "cancelled";

export type PaymentStatus = "unpaid" | "paid" | "refunded";
export type PaymentMethod = "cash" | "gcash" | "bank_transfer" | "card";
export type FulfillmentType = "delivery" | "pickup";
export type InventoryReason = "order" | "restock" | "adjustment" | "return";

type Relationship = {
  foreignKeyName: string;
  columns: string[];
  isOneToOne?: boolean;
  referencedRelation: string;
  referencedColumns: string[];
};

type NoRelationships = { Relationships: [] };
type Rel<T extends Relationship[]> = { Relationships: T };

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          full_name: string;
          email: string;
          phone: string | null;
          delivery_address: string | null;
          role: UserRole;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          full_name?: string;
          email: string;
          phone?: string | null;
          delivery_address?: string | null;
          role?: UserRole;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["profiles"]["Insert"]>;
      } & NoRelationships;
      categories: {
        Row: {
          id: string;
          name: string;
          slug: string;
          description: string | null;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          slug: string;
          description?: string | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["categories"]["Insert"]>;
      } & NoRelationships;
      products: {
        Row: {
          id: string;
          category_id: string | null;
          name: string;
          slug: string;
          description: string;
          price: number;
          image_url: string | null;
          stock: number;
          low_stock_threshold: number;
          is_available: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          category_id?: string | null;
          name: string;
          slug: string;
          description?: string;
          price: number;
          image_url?: string | null;
          stock?: number;
          low_stock_threshold?: number;
          is_available?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["products"]["Insert"]>;
      } & Rel<
        [
          {
            foreignKeyName: "products_category_id_fkey";
            columns: ["category_id"];
            isOneToOne: false;
            referencedRelation: "categories";
            referencedColumns: ["id"];
          },
        ]
      >;
      carts: {
        Row: {
          id: string;
          profile_id: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          profile_id: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["carts"]["Insert"]>;
      } & Rel<
        [
          {
            foreignKeyName: "carts_profile_id_fkey";
            columns: ["profile_id"];
            isOneToOne: true;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ]
      >;
      cart_items: {
        Row: {
          id: string;
          cart_id: string;
          product_id: string;
          quantity: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          cart_id: string;
          product_id: string;
          quantity: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["cart_items"]["Insert"]>;
      } & Rel<
        [
          {
            foreignKeyName: "cart_items_cart_id_fkey";
            columns: ["cart_id"];
            isOneToOne: false;
            referencedRelation: "carts";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "cart_items_product_id_fkey";
            columns: ["product_id"];
            isOneToOne: false;
            referencedRelation: "products";
            referencedColumns: ["id"];
          },
        ]
      >;
      orders: {
        Row: {
          id: string;
          order_number: string;
          profile_id: string;
          status: OrderStatus;
          payment_status: PaymentStatus;
          payment_method: PaymentMethod;
          fulfillment_type: FulfillmentType;
          delivery_address: string | null;
          preferred_datetime: string | null;
          contact_name: string;
          contact_phone: string;
          contact_email: string;
          notes: string | null;
          subtotal: number;
          total: number;
          created_at: string;
          updated_at: string;
        };
        // Orders are only ever created through the create_order() RPC
        // (see is/functions below), never via a direct table insert.
        Insert: never;
        Update: Partial<
          Pick<
            Database["public"]["Tables"]["orders"]["Row"],
            "status" | "payment_status"
          >
        >;
      } & Rel<
        [
          {
            foreignKeyName: "orders_profile_id_fkey";
            columns: ["profile_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ]
      >;
      order_items: {
        Row: {
          id: string;
          order_id: string;
          product_id: string | null;
          product_name: string;
          product_price: number;
          quantity: number;
          line_total: number;
          created_at: string;
        };
        Insert: never;
        Update: never;
      } & Rel<
        [
          {
            foreignKeyName: "order_items_order_id_fkey";
            columns: ["order_id"];
            isOneToOne: false;
            referencedRelation: "orders";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "order_items_product_id_fkey";
            columns: ["product_id"];
            isOneToOne: false;
            referencedRelation: "products";
            referencedColumns: ["id"];
          },
        ]
      >;
      inventory_transactions: {
        Row: {
          id: string;
          product_id: string;
          change_quantity: number;
          reason: InventoryReason;
          reference_order_id: string | null;
          note: string | null;
          created_by: string | null;
          created_at: string;
        };
        // Written only through the adjust_stock() RPC or create_order().
        Insert: never;
        Update: never;
      } & Rel<
        [
          {
            foreignKeyName: "inventory_transactions_product_id_fkey";
            columns: ["product_id"];
            isOneToOne: false;
            referencedRelation: "products";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "inventory_transactions_reference_order_id_fkey";
            columns: ["reference_order_id"];
            isOneToOne: false;
            referencedRelation: "orders";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "inventory_transactions_created_by_fkey";
            columns: ["created_by"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ]
      >;
    };
    Views: Record<string, never>;
    Functions: {
      is_admin: {
        Args: Record<string, never>;
        Returns: boolean;
      };
      create_order: {
        Args: {
          p_contact_name: string;
          p_contact_phone: string;
          p_contact_email: string;
          p_fulfillment_type: FulfillmentType;
          p_delivery_address: string | null;
          p_preferred_datetime: string | null;
          p_payment_method: PaymentMethod;
          p_notes: string | null;
          p_items: { product_id: string; quantity: number }[];
        };
        Returns: string;
      };
      adjust_stock: {
        Args: {
          p_product_id: string;
          p_change_quantity: number;
          p_reason: InventoryReason;
          p_note: string | null;
        };
        Returns: undefined;
      };
    };
  };
}
