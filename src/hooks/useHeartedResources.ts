
import { useUserFavorites } from './useUserFavorites';
import { useFavoriteFolders } from './useFavoriteFolders';
import { getResourceUrl, Resource } from '@/types/resources';

export const useHeartedResources = () => {
  const userFavorites = useUserFavorites();
  const { folders } = useFavoriteFolders();

  const toggleHeart = (resource: Resource | string): Promise<{ action: 'added' | 'removed' }> => {
    const resourceUrl = typeof resource === 'string' ? resource : getResourceUrl(resource);
    if (!resourceUrl) return Promise.resolve({ action: 'removed' });
    return userFavorites.toggleFavorite(resourceUrl);
  };

  const isHearted = (resource: Resource | string) => {
    const resourceUrl = typeof resource === 'string' ? resource : getResourceUrl(resource);
    if (!resourceUrl) return false;
    return userFavorites.isFavorited(resourceUrl);
  };

  return {
    heartedResources: userFavorites.favorites,
    toggleHeart,
    isHearted,
    isLoading: userFavorites.isLoading,
    moveFavorite: userFavorites.moveFavorite,
    addFavoriteToFolder: userFavorites.addFavoriteToFolder,
    getFolderItemCount: userFavorites.getFolderItemCount,
    folders,
  };
};
