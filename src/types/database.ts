export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: '14.5';
  };
  public: {
    Tables: {
      amenities: {
        Row: {
          category: string | null;
          created_at: string | null;
          icon: string | null;
          id: string;
          name: string;
        };
        Insert: {
          category?: string | null;
          created_at?: string | null;
          icon?: string | null;
          id?: string;
          name: string;
        };
        Update: {
          category?: string | null;
          created_at?: string | null;
          icon?: string | null;
          id?: string;
          name?: string;
        };
        Relationships: [];
      };
      announcements: {
        Row: {
          author_profile_id: string;
          body: string;
          created_at: string;
          id: string;
          property_id: string;
          title: string;
        };
        Insert: {
          author_profile_id: string;
          body: string;
          created_at?: string;
          id?: string;
          property_id: string;
          title: string;
        };
        Update: {
          author_profile_id?: string;
          body?: string;
          created_at?: string;
          id?: string;
          property_id?: string;
          title?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'announcements_author_profile_id_fkey';
            columns: ['author_profile_id'];
            isOneToOne: false;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'announcements_property_id_fkey';
            columns: ['property_id'];
            isOneToOne: false;
            referencedRelation: 'occupancy_statistics';
            referencedColumns: ['property_id'];
          },
          {
            foreignKeyName: 'announcements_property_id_fkey';
            columns: ['property_id'];
            isOneToOne: false;
            referencedRelation: 'properties';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'announcements_property_id_fkey';
            columns: ['property_id'];
            isOneToOne: false;
            referencedRelation: 'public_property_listings';
            referencedColumns: ['id'];
          },
        ];
      };
      audit_logs: {
        Row: {
          action: string;
          created_at: string | null;
          id: string;
          ip_address: string | null;
          new_values: Json | null;
          old_values: Json | null;
          resource: string;
          resource_id: string | null;
          user_agent: string | null;
          user_id: string | null;
        };
        Insert: {
          action: string;
          created_at?: string | null;
          id?: string;
          ip_address?: string | null;
          new_values?: Json | null;
          old_values?: Json | null;
          resource: string;
          resource_id?: string | null;
          user_agent?: string | null;
          user_id?: string | null;
        };
        Update: {
          action?: string;
          created_at?: string | null;
          id?: string;
          ip_address?: string | null;
          new_values?: Json | null;
          old_values?: Json | null;
          resource?: string;
          resource_id?: string | null;
          user_agent?: string | null;
          user_id?: string | null;
        };
        Relationships: [];
      };
      cms_pages: {
        Row: {
          content: string | null;
          created_at: string | null;
          created_by: string | null;
          id: string;
          is_published: boolean | null;
          meta_description: string | null;
          meta_keywords: string | null;
          meta_title: string | null;
          published_at: string | null;
          slug: string;
          title: string;
          updated_at: string | null;
          updated_by: string | null;
        };
        Insert: {
          content?: string | null;
          created_at?: string | null;
          created_by?: string | null;
          id?: string;
          is_published?: boolean | null;
          meta_description?: string | null;
          meta_keywords?: string | null;
          meta_title?: string | null;
          published_at?: string | null;
          slug: string;
          title: string;
          updated_at?: string | null;
          updated_by?: string | null;
        };
        Update: {
          content?: string | null;
          created_at?: string | null;
          created_by?: string | null;
          id?: string;
          is_published?: boolean | null;
          meta_description?: string | null;
          meta_keywords?: string | null;
          meta_title?: string | null;
          published_at?: string | null;
          slug?: string;
          title?: string;
          updated_at?: string | null;
          updated_by?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'cms_pages_created_by_fkey';
            columns: ['created_by'];
            isOneToOne: false;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'cms_pages_updated_by_fkey';
            columns: ['updated_by'];
            isOneToOne: false;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
        ];
      };
      contact_messages: {
        Row: {
          created_at: string | null;
          email: string;
          id: string;
          is_read: boolean | null;
          message: string;
          name: string;
          phone: string | null;
          read_at: string | null;
          subject: string;
          updated_at: string | null;
        };
        Insert: {
          created_at?: string | null;
          email: string;
          id?: string;
          is_read?: boolean | null;
          message: string;
          name: string;
          phone?: string | null;
          read_at?: string | null;
          subject: string;
          updated_at?: string | null;
        };
        Update: {
          created_at?: string | null;
          email?: string;
          id?: string;
          is_read?: boolean | null;
          message?: string;
          name?: string;
          phone?: string | null;
          read_at?: string | null;
          subject?: string;
          updated_at?: string | null;
        };
        Relationships: [];
      };
      id_verifications: {
        Row: {
          document_type: string;
          document_url: string;
          id: string;
          review_note: string | null;
          reviewed_at: string | null;
          reviewed_by_profile_id: string | null;
          status: string;
          submitted_at: string;
          tenant_profile_id: string;
        };
        Insert: {
          document_type: string;
          document_url: string;
          id?: string;
          review_note?: string | null;
          reviewed_at?: string | null;
          reviewed_by_profile_id?: string | null;
          status?: string;
          submitted_at?: string;
          tenant_profile_id: string;
        };
        Update: {
          document_type?: string;
          document_url?: string;
          id?: string;
          review_note?: string | null;
          reviewed_at?: string | null;
          reviewed_by_profile_id?: string | null;
          status?: string;
          submitted_at?: string;
          tenant_profile_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'id_verifications_reviewed_by_profile_id_fkey';
            columns: ['reviewed_by_profile_id'];
            isOneToOne: false;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'id_verifications_tenant_profile_id_fkey';
            columns: ['tenant_profile_id'];
            isOneToOne: false;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
        ];
      };
      inspections: {
        Row: {
          assigned_to: string | null;
          created_at: string | null;
          id: string;
          notes: string | null;
          preferred_date: string;
          preferred_time: string;
          property_id: string;
          status: Database['public']['Enums']['inspection_status'] | null;
          unit_id: string | null;
          updated_at: string | null;
          visitor_email: string;
          visitor_name: string;
          visitor_phone: string | null;
        };
        Insert: {
          assigned_to?: string | null;
          created_at?: string | null;
          id?: string;
          notes?: string | null;
          preferred_date: string;
          preferred_time: string;
          property_id: string;
          status?: Database['public']['Enums']['inspection_status'] | null;
          unit_id?: string | null;
          updated_at?: string | null;
          visitor_email: string;
          visitor_name: string;
          visitor_phone?: string | null;
        };
        Update: {
          assigned_to?: string | null;
          created_at?: string | null;
          id?: string;
          notes?: string | null;
          preferred_date?: string;
          preferred_time?: string;
          property_id?: string;
          status?: Database['public']['Enums']['inspection_status'] | null;
          unit_id?: string | null;
          updated_at?: string | null;
          visitor_email?: string;
          visitor_name?: string;
          visitor_phone?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'inspections_assigned_to_fkey';
            columns: ['assigned_to'];
            isOneToOne: false;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'inspections_property_id_fkey';
            columns: ['property_id'];
            isOneToOne: false;
            referencedRelation: 'occupancy_statistics';
            referencedColumns: ['property_id'];
          },
          {
            foreignKeyName: 'inspections_property_id_fkey';
            columns: ['property_id'];
            isOneToOne: false;
            referencedRelation: 'properties';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'inspections_property_id_fkey';
            columns: ['property_id'];
            isOneToOne: false;
            referencedRelation: 'public_property_listings';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'inspections_unit_id_fkey';
            columns: ['unit_id'];
            isOneToOne: false;
            referencedRelation: 'active_units';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'inspections_unit_id_fkey';
            columns: ['unit_id'];
            isOneToOne: false;
            referencedRelation: 'units';
            referencedColumns: ['id'];
          },
        ];
      };
      invoices: {
        Row: {
          amount: number;
          balance: number;
          billing_period: string | null;
          created_at: string | null;
          due_date: string;
          id: string;
          invoice_number: string;
          lease_id: string;
          notes: string | null;
          status: Database['public']['Enums']['invoice_status'] | null;
          updated_at: string | null;
        };
        Insert: {
          amount: number;
          balance: number;
          billing_period?: string | null;
          created_at?: string | null;
          due_date: string;
          id?: string;
          invoice_number: string;
          lease_id: string;
          notes?: string | null;
          status?: Database['public']['Enums']['invoice_status'] | null;
          updated_at?: string | null;
        };
        Update: {
          amount?: number;
          balance?: number;
          billing_period?: string | null;
          created_at?: string | null;
          due_date?: string;
          id?: string;
          invoice_number?: string;
          lease_id?: string;
          notes?: string | null;
          status?: Database['public']['Enums']['invoice_status'] | null;
          updated_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'invoices_lease_id_fkey';
            columns: ['lease_id'];
            isOneToOne: false;
            referencedRelation: 'leases';
            referencedColumns: ['id'];
          },
        ];
      };
      landlords: {
        Row: {
          account_name: string | null;
          bank_account_number: string | null;
          bank_code: string | null;
          bank_name: string | null;
          business_registration: string | null;
          commission_percentage: number | null;
          company_name: string | null;
          created_at: string | null;
          id: string;
          notes: string | null;
          profile_id: string;
          subaccount_code: string | null;
          tax_number: string | null;
          updated_at: string | null;
          website: string | null;
        };
        Insert: {
          account_name?: string | null;
          bank_account_number?: string | null;
          bank_code?: string | null;
          bank_name?: string | null;
          business_registration?: string | null;
          commission_percentage?: number | null;
          company_name?: string | null;
          created_at?: string | null;
          id?: string;
          notes?: string | null;
          profile_id: string;
          subaccount_code?: string | null;
          tax_number?: string | null;
          updated_at?: string | null;
          website?: string | null;
        };
        Update: {
          account_name?: string | null;
          bank_account_number?: string | null;
          bank_code?: string | null;
          bank_name?: string | null;
          business_registration?: string | null;
          commission_percentage?: number | null;
          company_name?: string | null;
          created_at?: string | null;
          id?: string;
          notes?: string | null;
          profile_id?: string;
          subaccount_code?: string | null;
          tax_number?: string | null;
          updated_at?: string | null;
          website?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'landlords_profile_id_fkey';
            columns: ['profile_id'];
            isOneToOne: true;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
        ];
      };
      lease_agreements: {
        Row: {
          created_at: string;
          guarantor_address: string | null;
          guarantor_email: string | null;
          guarantor_name: string | null;
          guarantor_phone: string | null;
          guarantor_relationship: string | null;
          id: string;
          lease_id: string;
          rules_acknowledged: boolean;
          signature_data: string | null;
          signed_at: string | null;
          status: string;
          typed_name: string | null;
        };
        Insert: {
          created_at?: string;
          guarantor_address?: string | null;
          guarantor_email?: string | null;
          guarantor_name?: string | null;
          guarantor_phone?: string | null;
          guarantor_relationship?: string | null;
          id?: string;
          lease_id: string;
          rules_acknowledged?: boolean;
          signature_data?: string | null;
          signed_at?: string | null;
          status?: string;
          typed_name?: string | null;
        };
        Update: {
          created_at?: string;
          guarantor_address?: string | null;
          guarantor_email?: string | null;
          guarantor_name?: string | null;
          guarantor_phone?: string | null;
          guarantor_relationship?: string | null;
          id?: string;
          lease_id?: string;
          rules_acknowledged?: boolean;
          signature_data?: string | null;
          signed_at?: string | null;
          status?: string;
          typed_name?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'lease_agreements_lease_id_fkey';
            columns: ['lease_id'];
            isOneToOne: true;
            referencedRelation: 'leases';
            referencedColumns: ['id'];
          },
        ];
      };
      lease_reminders_sent: {
        Row: {
          id: string;
          lease_id: string;
          sent_at: string;
          threshold_days: number;
        };
        Insert: {
          id?: string;
          lease_id: string;
          sent_at?: string;
          threshold_days: number;
        };
        Update: {
          id?: string;
          lease_id?: string;
          sent_at?: string;
          threshold_days?: number;
        };
        Relationships: [
          {
            foreignKeyName: 'lease_reminders_sent_lease_id_fkey';
            columns: ['lease_id'];
            isOneToOne: false;
            referencedRelation: 'leases';
            referencedColumns: ['id'];
          },
        ];
      };
      leases: {
        Row: {
          billing_cycle: string | null;
          created_at: string | null;
          document_url: string | null;
          end_date: string;
          id: string;
          lease_number: string;
          monthly_rent: number;
          security_deposit: number | null;
          signed_at: string | null;
          start_date: string;
          status: Database['public']['Enums']['lease_status'] | null;
          tenant_id: string;
          terms: string | null;
          unit_id: string;
          updated_at: string | null;
        };
        Insert: {
          billing_cycle?: string | null;
          created_at?: string | null;
          document_url?: string | null;
          end_date: string;
          id?: string;
          lease_number: string;
          monthly_rent: number;
          security_deposit?: number | null;
          signed_at?: string | null;
          start_date: string;
          status?: Database['public']['Enums']['lease_status'] | null;
          tenant_id: string;
          terms?: string | null;
          unit_id: string;
          updated_at?: string | null;
        };
        Update: {
          billing_cycle?: string | null;
          created_at?: string | null;
          document_url?: string | null;
          end_date?: string;
          id?: string;
          lease_number?: string;
          monthly_rent?: number;
          security_deposit?: number | null;
          signed_at?: string | null;
          start_date?: string;
          status?: Database['public']['Enums']['lease_status'] | null;
          tenant_id?: string;
          terms?: string | null;
          unit_id?: string;
          updated_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'leases_tenant_id_fkey';
            columns: ['tenant_id'];
            isOneToOne: false;
            referencedRelation: 'tenant_payment_summary';
            referencedColumns: ['tenant_id'];
          },
          {
            foreignKeyName: 'leases_tenant_id_fkey';
            columns: ['tenant_id'];
            isOneToOne: false;
            referencedRelation: 'tenants';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'leases_unit_id_fkey';
            columns: ['unit_id'];
            isOneToOne: false;
            referencedRelation: 'active_units';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'leases_unit_id_fkey';
            columns: ['unit_id'];
            isOneToOne: false;
            referencedRelation: 'units';
            referencedColumns: ['id'];
          },
        ];
      };
      maintenance_images: {
        Row: {
          caption: string | null;
          created_at: string | null;
          id: string;
          image_url: string;
          maintenance_request_id: string;
        };
        Insert: {
          caption?: string | null;
          created_at?: string | null;
          id?: string;
          image_url: string;
          maintenance_request_id: string;
        };
        Update: {
          caption?: string | null;
          created_at?: string | null;
          id?: string;
          image_url?: string;
          maintenance_request_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'maintenance_images_maintenance_request_id_fkey';
            columns: ['maintenance_request_id'];
            isOneToOne: false;
            referencedRelation: 'maintenance_overview';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'maintenance_images_maintenance_request_id_fkey';
            columns: ['maintenance_request_id'];
            isOneToOne: false;
            referencedRelation: 'maintenance_requests';
            referencedColumns: ['id'];
          },
        ];
      };
      maintenance_requests: {
        Row: {
          assigned_to: string | null;
          assigned_vendor_id: string | null;
          category: Database['public']['Enums']['maintenance_category'];
          created_at: string | null;
          description: string;
          id: string;
          priority: Database['public']['Enums']['maintenance_priority'] | null;
          property_id: string;
          resolution_notes: string | null;
          resolved_at: string | null;
          status: Database['public']['Enums']['maintenance_status'] | null;
          subject: string;
          tenant_id: string;
          unit_id: string;
          updated_at: string | null;
        };
        Insert: {
          assigned_to?: string | null;
          assigned_vendor_id?: string | null;
          category: Database['public']['Enums']['maintenance_category'];
          created_at?: string | null;
          description: string;
          id?: string;
          priority?: Database['public']['Enums']['maintenance_priority'] | null;
          property_id: string;
          resolution_notes?: string | null;
          resolved_at?: string | null;
          status?: Database['public']['Enums']['maintenance_status'] | null;
          subject: string;
          tenant_id: string;
          unit_id: string;
          updated_at?: string | null;
        };
        Update: {
          assigned_to?: string | null;
          assigned_vendor_id?: string | null;
          category?: Database['public']['Enums']['maintenance_category'];
          created_at?: string | null;
          description?: string;
          id?: string;
          priority?: Database['public']['Enums']['maintenance_priority'] | null;
          property_id?: string;
          resolution_notes?: string | null;
          resolved_at?: string | null;
          status?: Database['public']['Enums']['maintenance_status'] | null;
          subject?: string;
          tenant_id?: string;
          unit_id?: string;
          updated_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'maintenance_requests_assigned_to_fkey';
            columns: ['assigned_to'];
            isOneToOne: false;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'maintenance_requests_assigned_vendor_id_fkey';
            columns: ['assigned_vendor_id'];
            isOneToOne: false;
            referencedRelation: 'vendors';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'maintenance_requests_property_id_fkey';
            columns: ['property_id'];
            isOneToOne: false;
            referencedRelation: 'occupancy_statistics';
            referencedColumns: ['property_id'];
          },
          {
            foreignKeyName: 'maintenance_requests_property_id_fkey';
            columns: ['property_id'];
            isOneToOne: false;
            referencedRelation: 'properties';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'maintenance_requests_property_id_fkey';
            columns: ['property_id'];
            isOneToOne: false;
            referencedRelation: 'public_property_listings';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'maintenance_requests_tenant_id_fkey';
            columns: ['tenant_id'];
            isOneToOne: false;
            referencedRelation: 'tenant_payment_summary';
            referencedColumns: ['tenant_id'];
          },
          {
            foreignKeyName: 'maintenance_requests_tenant_id_fkey';
            columns: ['tenant_id'];
            isOneToOne: false;
            referencedRelation: 'tenants';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'maintenance_requests_unit_id_fkey';
            columns: ['unit_id'];
            isOneToOne: false;
            referencedRelation: 'active_units';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'maintenance_requests_unit_id_fkey';
            columns: ['unit_id'];
            isOneToOne: false;
            referencedRelation: 'units';
            referencedColumns: ['id'];
          },
        ];
      };
      notifications: {
        Row: {
          created_at: string | null;
          data: Json | null;
          id: string;
          is_read: boolean | null;
          message: string;
          read_at: string | null;
          title: string;
          type: Database['public']['Enums']['notification_type'];
          updated_at: string | null;
          user_id: string;
        };
        Insert: {
          created_at?: string | null;
          data?: Json | null;
          id?: string;
          is_read?: boolean | null;
          message: string;
          read_at?: string | null;
          title: string;
          type: Database['public']['Enums']['notification_type'];
          updated_at?: string | null;
          user_id: string;
        };
        Update: {
          created_at?: string | null;
          data?: Json | null;
          id?: string;
          is_read?: boolean | null;
          message?: string;
          read_at?: string | null;
          title?: string;
          type?: Database['public']['Enums']['notification_type'];
          updated_at?: string | null;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'notifications_user_id_fkey';
            columns: ['user_id'];
            isOneToOne: false;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
        ];
      };
      payments: {
        Row: {
          amount: number;
          created_at: string | null;
          currency: string | null;
          gateway: Database['public']['Enums']['payment_gateway'];
          id: string;
          invoice_id: string;
          paid_at: string | null;
          payment_data: Json | null;
          reference: string;
          status: Database['public']['Enums']['payment_status'] | null;
          tenant_id: string;
          transaction_id: string | null;
          updated_at: string | null;
        };
        Insert: {
          amount: number;
          created_at?: string | null;
          currency?: string | null;
          gateway: Database['public']['Enums']['payment_gateway'];
          id?: string;
          invoice_id: string;
          paid_at?: string | null;
          payment_data?: Json | null;
          reference: string;
          status?: Database['public']['Enums']['payment_status'] | null;
          tenant_id: string;
          transaction_id?: string | null;
          updated_at?: string | null;
        };
        Update: {
          amount?: number;
          created_at?: string | null;
          currency?: string | null;
          gateway?: Database['public']['Enums']['payment_gateway'];
          id?: string;
          invoice_id?: string;
          paid_at?: string | null;
          payment_data?: Json | null;
          reference?: string;
          status?: Database['public']['Enums']['payment_status'] | null;
          tenant_id?: string;
          transaction_id?: string | null;
          updated_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'payments_invoice_id_fkey';
            columns: ['invoice_id'];
            isOneToOne: false;
            referencedRelation: 'invoices';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'payments_tenant_id_fkey';
            columns: ['tenant_id'];
            isOneToOne: false;
            referencedRelation: 'tenant_payment_summary';
            referencedColumns: ['tenant_id'];
          },
          {
            foreignKeyName: 'payments_tenant_id_fkey';
            columns: ['tenant_id'];
            isOneToOne: false;
            referencedRelation: 'tenants';
            referencedColumns: ['id'];
          },
        ];
      };
      profiles: {
        Row: {
          address: string | null;
          avatar_url: string | null;
          city: string | null;
          country: string | null;
          created_at: string | null;
          date_of_birth: string | null;
          email: string;
          email_verified_at: string | null;
          first_name: string | null;
          full_name: string | null;
          gender: string | null;
          id: string;
          last_login: string | null;
          last_name: string | null;
          phone: string | null;
          role: Database['public']['Enums']['user_role'];
          state: string | null;
          status: Database['public']['Enums']['user_status'] | null;
          updated_at: string | null;
          user_id: string;
        };
        Insert: {
          address?: string | null;
          avatar_url?: string | null;
          city?: string | null;
          country?: string | null;
          created_at?: string | null;
          date_of_birth?: string | null;
          email: string;
          email_verified_at?: string | null;
          first_name?: string | null;
          full_name?: string | null;
          gender?: string | null;
          id?: string;
          last_login?: string | null;
          last_name?: string | null;
          phone?: string | null;
          role?: Database['public']['Enums']['user_role'];
          state?: string | null;
          status?: Database['public']['Enums']['user_status'] | null;
          updated_at?: string | null;
          user_id: string;
        };
        Update: {
          address?: string | null;
          avatar_url?: string | null;
          city?: string | null;
          country?: string | null;
          created_at?: string | null;
          date_of_birth?: string | null;
          email?: string;
          email_verified_at?: string | null;
          first_name?: string | null;
          full_name?: string | null;
          gender?: string | null;
          id?: string;
          last_login?: string | null;
          last_name?: string | null;
          phone?: string | null;
          role?: Database['public']['Enums']['user_role'];
          state?: string | null;
          status?: Database['public']['Enums']['user_status'] | null;
          updated_at?: string | null;
          user_id?: string;
        };
        Relationships: [];
      };
      properties: {
        Row: {
          address: string;
          city: string;
          country: string | null;
          cover_image: string | null;
          created_at: string | null;
          deleted_at: string | null;
          description: string | null;
          featured: boolean | null;
          id: string;
          landlord_id: string;
          latitude: number | null;
          longitude: number | null;
          manager_id: string | null;
          occupied_units: number | null;
          postal_code: string | null;
          property_name: string;
          property_type: string | null;
          purchase_date: string | null;
          purchase_price: number | null;
          slug: string;
          state: string;
          status: Database['public']['Enums']['property_status'] | null;
          total_units: number | null;
          updated_at: string | null;
          vacant_units: number | null;
          views: number | null;
          year_built: number | null;
        };
        Insert: {
          address: string;
          city: string;
          country?: string | null;
          cover_image?: string | null;
          created_at?: string | null;
          deleted_at?: string | null;
          description?: string | null;
          featured?: boolean | null;
          id?: string;
          landlord_id: string;
          latitude?: number | null;
          longitude?: number | null;
          manager_id?: string | null;
          occupied_units?: number | null;
          postal_code?: string | null;
          property_name: string;
          property_type?: string | null;
          purchase_date?: string | null;
          purchase_price?: number | null;
          slug: string;
          state: string;
          status?: Database['public']['Enums']['property_status'] | null;
          total_units?: number | null;
          updated_at?: string | null;
          vacant_units?: number | null;
          views?: number | null;
          year_built?: number | null;
        };
        Update: {
          address?: string;
          city?: string;
          country?: string | null;
          cover_image?: string | null;
          created_at?: string | null;
          deleted_at?: string | null;
          description?: string | null;
          featured?: boolean | null;
          id?: string;
          landlord_id?: string;
          latitude?: number | null;
          longitude?: number | null;
          manager_id?: string | null;
          occupied_units?: number | null;
          postal_code?: string | null;
          property_name?: string;
          property_type?: string | null;
          purchase_date?: string | null;
          purchase_price?: number | null;
          slug?: string;
          state?: string;
          status?: Database['public']['Enums']['property_status'] | null;
          total_units?: number | null;
          updated_at?: string | null;
          vacant_units?: number | null;
          views?: number | null;
          year_built?: number | null;
        };
        Relationships: [
          {
            foreignKeyName: 'properties_landlord_id_fkey';
            columns: ['landlord_id'];
            isOneToOne: false;
            referencedRelation: 'landlord_basic_info';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'properties_landlord_id_fkey';
            columns: ['landlord_id'];
            isOneToOne: false;
            referencedRelation: 'landlord_dashboard_summary';
            referencedColumns: ['landlord_id'];
          },
          {
            foreignKeyName: 'properties_landlord_id_fkey';
            columns: ['landlord_id'];
            isOneToOne: false;
            referencedRelation: 'landlord_payment_routing';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'properties_landlord_id_fkey';
            columns: ['landlord_id'];
            isOneToOne: false;
            referencedRelation: 'landlords';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'properties_manager_id_fkey';
            columns: ['manager_id'];
            isOneToOne: false;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
        ];
      };
      property_amenities: {
        Row: {
          amenity_id: string;
          property_id: string;
        };
        Insert: {
          amenity_id: string;
          property_id: string;
        };
        Update: {
          amenity_id?: string;
          property_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'property_amenities_amenity_id_fkey';
            columns: ['amenity_id'];
            isOneToOne: false;
            referencedRelation: 'amenities';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'property_amenities_property_id_fkey';
            columns: ['property_id'];
            isOneToOne: false;
            referencedRelation: 'occupancy_statistics';
            referencedColumns: ['property_id'];
          },
          {
            foreignKeyName: 'property_amenities_property_id_fkey';
            columns: ['property_id'];
            isOneToOne: false;
            referencedRelation: 'properties';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'property_amenities_property_id_fkey';
            columns: ['property_id'];
            isOneToOne: false;
            referencedRelation: 'public_property_listings';
            referencedColumns: ['id'];
          },
        ];
      };
      property_expenses: {
        Row: {
          amount: number;
          category: string;
          created_at: string;
          created_by_profile_id: string;
          description: string | null;
          expense_date: string;
          id: string;
          property_id: string;
        };
        Insert: {
          amount: number;
          category: string;
          created_at?: string;
          created_by_profile_id: string;
          description?: string | null;
          expense_date: string;
          id?: string;
          property_id: string;
        };
        Update: {
          amount?: number;
          category?: string;
          created_at?: string;
          created_by_profile_id?: string;
          description?: string | null;
          expense_date?: string;
          id?: string;
          property_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'property_expenses_created_by_profile_id_fkey';
            columns: ['created_by_profile_id'];
            isOneToOne: false;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'property_expenses_property_id_fkey';
            columns: ['property_id'];
            isOneToOne: false;
            referencedRelation: 'occupancy_statistics';
            referencedColumns: ['property_id'];
          },
          {
            foreignKeyName: 'property_expenses_property_id_fkey';
            columns: ['property_id'];
            isOneToOne: false;
            referencedRelation: 'properties';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'property_expenses_property_id_fkey';
            columns: ['property_id'];
            isOneToOne: false;
            referencedRelation: 'public_property_listings';
            referencedColumns: ['id'];
          },
        ];
      };
      property_images: {
        Row: {
          caption: string | null;
          created_at: string | null;
          display_order: number | null;
          id: string;
          image_url: string;
          is_cover: boolean | null;
          property_id: string;
        };
        Insert: {
          caption?: string | null;
          created_at?: string | null;
          display_order?: number | null;
          id?: string;
          image_url: string;
          is_cover?: boolean | null;
          property_id: string;
        };
        Update: {
          caption?: string | null;
          created_at?: string | null;
          display_order?: number | null;
          id?: string;
          image_url?: string;
          is_cover?: boolean | null;
          property_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'property_images_property_id_fkey';
            columns: ['property_id'];
            isOneToOne: false;
            referencedRelation: 'occupancy_statistics';
            referencedColumns: ['property_id'];
          },
          {
            foreignKeyName: 'property_images_property_id_fkey';
            columns: ['property_id'];
            isOneToOne: false;
            referencedRelation: 'properties';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'property_images_property_id_fkey';
            columns: ['property_id'];
            isOneToOne: false;
            referencedRelation: 'public_property_listings';
            referencedColumns: ['id'];
          },
        ];
      };
      quit_notices: {
        Row: {
          created_at: string;
          id: string;
          issued_by_profile_id: string;
          lease_id: string;
          notice_text: string;
          reason: string;
          revoked_at: string | null;
          status: string;
          vacate_by: string;
        };
        Insert: {
          created_at?: string;
          id?: string;
          issued_by_profile_id: string;
          lease_id: string;
          notice_text: string;
          reason: string;
          revoked_at?: string | null;
          status?: string;
          vacate_by: string;
        };
        Update: {
          created_at?: string;
          id?: string;
          issued_by_profile_id?: string;
          lease_id?: string;
          notice_text?: string;
          reason?: string;
          revoked_at?: string | null;
          status?: string;
          vacate_by?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'quit_notices_issued_by_profile_id_fkey';
            columns: ['issued_by_profile_id'];
            isOneToOne: false;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'quit_notices_lease_id_fkey';
            columns: ['lease_id'];
            isOneToOne: false;
            referencedRelation: 'leases';
            referencedColumns: ['id'];
          },
        ];
      };
      receipts: {
        Row: {
          created_at: string | null;
          id: string;
          issued_at: string | null;
          payment_id: string;
          pdf_url: string | null;
          receipt_number: string;
        };
        Insert: {
          created_at?: string | null;
          id?: string;
          issued_at?: string | null;
          payment_id: string;
          pdf_url?: string | null;
          receipt_number: string;
        };
        Update: {
          created_at?: string | null;
          id?: string;
          issued_at?: string | null;
          payment_id?: string;
          pdf_url?: string | null;
          receipt_number?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'receipts_payment_id_fkey';
            columns: ['payment_id'];
            isOneToOne: true;
            referencedRelation: 'payments';
            referencedColumns: ['id'];
          },
        ];
      };
      saved_properties: {
        Row: {
          created_at: string | null;
          id: string;
          profile_id: string;
          property_id: string;
        };
        Insert: {
          created_at?: string | null;
          id?: string;
          profile_id: string;
          property_id: string;
        };
        Update: {
          created_at?: string | null;
          id?: string;
          profile_id?: string;
          property_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'saved_properties_profile_id_fkey';
            columns: ['profile_id'];
            isOneToOne: false;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'saved_properties_property_id_fkey';
            columns: ['property_id'];
            isOneToOne: false;
            referencedRelation: 'occupancy_statistics';
            referencedColumns: ['property_id'];
          },
          {
            foreignKeyName: 'saved_properties_property_id_fkey';
            columns: ['property_id'];
            isOneToOne: false;
            referencedRelation: 'properties';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'saved_properties_property_id_fkey';
            columns: ['property_id'];
            isOneToOne: false;
            referencedRelation: 'public_property_listings';
            referencedColumns: ['id'];
          },
        ];
      };
      system_settings: {
        Row: {
          created_at: string | null;
          description: string | null;
          group_name: string | null;
          id: string;
          key: string;
          updated_at: string | null;
          value: Json | null;
        };
        Insert: {
          created_at?: string | null;
          description?: string | null;
          group_name?: string | null;
          id?: string;
          key: string;
          updated_at?: string | null;
          value?: Json | null;
        };
        Update: {
          created_at?: string | null;
          description?: string | null;
          group_name?: string | null;
          id?: string;
          key?: string;
          updated_at?: string | null;
          value?: Json | null;
        };
        Relationships: [];
      };
      tenant_screening_reviews: {
        Row: {
          comments: string | null;
          created_at: string;
          id: string;
          lease_id: string;
          payment_reliability: string;
          property_care: string;
          reviewer_profile_id: string;
          tenant_profile_id: string;
          would_rent_again: boolean;
        };
        Insert: {
          comments?: string | null;
          created_at?: string;
          id?: string;
          lease_id: string;
          payment_reliability: string;
          property_care: string;
          reviewer_profile_id: string;
          tenant_profile_id: string;
          would_rent_again: boolean;
        };
        Update: {
          comments?: string | null;
          created_at?: string;
          id?: string;
          lease_id?: string;
          payment_reliability?: string;
          property_care?: string;
          reviewer_profile_id?: string;
          tenant_profile_id?: string;
          would_rent_again?: boolean;
        };
        Relationships: [
          {
            foreignKeyName: 'tenant_screening_reviews_lease_id_fkey';
            columns: ['lease_id'];
            isOneToOne: false;
            referencedRelation: 'leases';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'tenant_screening_reviews_reviewer_profile_id_fkey';
            columns: ['reviewer_profile_id'];
            isOneToOne: false;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'tenant_screening_reviews_tenant_profile_id_fkey';
            columns: ['tenant_profile_id'];
            isOneToOne: false;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
        ];
      };
      tenants: {
        Row: {
          created_at: string | null;
          emergency_contact: string | null;
          emergency_phone: string | null;
          employer: string | null;
          government_id: string | null;
          id: string;
          notes: string | null;
          occupation: string | null;
          profile_id: string;
          updated_at: string | null;
          verification_status: string | null;
        };
        Insert: {
          created_at?: string | null;
          emergency_contact?: string | null;
          emergency_phone?: string | null;
          employer?: string | null;
          government_id?: string | null;
          id?: string;
          notes?: string | null;
          occupation?: string | null;
          profile_id: string;
          updated_at?: string | null;
          verification_status?: string | null;
        };
        Update: {
          created_at?: string | null;
          emergency_contact?: string | null;
          emergency_phone?: string | null;
          employer?: string | null;
          government_id?: string | null;
          id?: string;
          notes?: string | null;
          occupation?: string | null;
          profile_id?: string;
          updated_at?: string | null;
          verification_status?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'tenants_profile_id_fkey';
            columns: ['profile_id'];
            isOneToOne: true;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
        ];
      };
      unit_images: {
        Row: {
          created_at: string | null;
          display_order: number | null;
          id: string;
          image_url: string;
          unit_id: string;
        };
        Insert: {
          created_at?: string | null;
          display_order?: number | null;
          id?: string;
          image_url: string;
          unit_id: string;
        };
        Update: {
          created_at?: string | null;
          display_order?: number | null;
          id?: string;
          image_url?: string;
          unit_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'unit_images_unit_id_fkey';
            columns: ['unit_id'];
            isOneToOne: false;
            referencedRelation: 'active_units';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'unit_images_unit_id_fkey';
            columns: ['unit_id'];
            isOneToOne: false;
            referencedRelation: 'units';
            referencedColumns: ['id'];
          },
        ];
      };
      units: {
        Row: {
          available_from: string | null;
          bathrooms: number | null;
          bedrooms: number | null;
          created_at: string | null;
          deposit_amount: number | null;
          description: string | null;
          floor: string | null;
          furnished: boolean | null;
          id: string;
          lease_duration_months: number | null;
          property_id: string;
          rent_amount: number;
          square_meters: number | null;
          status: Database['public']['Enums']['unit_status'] | null;
          toilets: number | null;
          unit_number: string;
          updated_at: string | null;
        };
        Insert: {
          available_from?: string | null;
          bathrooms?: number | null;
          bedrooms?: number | null;
          created_at?: string | null;
          deposit_amount?: number | null;
          description?: string | null;
          floor?: string | null;
          furnished?: boolean | null;
          id?: string;
          lease_duration_months?: number | null;
          property_id: string;
          rent_amount: number;
          square_meters?: number | null;
          status?: Database['public']['Enums']['unit_status'] | null;
          toilets?: number | null;
          unit_number: string;
          updated_at?: string | null;
        };
        Update: {
          available_from?: string | null;
          bathrooms?: number | null;
          bedrooms?: number | null;
          created_at?: string | null;
          deposit_amount?: number | null;
          description?: string | null;
          floor?: string | null;
          furnished?: boolean | null;
          id?: string;
          lease_duration_months?: number | null;
          property_id?: string;
          rent_amount?: number;
          square_meters?: number | null;
          status?: Database['public']['Enums']['unit_status'] | null;
          toilets?: number | null;
          unit_number?: string;
          updated_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'units_property_id_fkey';
            columns: ['property_id'];
            isOneToOne: false;
            referencedRelation: 'occupancy_statistics';
            referencedColumns: ['property_id'];
          },
          {
            foreignKeyName: 'units_property_id_fkey';
            columns: ['property_id'];
            isOneToOne: false;
            referencedRelation: 'properties';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'units_property_id_fkey';
            columns: ['property_id'];
            isOneToOne: false;
            referencedRelation: 'public_property_listings';
            referencedColumns: ['id'];
          },
        ];
      };
      vendors: {
        Row: {
          category: string;
          created_at: string;
          email: string | null;
          id: string;
          landlord_id: string;
          name: string;
          notes: string | null;
          phone: string | null;
          updated_at: string;
        };
        Insert: {
          category: string;
          created_at?: string;
          email?: string | null;
          id?: string;
          landlord_id: string;
          name: string;
          notes?: string | null;
          phone?: string | null;
          updated_at?: string;
        };
        Update: {
          category?: string;
          created_at?: string;
          email?: string | null;
          id?: string;
          landlord_id?: string;
          name?: string;
          notes?: string | null;
          phone?: string | null;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'vendors_landlord_id_fkey';
            columns: ['landlord_id'];
            isOneToOne: false;
            referencedRelation: 'landlord_basic_info';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'vendors_landlord_id_fkey';
            columns: ['landlord_id'];
            isOneToOne: false;
            referencedRelation: 'landlord_dashboard_summary';
            referencedColumns: ['landlord_id'];
          },
          {
            foreignKeyName: 'vendors_landlord_id_fkey';
            columns: ['landlord_id'];
            isOneToOne: false;
            referencedRelation: 'landlord_payment_routing';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'vendors_landlord_id_fkey';
            columns: ['landlord_id'];
            isOneToOne: false;
            referencedRelation: 'landlords';
            referencedColumns: ['id'];
          },
        ];
      };
    };
    Views: {
      active_units: {
        Row: {
          bathrooms: number | null;
          bedrooms: number | null;
          city: string | null;
          created_at: string | null;
          deposit_amount: number | null;
          description: string | null;
          floor: string | null;
          furnished: boolean | null;
          id: string | null;
          property_cover_image: string | null;
          property_id: string | null;
          property_name: string | null;
          property_slug: string | null;
          rent_amount: number | null;
          square_meters: number | null;
          state: string | null;
          status: Database['public']['Enums']['unit_status'] | null;
          toilets: number | null;
          unit_number: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'units_property_id_fkey';
            columns: ['property_id'];
            isOneToOne: false;
            referencedRelation: 'occupancy_statistics';
            referencedColumns: ['property_id'];
          },
          {
            foreignKeyName: 'units_property_id_fkey';
            columns: ['property_id'];
            isOneToOne: false;
            referencedRelation: 'properties';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'units_property_id_fkey';
            columns: ['property_id'];
            isOneToOne: false;
            referencedRelation: 'public_property_listings';
            referencedColumns: ['id'];
          },
        ];
      };
      landlord_basic_info: {
        Row: {
          id: string | null;
          profile_id: string | null;
        };
        Insert: {
          id?: string | null;
          profile_id?: string | null;
        };
        Update: {
          id?: string | null;
          profile_id?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'landlords_profile_id_fkey';
            columns: ['profile_id'];
            isOneToOne: true;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
        ];
      };
      landlord_dashboard_summary: {
        Row: {
          available_units: number | null;
          landlord_id: string | null;
          maintenance_units: number | null;
          occupied_units: number | null;
          outstanding_balance: number | null;
          profile_id: string | null;
          total_collected: number | null;
          total_properties: number | null;
          total_tenants: number | null;
          total_units: number | null;
        };
        Relationships: [
          {
            foreignKeyName: 'landlords_profile_id_fkey';
            columns: ['profile_id'];
            isOneToOne: true;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
        ];
      };
      landlord_payment_routing: {
        Row: {
          id: string | null;
          subaccount_code: string | null;
        };
        Insert: {
          id?: string | null;
          subaccount_code?: string | null;
        };
        Update: {
          id?: string | null;
          subaccount_code?: string | null;
        };
        Relationships: [];
      };
      maintenance_overview: {
        Row: {
          category: Database['public']['Enums']['maintenance_category'] | null;
          city: string | null;
          created_at: string | null;
          hours_open: number | null;
          id: string | null;
          priority: Database['public']['Enums']['maintenance_priority'] | null;
          property_name: string | null;
          resolved_at: string | null;
          state: string | null;
          status: Database['public']['Enums']['maintenance_status'] | null;
          subject: string | null;
          tenant_name: string | null;
          tenant_profile_id: string | null;
          unit_number: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'tenants_profile_id_fkey';
            columns: ['tenant_profile_id'];
            isOneToOne: true;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
        ];
      };
      monthly_revenue: {
        Row: {
          currency: string | null;
          gateway: Database['public']['Enums']['payment_gateway'] | null;
          month: string | null;
          total_payments: number | null;
          total_revenue: number | null;
        };
        Relationships: [];
      };
      occupancy_statistics: {
        Row: {
          actual_units: number | null;
          available: number | null;
          city: string | null;
          declared_units: number | null;
          maintenance: number | null;
          occupancy_rate: number | null;
          occupied: number | null;
          property_id: string | null;
          property_name: string | null;
          reserved: number | null;
          state: string | null;
        };
        Relationships: [];
      };
      public_property_listings: {
        Row: {
          address: string | null;
          city: string | null;
          country: string | null;
          cover_image: string | null;
          created_at: string | null;
          description: string | null;
          featured: boolean | null;
          id: string | null;
          max_rent: number | null;
          min_rent: number | null;
          occupied_units: number | null;
          property_name: string | null;
          property_type: string | null;
          slug: string | null;
          state: string | null;
          status: Database['public']['Enums']['property_status'] | null;
          total_units: number | null;
          updated_at: string | null;
          vacant_units: number | null;
        };
        Insert: {
          address?: string | null;
          city?: string | null;
          country?: string | null;
          cover_image?: string | null;
          created_at?: string | null;
          description?: string | null;
          featured?: boolean | null;
          id?: string | null;
          max_rent?: never;
          min_rent?: never;
          occupied_units?: number | null;
          property_name?: string | null;
          property_type?: string | null;
          slug?: string | null;
          state?: string | null;
          status?: Database['public']['Enums']['property_status'] | null;
          total_units?: number | null;
          updated_at?: string | null;
          vacant_units?: number | null;
        };
        Update: {
          address?: string | null;
          city?: string | null;
          country?: string | null;
          cover_image?: string | null;
          created_at?: string | null;
          description?: string | null;
          featured?: boolean | null;
          id?: string | null;
          max_rent?: never;
          min_rent?: never;
          occupied_units?: number | null;
          property_name?: string | null;
          property_type?: string | null;
          slug?: string | null;
          state?: string | null;
          status?: Database['public']['Enums']['property_status'] | null;
          total_units?: number | null;
          updated_at?: string | null;
          vacant_units?: number | null;
        };
        Relationships: [];
      };
      tenant_payment_summary: {
        Row: {
          email: string | null;
          full_name: string | null;
          outstanding_balance: number | null;
          overdue_invoices: number | null;
          paid_invoices: number | null;
          partial_invoices: number | null;
          pending_invoices: number | null;
          phone: string | null;
          profile_id: string | null;
          tenant_id: string | null;
          total_amount: number | null;
          total_invoices: number | null;
        };
        Relationships: [
          {
            foreignKeyName: 'tenants_profile_id_fkey';
            columns: ['profile_id'];
            isOneToOne: true;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
        ];
      };
    };
    Functions: {
      current_user_role: { Args: never; Returns: string };
      expire_leases: { Args: never; Returns: undefined };
      get_current_profile_id: { Args: never; Returns: string };
      is_admin: { Args: never; Returns: boolean };
      is_landlord: { Args: never; Returns: boolean };
      send_lease_reminders: { Args: never; Returns: undefined };
    };
    Enums: {
      inspection_status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
      invoice_status: 'draft' | 'pending' | 'paid' | 'partial' | 'overdue' | 'cancelled';
      lease_status: 'active' | 'expired' | 'terminated' | 'renewed' | 'pending';
      maintenance_category:
        | 'plumbing'
        | 'electrical'
        | 'security'
        | 'cleaning'
        | 'water'
        | 'internet'
        | 'structural'
        | 'other';
      maintenance_priority: 'low' | 'medium' | 'high' | 'emergency';
      maintenance_status:
        'submitted' | 'assigned' | 'in_progress' | 'waiting_parts' | 'completed' | 'closed';
      notification_type:
        | 'rent_reminder'
        | 'payment_success'
        | 'payment_failed'
        | 'maintenance_update'
        | 'lease_expiry'
        | 'announcement'
        | 'welcome'
        | 'invoice_created'
        | 'lease_terminated';
      payment_gateway: 'paystack' | 'flutterwave' | 'bank_transfer' | 'cash';
      payment_status: 'pending' | 'processing' | 'successful' | 'failed' | 'refunded';
      property_status: 'active' | 'inactive' | 'draft' | 'archived';
      unit_status: 'available' | 'occupied' | 'reserved' | 'maintenance';
      user_role: 'tenant' | 'landlord' | 'manager' | 'admin' | 'super_admin';
      user_status: 'active' | 'inactive' | 'suspended' | 'pending_verification';
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

type DatabaseWithoutInternals = Omit<Database, '__InternalSupabase'>;

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, 'public'>];

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema['Tables'] & DefaultSchema['Views'])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Views'])
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Views'])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema['Tables'] & DefaultSchema['Views'])
    ? (DefaultSchema['Tables'] & DefaultSchema['Views'])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R;
      }
      ? R
      : never
    : never;

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    keyof DefaultSchema['Tables'] | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables']
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema['Tables']
    ? DefaultSchema['Tables'][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I;
      }
      ? I
      : never
    : never;

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    keyof DefaultSchema['Tables'] | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables']
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema['Tables']
    ? DefaultSchema['Tables'][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U;
      }
      ? U
      : never
    : never;

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    keyof DefaultSchema['Enums'] | { schema: keyof DatabaseWithoutInternals },
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions['schema']]['Enums']
    : never) = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions['schema']]['Enums'][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema['Enums']
    ? DefaultSchema['Enums'][DefaultSchemaEnumNameOrOptions]
    : never;

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    keyof DefaultSchema['CompositeTypes'] | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions['schema']]['CompositeTypes']
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions['schema']]['CompositeTypes'][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema['CompositeTypes']
    ? DefaultSchema['CompositeTypes'][PublicCompositeTypeNameOrOptions]
    : never;

export const Constants = {
  public: {
    Enums: {
      inspection_status: ['pending', 'confirmed', 'cancelled', 'completed'],
      invoice_status: ['draft', 'pending', 'paid', 'partial', 'overdue', 'cancelled'],
      lease_status: ['active', 'expired', 'terminated', 'renewed', 'pending'],
      maintenance_category: [
        'plumbing',
        'electrical',
        'security',
        'cleaning',
        'water',
        'internet',
        'structural',
        'other',
      ],
      maintenance_priority: ['low', 'medium', 'high', 'emergency'],
      maintenance_status: [
        'submitted',
        'assigned',
        'in_progress',
        'waiting_parts',
        'completed',
        'closed',
      ],
      notification_type: [
        'rent_reminder',
        'payment_success',
        'payment_failed',
        'maintenance_update',
        'lease_expiry',
        'announcement',
        'welcome',
        'invoice_created',
        'lease_terminated',
      ],
      payment_gateway: ['paystack', 'flutterwave', 'bank_transfer', 'cash'],
      payment_status: ['pending', 'processing', 'successful', 'failed', 'refunded'],
      property_status: ['active', 'inactive', 'draft', 'archived'],
      unit_status: ['available', 'occupied', 'reserved', 'maintenance'],
      user_role: ['tenant', 'landlord', 'manager', 'admin', 'super_admin'],
      user_status: ['active', 'inactive', 'suspended', 'pending_verification'],
    },
  },
} as const;
