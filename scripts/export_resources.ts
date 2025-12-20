
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Supabase credentials missing in .env');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function exportResources() {
    console.log('Fetching resources...');
    const { data, error } = await supabase
        .from('resources')
        .select('*');

    if (error) {
        console.error('Error fetching data:', error);
        return;
    }

    // Group by category for the structure the app likes
    const grouped = data.reduce((acc, resource) => {
        const cat = resource.category || 'uncategorized';
        if (!acc.categories[cat]) {
            acc.categories[cat] = [];
        }
        acc.categories[cat].push({
            id: resource.id,
            title: resource.title,
            ext: resource.filetype,
            url: resource.download_url,
            credit: resource.credit,
            // Add any others if needed
        });
        return acc;
    }, { categories: {} });

    fs.writeFileSync('resources_export.json', JSON.stringify(grouped, null, 2));
    console.log('Exported to resources_export.json');
}

exportResources();
