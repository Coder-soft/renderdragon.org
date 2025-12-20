
import { Resource } from '@/types/resources';

const MCI_API_URL = '/mci-proxy';

interface MciItem {
    name: string;
    category: string;
    subcategory: string;
    url: string;
}

export const fetchMciResources = async (): Promise<Resource[]> => {
    try {
        const response = await fetch(MCI_API_URL);
        if (!response.ok) {
            throw new Error(`Failed to fetch MCI resources: ${response.status}`);
        }

        const data: MciItem[] = await response.json();

        // Map the API data to our Resource type
        // We generate a pseudo-random ID based on the index to avoid collisions, 
        // but ideally we'd want stable IDs. Since the API doesn't provide IDs, 
        // we'll offset them significantly to avoid collision with existing DB resources (which are likely low integers)
        // or string IDs if we supported them fully. The current Resource type uses number for ID.
        // Let's use a large offset.
        const ID_OFFSET = 100000;

        return data.map((item, index) => {
            const nameWithoutExt = item.name.replace(/\.[^/.]+$/, "");
            const formattedTitle = nameWithoutExt
                .replace(/_/g, ' ')
                .split(' ')
                .filter(Boolean)
                .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
                .join(' ');

            return {
                id: ID_OFFSET + index,
                title: formattedTitle,
                category: 'minecraft-icons',
                subcategory: item.subcategory,
                filetype: 'png',
                download_url: item.url,
                preview_url: item.url,
                image_url: item.url,
                description: item.category,
            };
        });
    } catch (error) {
        console.error("Error fetching MCI resources:", error);
        return [];
    }
};
