import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

export const useDownloadCounts = () => {
  const [downloadCounts, setDownloadCounts] = useState<Record<string, number>>({});

  useEffect(() => {
    const fetchCounts = async () => {
      try {
        const { data, error } = await supabase
          .from('downloads')
          .select('resource_id, count');

        if (error) {
          console.error('Error fetching download counts:', error);
          return;
        }

        if (data) {
          const mapped = data.reduce((acc, row) => {
            if (row.resource_id) {
              acc[row.resource_id.toString()] = row.count || 0;
            }
            return acc;
          }, {} as Record<string, number>);
          setDownloadCounts(mapped);
        }
      } catch (err) {
        console.error('Unexpected error fetching download counts:', err);
      }
    };

    fetchCounts();
  }, []);

  const incrementDownload = useCallback(async (resourceId: string | number) => {
    try {
      const resIdStr = resourceId.toString();
      const currentCount = downloadCounts[resIdStr] || 0;
      const newCount = currentCount + 1;

      // Extract numeric ID if possible for DB persistence
      let numericId: number | null = null;
      if (typeof resourceId === 'number') {
        numericId = resourceId;
      } else if (resourceId.startsWith('main-')) {
        const idPart = resourceId.replace('main-', '');
        if (!isNaN(Number(idPart))) {
          numericId = Number(idPart);
        }
      }

      if (numericId !== null) {
        const { error } = await supabase
          .from('downloads')
          .upsert({
            resource_id: numericId,
            count: newCount
          }, {
            onConflict: 'resource_id'
          });

        if (error) {
          console.error('Error incrementing download count:', error);
          return;
        }
      }

      setDownloadCounts(prev => ({
        ...prev,
        [resIdStr]: newCount,
      }));
    } catch (err) {
      console.error('Unexpected error incrementing download count:', err);
    }
  }, [downloadCounts]);

  return { downloadCounts, incrementDownload };
};