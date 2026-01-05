import { motion } from 'framer-motion';
import { useUserFavorites } from '@/hooks/useUserFavorites';
import { useResources } from '@/hooks/useResources';
import ResourceCard from './ResourceCard';
import ResourceCardSkeleton from './ResourceCardSkeleton';
import { IconHeart } from '@tabler/icons-react';

const FavoritesTab = () => {
  const { favorites, isLoading: favoritesLoading } = useUserFavorites();
  const { resources, isLoading: resourcesLoading, setSelectedResource } = useResources();

  const isLoading = favoritesLoading || resourcesLoading;

  const favoriteResources = resources.filter(resource => favorites.includes(String(resource.id)));

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {Array.from({ length: 8 }).map((_, idx) => (
          <ResourceCardSkeleton key={`fav-skel-${idx}`} />
        ))}
      </div>
    );
  }

  if (favoriteResources.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center py-12"
      >
        <IconHeart className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
        <h3 className="text-lg font-vt323 mb-2">No favorites yet</h3>
        <p className="text-muted-foreground">
          Start exploring resources and add them to your favorites!
        </p>
      </motion.div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {favoriteResources.map(resource => (
        <ResourceCard
          key={resource.id}
          resource={resource}
          onClick={setSelectedResource}
        />
      ))}
    </div>
  );
};

export default FavoritesTab;