import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from 'sonner';

export const useUserFavorites = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: favorites = [], isLoading } = useQuery({
    queryKey: ['userFavorites', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];

      const { data, error } = await supabase
        .from('user_favorites')
        .select('resource_id')
        .eq('user_id', user.id);

      if (error) {
        console.error('Error fetching favorites:', error);
        toast.error('Failed to load favorites');
        throw error;
      }

      return data?.map(fav => fav.resource_id.toString()) || [];
    },
    enabled: !!user?.id,
    staleTime: 1000 * 60 * 5, // Cache for 5 minutes
  });

  const toggleMutation = useMutation({
    mutationFn: async (resourceId: string) => {
      if (!user) throw new Error('User not authenticated');

      const isFavorited = favorites.includes(resourceId);

      if (isFavorited) {
        const { error } = await supabase
          .from('user_favorites')
          .delete()
          .eq('user_id', user.id)
          .eq('resource_id', resourceId);
        if (error) throw error;
        return { action: 'removed', resourceId };
      } else {
        const { error } = await supabase
          .from('user_favorites')
          .insert({ user_id: user.id, resource_id: parseInt(resourceId) }); // Ensure ID is int if needed by DB, or keep string if uuid
        if (error) throw error;
        return { action: 'added', resourceId };
      }
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['userFavorites', user?.id] });
      toast.success(data.action === 'added' ? 'Added to favorites' : 'Removed from favorites');
    },
    onError: (error) => {
      console.error('Error toggling favorite:', error);
      toast.error('Failed to update favorites');
    }
  });

  const toggleFavorite = (resourceId: string) => {
    if (!user) {
      toast.error('Please sign in to save favorites');
      return;
    }
    toggleMutation.mutate(resourceId);
  };

  const isFavorited = (resourceId: string) => favorites.includes(resourceId);

  return {
    favorites,
    isLoading,
    toggleFavorite,
    isFavorited,
  };
};