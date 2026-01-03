import { createClient } from '@supabase/supabase-js';

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

export default async function handler(req) {
    if (req.method === 'OPTIONS') {
        return new Response(null, { status: 204, headers: corsHeaders });
    }

    if (req.method !== 'POST') {
        return new Response(JSON.stringify({ error: 'Method not allowed' }), {
            status: 405,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
    }

    try {
        // Get the authorization header from the request
        const authHeader = req.headers.authorization || req.headers.get?.('authorization');

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return new Response(JSON.stringify({ error: 'Missing or invalid authorization header' }), {
                status: 401,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            });
        }

        const accessToken = authHeader.replace('Bearer ', '');

        // Create a client with the user's access token to verify their identity
        const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
        const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;

        // Check for Supabase secret key (service role) under various common names
        const supabaseSecretKey = process.env.SUPABASE_SECRET_KEY
            || process.env.SUPABASE_SERVICE_ROLE_KEY
            || process.env.SUPABASE_SERVICE_ROLE_SECRET;

        if (!supabaseUrl || !supabaseAnonKey) {
            throw new Error('Supabase configuration missing');
        }

        if (!supabaseSecretKey) {
            throw new Error('Supabase secret key not configured. Set SUPABASE_SECRET_KEY in your environment.');
        }

        // First, verify the user's token and get their user ID
        const userClient = createClient(supabaseUrl, supabaseAnonKey, {
            global: {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                },
            },
        });

        const { data: { user }, error: userError } = await userClient.auth.getUser();

        if (userError || !user) {
            return new Response(JSON.stringify({ error: 'Invalid or expired session' }), {
                status: 401,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            });
        }

        // Now use the admin client with secret key to delete the user
        const adminClient = createClient(supabaseUrl, supabaseSecretKey, {
            auth: {
                autoRefreshToken: false,
                persistSession: false,
            },
        });

        const { error: deleteError } = await adminClient.auth.admin.deleteUser(user.id);

        if (deleteError) {
            console.error('Delete user error:', deleteError);
            throw new Error(deleteError.message || 'Failed to delete account');
        }

        return new Response(JSON.stringify({ success: true, message: 'Account deleted successfully' }), {
            status: 200,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });

    } catch (error) {
        console.error('Account deletion error:', error);
        const message = error instanceof Error ? error.message : 'Failed to delete account';
        return new Response(JSON.stringify({ error: message }), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
    }
}
