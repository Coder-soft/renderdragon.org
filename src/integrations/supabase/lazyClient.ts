import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from './types';

let clientPromise: Promise<SupabaseClient<Database>> | null = null;

export const getSupabase = (): Promise<SupabaseClient<Database>> => {
    if (!clientPromise) {
        clientPromise = import('./client')
            .then((module) => module.supabase)
            .catch((error) => {
                clientPromise = null;
                throw error;
            });
    }
    return clientPromise;
};
