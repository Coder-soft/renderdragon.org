/* eslint-disable @typescript-eslint/no-explicit-any */

export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

type AnyTable = {
  Row: any;
  Insert: any;
  Update: any;
  Relationships: [];
};

export type Database = {
  public: {
    Tables: {
      blogs: AnyTable;
      creator_packs: AnyTable;
      creator_packs_covers: AnyTable;
      downloads: AnyTable;
      profiles: AnyTable;
      resources: AnyTable;
      showcase_media: AnyTable;
      showcase_pages: AnyTable;
      user_favorite_folders: AnyTable;
      user_favorites: AnyTable;
    };
    Views: Record<string, never>;
    Functions: Record<string, { Args: Record<string, any>; Returns: any }>;
    Enums: Record<string, string>;
    CompositeTypes: Record<string, never>;
  };
};
