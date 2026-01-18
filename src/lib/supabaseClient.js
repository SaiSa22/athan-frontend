import { createClient } from '@supabase/supabase-js'

// REPLACE WITH YOUR SUPABASE URL AND ANON KEY
const supabaseUrl = 'YOUR_SUPABASE_URL'
const supabaseKey = 'YOUR_SUPABASE_ANON_KEY'

export const supabase = createClient(supabaseUrl, supabaseKey)
