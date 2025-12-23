import { createClient } from '@supabase/supabase-js';

// TODO: Replace with your actual values from Supabase Settings -> API
const supabaseUrl = 'YOUR_SUPABASE_PROJECT_URL';
const supabaseAnonKey = 'YOUR_SUPABASE_ANON_KEY';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
