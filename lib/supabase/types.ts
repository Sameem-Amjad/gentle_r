/**
 * Hand-maintained database types. Keep in step with supabase/migrations.
 * Regenerate with `supabase gen types typescript --linked > lib/supabase/types.ts`
 * once a project is linked, if preferred.
 */
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type JournalEntryRow = {
  id: string;
  user_id: string;
  title: string;
  body: string;
  created_at: string;
  updated_at: string;
  revision: number;
};

export type Database = {
  public: {
    Tables: {
      journal_entries: {
        Row: JournalEntryRow;
        Insert: {
          id?: string;
          user_id?: string;
          title?: string;
          body?: string;
          created_at?: string;
          updated_at?: string;
          revision?: number;
        };
        Update: {
          title?: string;
          body?: string;
        };
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: {
      delete_own_account: {
        Args: Record<string, never>;
        Returns: undefined;
      };
    };
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};
