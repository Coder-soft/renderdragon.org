
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from 'sonner';

interface UserProfile {
  id: string;
  email: string | null;
  username?: string | null;
  display_name?: string | null;
  first_name?: string | null;
  last_name?: string | null;
  avatar_url?: string | null;
  created_at: string;
  updated_at: string;
}

export const useProfile = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchProfile = useCallback(async () => {
    if (!user) return;

    setLoading(true);
    try {
      // Own-profile reads go through the security-definer RPC so the client
      // never needs (and no longer has) column access to email/first/last/etc.
      const { data: rawData, error } = await supabase.rpc("get_my_profile");

      if (error) throw error;
      if (!rawData) {
        setProfile(null);
        return;
      }

      const data = rawData as any;

      // Transform the data to match our interface, handling missing fields
      const profileData: UserProfile = {
        id: data.id,
        email: data.email,
        username: data.username || null,
        display_name: data.display_name || null,
        first_name: data.first_name || null,
        last_name: data.last_name || null,
        avatar_url: data.avatar_url || null,
        created_at: data.created_at,
        updated_at: data.updated_at,
      };

      setProfile(profileData);
    } catch (error) {
      console.error("Error fetching profile:", error);
      toast.error('Failed to load profile');
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      fetchProfile();
    } else {
      setProfile(null);
    }
  }, [user, fetchProfile]);

  const updateProfile = async (updates: Partial<UserProfile>) => {
    if (!user) return;

    setLoading(true);
    try {
      // Only columns the owner is actually allowed to change (RLS-granted).
      // email/created_at/updated_at/role/etc. are never written from the client.
      const allowedFields = [
        "username", "display_name", "avatar_url", "bio", "links",
        "social_links", "theme_config", "first_name", "last_name",
      ] as const;

      const payload: Record<string, unknown> = {};
      for (const field of allowedFields) {
        const value = (updates as Record<string, unknown>)[field];
        if (value !== undefined) payload[field] = value;
      }

      // .select('id') limits the RETURNING clause to a granted column —
      // default return=representation needs SELECT on every column (incl. email).
      const { error } = await supabase
        .from("profiles")
        .update(payload as any)
        .eq("id", user.id)
        .select('id');

      if (error) throw error;

      // Refetch the full row via the RPC so the UI reflects server state
      await fetchProfile();
      toast.success("Profile updated successfully");
      return { success: true };
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error("Failed to update profile");
      return { success: false };
    } finally {
      setLoading(false);
    }
  };

  const deleteAccount = async () => {
    if (!user) return;

    try {
      // Get the current session to send the access token
      const { data: { session } } = await supabase.auth.getSession();

      if (!session?.access_token) {
        throw new Error('No active session');
      }

      // Call the server-side API endpoint which has access to the service role key
      const response = await fetch('/api/deleteAccount', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to delete account');
      }

      // Sign out locally after successful deletion
      await supabase.auth.signOut();

      toast.success("Account deleted successfully");
      return { success: true };
    } catch (error) {
      console.error("Error deleting account:", error);
      toast.error("Failed to delete account. Please contact support.");
      return { success: false };
    }
  };

  return {
    profile,
    loading,
    updateProfile,
    deleteAccount,
    refetch: fetchProfile,
  };
};
