import { createClient } from '@supabase/supabase-js';

// Server-side Supabase client using the service-role key so that we can execute
// privileged operations (e.g. multi-table updates) inside API route handlers.
//
// IMPORTANT:  Add `SUPABASE_SERVICE_ROLE_KEY` to your local `.env.local` and to
// your production environment variables in the Supabase dashboard.
// NEVER expose the service-role key to the browser – it must stay on the server!
//
// The public URL can still be reused from the browser-side client.
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey);
