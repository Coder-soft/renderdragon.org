
import { useCallback, useEffect, useState } from 'react';
import { useUserFavorites } from './useUserFavorites';
import { useAuth } from './useAuth';
import { getResourceUrl, Resource } from '@/types/resources';

export const useHeartedResources = () => {
  const { user } = useAuth();
  const userFavorites = useUserFavorites();
  const localStorageKey = 'heartedResources';
  
  const getLocalHeartedResources = useCallback((): string[] => {
    try {
      const stored = localStorage.getItem(localStorageKey);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  }, []);

  const setLocalHeartedResources = (resources: string[]) => {
    localStorage.setItem(localStorageKey, JSON.stringify(resources));
  };

  const [heartedResources, setHeartedResources] = useState<string[]>(() => getLocalHeartedResources());

  useEffect(() => {
    const handleLocalUpdate = () => {
      setHeartedResources(getLocalHeartedResources());
    };

    const handleStorage = (event: StorageEvent) => {
      if (event.key === localStorageKey) {
        setHeartedResources(getLocalHeartedResources());
      }
    };

    window.addEventListener('localFavoritesChanged', handleLocalUpdate);
    window.addEventListener('storage', handleStorage);

    return () => {
      window.removeEventListener('localFavoritesChanged', handleLocalUpdate);
      window.removeEventListener('storage', handleStorage);
    };
  }, [getLocalHeartedResources]);

  const toggleHeart = (resource: Resource | string) => {
    const resourceUrl = typeof resource === 'string' ? resource : getResourceUrl(resource);
    if (!resourceUrl) return;
    const current = getLocalHeartedResources();
    const newHearted = current.includes(resourceUrl)
      ? current.filter(id => id !== resourceUrl)
      : [...current, resourceUrl];
    
    setLocalHeartedResources(newHearted);
    setHeartedResources(newHearted);
    window.dispatchEvent(new CustomEvent('localFavoritesChanged'));
  };

  const isHearted = (resource: Resource | string) => {
    const resourceUrl = typeof resource === 'string' ? resource : getResourceUrl(resource);
    if (!resourceUrl) return false;
    return getLocalHeartedResources().includes(resourceUrl);
  };

  if (user) {
    return {
      heartedResources: userFavorites.favorites,
      toggleHeart: userFavorites.toggleFavorite,
      isHearted: userFavorites.isFavorited,
      isLoading: userFavorites.isLoading,
    };
  }

  return {
    heartedResources,
    toggleHeart,
    isHearted,
    isLoading: false,
  };
};
